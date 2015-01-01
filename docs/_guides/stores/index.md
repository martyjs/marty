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
  },
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

A store is a singleton which is created using [<code>Marty.createStore</code>](/api/stores/index.html#createStore). When the store is created it will call [<code>getInitialState</code>](/api/stores/index.html#getInitialState) which should return an object that all the stores state will live in. This state is accessible by calling <code>this.state</code>.

When an action is dispatched, the store will check its [``handlers`` hash](/api/stores/index.html#handlers) to see if the store has a handler for the actions type. If it does it will call that handler, passing in the actions data. If the handler updates the stores state state, it can call [<code>hasChanged</code>](/api/stores/index.html#hasChanged) which will notify any listening views of its new state.

If your view needs some data, it should request it from the relevant store. The store is responsible for sourcing it, either locally or from the server. The [fetch](/api/stores/index.html#fetch) API helps simplify handling async operations.