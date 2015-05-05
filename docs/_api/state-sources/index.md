---
layout: page
title: State Sources API
id: api-state-sources
section: State Sources
---

{% sample %}
classic
=======
var UsersAPI = Marty.createStateSource({
  createUser: function (user) {
    return $.get("/users");
  }
});

es6
===
class UsersAPI extends Marty.StateSource {
  createUser(user) {
    return $.get("/users");
  }
}
{% endsample %}

<h2 id="type">type</h2>

The type of the state source (e.g. 'http').

<h2 id="mixins">mixins</h2>

An (optional) array of mixins that can be passed in through the createStateSource method.

<h2 id="app">app</h2>

Returns the instance's [application]({% url /api/application/index.html %}).