---
layout: page
title: Dispatching actions from state sources
id: dispatching-actions-from-state-sources
section: State Sources
---

When you're [fetching data](/guides/stores/fetching-data.html) you're stores expect your state to be available once the API promise resolves. Flux dictates that all state should come through the dispatcher so the natural thing to do is add some action creators to handle the new state coming if. 

{% sample %}
classic
=======
var UserAPI = Marty.createStateSource({
  type: 'http',
  id: 'UserAPI',
  getUser: function (id) {
    UserActionCreators.recieveUserStarting(id);
    this.get('/users/' + id).then(function (res) {
      UserActionCreators.recieveUser(id, res.body);
    }.bind(this)).catch(function (err) {
      UserActionCreators.recieveUserFailed(id, err);
    }.bind(this))
  }
});

es6
===
class UserActionCreators extends Marty.ActionCreators {
  getUser: function (id) {
    UserActionCreators.recieveUserStarting(id);
    this.get('/users/' + id)
      .then((res) => UserActionCreators.recieveUser(id, res.body))
      .catch((err) => UserActionCreators.recieveUserFailed(id, err));
  }
}
{% endsample %}

If you're run this code through a module loader (e.g. Browserify/Webpack/ES6) you might be wondering why ``UserActionCreators`` is an empty object (``{}``) rather then an action creator. This is because there's a cyclic dependency between your stores, action creators and state sources. So rather than creating a whole new file just for recieving data Marty allows you to dispatch from within the state source.

{% sample %}
classic
=======
var UserAPI = Marty.createStateSource({
  type: 'http',
  id: 'UserAPI',
  getUser: function (id) {
    this.dispatch(UserConstants.RECIEVE_USER_STARTING, id);
    this.get('/users/' + id).then(function (res) {
      this.dispatch(UserConstants.RECIEVE_USER, id, res.body);
    }.bind(this)).catch(function (err) {
      this.dispatch(UserConstants.RECIEVE_USER_FAILED, id, err);
    }.bind(this))
  }
});

es6
===
class UserActionCreators extends Marty.ActionCreators {
  getUser: function (id) {
    this.dispatch(UserConstants.RECIEVE_USER_STARTING, id);
    this.get('/users/' + id)
      .then((res) => this.dispatch(UserConstants.RECIEVE_USER, id, res.body))
      .catch((err) => this.dispatch(UserConstants.RECIEVE_USER_FAILED, id, err));
  }
}
{% endsample %}