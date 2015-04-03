import Diagnostics from './diagnostics';

let error = function() {};
let log = function() {};
let trace = function() {};
let warn = function() {};

if (console) {
  error = function(...args) { console.error.apply(console, args) };
  log = function(...args) { console.log.apply(console, args); }
  trace = Diagnostics.trace;
  warn = function(...args) { console.warn.apply(console, args); };
}

export { error };
export { log };
export { trace };
export { warn };
