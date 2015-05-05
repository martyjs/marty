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
  addUser: function (name, email) {
    this.dispatch(UserActions.ADD_USER, name, email);
  }
});

es6
===
class UserActionCreators extends Marty.ActionCreators {
  addUser(name, email) {
    this.dispatch(UserActions.ADD_USER, name, email);
  }
}
{% endsample %}

<h2 id="displayName">displayName</h2>

An optional display name for the action creator. Used for richer debugging.  If you're using ES6 classes, displayName will be the name of the class by default.

<h2 id="dispatch">dispatch(type, [...])</h2>

Dispatches an action payload with the given type. Any [action handlers]({% url /api/stores/index.html#handleAction %}) will be invoked with the given action handlers.

<h2 id="app">app</h2>

Returns the instance's [application]({% url /api/application/index.html %}).