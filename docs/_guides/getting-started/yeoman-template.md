---
layout: page
title: Yeoman template
id: getting-started-yeoman-template
section: Getting Started
---

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

Initially it only generates the basic folder structure. You can use <code>yo marty:domain {domain name}</code> to automatically create an action creator, store, constants, state source and component for the given domain.