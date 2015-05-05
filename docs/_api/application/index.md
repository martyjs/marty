---
layout: page
title: Application API
id: api-application
section: Application
---
<h3 id="replaceState">Marty.replaceState(stores, [context])</h3>

Replaces ([Store#replaceState]({% url /api/stores/index.html#replaceState %})) the state of all stores with the values passed in. If a [context](#createContext) is passed in then we will replace the context's stores state. The key within the ``stores`` object literal must be the Id of the store.

{% highlight js %}
Marty.replaceState({
  UserStore: {
    state: {
      [123]: { id: 123, name: 'Foo' }
    }
  }
});

UserStore.getUser(123) // { id: 123, name: 'Foo' }
{% endhighlight %}

<h3 id="clearState">Marty.clearState([context])</h3>
Calls [Store#clear]({% url /api/stores/index.html#clear %}) on all registered stores. If a [context](#createContext) is passed in then we will call  [Store#clear]({% url /api/stores/index.html#clear %})) on all stores within the context.

<h3 id="dehydrate">Marty.dehydrate([context])</h3>

Calls [Store#dehydrate]({% url /api/stores/index.html#dehydrate %}) if present or [Store#getState]({% url /api/stores/index.html#getState %}) on all registered stores. Returning all states as a serializable object literal where they key is the Id of the store. If a [context](#createContext) is passed in then we will dehyrdate all stores within the context.

<h3 id="rehydrate">Marty.rehydrate([states], [context])</h3>

Given some dehyrdated state, it will call [Store#rehydrate]({% url /api/stores/index.html#rehydrate %}) if present or [Store#replaceState]({% url /api/stores/index.html#replaceState %}) on all registered stores passing in the dehyrdated state. The key of the states must match the Id of the store. If you don't pass in states then it will look at the ``window.__marty.state``. If a [context](#createContext) is passed in then we will rehyrdate all stores within the context.

<h3 id="createContext">Marty.createContext([values])</h3>

Creates a [context]({% url /api/context/index.html %}) which contains a dispatcher and instances of all types currently registered within [Marty.registry](#registry). Optionally will be extended with ``values`` object.

<h3 id="renderToString">Marty.renderToString(options)</h3>

[Renders](http://facebook.github.io/react/docs/top-level-api.html#react.rendertostring) the given component type with the given props to string, waits for all fetches to complete and then re-renders component. Returns a promise which resolves once component is re-rendered. Result of render is an object containing the rendered string and an object detailing what fetches occurred. ``timeout`` allows you to configure how long to wait for a fetch to finish before re-rendering the component (Default **1000ms**). It uses React contexts to pass the Marty context to child components (context key is ``marty``).

{% highlight js %}
var options = {
  type: Foo,
  context: context,
  props: { bar: 'bar' },
  timeout: 1000
};

var Foo = React.createClass({
  contextTypes {
    marty: React.PropTypes.object
  },
  render: function () {
    var store = this.context.marty.getStore('foo');

    return <div />
  }
});

Marty.renderToString(options).then(function (res) {
  console.log('Rendered html', res.html);
  console.log('Diagnostics', res.diagnostics);
});
{% endhighlight %}