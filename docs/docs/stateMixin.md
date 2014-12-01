---
layout: docs
title: State mixin
description: How to bind store state to React components
id: state-mixin
group: docs
header_colour: 68ADCA
order: 4
---

We found that there was a lot of boilerplate code in React components to start listening to [stores](/docs/stores.html) and get their states. The State mixin helps to reduce the amount of code you have to write.

Firstly it automatically handles [adding change listeners](/docs/stores.html#addChangeListener) to [stores you specify](#listenTo) as well as disposing of those listeners when the component unmounts.

It also introduces a new function [<code>getState</code>](#getState) which returns state of the component. It will be called just before the initial render of the component and whenever a store updates.

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


<h2 id="api">API</h2>

<h3 id="createStateMixinObject">createStateMixin(<i>Object</i>)</h3>

<h4 id="listenTo">listenTo</h4>

Expects either a [store](/docs/stores.html) or an array of [stores](/docs/stores.html). Just before the [initial render](http://facebook.github.io/react/docs/component-specs.html#mounting-componentwillmount), it will register a change listener with the specified store(s).

When the element is about to be [unmounted from the DOM](http://facebook.github.io/react/docs/component-specs.html#unmounting-componentwillunmount) it will dispose of an change listeners.

{% highlight js %}
var UserState = Marty.createStateMixin({
  listenTo: [UserStore, FooStore]
});
{% endhighlight %}

<h4 id="getState">getState</h4>

The result of <code>getState</code> will be [set as the state of the bound component](http://facebook.github.io/react/docs/component-api.html#setstate). <code>getState</code> will be called when

* [<code>getInitialState</code>](http://facebook.github.io/react/docs/component-specs.html#getinitialstate) is called
* The components [props change](http://facebook.github.io/react/docs/component-specs.html#updating-componentwillupdate)
* Any of the stores change

{% highlight js %}
var UserState = Marty.createStateMixin({
  getState: function () {
    return {
      user: UserStore.getUser(this.props.id)
    }
  }
});
{% endhighlight %}

<h4 id="stores">Stores</h4>

If the value of a key is a [store](/docs/stores.html), then the mixin will automatically listen to the store and merge the stores state with result of <code>getState</code>

{% highlight js %}
var UserState = Marty.createStateMixin({
  foos: FooStore,
  getState: function () {
    return {
      user: UserStore.getUser(this.props.id)
    }
  }
});

// UserState.getState() =>
{
  foos: [...],
  user: { name: ...}
}
{% endhighlight %}

<code>getState</code> is optional and so you could just pass in a set of stores and it will automatically listen to them and build the state

{% highlight js %}
var FooBarState = Marty.createStateMixin({
  foos: FooStore,
  bars: BarStore
});

// FooBarState.getState() =>
{
  foos: [...],
  bars: [...]
}
{% endhighlight %}

<h3 id="createStateMixinStore">Marty.createStateMixin(<i>Store</i>)</h3>

If you are only interested in the state of a *single* store then you can pass a store directly to <code>createStateMixin</code> which will automatically listen to the store and <code>getState</code> will return the state of the store.


{% highlight js %}
var UserState = Marty.createStateMixin(UserStore);

// UserState.getState() =>
[{name: 'foo'}, ...]
{% endhighlight %}

<h3 id="listenToActions">listenToActions</h3>

Flag to determine when you should listen to the Actions store.

Defaults to ``true``.

{% highlight js %}
var UserState = Marty.createStateMixin({
  listenToActions: false
});
{% endhighlight %}