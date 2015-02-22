---
layout: page
title: Constants
id: constants
section: Constants
---

[Actions](/guides/action-creators/index.html) must have a type which is a terse description of what the action does (e.g. ``"DELETE_USER"``). The main purpose of action types is that they allow you to loosely couple your actions to your stores ([Law of Dementer](http://en.wikipedia.org/wiki/Law_of_Demeter)).

As your application grows you might find that it becomes littered with these strings, making it difficult to refactor and understand at a high level what actions are available. Marty provides **Constants** as a solution to this problem.

``Marty.createConstants`` will create an object literal where the key is the action type. The value is also the action type.

{% highlight js %}
var UserConstants = Marty.createConstants([
  "ADD_USER",
  "DELETE_USER",
  "UPDATE_USER_EMAIL"
]);

// returns
{
  ADD_USER: ..,
  DELETE_USER: ..,
  UPDATE_USER_EMAIL: ..,
}
{% endhighlight %}
