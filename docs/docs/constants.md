---
layout: docs
title: Constants
description: Showing you what actions your application is capable of
id: constants
group: docs
header_colour: 433B46
order: 6
---

When an action creator creates an action, that action has an action type which is just a string identifier (e.g. <code>'DELETE_USER'</code>). The action type is what your stores use to decided whether to handle the action. One of their major benefits is this allows you to loosely couple your actions to your stores ([Law of Dementer](http://en.wikipedia.org/wiki/Law_of_Demeter)). This approach does make it difficult to understand at a high level what the application is capable of doing. The solution to this is **Constants**.

Constants are simple object literals where the key and the value are the same. They become a useful reference to help you understand the application (especially useful as the application grows).

{% highlight js %}
var Constants = {
  Users: {
    DELETE_USER: 'DELETE_USER',
    RECEIVE_USERS: 'RECEIVE_USERS'
  }
}
{% endhighlight %}

You then reference the constants in the rest of your application

```
var UserActionCreators = Marty.createActionCreators({
  deleteUser: function (user) {
    this.dispatch(Constants.Users.DELETE_USER, user);
  }
});

var UsersStore = Marty.createStore({
  handlers: {
    deleteUser: Constants.Users.DELETE_USER
  },
  deleteUser: function (user) {
    ...
  }
})

```

Marty offers a helper function, <code>Marty.createConstants()</code>, that makes it easier to create constants. You can pass an array of strings to it

{% highlight js %}
var Constants = Marty.createConstants([
  'RECEIVE_USERS',
  'DELETE_USER'
]);

//returns
{
  RECEIVE_USERS: 'RECEIVE_USERS',
  DELETE_USER: 'DELETE_USER'
}
{% endhighlight %}

Or you could pass an object literal of arrays. We recommend organising constants by domain and so this our preferred approach.

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
    RECEIVE_USERS: 'RECEIVE_USERS',
    DELETE_USER: 'DELETE_USER'
  },
  Foos: {
    Bars: {
      ADD_BAR: 'ADD_BAR'
    }
  }
}
{% endhighlight %}