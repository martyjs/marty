---
layout: page
title: Queries API
id: api-queries
section: Queries
---
{% sample %}
classic
=======
var UserQueries = Marty.createQueries({
  getUser: function (id) {
    this.dispatch(UserActions.RECEIVE_USER_STARTING, id);
    this.app.userAPI.getUser(id).then(function (res) {
      if (res.status === 200) {
        this.dispatch(UserActions.RECEIVE_USER, res.body, id);
      } else {
        this.dispatch(UserActions.RECEIVE_USER_FAILED, id);
      }
    }.bind(this)).catch(function (err) {
      this.dispatch(UserActions.RECEIVE_USER_FAILED, id, err);
    }.bind(this))
  }
});

es6
===
class UserQueries extends Marty.Queries {
  getUser(id) {
    this.dispatch(UserActions.RECEIVE_USER_STARTING, id);
    this.app.userAPI.getUser(id).then((res) => {
      if (res.status === 200) {
        this.dispatch(UserActions.RECEIVE_USER, res.body, id);
      } else {
        this.dispatch(UserActions.RECEIVE_USER_FAILED, id);
      }
    }).catch((err) => this.dispatch(UserActions.RECEIVE_USER_FAILED, id, err));
  }
}
{% endsample %}

<h2 id="displayName">displayName</h2>

An optional display name for the queries. Used for richer debugging. If you're using ES6 classes, displayName will be the name of the class by default.

<h2 id="dispatch">dispatch(type, [...])</h2>

Dispatches an action payload with the given type. Any [action handlers]({% url /api/stores/index.html#handleAction %}) will be invoked with the given action handlers.

<h2 id="app">app</h2>

Returns the instance's [application]({% url /api/application/index.html %}).