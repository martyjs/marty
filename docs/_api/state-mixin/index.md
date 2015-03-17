---
layout: page
id: api-state-mixin
title: State Mixin API
section: State Mixin
---
<h2 id="createStateMixinObject">Marty.createStateMixin(<i>Object</i>)</h2>

<h3 id="listenTo">listenTo</h3>

Expects either a [store]({% url /api/stores/index.html %}) or an array of [stores]({% url /api/stores/index.html %}). Just before the [initial render](http://facebook.github.io/react/docs/component-specs.html#mounting-componentwillmount), it will register a change listener with the specified store(s).

When the element is about to be [unmounted from the DOM](http://facebook.github.io/react/docs/component-specs.html#unmounting-componentwillunmount) it will dispose of an change listeners.

{% highlight js %}
var UserState = Marty.createStateMixin({
  listenTo: [UserStore, FooStore]
});
{% endhighlight %}

<h3 id="getState">getState</h3>

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

<h3 id="stores">Stores</h3>

If the value of a key is a [store]({% url /api/stores/index.html %}), then the mixin will automatically listen to the store and merge the stores state with result of <code>getState</code>

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

<h2 id="createStateMixinStore">Marty.createStateMixin(<i>Store</i>)</h2>

If you are only interested in the state of a *single* store then you can pass a store directly to <code>createStateMixin</code> which will automatically listen to the store and <code>getState</code> will return the state of the store.


{% highlight js %}
var UserState = Marty.createStateMixin(UserStore);

// UserState.getState() =>
[{name: 'foo'}, ...]
{% endhighlight %}