---
layout: docs
title: State Mixin
description: How to bind store state to React views
id: state-mixin
group: docs
order: 4
---

{% highlight js %}
var UserState = Marty.createStateMixin({
  listenTo: UserStore,
  getState: function () {
    return {
      users: UserStore.getAll()
    };
  }
});

var Users = React.createClass({
  mixins: [UserState],
  render: function () {
    return (<ul>
      {this.state.map(function (user) {
        return <li>{user.name}</li>;
      })}
    </ul>);
  }
});
{% endhighlight %}