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
  id: 'UsersAPI'
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

<h2 id="id">id</h2>

A unique identifier (*required*). Needed by the [registry]({% url /api/registry/index.html %}) to uniquely identify the type.

<h2 id="type">type</h2>

The type of the state source (e.g. 'http').

<h2 id="mixins">mixins</h2>

An (optional) array of mixins that can be passed in through the createStateSource method.

<h2 id="for">for(obj)</h2>

Resolves the instance of the object for the objects Marty context. The context can either be the object itself or available at ``obj.context`` or ``obj.context.marty``.