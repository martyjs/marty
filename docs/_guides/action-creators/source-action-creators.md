---
layout: page
title: Source Action Creators
id: server-action-creators
section: Action Creators
---

Often your action creator will call a [state source](/guides/state-source/index.html) which then calls another action creator with the response. This becomes a problem if you are using a module loader (e.g. CommonJS, AMD) since it creates a cyclic dependency.

The way to get around this is to have a seperate action creator that is responsible for handling responses from sources. In Marty we call them **Source Action Creator**.

{% highlight js %}
// actions/userActionCreators.js
var UserActionCreators = Marty.createActionCreators({
  saveUser: UserConstants.SAVE_USER(function (user) {
    return UserAPI.saveUser(user);
  })
});

// actions/userSourceActionCreators.js
var UserSourceActionCreators = Marty.createActionCreators({
  addUser: UserConstants.ADD_USER(function (user) {
    this.dispatch(user);
  })
});

// sources/userAPI.js
var UserAPI = Marty.createStateSource({
  type: 'http',
  saveUser: function (user) {
    this.post({ url: '/users', data: user }).then(function (user) {
      UserSourceActionCreators.addUser(user);
    });
  }
});
{% endhighlight %}
