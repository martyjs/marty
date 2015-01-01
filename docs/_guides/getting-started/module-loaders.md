---
layout: page
title: Module Loaders
id: getting-started-module-loaders
section: Getting Started
---

Marty is built using [UMD](https://github.com/umdjs/umd). This means you can use it from [node.js](nodejs.org) or [Browserify](browserify.org)

{% highlight js %}
var Marty = require('marty');

module.exports = Marty.createStore({
  ...
})
{% endhighlight %}

Or [require.js](requirejs.org) ([Working example](https://github.com/jhollingworth/marty/tree/master/examples/requirejs))

{% highlight js %}
require(['marty'], function (Marty) {
  return Marty.createStore({
    ...
  })
});
{% endhighlight %}

Or you can access it from the window object ([Working example](https://github.com/jhollingworth/marty/tree/master/examples/window))

{% highlight js %}
window.Marty.createStore({
  ...
})
{% endhighlight %}