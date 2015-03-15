---
layout: page
title: Context API
id: api-context
section: Context
---

An object that contains instances of all types within ``Marty.container`` at the point that ``Marty.createContext()`` was called. Needed for isomorphic applications.

<h2 id="fetch">fetch(callback, options)</h2>

Function for tracking all fetches that occur against the context for the duration of the callback. It will invoke the callback and then return a promise which will resolve once all fetches that started within the callback are either done or have failed. Setting ``timeout`` within the options configures how long you should wait for a fetch before giving up (Default 1000ms). The promise resolves with diagnostics about the fetches that occurred.

{% highlight js %}
var context = Marty.createContext();

context.fetch(function () {
    FooStore.getFoo();
}, { timeout: 500 }).then(function (diagnostics) {
    console.log('Fetch diagnostics', diagnostics);
});
{% endhighlight %}

<h2 id="resolve">resolve(obj)</h2>

Given an instance of a type, resolve the instance for the context.

<h2 id="getAll">getAll(type)</h2>

Get all instances of the given type within the context.

<h2 id="dispose">dispose</h2>

Disposes of all instances of instances.
