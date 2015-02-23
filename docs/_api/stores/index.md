---
layout: page
id: api-stores
title: Stores API
section: Stores
---

{% sample %}
classic
=======
var UsersStore = Marty.createStore({
  id: 'UsersStore',
  handlers: {
    addUser: Constants.RECEIVE_USER
  },
  getInitialState: function () {
    return [];
  },
  addUser: function (user) {
    this.state.push(user);
    this.hasChanged();
  }
});

es6
===
class UsersStore extends Marty.Store {
  constructor() {
    super();
    this.state = [];
    this.handlers = {
      addUser: Constants.RECEIVE_USER
    };
  }
  addUser(user) {
    this.state.push(user);
    this.hasChanged();
  }
}

{% endsample %}

<h2 id="id">id</h2>

A unique identifier (*required*). Used for registration within the container and (de)hydration.

<h2 id="displayName">displayName</h2>

An (optional) display name for the action creator. Used for richer debugging. We will use the Id if displayName hasn't been set. If you're using ES6 classes, displayName will automatically be the name of the class.

<h2 id="handlers">handlers</h2>

The <code>handlers</code> property is used to define which handlers should be called when an action is dispatched. The key is the name of the handler and value is an [action predicate](#action-predicates).

When invoked the handlers arguments are [the arguments passed to the dispatcher](/api/action-creators/index.html#dispatch). The original action is available by calling <code>this.action</code>.

{% sample %}
classic
=======
var UsersStore = Marty.createStore({
  id: 'UsersStore'
  handlers: {
    addUser: Constants.RECEIVE_USER
  },
  getInitialState: function () {
    return {};
  },
  addUser: function (user) {
    console.log(this.action) // { type: 'RECEIVE_USER', arguments: [{ name: ...}] }
    ...
  }
});

es6
===
class UsersStore extends Marty.Store {
  constructor() {
    super();
    this.state = {};
    this.handlers = {
      addUser: Constants.RECEIVE_USER
    };
  }
  addUser: function (user) {
    console.log(this.action) // { type: 'RECEIVE_USER', arguments: [{ name: ...}] }
    ...
  }
}
{% endsample %}

<h3 id="action-predicates">Action predicates</h3>

An action predicate can either be a single value or an array of either action types (i.e. a strong) or a <a href="http://underscorejs.org/#findWhere">where query</a>. Some examples of action predicates:

{% sample %}
classic
=======
var UsersStore = Marty.createStore({
  id: 'UserStore',
  handlers: {
    foo: UserConstants.ADD_USER,
    bar: [UserConstants.ADD_USER, 'UPDATE_USER']
  },
  // called when action.type == 'ADD_USER'
  foo: function () { .. },

  // called when action.type == 'ADD_USER' || action.type ==  'UPDATE_USER'
  bar: function () { .. }
});

es6
===
class UsersStore extends Marty.Store {
  constructor() {
    super();
    this.handlers = {
      foo: UserConstants.ADD_USER,
      bar: [UserConstants.ADD_USER, 'UPDATE_USER']
    };
  }
  // called when action.type == 'ADD_USER'
  foo() { .. },

  // called when action.type == 'ADD_USER' || action.type ==  'UPDATE_USER'
  bar() { .. }
}
{% endsample %}

<h3 id="rollback">Rollback</h3>

There are a number of cases where it would be useful to be able to rollback an action (e.g. if you've optimistically added an entity to your locally store but the associated request to the server failed).

To provide a rollback to an action handler, simply return a function from the action handler. If an action is rolled back, the function you return will be called.

{% sample %}
classic
=======
var UsersStore = Marty.createStore({
  id: 'UserStore',
  handlers: {
    addUser: Constants.RECEIVE_USER
  },
  getInitialState: function () {
    return {};
  },
  addUser: function (user) {
    this.state.push(user);
    this.hasChanged();

    return function rollback() {
      this.state.splice(this.state.indexOf(user), 1);
      this.hasChanged();
    }
  }
});

es6
===
class UsersStore extends Marty.Store {
  constructor() {
    super();
    this.state = {};
    this.handlers = {
      addUser: Constants.RECEIVE_USER
    };
  },
  addUser(user) {
    this.state.push(user);
    this.hasChanged();

    return function rollback() {
      this.state.splice(this.state.indexOf(user), 1);
      this.hasChanged();
    }
  }
}
{% endsample %}

<h2 id="getInitialState">getInitialState()</h2>

<h3>Classic</h3>
<code>getInitialState</code> (<i>required</i>) is called when the store is first instantiated. It expects you to pass an object back which represents the stores state. The value you return will subsequently be available from the [state](#state) property.

<h3>ES6</h3>
<code>getInitialState</code> is no longer necessary, instead you should set the state in the constructor.

<h2 id="state">state</h2>

The state property holds the current state of the store. You can get the state by calling <code>this.state</code> or <code>this.getState()</code>.

If you want to change the state to a new instance (or if you are using [immutable data collections](/guides/stores/immutable-data-collections.html)) you can set the states value.

{% sample %}
classic
=======
addUsers: function (users) {
  this.state = this.state.concat(users);
}

es6
===
addUsers(users) {
  this.state = this.state.concat(users);
}
{% endsample %}

If the new state does not equal the current state then [hasChanged](#hasChanged) will be called after updating the stores state.

<h2 id="replaceState">replaceState(nextState)</h2>

Replace the nextState with the current state. Same as setting <code>this.state</code>. Triggers [hasChanged](#hasChanged) if the new state is different.

{% sample %}
classic
=======
addUsers: function (users) {
  this.replaceState(_.extend(users, this.state));
}

es6
===
addUsers(users) {
  this.replaceState(_.extend(users, this.state));
}
{% endsample %}

<h2 id="setState">setState(nextState)</h2>

Merges nextState with the current state. Triggers [hasChanged](#hasChanged).

{% sample %}
classic
=======
addUser: function (user) {
  var nextState = {};
  nextState[user.id] = user;
  this.setState(nextState);
}

es6
===
addUser(user) {
  this.setState({
    [user.id]: user
  });
}
{% endsample %}

<h2 id="addChangeListener">addChangeListener(callback, [context])</h2>

If you want to be notified of changes to a store, you can register a callback by calling <code>Store.addChangeListener</code>. You can optionally pass the functions context as a second argument.

Once registered, the store will invoke your callback anytime the store changes passing the state and the store as the two arguments.

addChangeListener will return a disposable object. If you want to stop listening to the store, you can call <code>dispose</code> on the object.

{% highlight js %}
var listener = UserStore.addChangeListener(function (state, store) {
  console.log('state', state);
  console.log('from', store.displayName);
}, this);

listener.dispose();
{% endhighlight %}

<h2 id="hasChanged">hasChanged()</h2>

Calls any [registered callbacks](#addChangeListener).

{% sample %}
classic
=======
var UsersStore = Marty.createStore({
  id: 'UserStore',
  handlers: {
    addUser: Constants.RECEIVE_USER
  },
  addUser: function (user) {
    this.state.push(user);
    this.hasChanged();
  }
});

es6
===
class UsersStore extends Marty.Store {
  constructor() {
    super();
    this.state = {};
    this.handlers = {
      addUser: Constants.RECEIVE_USER
    };
  }
  addUser(user) {
    this.state.push(user);
    this.hasChanged();
  }
}
{% endsample %}

<h2 id="fetch">fetch(options)</h2>

When requesting data from a store we should assume that it might require an async operation. <code>Store#fetch</code> provides a simple syntax that allows you to encapsulate that asynchronicity in a flux way. The <code>fetch</code> function allows you to specify how to get the state locally and remotely and returns an object that represents the current state of that request.

{% sample %}
classic
=======
var UsersStore = Marty.createStore({
  id: 'UserStore',
  getUser: function (id) {
    return this.fetch({
      id: api-id,
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

es6
===
class UsersStore extends Marty.Store {
  getUser(id) {
    return this.fetch({
      id: id,
      locally() {
        return this.state[id];
      },
      remotely() {
        return UserAPI.getUser(id);
      }
    });
  }
}

UsersStore.getUser(123).when({
  pending() {
    return <div className="pending"/>;
  },
  failed(error) {
    return <div className="error">{error.message}</div>;
  },
  done(user) {
    return <div className="user">{user.name}</div>;
  }
});
{% endsample %}

If you need to wait for multiple fetch results to be finished, you can use ``when.all()``. You pass in an array of fetch results and it will execute the appropriate handler (e.g. if any of the handlers failed then it will execute the failed handler).

{% highlight js %}
var when = require('marty/when');

var foo = FooStore.getFoo(123);
var bar = BarStore.getBar(456);

when.all([foo, bar], {
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

<h3>Options</h3>

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
     <td>Should try and fetch from the local state. If it returns a value then an done fetch result will be returned immediately. If it returns undefined then the remotely function will be called. If it returns null then it will return a not found fetch result.</td>
   </tr>
   <tr>
     <td>remotely</td>
     <td>function</td>
     <td>false</td>
     <td>
     If ``locally`` returned undefined then ``remotely`` is invoked. When ``remotely`` has finished then ``locally`` will be reinvoked and should contain now contain the state. If ``remotely`` returns a promise then ``locally`` will be called if the promise is fulfilled</td>
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

{% sample %}
classic
=======
var UsersStore = Marty.createStore({
  id: 'UserStore',
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

es6
===
class UsersStore extends Marty.Store {
  getUser(id) {
    return this.fetch(id,
      () => return this.state[id],
      () => return UserAPI.getUser(id)
    );
  }
});
{% endsample %}

<h3 id="fetch-result">Fetch Result</h3>

Fetch returns a result object that repesents the current state of the fetch. It has a status which can be either **PENDING**, **DONE** OR **FAILED**. You can get the status by accessing ``fetch.status`` or with the helpers ``fetch.pending``, ``fetch.failed`` or ``fetch.done``.

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

<h2 id="fetch_pending">fetch.pending()</h2>

Returns a pending fetch result

{% highlight js %}
var fetch = Store.fetch.pending();

// or
var fetch = require('marty/fetch').pending();

console.log(fetch.status) // PENDING
{% endhighlight %}

<h2 id="fetch_done">fetch.done(result)</h2>

Returns a done fetch result

{% highlight js %}
var fetch = Store.fetch.done(result);

// or
var fetch = require('marty/fetch').done(result);

console.log(fetch.status, fetch.result) // DONE, { ... }
{% endhighlight %}

<h2 id="fetch_failed">fetch.failed(error)</h2>

Returns a failed fetch result

{% highlight js %}
var fetch = Store.fetch.failed(error);

// or
var fetch = require('marty/fetch').failed(error);

console.log(fetch.status, fetch.error) // FAILED, { ... }
{% endhighlight %}

<h2 id="fetch_notFound">fetch.notFound()</h2>

Returns a failed fetch result with a NotFound error

{% highlight js %}
var fetch = Store.fetch.notFound();

// or
var fetch = require('marty/fetch').notFound();

console.log(fetch.failed, fetch.error) // FAILED, { status: 404 }
{% endhighlight %}

<h2 id="when.all">when.all([fetchResult*], handlers)</h2>

``when.all`` will wait for all fetch results to be done before invoked the ``done`` status handler. If any fetch result is pending or failed then the pending or failed status handlers will be invoked instead. If all fetch results are done then their results are passed to the done handler in an array. If any fetch result has failed then the error of the first failed fetch result will be passed to the failed status handler.

{% highlight js %}
var when = require('marty/when');
var fetch = require('marty/fetch');

when.all([fetch.done("foo"), fetch.done("bar")], {
  pending: function () {
    console.log("pending");
  },
  done: function (results) {
    console.log("all done", results); // foo, bar
  },
  failed: function (error) {
    console.log("failed", error); // first error
  }
})

{% endhighlight %}

<h2 id="when.join">when.join(fetchResult*, handlers)</h2>

``when.join`` will wait for all fetch results to be done before invoked the ``done`` status handler. If any fetch result is pending or failed then the pending or failed status handlers will be invoked instead. If all fetch results are done then their results are passed to the done handler in an array. If any fetch result has failed then the error of the first failed fetch result will be passed to the failed status handler.

{% highlight js %}
var when = require('marty/when');
var fetch = require('marty/fetch');

when.join(fetch.done("foo"), fetch.done("bar"), {
  pending: function () {
    console.log("pending");
  },
  done: function (results) {
    console.log("all done", results); // foo, bar
  },
  failed: function (error) {
    console.log("failed", error); // first error
  }
})

{% endhighlight %}

<h2 id="hasAlreadyFetched">hasAlreadyFetched(fetchId)</h2>

For when you want to know if you have already tried fetching something. Given a fetch Id it will return true or false depending on whether you have previously tried a fetch for that Id (Irrelevant of whether it was successful or not). Useful if you want to distinguish between an empty collection and needing to fetch state from a remote source.

{% sample %}
classic
=======
var UsersStore = Marty.createStore({
  id: 'UsersStores',
  getUsers: function () {
    return this.fetch(
      id: 'users',
      locally: function () {
        if (this.hasAlreadyFetched('users')) {
          return this.state;
        }
      },
      remotely: function () {
        return UsersHttpAPI.getAll()
      }
    })
  }
});

es6
===
class UsersStore extends Marty.Store {
  getUsers() {
    return this.fetch(
      id: 'users',
      locally() {
        if (this.hasAlreadyFetched('users')) {
          return this.state;
        }
      },
      remotely() {
        return UsersHttpAPI.getAll()
      }
    });
  }
}
{% endsample %}

<h2 id="dehydrate">dehydrate()</h2>

Should return the state of your store in a form that can be serialised to JSON. Used in conjunction with <a href="#rehydrate">rehydrate</a> for synchronising the state of a store on the server with its browser counterpart. If not implemented then Marty will attempt to serialise <code>this.state</code>.

<h2 id="rehydrate">rehydrate(dehydratedState)</h2>

Expects the store to deserialize the dehydrated state and initialise the store. Used in conjunction with <a href="#dehydrate">dehydrate</a> for synchronising the state of a store on the server with its browser counterpart. If not implemented then Marty will call <code>this.replaceState(dehydratedState)</code>.

<h2 id="waitFor">waitFor(*stores)</h2>

If an action handler is dependant on another store having already processed the action they can wait for those stores to finish processing by calling <code>waitFor</code>. If you call <code>waitFor</code> with the stores you wish to wait for (or pass an array), it will stop execution of the current action handler, process all dependent action handlers and then continue execution of the original action handler.

You can also pass an array of dispatch tokens to waitFor.

{% sample %}
classic
=======
var UsersStore = Marty.createStore({
  id: 'UsersStore',
  handlers: {
    addUser: Constants.RECEIVE_USER
  },
  addUser: function (user) {
    this.waitFor(FooStore, BarStore);
    this.state.push(user);
    this.hasChanged();
  }
});

es6
===
class UsersStore extends Marty.Store {
  constructor() {
    super();
    this.handlers = {
      addUser: Constants.RECEIVE_USER
    };
  }
  addUser(user) {
    this.waitFor(FooStore, BarStore);
    this.state.push(user);
    this.hasChanged();
  }
}
{% endsample %}

<h2 id="#dispatchToken">dispatchToken</h2>

Dispatch token that is returned from [<code>Dispatcher.register()</code>](http://facebook.github.io/flux/docs/dispatcher.html#api). Used by [<code>waitFor()</code>](#waitFor).
