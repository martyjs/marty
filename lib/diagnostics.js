var diagnostics = {
  log: log,
  trace: log,
  warn: warn,
  enabled: false,
  devtoolsEnabled: false,
};

module.exports = diagnostics;

function log() {
  if (diagnostics.enabled) {
    console.log.apply(console, arguments);
  }
}

function warn() {
  if (diagnostics.enabled) {
    console.warn.apply(console, arguments);
  }
}