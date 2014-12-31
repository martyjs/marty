---
layout: docs
title: Action Creators
id: action-creators
group: docs
header_colour: D65D28
order: 3
---

Action Creators are where any changes to your applications state starts. Actions are functions that are responsible for coordinating changes to local and remote state.

All actions have a type which is string which gives a terse description of what the action does (e.g. "UPDATE\_USER_EMAIL"). Stores listen for new actions (using the [dispatcher](/docs/dispatcher.html)) and use [action's type to determine whether to do something with it](/docs/stores.html#handlers). Action types help us build loosely coupled applications that can grow without increasing complexity.
 
[Constants](/docs/constants.html) provide a simple way of creating action creators for a type

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

<h2 id="api">API</h2>

<h3 id="createActionCreators">createActionCreators(props)</h3>

To create some new action creators, you call <code>Marty.createActionCreators</code> passing in an object literal. It returns your action creators as a singleton.

{% highlight js %}
var UserActionCreators = Marty.createActionCreators({
  addUser: UserActions.ADD_USER(function (name, email) {
    this.dispatch(name, email);
  })
});
{% endhighlight %}

<h3 id="displayName">displayName</h3>

An (optional) display name for the action creator. Used for richer debugging.

<h3 id="dispatch">dispatch([...])</h3>

Dispatches an action payload. Any [action handlers](/docs/stores.html#handleAction) will be invoked with the given action handlers.

Returns <code>Action</code>. You can rollback an action by calling <code>action.rollback()</code>.

<h2 id="server-action-creators">Server Action Creators</h2>

Action creators often will call an [Http API](/docs/httpApi.html) which, when complete, will then call another action creator with the new data. If you are using a module loader (e.g. CommonJS, AMD) it can cause a cyclic dependency between the Action Creator and the HTTP API.

The way to get around this is to have a seperate action creator, called a Server Action Creator, that is responsible for handling responses from Http APIs.

{% highlight js %}
var UserActionCreators = Marty.createActionCreators({
  saveUser: UserActions.SAVE_USER(function (user) {
    return UserAPI.saveUser(user);
  })
});

var UserServerActionCreators = Marty.createActionCreators({
  addUser: UserActions.ADD_USER(function (user) {
    this.dispatch(user);
  })
});

var UserAPI = Marty.createHttpAPI({
  saveUser: function (user) {
    this.post({ url: '/users', data: user }).then(function (user) {
      UserServerActionCreators.addUser(user);
    });
  }
});
{% endhighlight %}

<h2 id="actions-vs-action-creators">Actions vs Action Creators</h2>

There has been some confusion around actions and action creators. In the [original blog announcing Flux](http://facebook.github.io/flux/docs/overview.html), [action creators were called actions](http://facebook.github.io/flux/docs/overview.html#actions). Since then, the creators of Flux have [decided to rename actions to action creators](https://groups.google.com/d/msg/reactjs/jBPHH4Q-8Sc/zwObiX9UT2EJ) because "they create actions but are not themselves actually the action itself".

Utilmately this is just semantics so actions and action creators are terms that can be used interchangeably.

<h2 id="further-reading">Further reading</h2>

* [Actions and Action Creators](http://facebook.github.io/react/blog/2014/07/30/flux-actions-and-the-dispatcher.html#actions-and-actioncreators)
* [Discussion on actions & action creators](https://groups.google.com/forum/#!topic/reactjs/jBPHH4Q-8Sc)
* [Original article about Flux](http://facebook.github.io/flux/docs/overview.html#stores)