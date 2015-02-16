---
layout: page
title: State Mixin
id: state-mixin
section: State Mixin
---

We found that there was a lot of boilerplate code in React components to start listening to [stores](/guides/stores/index.html) and get their states. The State mixin helps to reduce the amount of code you have to write.

Firstly, it automatically [adds change listeners](/api/stores/index.html#addChangeListener) to [stores you want to listen to](/api/state-mixin/index.html#listenTo), as well as disposing of those listeners when the component unmounts.

It also introduces a new function [<code>getState</code>](#getState), which returns the state of the component. It will be called just before the initial render of the component and whenever a store updates.

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
      {this.state.users.map(function (user) {
        return <li>{user.name}</li>;
      })}
    </ul>);
  }
});
{% endhighlight %}
