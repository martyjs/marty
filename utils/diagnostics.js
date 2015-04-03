let diagnostics = {
  devtoolsEnabled: false,
  enabled: false,
  trace: function trace(...args) {
    if (diagnostics.enabled) {
      console && console.log.apply(console, args);
    }
  }
};

export default diagnostics
