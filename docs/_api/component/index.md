---
layout: page
id: api-component
title: Component API
section: Component
---
{% highlight js %}
class User extends Marty.Component {
  constructor(props, context) {
    super(props, context);
    this.listenTo = UserStore;
  }
  render() {
    return <div className="user">{this.state.user}</div>;
  }
  getState() {
    return {
      user: UserStore.getUser(this.props.id)
    }
  }
}
{% endhighlight %}

<h3 id="listenTo">listenTo</h3>

Must be either a [store](/api/stores/index.html) or an array of [stores](/api/stores/index.html). Just before the [initial render](http://facebook.github.io/react/docs/component-specs.html#mounting-componentwillmount), it will register a change listener with the specified store(s).

When the element is about to be [unmounted from the DOM](http://facebook.github.io/react/docs/component-specs.html#unmounting-componentwillunmount) it will dispose of an change listeners.

{% highlight js %}
class User extends Marty.Component {
  constructor(props, context) {
    super(props, context);
    this.listenTo = [UserStore, FriendsStore];
  }
  render() {
    return (
      <div className="user">
        <span className="name">{this.state.user.name}</span>
        <FriendsList friends={this.state.friends}/>
      </div>
    );
  }
  getState() {
    return {
      user: UserStore.getUser(this.props.id),
      friends: FriendsStore.getFriendsForUser(this.props.id)
    }
  }
}
{% endhighlight %}

<h3 id="getState">getState</h3>

The result of <code>getState</code> will be set as the components state. <code>getState</code> will be called

* When the component is being constructed
* The components [props change](http://facebook.github.io/react/docs/component-specs.html#updating-componentwillupdate)
* When any of the stores specified by [listenTo](#listenTo) change