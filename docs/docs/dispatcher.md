---
layout: docs
title: Dispatcher
id: dispatcher
group: docs
header_colour: F1B63A
order: 7
---

The dispatcher is the central hub in which all application data flows throw. When a store is created it [registers](http://facebook.github.io/flux/docs/dispatcher.html#api) with the dispatcher a callback with the dispatcher. Whenever an [action creators](/docs/actionCreators.html) create actions it is passed to the dispatcher which passes it to any registered stores. The dispatcher will call each registered callback synchronously. Any actions that are dispatched during this process will be queued until all callbacks are called.

Marty uses [facebook's dispatcher](https://github.com/facebook/flux/).

{% highlight js %}
var Dispatcher = require('marty/dispatcher');

var dispatchToken = Dispatcher.register(function (action) {
  console.log(action);
});

Dispatcher.dispatch({ type: 'CREATE_FOO' });
{% endhighlight %}

Normally [action creators](/docs/actionCreators.html) are responsible for calling the dispatcher. However if you feel the need to dispatch an action elsewhere, Marty expects the dispatch payload to be an instance of [``ActionPayload``](https://github.com/jhollingworth/marty/blob/master/lib/actionPayload.js).

{% highlight js %}
var Dispatcher = require('marty/dispatcher');
var ActionPayload = require('marty/actionPayload');

Dispatcher.dispatch(new ActionPayload({
  type: 'CREATE_FOO'
}));
{% endhighlight %}

<h2 id="further-reading">Further reading</h2>

* [Dispatcher documentation](http://facebook.github.io/flux/docs/dispatcher.html)