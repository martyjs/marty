---
layout: page
title: Application API
id: api-application
section: Application
---

<h3 id="dispatcher">dispatcher</h3>

The application will create an instance of [dispatcher]({% url /guides/dispatcher/index.html %}) when first created.

<h3 id="register">register(id, type)</h3>

Creates an instance of the given type, passing the id and application into the types constructor. The instance will then be accessible on the application object with the given Id.

{% highlight js %}
function Foo(options) {
  console.log(options.id, options.app); // foo, Application(...)
}

var app = new Marty.Application();

app.register('foo', Foo);
{% endhighlight %}

<h3 id="registerObject">register(registrations)</h3>

Same as [register](#register) except you pass in an object literal where the keys are the Ids and the value is the type. If the value is an object literal when the instance will be accessible on the app within a child object.

{% highlight js %}
var app = new Marty.Application();

app.register({
  foo: Foo,
  bar: {
    baz: Baz
  }
});

console.log(app.bar.baz);
{% endhighlight %}

<h3 id="replaceState">replaceState(stores)</h3>

Replaces ([Store#replaceState]({% url /api/stores/index.html#replaceState %})) the state of all stores with the values passed in. The key within the ``stores`` object literal must be the Id of the store.

{% highlight js %}
var app = new Marty.Application();

app.register('fooStore', require('./stores/fooStore'));
app.register('barStore', require('./stores/barStore'));

app.replaceState({
  fooStore: {
    state: {
      [123]: { id: 123, name: 'Foo' }
    }
  },
  barStore: {
    state: {
      [456]: { id: 456, name: 'Foo' }
    }
  }
});

app.fooStore.getFoo(123) // { id: 123, name: 'Foo' }
{% endhighlight %}

<h3 id="clearState">clearState()</h3>

Calls [Store#clear]({% url /api/stores/index.html#clear %}) on all registered stores.

<h3 id="dehydrate">dehydrate()</h3>

Calls [Store#dehydrate]({% url /api/stores/index.html#dehydrate %}) if present or [Store#getState]({% url /api/stores/index.html#getState %}) on all registered stores. Returning all states as a serializable object literal where they key is the Id of the store.

<h3 id="rehydrate">rehydrate([states])</h3>

Given some dehyrdated state, it will call [Store#rehydrate]({% url /api/stores/index.html#rehydrate %}) if present or [Store#replaceState]({% url /api/stores/index.html#replaceState %}) on all registered stores passing in the dehyrdated state. The key of the states must match the Id of the store. If you don't pass in states then it will look at the ``window.__marty.state``.

<h3 id="renderToString">renderToString(Component, options)</h3>

[Renders](http://facebook.github.io/react/docs/top-level-api.html#react.rendertostring) the given element to a string, waits for all fetches to complete and then re-renders element. Returns a promise which resolves once element is re-rendered. Result of render is an object containing the html body and the state as a script tag. ``timeout`` allows you to configure how long to wait for a fetch to finish before re-rendering the component (Default **1000ms**).

{% highlight js %}
var app = new Application();
var User = require('./views/user');

app.renderToString(<User id={123} />, { timeout: 2000}).then(function (res) {
  console.log('HTML body', res.htmlBody);
  console.log('HTML state', res.htmlState);
  console.log('Diagnostics', res.diagnostics);
});
{% endhighlight %}

<h3 id="renderToStaticMarkup">renderToStaticMarkup(Component, options)</h3>

Same as [renderToString](#renderToString) except using [React.renderToStaticMarkup](https://facebook.github.io/react/docs/top-level-api.html#react.rendertostaticmarkup).

<h3 id="getAll">getAll(type)</h3>

Get all instances of the given type. Result is an object literal where the keys is the instance id and the value is the instance.

{% highlight js %}
app.register({
  fooStore: FooStore,
  barStore: { store: BarStore }
})

app.getAll('Store') // => { 'fooStore': ..., 'bar.store': ...  }
{% endhighlight %}
