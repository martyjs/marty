var Marty = {
  version: require('./package.json').version,
  createStore: require('./lib/createStore'),
  createHttpAPI: require('./lib/createHttpAPI'),
  createConstants: require('./lib/createConstants'),
  createContainer: require('./lib/createContainer'),
  createActionCreators: require('./lib/createActionCreators')
};

module.exports = Marty;