---
layout: page
title: Fetching data
id: stores-fetch
section: Stores
---

From the views perspective, the store holds all the state it needs. In most cases it's unfeasible for you to hold all your applications data locally and so we need to fetch data from a remote source. Traditionally you might solve this problem by using callbacks or a promise however we've found they make your views complicated and difficult to reason about. It also goes against Flux's unidirectional data flow. Marty introduces the [fetch API](/api/stores/#fetch) which is an alternative solution to the problem.

Say your view wants to load a user from the ``UserStore``. Internally the store would call ``fetch`` which allows it to define how to get the user locally or, if not present, get it from a state source. ``fetch`` requires 3 things:

1. **id** A string that uniquely identifies the bit of state you are fetching. Marty ensures that only one fetch for a given Id can be in progress at any time.
2. **locally** A function which tries to find the required state in the stores state (if its present)
3. **remotely** A function which tries to get the required state from a state source (if not present)

{% highlight js %}
var UserStore = Marty.createStore({
  getUser: function (userId) {
    return this.fetch({
      id: userId,
      locally: function () {
        return this.state[userId];
      },
      remotely: function () {
        return UserHttpAPI.getUser(userId)
      }
    });
  }
});
{% endhighlight %}

When you call fetch, Marty will first try calling the ``locally`` function. It the state is present in the store then it's returned and the fetch will finish executing. If the store can't find the state locally it should return ``undefined``. This causes the fetch function to invoke ``remotely``. Once ``remotely`` has finished executing then fetch will then re-execute the ``locally`` function with the expectation that the state is now in the store. If it isn't then the fetch will fail with a "Not found" error. If the ``remotely`` function needs to get the state asynchronously you can return a promise. The fetch function will wait for the promise to be resolved before re-executing ``locally``.

Using the example of getting a user, you would have a UserHttpAPI (Which is an [HTTP State Source]({% url /guides/state-sources/http.html %})), internally it would make the HTTP request which would be represented as a promise. Once the request completes, you should push the user into the store with a [source action creator]({% url /guides/action-creators/source-action-creators.html %}). You then return this promise chain to ``remotely``.

{% highlight js %}
var UserHttpAPI = Marty.createStateSource({
  type: 'http',
  getUser: function (userId) {
    return this.get('http://jsonplaceholder.typicode.com/users/' + userId).then(function (res) {
      UserSourceActionCreators.receiveUser(res.body);
    });
  }
});

var UserConstants = Marty.createConstants([
  'RECEIVE_USER',
  'USER_NOT_FOUND'
]);

var UserSourceActionCreators = Marty.createActionCreators({
  receiveUser: UserConstants.RECEIVE_USER(function (user) {
    this.dispatch(user);
  })
});

var UserStore = Marty.createStore({
  handlers: {
    addUser: UserConstants.RECEIVE_USER,
    removeUser: UserConstants.USER_NOT_FOUND
  },
  getInitialState: function() {
    return {};
  },
  addUser: function (user) {
    this.state[user.id] = user;
    this.hasChanged();
  },
  getUser: function (userId) {
    return this.fetch({
      id: userId,
      locally: function () {
        return this.state[userId];
      },
      remotely: function () {
        return UserHttpAPI.getUser(userId)
      }
    });
  },
  removeUser: function (userId) {
    // ...
  }
});
{% endhighlight %}

The result of the fetch function is a [fetch result](/api/stores/#fetch-result) which represents the current state of the fetch. A fetch can either be **PENDING**, **FAILED** or **DONE** (``fetch.status``). If a fetch has failed then the result will have the error (``fetch.error``) and if done it will have the result (``fetch.result``). Your views normally have to deal with each state of a fetch so the fetch result has a ``when()`` function which allows you to render different views for each state

{% highlight js %}
var UserStateMixin = Marty.createStateMixin({
  listenTo: UserStore,
  getState: function () {
    return {
      user: UserStore.getUser(this.props.id)
    };
  }
});

var User = React.createClass({
  mixins: [UserStateMixin],
  render: function () {
    return this.state.user.when({
      pending: function () {
        return <div class="user-loading">Loading...</div>;
      },
      failed: function (error) {
        return <div class="user-error">{error.message}</div>;
      },
      done: function (user) {
        return <div className="user">{user.name}</div>;
      }
    })
  }
});
{% endhighlight %}
