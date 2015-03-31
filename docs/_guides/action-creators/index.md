---
layout: page
title: Action Creators
id: action-creators
section: Action Creators
---

Action Creators are where any changes to your applications state start. Actions are functions that are responsible for coordinating changes to local and remote state.

All actions have a type of string which gives a terse description of what the action does (e.g. "UPDATE\_USER_EMAIL"). Stores listen for new actions (using the [dispatcher]({% url /guides/dispatcher/index.html %})) and use [action's type to determine whether to do something with it]({% url /api/stores/index.html#handlers %}). Action types help us build loosely coupled applications that can grow without increasing complexity.

To create an action, you should pass its type followed by any arguments to the [``dispatch``]({% url /api/actionCreators/index.html#dispatch %}) function.

{% sample %}
classic
=======
var Dispatcher = require('marty').dispatcher.getDefault();
var UserConstants = Marty.createConstants(["UPDATE_EMAIL"]);

var UserActionCreators = Marty.createActionCreators({
  id: 'UserActionCreators',
  updateEmail: function (userId, email) {
    this.dispatch(UserConstants.UPDATE_EMAIL, userId, email)
  }
});

UserActionCreators.updateEmail(123, "foo@bar.com");

Dispatcher.register(function (action) {
  console.log(action.type) // => "UPDATE_EMAIL"
  console.log(action.arguments) // => [123, "foo@bar.com"];
});
es6
===
var Dispatcher = require('marty').dispatcher.getDefault();
var UserConstants = Marty.createConstants(["UPDATE_EMAIL"]);

class UserActionCreators extends Marty.ActionCreators {
  updateEmail(userId, email) {
    this.dispatch(UserConstants.UPDATE_EMAIL, userId, email)
  }
}

userActionCreators = Marty.register(UserActionCreators);

userActionCreators.updateEmail(123, "foo@bar.com");

Dispatcher.register(function (action) {
  console.log(action.type) // => "UPDATE_EMAIL"
  console.log(action.arguments) // => [123, "foo@bar.com"];
});
{% endsample %}
