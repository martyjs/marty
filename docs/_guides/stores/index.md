---
layout: page
title: Stores
id: stores
section: Stores
---

The store is where your state should live. It is also the only place that your state should **change**. Actions come in from the dispatcher and the store  decides whether to handle them or not. If the store does choose to handle an action and subsequently changes its state then it will notify any listeners that it has changed. Your views can then listen to those changes (via the [State Mixin]({% url /guides/state-mixin %})) and then re-render themselves.

All of a store's state should live within ``Store#state``. If you want to update the state you should use ``Store#setState`` which will update ``this.state`` and then notify any listeners that the store has changed. Or if you prefer you can update ``this.state`` and then manually call ``this.hasChanged()``

When you create a store it will automatically start listening to the dispatcher. To determine which actions to handle you define the [handlers](/api/stores/#handlers) hash. The keys in handlers are the functions you wish to call when an action comes in and the values are [action predicates](/api/stores/#action-predicates) (Normally the constant of the action's type). If your store does handle the action, then the arguments you passed to [ActionCreator#dispatch](/api/action-creators/index.html#dispatch) are the arguments for the handler.

{% highlight js %}
var UsersStore = Marty.createStore({
  displayName: 'Users',
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

var listener = UsersStore.addChangeListener(function () {
  console.log('Users store changed');
  listener.dispose();
});
{% endhighlight %}

Often action creators optimistically dispatch an action before connecting to a state source. So what should you do if that action fails? Action creators will emit actions of  type ``ACTION_FAILED`` and ``{Action Type}_FAILED`` which your store can handle. Alternatively you can return a function from an action handler which will be called if the action fails or if the [action rolled back](/api/stores/index.html#rollback).

{% highlight js %}
var UsersStore = Marty.createStore({
  addUser: function (user) {
    this.state[user.id] = user;
    this.hasChanged();

    return function (error) {
      this.state.errors[user.id] = error;
      delete this.state[user.id];
      this.hasChanged();
    }
  }
});
{% endhighlight %}
