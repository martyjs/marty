var constants = require('./constants');

module.exports = constants({
  ActionSources: ['VIEW', 'SERVER'],
  Statuses: ['PENDING', 'FAILED', 'DONE'],
  Actions: ['ACTION_STARTING', 'ACTION_DONE', 'ACTION_ERROR']
});