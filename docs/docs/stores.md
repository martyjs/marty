---
layout: docs
title: Stores
id: stores
group: docs
header_colour: 1DACA8
order: 2
---

{% highlight js %}
var UsersStore = Marty.createStore({
  handlers: {
    addUsers: Constants.RECEIVE_USERS
  },
  addUsers: function (users) {
    this.state = this.state.concat(user);
  },
  getInitialState: function () {
    UsersAPI.getAll();
    return [];
  },
  getAll: function () {
    return this.state;
  }
});
{% endhighlight %}