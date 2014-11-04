# marty.js

## spec

```
var Flux = require('flux')

var Constants = Flux.createConstants({
  users: ["showList", "add"]
});

var UsersStore = Flux.createStore({
  handlers: {
    'addUser' Constants.users.add
  },
  initialize: function() {
    this.users = Immutable.Map();
  },
  addUser: function (foos) {
    this.waitFor(OtherStore);
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
  getUsers: function (users) {
    UserAPI.getUsers().thenDispatch(Constants.users);
  }
});

var UserAPI = Flux.createHttpAPI({
  baseUrl: "http://foo.com",
  getUsers: function () {
    return this.get("/users").thenDispatchResponse(Constants.addUsers);
  },
  getUser: function (id) {
    return this.get("/users/" + id).thenDispatchResponse(Constants.addUser)
  }
});

var UserState = Marty.createStateMixin({
  required: ['users'],
  listenTo: [UserStore],
  getState: function () {
    return {
      users: UserStore.getAll()
    }
  }
});

var Users = React.createClass({
  mixins: [UserState],
  render: function () {
    return <div className='user'>{this.state.user.name}</div>;
  }
});

// all writes go through actions
// reads in stores, responsible for fetching data from server if needed
// there should only be one channel for state changes
```
