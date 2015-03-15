---
layout: page
title: Constants
id: constants
section: Constants
---

[Actions]({% url /guides/action-creators/index.html %}) must have a type which is a terse description of what the action does (e.g. ``"DELETE_USER"``). The main purpose of action types is that they allow you to loosely couple your actions to your stores ([Law of Demeter](http://en.wikipedia.org/wiki/Law_of_Demeter)).

As your application grows you might find that it becomes littered with these strings, making it difficult to refactor and understand at a high level what actions are available. Marty provides **Constants** as a solution to this problem.

``Marty.createConstants`` will create an object literal where the key is the action type. The value is also the action type. We also create a few extra constants for you so that you can dispatch the various states an action can be in (e.g. starting, done, failed).

{% highlight js %}
var UserConstants = Marty.createConstants([
  "ADD_USER",
  "DELETE_USER",
  "UPDATE_USER_EMAIL"
]);

// returns
{
  ADD_USER: 'ADD_USER',
  ADD_USER_STARTING: 'ADD_USER_STARTING',
  ADD_USER_DONE: 'ADD_USER_DONE',
  ADD_USER_FAILED: 'ADD_USER_FAILED',

  DELETE_USER: 'DELETE_USER',
  DELETE_USER_STARTING: 'DELETE_USER_STARTING',
  DELETE_USER_DONE: 'DELETE_USER_DONE',
  DELETE_USER_FAILED: 'DELETE_USER_FAILED',

  UPDATE_USER_EMAIL: 'UPDATE_USER_EMAIL',
  UPDATE_USER_STARTING: 'UPDATE_USER_STARTING',
  UPDATE_USER_DONE: 'UPDATE_USER_DONE',
  UPDATE_USER_FAILED: 'UPDATE_USER_FAILED',
}
{% endhighlight %}
