/* Log sync: localStorage first, Google Sheet second.
   Every toggle is written locally and rendered immediately, so the page is
   never waiting on the network and works with no signal. Changes queue in a
   pending list and flush to the Sheet when they can. On load the Sheet is the
   source of truth, with anything still pending applied on top. */

(function () {
  'use strict';

  var cfg = window.SYNC || {};
  var plan = null, pendKey = null;
  var listeners = [];

  function on() { return !!(cfg.url && cfg.token); }

  function readPending() {
    try { return JSON.parse(localStorage.getItem(pendKey)) || []; }
    catch (e) { return []; }
  }
  function writePending(list) {
    try { localStorage.setItem(pendKey, JSON.stringify(list)); } catch (e) {}
  }

  function emit(state, detail) {
    listeners.forEach(function (fn) { fn(state, detail); });
  }

  var api = {
    enabled: on,

    init: function (planId, storageKey) {
      plan = planId;
      pendKey = storageKey + ':pending';
    },

    onStatus: function (fn) { listeners.push(fn); },

    /* Fetch the Sheet's view of the log. Resolves to null when sync is off
       or unreachable — the caller then just keeps what is local. */
    pull: function () {
      if (!on()) return Promise.resolve(null);
      emit('syncing');
      var u = cfg.url + '?plan=' + encodeURIComponent(plan) +
              '&token=' + encodeURIComponent(cfg.token) +
              '&t=' + Date.now();
      return fetch(u)
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d || !d.ok) throw new Error(d && d.error ? d.error : 'refused');
          /* anything not yet flushed wins over the remote copy */
          var merged = {};
          Object.keys(d.logged || {}).forEach(function (k) { merged[k] = true; });
          readPending().forEach(function (c) {
            if (c.done) merged[c.key] = true; else delete merged[c.key];
          });
          emit('ok', d.count);
          return merged;
        })
        .catch(function (err) {
          emit('offline', err.message);
          return null;
        });
    },

    /* Queue one toggle and try to flush. Safe to call while offline. */
    record: function (change) {
      if (!on()) return;
      var list = readPending().filter(function (c) { return c.key !== change.key; });
      list.push(change);
      writePending(list);
      api.flush();
    },

    flush: function () {
      if (!on()) return Promise.resolve();
      var list = readPending();
      if (!list.length) { emit('ok'); return Promise.resolve(); }
      emit('syncing');
      return fetch(cfg.url, {
        method: 'POST',
        /* text/plain keeps this a "simple request" so the browser sends no
           preflight — Apps Script does not answer OPTIONS. */
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ plan: plan, token: cfg.token, changes: list })
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d || !d.ok) throw new Error(d && d.error ? d.error : 'refused');
          /* only drop what we actually sent — a toggle made mid-flight stays */
          var sent = {};
          list.forEach(function (c) { sent[c.key] = c.done; });
          writePending(readPending().filter(function (c) {
            return !(c.key in sent) || sent[c.key] !== c.done;
          }));
          emit('ok');
        })
        .catch(function (err) { emit('offline', err.message); });
    },

    pendingCount: function () { return on() ? readPending().length : 0; }
  };

  window.PlanSync = api;

  /* retry whatever is stuck as soon as the network comes back */
  window.addEventListener('online', function () { api.flush(); });
})();
