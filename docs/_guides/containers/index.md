---
layout: page
title: Containers
id: container
section: Containers
---

Containers are components that wrap a component and manages its state. They manage subscriptions to stores and allow you to control what happens when fetching state. They are Marty's solution to state mixins being depreciated.

{% sample %}
classic
=======
var User = React.createClass({
  render: function() {
    return <div className="User">{this.props.user}</div>;
  }
});

module.exports = Marty.createContainer(User, {
  listenTo: UserStore,
  fetch: {
    user() {
      return UserStore.for(this).getUser(this.props.id);
    }
  },
  failed(errors) {
    return <div className="User User-failedToLoad">{errors}</div>;
  },
  pending() {
    return this.done({
      user: {}
    });
  }
});

es6
===
class User extends React.Component {
  render() {
    return <div className="User">{this.props.user}</div>;
  }
}

module.exports = Marty.createContainer(User, {
  listenTo: UserStore,
  fetch: {
    user() {
      return UserStore.for(this).getUser(this.props.id);
    }
  },
  failed(errors) {
    return <div className="User User-failedToLoad">{errors}</div>;
  },
  pending() {
    return this.done({
      user: {}
    });
  }
});
{% endsample %}

To create a container, pass your component (called the inner component) to [``Marty.createContainer``]({% url /api/top-level-api/index.html#createContainer %}) with an object hash that contains the container configuration. The result will be a component which you can render.

The most important configuration option is ``fetch``. ``fetch`` is an object where the values are functions which are invoked and the result is passed to the inner component as a prop. The prop key is determined by the key. The container component will do this when first created and any time any stores you specify in ``listenTo`` change.

If any of the values are [fetch results]({% url /api/stores.html#fetch-result %}) then Marty will wait for the fetches to complete before rendering the inner component. While there are pending fetch results then the result of ``pending`` handler will be rendered. If you'd still like to render the inner component you can call ``this.done`` passing in default values.

If any of the fetches have failed then ``failed`` handler is called. It will pass in an object hash containing the errors that have failed.

##Further reading

* [Mixins Are Dead. Long Live Composition](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750)
* [Building The Facebook News Feed With Relay](http://facebook.github.io/react/blog/2015/03/19/building-the-facebook-news-feed-with-relay.html)

