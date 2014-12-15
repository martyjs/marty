---
layout: docs
title: Action Creators
id: action-creators
group: docs
header_colour: D65D28
order: 3
---

Action Creators are where any changes to your applications state starts. Actions are functions that are responsible for coordinating changes to local and remote state.

All actions have a type which is string which gives a terse description of what the action does (e.g. "UPDATE\_USER_EMAIL"). Stores listen for new actions (using the [dispatcher](/docs/dispatcher.html)) and use [action's type to determine whether to do something with it](/docs/stores.html#handlers). Using strings helps us build loosely coupled applications that can grow without increasing complexity.

Lets look at how you define an action creator using marty:

{% highlight js %}
var UserActionCreators = Marty.createActionCreators({
  updateEmail: ["UPDATE_EMAIL", function (userId, email) {
    ...
  }]
});

UserActionCreators.updateEmail(123, "foo@bar.com");
{% endhighlight %}

In this case the actions type is "UPDATE\_EMAIL" and the second function in the array is the action which will be invoked when you call ``updateEmail``. We found that more often than not the action type is the same as the actions function name so by convention we camelize, underscore and upper case it. In the above example, specifying the action type is superfluous because updateEmail becomes "UPDATE\_EMAIL".

{% highlight js %}
var UserActionCreators = Marty.createActionCreators({
  updateEmail: function (userId, email) {
    ...
  }
});
{% endhighlight %}
If you want to make a change locally, you can use ``this.dispatch()``.

{% highlight js %}
var UserActionCreators = Marty.createActionCreators({
  updateEmail: function (userId, email) {
    this.dispatch(userId, email);
  }
});

Marty.dispatcher.register(function (action) {
  console.log(action.type) // => "UPDATE_EMAIL"
  console.log(action.arguments) // => [123, "foo@bar.com"];
});

UserActionCreators.updateEmail(123, "foo@bar.com");
{% endhighlight %}

Action creators become more complex when you start involving remote requests since they involve asynchronous calls and have the potential to fail. Traditionally you would pass in a callback or return a promise but comply with Flux's unidirectional data flow rule. So we need a different approach to ensure data is flowing in the right direction.

If an action fails then an extra action is dispatched with the type ``{action type}_FAILED`` (e.g. ``CREATE_USER_FAILED``) that contains the error allowing you to update your state.

Marty also has an Actions store (``Marty.Stores.Actions``) which knows about all actions. When you create an action, it will return an **action token** which you can use to get the status of an action.

{% highlight js %}
var UserActionCreators = Marty.createActionCreators({
  createUser: function (user) {
    return UserAPI.createUser(user);
  }
});

var createUserToken = UserActionCreators.createUser(user);

Marty.Stores.Actions.addChangeListener(function () {
  var action = Marty.getAction(createUserAction); // Shortcut for Marty.Stores.Actions.getAction()
  console.log(action.status)
});
{% endhighlight %}

Like [store fetches](/docs/stores.html#fetches), an action's status can either be **pending**, **done** or **error**. If you are using the [state mixin](/docs/stateMixin.html) then it automatically listens to the actions store ([unless you tell it not to](/docs/stateMixin.html#listenToActions)).

{% highlight js %}
var UserFormState = Marty.createStateMixin({
  getState: function () {
    return {
      createUser: Marty.getAction(this.state.createUserToken)
    }
  }
});

var UserForm = Marty.createActionCreators({
  render: function () {
    return this.state.createUser.when({
      pending: function () {
        return <div className="pending"/>;
      },
      failed: function (error) {
        return <div className="error">{error.message}</div>;
      },
      done: function (user) {
        return <div className="user">{user.name}</div>;
      }
    });
  },
  createUser: function (user) {
    this.setState({
      createUserToken: UserActionCreators.createUser(user)
    })
  }
});
{% endhighlight %}

<h2 id="api">API</h2>

<h3 id="createActionCreators">createActionCreators(props)</h3>

To create some new action creators, you call <code>Marty.createActionCreators</code> passing in a set of properties. It returns your action creators as a singleton.

{% highlight js %}
var UserActionCreators = Marty.createActionCreators({
  addUser: function (name, email) {
    this.dispatch(name, email);
  }
});
{% endhighlight %}

<h3 id="name">name</h3>

An (optional) display name for the action creator. Used for richer debugging.

<h3 id="dispatch">dispatch([...])</h3>

Dispatches an action payload. Any [action handlers](/docs/stores.html#handleAction) will be invoked with the given action handlers.

Returns <code>Action</code>. You can rollback an action by calling <code>action.rollback()</code>.

<h3 id="getActionType">getActionType(functionName)</h3>

Returns the action type for a given function name. The default implementation will camelize, underscore and upper case the function name (fooBarBaz becomes "FOO\_BAR_BAZ"). To implement your own naming strategy you can re-implement this function.

<h2 id="server-action-creators">Server Action Creators</h2>

Action creators often will call an [Http API](/docs/httpApi.html) which, when complete, will then call another action creator with the new data. If you are using a module loader (e.g. CommonJS, AMD) it can cause a cyclic dependency between the Action Creator and the HTTP API.

The way to get around this is to have a seperate action creator, called a Server Action Creator, that is responsible for handling responses from Http APIs.

{% highlight js %}
var UserActionCreators = Marty.createActionCreators({
  saveUser: function (user) {
    return UserAPI.saveUser(user);
  }
});

var UserServerActionCreators = Marty.createActionCreators({
  addUser: function (user) {
    this.dispatch(user);
  }
});

var UserAPI = Marty.createHttpAPI({
  saveUser: function (user) {
    this.post({ url: '/users', data: user }).then(function (user) {
      UserServerActionCreators.addUser(user);
    });
  }
});
{% endhighlight %}

<h2 id="actions-vs-action-creators">Actions vs Action Creators</h2>

There has been some confusion around actions and action creators. In the [original blog announcing Flux](http://facebook.github.io/flux/docs/overview.html), [action creators were called actions](http://facebook.github.io/flux/docs/overview.html#actions). Since then, the creators of Flux have [decided to rename actions to action creators](https://groups.google.com/d/msg/reactjs/jBPHH4Q-8Sc/zwObiX9UT2EJ) because "they create actions but are not themselves actually the action itself".

Utilmately this is just semantics so actions and action creators are terms that can be used interchangeably.

<h2 id="further-reading">Further reading</h2>

* [Actions and Action Creators](http://facebook.github.io/react/blog/2014/07/30/flux-actions-and-the-dispatcher.html#actions-and-actioncreators)
* [Discussion on actions & action creators](https://groups.google.com/forum/#!topic/reactjs/jBPHH4Q-8Sc)
* [Original article about Flux](http://facebook.github.io/flux/docs/overview.html#stores)