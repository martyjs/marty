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


<h2 id="yeoman" class="="page-header>Yeoman template</h2>

The quickest way to get started with marty is to use our [yeoman generator](http://yeoman.io/). To use it you first need to install yeoman and our generator

{% highlight bash %}
npm install -g yo generator-marty
{% endhighlight %}

To use the generator, create a directory and then <code>cd</code> into it. Next run <code>yo marty</code> which will create an empty marty project and install all dependencies. To start the application run <code>npm start</code>, you can view it in a browser at [http://localhost:5000](http://localhost:5000).

{% highlight bash %}
mkdir example && cd example
yo marty
npm start
open http://localhost:5000
{% endhighlight %}

Initially it only generates the basic folder structure. You can use <code>yo marty:domain {domain name}</code> to automatically create an action creator, store, constants, HTTP API and component for the given domain.

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