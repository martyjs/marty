---
layout: page
title: Dispatcher API
id: api-dispatcher
section: Dispatcher
---

<h2 id="getDefault">getDefault()</h2>

Returns the default instance of the dispatcher.

{% highlight js %}
var Dispatcher = require('marty').dispatcher.getDefault();

var dispatchToken = Dispatcher.register(function (action) {
  console.log(action);
});
{% endhighlight %}

<h2 id="dispatchAction">dispatchAction(action}</h2>

Dispatches an action.

{% highlight js %}
var Dispatcher = require('marty').dispatcher.getDefault();

Dispatcher.dispatchAction({
  type: 'CREATE_FOO',
  arguments: [{ foo: 'bar' }]
});
{% endhighlight %}


<h2 id="onActionDispatched">onActionDispatched(cb, [context])</h2>

Register a callback which will be invoked after an action has been dispatched.

{% highlight js %}
var Dispatcher = require('marty').dispatcher.getDefault();

var listener = Dispatcher.onActionDispatched(function (action) {
  console.log('Action has been dispatched');

  listener.dispose();
});
{% endhighlight %}
