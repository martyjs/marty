var constants = require('./constants');

module.exports = constants({
  ActionSources: ['VIEW', 'SERVER'],
  Statuses: ['pending', 'error', 'done'],
  Actions: ['ACTION_STARTING', 'ACTION_DONE', 'ACTION_ERROR']
});