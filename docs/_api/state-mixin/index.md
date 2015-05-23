---
layout: page
id: api-state-mixin
title: State Mixin API
section: State Mixin
---
<h3 id="listenTo">listenTo</h3>

Expects either a [store Id]({% url /api/stores/index.html %}) or an array of [store Ids]({% url /api/stores/index.html %}). Just before the [initial render](http://facebook.github.io/react/docs/component-specs.html#mounting-componentwillmount), it will register a change listener with the specified store(s).

When the element is about to be [unmounted from the DOM](http://facebook.github.io/react/docs/component-specs.html#unmounting-componentwillunmount) it will dispose of an change listeners.

{% highlight js %}
var UserState = Marty.createStateMixin({
  listenTo: ['userStore', 'fooStore']
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
      user: this.app.userStore.getUser(this.props.id)
    }
  }
});
{% endhighlight %}

<h2 id="app">app</h2>

Returns the instance's [application]({% url /api/application/index.html %}).