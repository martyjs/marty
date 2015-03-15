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

<h2 id="id">id</h2>

A unique identifier (*required*). Used for registration within the container.

<h2 id="displayName">displayName</h2>

An (optional) display name for the action creator. Used for richer debugging. We will use the Id if displayName hasn't been set. If you're using ES6 classes, displayName will automatically be the name of the class.

<h2 id="dispatch">dispatch(type, [...])</h2>

Dispatches an action payload with the given type. Any [action handlers]({% url /api/stores/index.html#handleAction %}) will be invoked with the given action handlers.

<h2 id="for">for(obj)</h2>

Resolves the instance of the object for the objects Marty context. The context can either be the object itself or available at ``obj.context`` or ``obj.context.marty``.