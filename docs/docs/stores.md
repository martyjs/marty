---
layout: docs
title: Stores
id: stores
group: docs
header_colour: 1DACA8
order: 2
---

Stores hold information about a domain. That domain could be a collection of entities (Like a [Backbone Collection](http://backbonejs.org/#Collection)) or it could be some information about something specific (Like a [Backbone Model](http://backbonejs.org/#Model)). It is responsible for processing actions from the [dispatcher](/docs/dispatcher.html), updating its own state and notifying interested parties when its state changes.

The store should be the **only** place where your applications state changes. If your views want to update its state, it should call an [action creator](/docs/actionCreators.html) which dispatches an action that stores listen to and update themselves and then notify the views about their new state.

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

A store is a singleton which is created using [<code>Marty.createStore</code>](#createStore). When the store is created it will call [<code>getInitialState</code>](#getInitialState) which should return an object that all the stores state will live in. This state is accessible by calling <code>this.state</code>.

When an action is dispatched, the store will check its [``handlers`` hash](/docs/stores.html#handlers) to see if the store has a handler for the actions type. If it does it will call that handler, passing in the actions data. If the handler updates the stores state state, it can call [<code>hasChanged</code>](#hasChanged) which will notify any listening views of its new state.

If your view needs some data, it should request it from the relevant store. The store is responsible for sourcing it, either locally or from the server. The [fetch](/docs/stores.html#fetch) API helps simplify handling async operations.


<h2 id="api">API</h2>

<h3 id="createStore">createStore(props)</h3>

To create a new store, you call <code>Marty.createStore</code> passing in a set of instance properties. It returns a singleton store which is listening to the dispatcher.

{% highlight js %}
var UsersStore = Marty.createStore({
  name: 'Users',
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

<h3 id="name">name</h3>

An (optional) display name for the store. Used for richer debugging.

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

{% highlight js %}
var UsersStore = Marty.createStore({
  handlers: {
    foo: 'ADD_USER',
    bar: ['ADD_USER', 'UPDATE_USER'],
    baz: { source: 'VIEW' },
    bam: [{ source: 'VIEW' }, 'USER_DELETED']
  },
  // called when action.type == 'ADD_USER'
  foo: function () { .. },

  // called when action.type == 'ADD_USER' || action.type ==  'UPDATE_USER'
  bar: function () { .. },

  // called when action.source == 'VIEW'
  baz: function () { .. },

  // called when action.source == 'VIEW' || action.type ==  'USER_DELETED'
  bam: function () { .. }
});
{% endhighlight %}

<h4 id="rollback">Rollback</h4>

There are a number of cases where it would be useful to be able to rollback an action (e.g. if you've optimistically added an entity to your locally store but the associated request to the server failed).

To provide a rollback to an action handler, simply return a function from the action handler. If an [action is rolled back](/docs/actionCreators.html#dispatch), the function you return will be called.

{% highlight js %}
var UsersStore = Marty.createStore({
  handlers: {
    addUser: Constants.RECEIVE_USER
  },
  addUser: function (user) {
    this.state.push(user);
    this.hasChanged();

    return function rollback() {
      this.state.splice(this.state.indexOf(user), 1);
      this.hasChanged();
    };
  }
});
{% endhighlight %}


<h3 id="getInitialState">getInitialState()</h3>

<code>getInitialState</code> is called when the store is first instantiated. It expects you to pass an object back which represents the stores state. The value you return will subsequently be available from the [state](#state) property.

If you do not implement getInitialState or you do not return anything then the default state is an empty object literal (<code>{}</code>).

<h3 id="state">state</h3>

The state property holds the current state of the store. You can get the state by calling <code>this.state</code> or <code>this.getState()</code>.

If you want to change the state to a new instance (or if you are using [immutable data collections](immutable)) you can set the states value or call <code>this.setState(state)</code>

{% highlight js %}
addUsers: function (users) {
  this.state = this.state.concat(users);

  // or

  this.setState(this.state.concat(users));
}
{% endhighlight %}

If the new state does not equal the current state then [hasChanged](#hasChanged) will be called after updating the stores state.

<h3 id="addChangeListener">addChangeListener(callback, [context])</h3>

If you want to be notified of changes to a store, you can register a callback by calling <code>Store.addChangeListener</code>. You can optionally pass the functions context as a second argument.

Once registered, the store will invoke your callback anytime the store changes passing the state and the store as the two arguments.

addChangeListener will return a disposable object. If you want to stop listening to the store, you can call <code>dispose</code> on the object.

{% highlight js %}
var listener = UserStore.addChangeListener(function (state, store) {
  console.log('state', state);
  console.log('from', store.name);
}, this);

listener.dispose();
{% endhighlight %}

<h3 id="hasChanged">hasChanged()</h3>

Calls any [registered callbacks](#addChangeListener).

{% highlight js %}
var UsersStore = Marty.createStore({
  handlers: {
    addUser: Constants.RECEIVE_USER
  },
  addUser: function (user) {
    this.state.push(user);
    this.hasChanged();
  }
});
{% endhighlight %}

<h3 id="fetch">fetch(options)</h3>

When requesting data from a store we should assume that it might require an async operation. <code>Store#fetch</code> provides a simple syntax that allows you to encapsulate that asynchronicity in a flux way. The <code>fetch</code> function allows you to specify how to get the state locally and remotely and returns an object that represents the current state of that request.

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

UsersStore.getUser(123).when({
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
{% endhighlight %}

<h4>Options</h4>

<table class="table table-bordered table-striped">
  <thead>
   <tr>
     <th style="width: 100px;">Name</th>
     <th style="width: 100px;">type</th>
     <th style="width: 50px;">required</th>
     <th>description</th>
   </tr>
  </thead>
  <tbody>
   <tr>
     <td>id</td>
     <td>number | string | object</td>
     <td>true</td>
     <td>Uniquely identifies the bit of state you are fetching. Only one request for a given Id can be in progress at any time. If another request is in progress then a pending fetch result is returned</td>
   </tr>
   <tr>
     <td>locally</td>
     <td>function</td>
     <td>true</td>
     <td>Should try and fetch from the local state. If it returns a value then an done fetch result will be returned immediately</td>
   </tr>
   <tr>
     <td>remotely</td>
     <td>function</td>
     <td>false</td>
     <td>
     If ``locally`` did not return a value then then ``remotely`` is invoked. When ``remotely`` has finished then ``locally`` will be reinvoked and should contain now contain the state. If ``remotely`` returns a promise then ``locally`` will be called if the promise is fulfilled</td>
   </tr>
   <tr>
     <td>dependsOn</td>
     <td>fetch result | array of fetch results</td>
     <td>false</td>
     <td>If a fetch depends on some other state being there already you can pass in their fetch results. It will only try and start fetching the data when all dependencies are done.</td>
   </tr>
   <tr>
     <td>cacheError</td>
     <td>boolean</td>
     <td>false</td>
     <td>If true (default) then if an error is thrown at any point during a fetch then that error is cached and returned immediately instead.</td>
   </tr>
  </tbody>
</table>

Often you're only concerned with fetching locally and remotely so you use the second function signature ``fetch(id, locally, remotely)``:

{% highlight js %}
var UsersStore = Marty.createStore({
  getUser: function (id) {
    return this.fetch(id,
      function () {
        return this.state[id];
      },
      function () {
        return UserAPI.getUser(id);
      }
    });
  }
});
{% endhighlight %}

<h4>Fetch Result</h4>

Fetch returns a result object that repesents the current state of the fetch. It has a status which can be either **PENDING**, **DONE** OR **ERROR**. You can get the status by accessing ``fetch.status`` or with the helpers ``fetch.pending``, ``fetch.failed`` or ``fetch.done``.

{% highlight js %}
var user = UserStore.getUser(id);

console.log(user.status) // => PENDING
{% endhighlight %}

If the fetch has an error, then the error is accessible at ``result#error``

{% highlight js %}
if (user.failed) {
  console.log('failed to get user', user.error);
}
{% endhighlight %}

If the fetch is done, then the result is accessible at ``result#result``

{% highlight js %}
if (user.done) {
  console.log('got user', user.result);
}
{% endhighlight %}

If you start a new fetch then the store will notify any listeners when the fetch's status has changed.

{% highlight js %}
UserStore.addChangeListener(function () {
  var user = UserStore.getUser(id);

  if (user.done) {
    console.log(user.result);
  }
});
{% endhighlight %}

The result offers the helper function ``when(statusHandlers)`` for handling each of the status

{% highlight js %}
var component = user.when({
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

<h3 id="fetch_pending">fetch.pending()</h3>

Returns a pending fetch result

{% highlight js %}
var fetch = Store.fetch.pending();

console.log(fetch.status) // PENDING
{% endhighlight %}

<h3 id="fetch_failed">fetch.failed(error)</h3>

Returns a failed fetch result

{% highlight js %}
var fetch = Store.fetch.failed(error);

console.log(fetch.status, fetch.error) // FAILED, { ... }
{% endhighlight %}

<h3 id="fetch_done">fetch.done(result)</h3>

Returns a done fetch result

{% highlight js %}
var fetch = Store.fetch.done(result);

console.log(fetch.status, fetch.result) // DONE, { ... }
{% endhighlight %}

<h3 id="waitFor">waitFor(*stores)</h3>

If an action handler is dependant on another store having already processed the action they can wait for those stores to finish processing by calling <code>waitFor</code>. If you call <code>waitFor</code> with the stores you wish to wait for (or pass an array), it will stop execution of the current action handler, process all dependent action handlers and then continue execution of the original action handler.

You can also pass an array of dispatch tokens to waitFor.

{% highlight js %}
var UsersStore = Marty.createStore({
  handlers: {
    addUser: Constants.RECEIVE_USER
  },
  addUser: function (user) {
    this.waitFor(FooStore, BarStore);
    this.state.push(user);
    this.hasChanged();
  }
});
{% endhighlight %}

<h3 id="#dispatchToken">dispatchToken</h3>

Dispatch token that is returned from [<code>Dispatcher.register()</code>](http://facebook.github.io/flux/docs/dispatcher.html#api). Used by [<code>waitFor()</code>](#waitFor).

<h2 id="immutable">Immutable data collections</h2>

Within a Flux application you want the stores to be the **only** place you can change state. This can be very difficult to achieve using the in built Javascript collections since they are mutable. This can make it very difficult to debug issues since any piece of code that touches that collection could be the cause.

The solution this is to use immutable data collections like [immutable.js](http://facebook.github.io/immutable-js/) or [mori](http://swannodette.github.io/mori/). Operations on immutable data structures do mutate the instance itself but rather return a new instance with is the result of the mutation.

{% highlight js %}
var users = Immutable.List.of("foo");
var users2 = users.push("bar");

console.log(users) // ["foo"]
console.log(users2) // ["foo", "bar"]
{% endhighlight %}

Using immutable data collections help you sleep soundly with knowledge that nothing outside of stores will be able to change its state.

While immutable data collections are not required, we try to make it as easy to use as possible. For example, you can simple call this.state with the mutated collection and internally it will check if the collection has changed and handle notifying and listeners.

{% highlight js %}
var UsersStore = Marty.createStore({
  handlers: {
    addUser: Constants.RECEIVE_USER
  },
  getInitialState: function () {
    return Immutable.List();
  },
  addUser: function (user) {
    this.state = this.state.push(user);
  }
});
{% endhighlight %}

<h2 id="further-reading">Further reading</h2>

* [Original article about Flux](http://facebook.github.io/flux/docs/overview.html#stores)