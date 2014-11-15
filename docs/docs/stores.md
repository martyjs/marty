---
layout: docs
title: Stores
id: stores
group: docs
header_colour: 1DACA8
order: 2
---

A store is where the applications state and logic live for a specific domain. A store can contain a collection of domain entities (Like a [Backbone Collection](http://backbonejs.org/#Collection)) or it could store some data about something (Like a [Backbone Model](http://backbonejs.org/#Model)).

The store should be the **only** place where your applications state changes. If your views want to update its state, it should call an [action creator](/docs/actionCreators.html) which dispatches an action that stores listen to and update themselves and then notify the views about their new state.

{% highlight js %}
var UsersStore = Marty.createStore({
  handlers: {
    addUser: Constants.RECEIVE_USER
  },
  addUser: function (user) {
    this.state.push(user);
    this.hasChanged();
  },
  getInitialState: function () {
    UsersAPI.getAll();
    return [];
  },
  getUser: function (id) {
    return _.where(this.state, {
      id: id
    });
  }
});
{% endhighlight %}

A store is a singleton which is created using [<code>Marty.createStore</code>](#createStore). When the store is creted it will call [<code>getInitialState</code>](#getInitialState) which should return an object that all the stores state will live in. This state is accessible by calling <code>this.state</code>. Stores are responsible for fetching their own data so [<code>getInitialState</code>](#getInitialState) is a good place to make any [API calls](/docs/httpApi.html).

The store will also register with the [dispatcher](/docs/dispatcher.html) to be notified of any new actions on creation. When an action arrives, the store determines whether to handle that action or not. It does this by looking at the [handlers](#handlers) where the key is the name of the handler function and the value is an [action predicate](#action-predicates).

When an action handler is invoked, its arguments will be [the arguments passed to the dispatcher](/docs/actionCreators.html#dispatch). If the handler updates its state, it can call [<code>hasChanged</code>](#hasChanged) which will notify any listening views of its new state.

<h2 id="api">API</h2>

<h3 id="createStore">Marty.createStore(instanceProperties)</h3>

To create a new store, you call <code>Marty.createStore</code> passing in a set of intance properties. It returns a singleton store which is listening to the dispatcher.

{% highlight js %}
var UsersStore = Marty.createStore({
  handlers: {
    addUser: Constants.RECEIVE_USER
  },
  addUser: function (user) {
    this.state.push(user);
    this.hasChanged();
  },
  getInitialState: function () {
    return [];
  }
});
{% endhighlight %}

<h3 id="handlers">handlers</h3>

The <code>handlers</code> property is used to define which handlers should be called when an action is dispatched. The key is the name of the handler and value is an [action predicate](#action-predicates).

When invoked the handlers arguments are [the arguments passed to the dispatcher](/docs/actionCreators.html#dispatch). The original action is available by calling <code>this.action</code>.

{% highlight js %}
var UsersStore = Marty.createStore({
  handlers: {
    addUser: Constants.RECEIVE_USER
  },
  addUser: function (user) {
    console.log(this.action) // { type: 'RECEIVE_USER', arguments: [{ name: ...}] }
    ...
  }
});
{% endhighlight %}

<h4 id="action-predicates">Action predicates</h4>

An action predicate can either be a single value or an array of either action types (i.e. a strong) or a <a href="https://lodash.com/docs#where">where query</a>. Some examples of action predicates:

<ul>
  <li><code>'ADD_USER'</code></li>
  <li><code>['USER_CREATED', 'USER_UPDATED']</code></li>
  <li><code>{ source: 'VIEW' }</code></li>
  <li><code>[{ source: 'VIEW' }, 'USER_DELETED']</code></li>
</ul>

<h3 id="getInitialState">getInitialState()</h3>

<h3 id="state">state</h3>

<h4 id="setState">setState(state)</h4>

<h4 id="addChangeListener">addChangeListener(state)</h4>

<h4 id="removeChangeListener">removeChangeListener(state)</h4>


<h3 id="hasChanged">hasChanged()</h3>

<h3 id="waitFor">waitFor(*stores)</h3>

<h2 id="immutable">Immutable data collections</h2>
