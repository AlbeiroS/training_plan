/* Where the training log is stored.
   With `url` empty everything still works — the log just stays in this
   browser's localStorage, which does NOT survive clearing site data.
   Filled in, the log syncs to the Google Sheet instead and survives any phone.

   The token is visible to anyone who reads this file. It keeps the endpoint
   obscure, not secure; the Sheet's version history is the undo. To change it,
   edit TOKEN in Apps Script, deploy a NEW VERSION, then update it here. */

window.SYNC = {
  url: 'https://script.google.com/macros/s/AKfycbyh4fD9-HEwi4IZd3MvAy63r_A-FricPDqKOnfo__vfowtktYMwvjuXIBFwpOQNGs3yMA/exec',
  token: 'albeiroroadtobostonmarathon'
};
