---
layout: page
title: Fetching state
id: fetch
section: Fetching state
---

From the views perspective, the store holds all the state it needs. In most cases it's unfeasible for you to hold all your applications data locally and so we need to fetch data from a remote source. Traditionally you might solve this problem by using callbacks or a promise however we've found they make your views complicated and difficult to reason about. It also goes against Flux's unidirectional data flow. Marty introduces the [fetch API]({% url /api/stores/#fetch %}) which is an alternative solution to the problem.

Say your view wants to load a user from the ``UserStore``. Internally the store would call ``fetch`` which allows it to define how to get the user locally or, if not present, get it from a state source. ``fetch`` requires 3 things:

1. **id** A string that uniquely identifies the bit of state you are fetching. Marty ensures that only one fetch for a given Id can be in progress at any time.
2. **locally** A function which tries to find the required state in the stores state (if its present)
3. **remotely** A function which tries to get the required state from a state source (if not present)

{% sample %}
classic
=======
var UserStore = Marty.createStore({
  id: 'UsersStore',
  getUser: function (userId) {
    return this.fetch({
      id: userId,
      locally: function () {
        return this.state[userId];
      },
      remotely: function () {
        return UserAPI.getUser(userId)
      }
    });
  }
});

es6
===
class UserStore extends Marty.Store {
  getUser(userId) {
    return this.fetch({
      id: userId,
      locally: function () {
        return this.state[userId];
      },
      remotely: function () {
        return UserAPI.getUser(userId)
      }
    });
  }
}

export default Marty.register(UserStore);

{% endsample %}

When you call fetch, Marty will first try calling the ``locally`` function. It the state is present in the store then it's returned and the fetch will finish executing. If the store can't find the state locally it should return ``undefined``. This causes the fetch function to invoke ``remotely``. Once ``remotely`` has finished executing then fetch will then re-execute the ``locally`` function with the expectation that the state is now in the store. If it isn't then the fetch will fail with a "Not found" error. If the ``remotely`` function needs to get the state asynchronously you can return a promise. The fetch function will wait for the promise to be resolved before re-executing ``locally``.

Using the example of getting a user, you would have a UserAPI (Which is an [HTTP State Source]({% url /api/state-sources/http.html %})), internally it would make the HTTP request which would be represented as a promise. Once the request completes, you should dispatch the state. You then return this promise chain to ``remotely``.

{% sample %}
classic
=======
var UserConstants = Marty.createConstants([
  'RECEIVE_USER',
  'USER_NOT_FOUND'
]);

var UserAPI = Marty.createStateSource({
  type: 'http',
  id: 'UserAPI',
  getUser: function (userId) {
    return this.get('http://jsonplaceholder.typicode.com/users/' + userId);
  }
});

var UserQueries = Marty.createQueries({
  getUser: function (userId) {
    this.dispatch(UserConstants.RECEIVE_USER_STARTING, userId);

    return UserAPI.getUser(userId).then(
      function (res) {
        this.dispatch(UserConstants.RECEIVE_USER, userId, res.body);
      }.bind(this)),
      function (err) {
        this.dispatch(UserConstants.RECEIVE_USER_FAILED, userId, err);
      }.bind(this)
    );
  }
});

var UserStore = Marty.createStore({
  id: 'UsersStore',
  handlers: {
    addUser: UserConstants.RECEIVE_USER
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
        return UserQueries.getUser(userId)
      }
    });
  }
});

es6
===
var UserConstants = Marty.createConstants([
  'RECEIVE_USER',
  'USER_NOT_FOUND'
]);

class UserAPI extends Marty.HttpStateSource {
  getUser(userId) {
    return this.get('http://jsonplaceholder.typicode.com/users/' + userId);
  }
}

var userAPI = Marty.register(UserAPI);

class UserQueries extends Marty.Queries {
  getUser(userId) {
    this.dispatch(UserConstants.RECEIVE_USER_STARTING, userId);

    return userAPI.getUser(userId)
      .then(
        res => this.dispatch(UserConstants.RECEIVE_USER, userId, res.body),
        err => this.dispatch(UserConstants.RECEIVE_USER_FAILED, userId, err)
      );
  }
}

var userQueries = Marty.register(UserQueries);

class UserStore extends Marty.Store {
  constructor(options) {
    super(options);
    this.state = {};
    this.handlers = {
      addUser: UserConstants.RECEIVE_USER
    };
  }
  addUser(user) {
    this.state[user.id] = user;
    this.hasChanged();
  }
  getUser(userId) {
    return this.fetch({
      id: userId,
      locally: function () {
        return this.state[userId];
      },
      remotely: function () {
        return userQueries.getUser(userId)
      }
    });
  }
}
{% endsample %}

The result of the fetch function is a [fetch result]({% url /api/stores/#fetch-result %}) which represents the current state of the fetch. A fetch can either be **PENDING**, **FAILED** or **DONE** (``fetch.status``). If a fetch has failed then the result will have the error (``fetch.error``) and if done it will have the result (``fetch.result``). Your views normally have to deal with each state of a fetch so the fetch result has a ``when()`` function which allows you to render different views for each state

{% sample %}
classic
=======
var User = React.createClass({
  render: function () {
    return <div className="user">{this.props.user.name}</div>;
  }
});

module.exports = Marty.createContainer(User, {
  listenTo: UserStore,
  fetch: {
    user() {
      return UserStore.getUser(this.props.userId)
    }
  }
});

es6
===
class User extends React.Component {
  render() {
    return <div className="user">{this.props.user.name}</div>;
  }
}

module.exports = Marty.createContainer(User, {
  listenTo: UserStore,
  fetch: {
    user() {
      return UserStore.getUser(this.props.userId)
    }
  }
});
{% endsample %}
