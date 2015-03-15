---
layout: page
title: Constants
id: constants
section: Constants
---

[Actions](/guides/action-creators/index.html) must have a type which is a terse description of what the action does (e.g. ``"DELETE_USER"``). The main purpose of action types is that they allow you to loosely couple your actions to your stores ([Law of Demeter](http://en.wikipedia.org/wiki/Law_of_Demeter)).

As your application grows you might find that it becomes littered with these strings, making it difficult to refactor and understand at a high level what actions are available. Marty provides **Constants** as a solution to this problem.

``Marty.createConstants`` will create an object literal where the key is the action type

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

The value for each constant is a little more complex. It can be treated as a string however they are actually helper functions for creating action creators

{% highlight js %}
UserConstants.ADD_USER == "ADD_USER" // => true

var addUser = UserConstants.ADD_USER(function (user) {
  console.log(user);
});

console.log(addUser.properties) // => { type: "ADD_USER" }

addUser({ name: "Foo" });
{% endhighlight %}

You can pass in custom properties as the second argument to action creator helper function

{% highlight js %}
var UserActionCreators = Marty.createActionCreators({
  deleteUser: UserConstants.DELETE_USER(function (user) {
    this.dispatch(user);
  }, { foo: true })
});

var FooStore = Marty.createStore({
  handlers: {
    fooAction: { foo: true }
  },
  fooAction: function () {
    ...
  }
})
{% endhighlight %}

We found that a lot of the time action creators just dispatched any arguments it was invoked with. Constants can automatically generate that function for you, all you need to do is not pass in a function as the first argument

{% highlight js %}
var UserActionCreators = Marty.createActionCreators({
  deleteUser: UserConstants.DELETE_USER(),

  // Same as
  deleteUser: UserConstants.DELETE_USER(function (user) {
    this.dispatch(user);
  })
});
{% endhighlight %}
