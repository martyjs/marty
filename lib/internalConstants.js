var constants = require('./constants');

module.exports = constants({
  ActionSources: ['VIEW', 'SERVER'],
  Statuses: ['pending', 'failed', 'done'],
  Actions: ['ACTION_STARTING', 'ACTION_DONE', 'ACTION_ERROR']
});