/*
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * TodoActions
 */

var Marty = require('../marty');
var TodoConstants = require('../constants/TodoConstants');


var TodoActions = Marty.createActionCreators({

  /**
   * @param  {string} text
   */
  create: TodoConstants.TODO_CREATE(function (text) {
    this.dispatch(text);
  }),

  /**
   * @param  {string} id The ID of the ToDo item
   * @param  {string} text
   */
  updateText: TodoConstants.TODO_UPDATE_TEXT(function (id, text) {
    this.dispatch(id, text);
  }),

  /**
   * Toggle whether a single ToDo is complete
   * @param  {object} todo
   */
  toggleComplete: function (todo) {
    var id = todo.id;
    if (!todo.complete) {
      this.complete(id);
    } else {
      this.undoComplete(id);
    }
  },

   /**
   * @param  {string} id The ID of the ToDo item
   */
  complete: TodoConstants.TODO_COMPLETE(function (id) {
    this.dispatch(id);
  }),

  /**
   * @param  {string} id The ID of the ToDo item
   */
  undoComplete: TodoConstants.TODO_UNDO_COMPLETE(function (id) {
    this.dispatch(id);
  }),

  /**
   * Mark all ToDos as complete
   */
  toggleCompleteAll: TodoConstants.TODO_TOGGLE_COMPLETE_ALL(function () {
    this.dispatch();
  }),

  /**
   * @param  {string} id
   */
  destroy: TodoConstants.TODO_DESTROY(function (id) {
    this.dispatch(id);
  }),

  /**
   * Delete all the completed ToDos
   */
  destroyCompleted: TodoConstants.TODO_DESTROY_COMPLETED(function () {
    this.dispatch();
  })

});

module.exports = TodoActions;
