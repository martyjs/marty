---
layout: page
title: Action Creators
id: action-creators
section: Action Creators
---

Action Creators are where any changes to your applications state start. Actions are functions that are responsible for coordinating changes to local and remote state.

All actions have a type of string which gives a terse description of what the action does (e.g. "UPDATE\_USER_EMAIL"). Stores listen for new actions (using the [dispatcher](/guides/dispatcher/index.html)) and use [action's type to determine whether to do something with it](/api/stores/index.html#handlers). Action types help us build loosely coupled applications that can grow without increasing complexity.

[Constants](/guides/constants/index.html) provide a simple way of creating action creators for a type

{% highlight js %}
var UserConstants = Marty.createConstants(["UPDATE_EMAIL"]);

var UserActionCreators = Marty.createActionCreators({
  updateEmail: UserConstants.UPDATE_EMAIL(function (userId, email) {
    ...
  })
});

UserActionCreators.updateEmail(123, "foo@bar.com");
{% endhighlight %}

If your action wants to make a change to the local state, you can use ``this.dispatch()``.

{% highlight js %}
var Dispatcher = require('marty/dispatcher');

var UserActionCreators = Marty.createActionCreators({
  updateEmail: UserConstants.UPDATE_EMAIL(function (userId, email) {
    this.dispatch(userId, email);
  })
});

Dispatcher.register(function (action) {
  console.log(action.type) // => "UPDATE_EMAIL"
  console.log(action.arguments) // => [123, "foo@bar.com"];
});

UserActionCreators.updateEmail(123, "foo@bar.com");
{% endhighlight %}

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