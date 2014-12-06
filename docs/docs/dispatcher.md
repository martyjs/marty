---
layout: docs
title: Dispatcher
id: dispatcher
group: docs
header_colour: F1B63A
order: 7
---

The dispatcher is the central hub in which all application data flows throw. When a store is created it [registers](http://facebook.github.io/flux/docs/dispatcher.html#api) with the dispatcher a callback with the dispatcher. Whenever an [action creators](/docs/actionCreators.html) create actions it is passed to the dispatcher which passes it to any registered stores. The dispatcher will call each registered callback synchronously. Any actions that are dispatched during this process will be queued until all callbacks are called.

Marty uses [facebook's dispatcher](https://github.com/facebook/flux/) which is a singleton accessible on <code>Marty</code>.

{% highlight js %}
var dispatchToken = Marty.Dispatcher.register(function (action) {
  console.log(action);
});

var action = new Action('ADD_FOO', [], Marty.constants.actionSources.VIEW);
Marty.Dispatcher.dispatch(action);
{% endhighlight %}

<h2 id="further-reading">Further reading</h2>

* [Dispatcher documentation](http://facebook.github.io/flux/docs/dispatcher.html)