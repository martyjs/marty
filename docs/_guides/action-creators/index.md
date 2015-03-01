---
layout: page
title: Action Creators
id: action-creators
section: Action Creators
---

Action Creators are where any changes to your applications state start. Actions are functions that are responsible for coordinating changes to local and remote state.

All actions have a type of string which gives a terse description of what the action does (e.g. "UPDATE\_USER_EMAIL"). Stores listen for new actions (using the [dispatcher](/guides/dispatcher/index.html)) and use [action's type to determine whether to do something with it](/api/stores/index.html#handlers). Action types help us build loosely coupled applications that can grow without increasing complexity.

To define the action type for an action creator you use the [types object hash](/api/actionCreators/index.html#types)

{% sample %}
classic
=======
var UserConstants = Marty.createConstants(["UPDATE_EMAIL"]);

var UserActionCreators = Marty.createActionCreators({
  id: 'UserActionCreators',
  types: {
    updateEmail: UserConstants.UPDATE_EMAIL
  },
  updateEmail: function (userId, email) {
    ...
  }
});

UserActionCreators.updateEmail(123, "foo@bar.com");

es6
===
var UserConstants = Marty.createConstants(["UPDATE_EMAIL"]);

class UserActionCreators extends Marty.ActionCreators {
  constructor(options) {
    super(options);
    this.types = {
      updateEmail: UserConstants.UPDATE_EMAIL
    };
  }
  updateEmail(userId, email) {
    ...
  }
}

UserActionCreators.updateEmail(123, "foo@bar.com");
{% endsample %}

If your action wants to make a change to the local state, you can use ``this.dispatch()``.

{% sample %}
classic
=======
var Dispatcher = require('marty/dispatcher');

var UserActionCreators = Marty.createActionCreators({
  types: {
    updateEmail: UserConstants.UPDATE_EMAIL
  },
  updateEmail: function (userId, email) {
    this.dispatch(userId, email);
  }
});

Dispatcher.register(function (action) {
  console.log(action.type) // => "UPDATE_EMAIL"
  console.log(action.arguments) // => [123, "foo@bar.com"];
});

UserActionCreators.updateEmail(123, "foo@bar.com");
es6
===
var Dispatcher = require('marty/dispatcher');

class UserActionCreators extends Marty.ActionCreators {
  constructor(options) {
    super(options);
    this.types = {
      updateEmail: UserConstants.UPDATE_EMAIL
    };
  }
  updateEmail(userId, email) {
    this.dispatch(userId, email);
  }
}

Dispatcher.register((action) => {
  console.log(action.type) // => "UPDATE_EMAIL"
  console.log(action.arguments) // => [123, "foo@bar.com"];
});

UserActionCreators.updateEmail(123, "foo@bar.com");
{% endsample %}

We found that a lot of the time action creators just dispatched any arguments it was invoked with. If you add an action creator name to the types object but dont add an associated function, Marty will create one for you which dispatches whatever arguments passed to it.

{% sample %}
classic
=======
var UserActionCreators = Marty.createActionCreators({
  id: 'UserActionCreators',
  types: {
    foo: Constants.FOO,
    bar: Constants.BAR
  },
  // This is unnecessary, Marty will do this for you automatically
  bar: function (baz) {
    this.dispatch(baz);
  }
});

UserActionCreators.foo(1, 2); // Dispatch FOO(1, 2)
UserActionCreators.bar('baz'); // Dispatch BAR('baz')
es6
===
class UserActionCreators extends Marty.ActionCreators {
  constructor(options) {
    super(options);
    this.types = {
      foo: Constants.FOO,
      bar: Constants.BAR
    };
  }
  // This is unnecessary, Marty will do this for you automatically
  bar(baz) {
    this.dispatch(baz);
  }
}

UserActionCreators.foo(1, 2); // Dispatch FOO(1, 2)
UserActionCreators.bar('baz'); // Dispatch BAR('baz')
{% endsample %}

You often want to know if an action is starting, finished or has failed. To help here Marty actually emits a number of other actions:

* When an action is about to start
  * ``ACTION_STARTING`` (see ``require('marty/constants/actions')``)
  * ``{Action Type}_STARTING`` (e.g. ``UPDATE_EMAIL_STARTING``)
* When an action is done
  * ``ACTION_DONE`` (see ``require('marty/constants/actions')``)
  * ``{Action Type}_DONE`` (e.g. ``UPDATE_EMAIL_DONE``)
* When an action has failed
  * ``ACTION_FAILED`` (see ``require('marty/constants/actions')``)
  * ``{Action Type}_FAILED`` (e.g. ``UPDATE_EMAIL_FAILED``)

If the action creator returns a promise then Marty will wait for the promise to resolve or be rejected before dispatching done/failed actions.
