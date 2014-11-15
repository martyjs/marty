---
layout: docs
title: Action Creators
id: action-creators
group: docs
header_colour: D65D28
order: 3
---


When new data arrives into your application it needs to be processed by the stores before being passed to the views (Called a [data flow](/docs/#data-flow)). Action creators are responsible for formatting that data in a standardised way so that it can be processed by the stores. It does this by creating an action which is composed of a type, some data and (optionally) a source (e.g. from the view, server).

At their most basic, an action creator is a function that calls [<code>this.dispatch</code>](#dispatch) with an action type (Ideally from a [constant](/docs/constants.html)) and any data you want to pass to the store.

{% highlight js %}
var UserActionCreators = Marty.createActionCreators({
  name: 'Users',
  createUser: function (name, email) {
    this.dispatch(Constants.Users.CREATE_USER, name, email);
  }
});

var UserStore = Marty.createStore({
  handlers: {
    createUser: Constants.Users.CREATE_USER
  },
  createUser: function (name, email) {
    this.state.push({
      name: name,
      email: email
    });
    this.hasChanged();
  }
})
{% endhighlight %}

Internally the dispatch function will create a new action which is passed to the [dispatcher](/docs/dispatcher.html) which it to [<code>Store#handleAction</code>](/docs/stores.html#handAction).

{% highlight js %}
var action = {
  source: 'VIEW',
  type: 'CREATE_USER',
  arguments: ['foo', 'foo@bar.com']
}
{% endhighlight %}

<h2 id="api">API</h2>

<h3 id="createActionCreators">Marty.createActionCreators(instanceProperties)</h3>

To create soem new action creators, you call <code>Marty.createActionCreators</code> passing in a set of intance properties. It returns your action creators as a singleton.

{% highlight js %}
var UserActionCreators = Marty.createActionCreators({
  createUser: function (name, email) {
    this.dispatch(Constants.Users.CREATE_USER, name, email);
  }
});
{% endhighlight %}

<h3 id="name">name</h3>

An (optional) display name for the action creator. Used by developer tools.

<h3 id="dispatch">this.dispatch(actionType, [...])</h3>

Creates a new action, with the action type being the first argument. The remaining arguments will be the arguments for any [store action handlers](/docs/stores.html#handleAction).

The actions source will be null.

<h3 id="dispatchViewAction">this.dispatchViewAction(actionType, [...])</h3>

Creates a new action, with the action type being the first argument. The remaining arguments will be the arguments for any [store action handlers](/docs/stores.html#handleAction).

The actions source will be <code>VIEW</code> (or <code>Marty.constants.actionSources.VIEW</code>).

<h3 id="dispatchServerAction">this.dispatchServerAction(actionType, [...])</h3>

Creates a new action, with the action type being the first argument. The remaining arguments will be the arguments for any [store action handlers](/docs/stores.html#handleAction).

The actions source will be <code>SERVER</code> (or <code>Marty.constants.actionSources.SERVER</code>).

<h2 id="server-action-creators">Server Action Creators</h2>

Action creators often will call an [Http API](/docs/httpApi.html) which, when complete, will then call another action creator with the new data. If you are using a module loader (e.g. CommonJS, AMD) it can cause a cyclic dependency between the Action Creator and the HTTP API.

The way to get around this is to have a seperate action creator, called a Server Action Creator, that is responsible for handling responses from Http APIs.

{% highlight js %}
var UserActionCreators = Marty.createActionCreators({
  saveUser: function (user) {
    UserAPI.createUser(user);
  }
});

var UserServerActionCreators = Marty.createActionCreators({
  receiveUser: function (user) {
    this.dispatch(Constants.Users.ADD_USER, user);
  }
});

var UserAPI = Marty.createHttpAPI({
  createUser: function (user) {
    this.post({ url: '/users', data: user }).then(function (user) {
      UserServerActionCreators.receiveUser(user);
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