---
layout: docs
title: Constants
description: Showing you what actions your application is capable of
id: constants
group: docs
header_colour: 433B46
order: 6
---

[Actions](/docs/actionCreators.html) must have a type which is a terse description of what the action does (e.g. ``"DELETE_USER"``). The main of action types is that they allow you to loosely couple your actions to your stores ([Law of Dementer](http://en.wikipedia.org/wiki/Law_of_Demeter)).

As your application grows you might find it becomes littered with these strings making it difficult to refactor and understand at a high level what actions are available. Marty provides **Constants** as a solution to this problem. 

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


<h2 id="api">API</h2>

<h3 id="createConstantsArray">createConstants(<i>Array</i>)</h3>

{% highlight js %}
var Constants = Marty.createConstants([
  'RECEIVE_USERS',
  'DELETE_USER'
]);

//returns
{
  RECEIVE_USERS: function RECEIVE_USERS_CREATOR() { ... },
  DELETE_USER: function DELETE_USER_CREATOR() { ... }
}
{% endhighlight %}


<h3 id="createConstantsObj">Marty.createConstants(<i>Object</i>)</h3>

{% highlight js %}
var Constants = Marty.createConstants([
  Users: ['RECEIVE_USERS', 'DELETE_USER'],
  Foos: {
    Bars: ['ADD_BAR']
  }
]);

//returns
{
  Users: {
    RECEIVE_USERS: function RECEIVE_USERS_CREATOR() { ... },
    DELETE_USER: function DELETE_USER_CREATOR() { ... }
  },
  Foos: {
    Bars: {
      ADD_BAR: function ADD_BAR_CREATOR() { ... }
    }
  }
}
{% endhighlight %}