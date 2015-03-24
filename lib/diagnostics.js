let diagnostics = {
  trace: trace,
  enabled: false,
  devtoolsEnabled: false,
};

module.exports = diagnostics;

function trace() {
  if (diagnostics.enabled) {
    console && console.log.apply(console, arguments);
  }
}