---
layout: page
title: Getting Started
id: getting-started
section: Getting Started
---

Welcome to Marty! This guide will help you learn how to use it. If you've never heard of Flux before I suggest you read about the [basic concepts](/guides/concepts/index.html). Or if you prefer you can look at some examples:

* [Marty Todo MVC](https://github.com/jhollingworth/marty-todo-mvc)
* [Marty Chat Example](https://github.com/jhollingworth/marty-chat-example)

The quickest way to start writing some code is to use our [yeoman generator](https://github.com/jhollingworth/generator-marty). First you will need to install yeoman and the marty generator

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

Initially it only generates the basic folder structure. You can use <code>yo marty:domain {domain name}</code> to automatically create an action creator, store, constants, state source and component for the given domain.

If you'd prefer to do your own thing you can download the [latest version from Github](https://github.com/jhollingworth/marty/releases) or you can get it from NPM or Bower

{% highlight bash %}
npm install --save marty
bower install --save marty
{% endhighlight %}

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
