---
layout: page
title: Action Creators API
id: api-action-creators
section: Action Creators
---
{% sample %}
classic
=======
var UserActionCreators = Marty.createActionCreators({
  id: 'UserActionCreators',
  types: {
    addUser: UserActions.ADD_USER
  },
  addUser: function (name, email) {
    this.dispatch(name, email);
  }
});

es6
===
class UserActionCreators extends Marty.ActionCreators {
  types: {
    addUser: UserActions.ADD_USER
  },
  addUser(name, email) {
    this.dispatch(name, email);
  }
}
{% endsample %}

<h2 id="id">id</h2>

A unique identifier (*required*). Used for registration within the container.

<h2 id="displayName">displayName</h2>

An (optional) display name for the action creator. Used for richer debugging. We will use the Id if displayName hasn't been set. If you're using ES6 classes, displayName will automatically be the name of the class.

<h2 id="types">types</h2>

An object hash where the key is the action creator name and the value is the action type. If a corresponding action creator does not exist, an action creator will be created which automatically dispatches any arguments.

<h2 id="dispatch">dispatch([...])</h2>

Dispatches an action payload. Any [action handlers](/api/stores/index.html#handleAction) will be invoked with the given action handlers.

Returns <code>Action</code>. You can rollback an action by calling <code>action.rollback()</code>.
