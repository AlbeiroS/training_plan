/* Where the training log is stored.
   Leave `url` empty and everything still works — the log just stays in this
   browser's localStorage, which does NOT survive clearing site data.
   Fill both in (see apps-script/Code.gs for how to get them) and the log
   syncs to your Google Sheet instead, surviving any phone. */

window.SYNC = {
  url: '',     // the Apps Script /exec URL
  token: ''    // the same TOKEN string you set in Code.gs
};
