/*
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * TodoStore
 */

var Marty = require('../marty');
var extend = require('lodash-node/modern/objects/assign');
var TodoConstants = require('../constants/TodoConstants');

var TodoStore = Marty.createStore({
  handlers: {
    create: TodoConstants.TODO_CREATE,
    toggleComplete: TodoConstants.TODO_TOGGLE_COMPLETE_ALL,
    undoCompleteTodo: TodoConstants.TODO_UNDO_COMPLETE,
    completeTodo: TodoConstants.TODO_COMPLETE,
    updateText: TodoConstants.TODO_UPDATE_TEXT,
    destroyTodo: TodoConstants.TODO_DESTROY,
    destroyCompleted: TodoConstants.TODO_DESTROY_COMPLETED
  },

  getInitialState: function () {
    return {};
  },

  /**
   * Create a TODO item.
   * @param  {string} text The content of the TODO
   */
  create: function (text) {
    text = text.trim();

    if (text) {
      // Hand waving here -- not showing how this interacts with XHR or persistent
      // server-side storage.
      // Using the current timestamp + random number in place of a real id.
      var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
      this.state[id] = {
        id: id,
        complete: false,
        text: text
      };
      this.hasChanged();
    }
  },
  toggleComplete: function () {
    this.updateAll({
      complete: !this.areAllComplete()
    });
  },
  undoCompleteTodo: function (id) {
    this.update(id, { complete: false });
  },
  completeTodo: function (id) {
    this.update(id, { complete: true });
  },
  updateText: function (id, text) {
    text = action.text.trim();
    if (text !== '') {
      this.update(action.id, {text: text});
    }
  },

  /**
   * Update a TODO item.
   * @param  {string} id
   * @param {object} updates An object literal containing only the data to be
   *     updated.
   */
  update: function (id, props) {
    this.state[id] = extend({}, this.state[id], props);
    this.hasChanged();
  },

  /**
   * Update all of the TODO items with the same object.
   *     the data to be updated.  Used to mark all TODOs as completed.
   * @param  {object} updates An object literal containing only the data to be
   *     updated.

   */
  updateAll: function (props) {
    for (var id in this.state) {
      this.update(id, props);
    }
  },

  /**
   * Delete a TODO item.
   * @param  {string} id
   */
  destroy: function (id) {
    delete this.state[id];
    this.hasChanged();
  },

  /**
   * Delete all the completed TODO items.
   */
  destroyCompleted: function () {
    for (var id in this.state) {
      if (this.state[id].complete) {
        this.destroy(id);
      }
    }
  },

  /**
   * Tests whether all the remaining TODO items are marked as completed.
   * @return {boolean}
   */
  areAllComplete: function() {
    for (var id in this.state) {
      if (!this.state[id].complete) {
        return false;
      }
    }

    return true;
  }
});

module.exports = TodoStore;