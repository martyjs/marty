---
layout: page
title: Stores
id: stores
section: Stores
---

Stores hold information about a domain. That domain could be a collection of entities (Like a [Backbone Collection](http://backbonejs.org/#Collection)) or it could be some information about something specific (Like a [Backbone Model](http://backbonejs.org/#Model)). It is responsible for processing actions from the [dispatcher](/guides/dispatcher/index.html), updating its own state and notifying interested parties when its state changes.

The store should be the **only** place where your applications state changes. If your views want to update its state, it should call an [action creator](/guides/action-creators/index.html) which dispatches an action that stores listen to and update themselves and then notify the views about their new state.

{% highlight js %}
var UsersStore = Marty.createStore({
  name: 'Users',
  handlers: {
    addUser: Constants.RECEIVE_USER
  },
  getInitialState: function () {
    return {};
  },
  addUser: function (user) {
    this.state[user.id] = user;
    this.hasChanged();
  }
});
{% endhighlight %}

A store is a singleton which is created using [<code>Marty.createStore</code>](/api/stores/index.html#createStore). When the store is created it will call [<code>getInitialState</code>](/api/stores/index.html#getInitialState) which should return an object that all the stores state will live in. This state is accessible by calling <code>this.state</code>.

When an action is dispatched, the store will check its [``handlers`` hash](/api/stores/index.html#handlers) to see if the store has a handler for the actions type. If it does it will call that handler, passing in the actions data. If the handler updates the stores state state, it can call [<code>hasChanged</code>](/api/stores/index.html#hasChanged) which will notify any listening views of its new state.

If your view needs some state it should request it from the relevant store. If the store doesn't have it locally it should get it from a [state source](/guides/state-sources/index.html). The [fetch](/api/stores/index.html#fetch) API helps you define how to get the state locally and remotely. ``fetch`` requires 3 things: An Id that uniquely identifies the bit of state you are fetching (e.g. a user Id), a function to try and get the state from the store (``locally``) and a function to get the state from a state source (``remotely``).

{% highlight js %}
var UsersStore = Marty.createStore({
  getUser: function (id) {
    return this.fetch({
      id: id,
      locally: function () {
        return this.state[id];
      },
      remotely: function () {
        return UserAPI.getUser(id);
      }
    });
  }
});
{% endhighlight %}

The ``fetch`` function will first try calling the ``locally`` function. If it returns a value then it will immediately return. If it returns null or undefined then it will call the ``remotely`` function. Once ``remotely`` is finished executing then ``locally`` is then re-called with the expectation that the state should now be in the store. If ``remotely`` returns a promise then ``locally`` will be reinvoked once the promise resolves.

The result of the ``fetch`` function is a [fetch result](http://localhost:4000/api/stores/#fetch-result) which represents the current state of the fetch. The 3 states a fetch result can be in is **PENDING**, **DONE** OR **FAILED**. You can use ``FetchResult#when`` to switch between the 3 states

{% highlight js %}
var component = UserStore.getUser(123).when({
  pending: function () {
    return <Loading />;
  },
  failed: function (error) {
    return <ErrorPage error={error} />;
  },
  done: function (user) {
    return <div className="user">{user.name}</div>;
  }
});
{% endhighlight %}
