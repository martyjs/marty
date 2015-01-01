---
layout: page
title: Server Action Creators
id: server-action-creators
section: Action Creators
---

Action creators often will call an [HTTP API](/guides/http-api/index.html) which, when complete, will then call another action creator with the new data. If you are using a module loader (e.g. CommonJS, AMD) it can cause a cyclic dependency between the Action Creator and the HTTP API.

The way to get around this is to have a seperate action creator, called a Server Action Creator, that is responsible for handling responses from Http APIs.

{% highlight js %}
var UserActionCreators = Marty.createActionCreators({
  saveUser: UserActions.SAVE_USER(function (user) {
    return UserAPI.saveUser(user);
  })
});

var UserServerActionCreators = Marty.createActionCreators({
  addUser: UserActions.ADD_USER(function (user) {
    this.dispatch(user);
  })
});

var UserAPI = Marty.createHttpAPI({
  saveUser: function (user) {
    this.post({ url: '/users', data: user }).then(function (user) {
      UserServerActionCreators.addUser(user);
    });
  }
});
{% endhighlight %}