# marty.js

## spec

```
var Marty = require('marty')

var Constants = Marty.createConstants({
  users: ["showList", "add"]
});

var UsersStore = Marty.createStore({
  type: 'set',
  identity: 'id',
  handlers: {
    addUser Constants.users.add
  },
  initialize: function() {
    this.users = Immutable.Map();
  },
  addUsers: function (users) {
    this.add(users);
  },
  getUser: function (id) {
    var user = this.get(id);

    if (user) {
      return user;
    }

    UserApi.getUsers();
  }
});

var Actions = Marty.createActionCreators({
  addUsers: function (users) {
    this.dispatch(Constants.users.add, users);
  }
});

var UserAPI = Marty.createHttpAPI({
  baseUrl: "http://foo.com",
  getUsers: function () {
    return this.get("/users").then(Actions.addUsers);
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
