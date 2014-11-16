---
layout: page
title: Getting started
description: An overview of how to start using Marty
id: getting-started
group: getting-started
---

<h2 id="download" class="page-header">Download</h2>

You can download marty using **npm**

{% highlight bash %}
npm install --save marty
{% endhighlight %}

or **bower**

{% highlight bash %}
bower install --save marty
{% endhighlight %}


<h2 id="module-loaders" class="page-header">Module loaders</h2>

Marty is built using [UMD](https://github.com/umdjs/umd). This means you can use it from [node.js](nodejs.org) or [Browserify](browserify.org)

{% highlight js %}
var Marty = require('marty');

module.exports = Marty.createStore({
  ...
})
{% endhighlight %}

[require.js](requirejs.org)

{% highlight js %}
require(['marty'], function (Marty) {
  return Marty.createStore({
    ...
  })
});
{% endhighlight %}

Or you can access it from the window object

{% highlight js %}
window.Marty.createStore({
  ...
})
{% endhighlight %}

<h2 id="examples">Examples</h2>

* [TodoMVC](https://github.com/jhollingworth/marty/tree/master/examples/flux-todomvc)