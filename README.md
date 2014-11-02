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

var Container = Flux.createContainer({
  stores: [UsersStore],
  actions: Actions,
  apis: [UserAPI]
  routers: Router
});

var Insight = React.createClass({
  mixins: [Container.Mixin({
    watch: ['users']
  })],
  render: function () {

  },
  addUser: function (user) {
    this.actions.addUser(user);
  },
  getState: function () {
    return this.stores.users.getUser(this.props.id);
  }
});

// all writes go through actions
// reads in stores, responsible for fetching data from server if needed
// there should only be one channel for state changes
```