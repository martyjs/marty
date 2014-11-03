# marty.js

## spec

```
var Flux = require('flux')

var Constants = Flux.createConstants({
  users: ["showList", "add"]
});

var UsersStore = Flux.createStore({
  name: 'users',
  handlers: {
    'addUser' Constants.users.add
  },
  initialize: function() {
    this.users = Immutable.Map();
  },
  addUser: function (foos) {
    this.waitFor('other-store');
    this.setState()
  },
  getUser: function (id) {
    var user = this.users[id];

    if (user) {
      return user;
    }

    this.apis.users.get(id);
  }
});

var Actions = Flux.createActionCreators({
  name: 'viewActions',
  getUsers: function (users) {
    UserAPI.getUsers().thenDispatch(Constants.users);
  }
});

var UserAPI = Flux.createHttpAPI({
  baseUrl: "http://foo.com",
  getUsers: function () {
    return this.http.get("/users").thenDispatchResponse(Constants.addUsers);
  },
  getUser: function (id) {
    return this.http.get("/users/" + id).thenDispatchResponse(Constants.addUser)
  }
});

var App = Marty.createApplication({
  dependencies: [
    Actions,
    UserApi
  ],
  initialize: function () {
    this.getStores().forEach(function (store) {
      store.load();
    });
  }
});

App.registerDependency(UsersStore);

var Users = React.createClass({
  mixins: [App.createMixin({
    listenTo: ['users']
  })],
  getState: function () {
    return {
      users: this.users.all(),
    }
  },
  render: function () {
  }
});

// all writes go through actions
// reads in stores, responsible for fetching data from server if needed
// there should only be one channel for state changes
```