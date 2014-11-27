var constants = require('./constants');

module.exports = constants({
  actionSources: ['VIEW', 'SERVER'],
  Actions: ['ACTION_STARTING', 'ACTION_DONE', 'ACTION_ERROR'],
  Statuses: ['pending', 'error', 'done']
});