---
layout: page
title: Top-Level API
id: top-level
section: Top-Level API
---

<h3 id="createApplication">Marty.createApplication(constructor)</h3>

Creates a [application]({% url /api/application/index.html %}) class with the given constructor.

<h3 id="createStore">Marty.createStore(properties)</h3>

Creates a [store]({% url /api/stores/index.html %}) class with the given properties.

<h3 id="createQueries">Marty.createQueries(properties)</h3>

Register [queries]({% url /api/queries/index.html %}) class with the given properties.

<h3 id="createStateSource">Marty.createStateSource(properties)</h3>

Register a [state source]({% url /api/state-source/index.html %}) class with the given properties.

<h3 id="createActionCreators">Marty.createActionCreators(properties)</h3>

Register [action creators]({% url /api/action-creators/index.html %}) class with the given properties.

<h3 id="createStateMixin">Marty.createStateMixin(options)</h3>

Creates a [state mixin]({% url /guides/state-mixin/index.html %}).

<h3 id="createConstants">Marty.createConstants(options)</h3>

Creates [constants]({% url /guides/constants/index.html %}).

<h3 id="createContainer">Marty.createContainer(InnerComponent, options)</h3>

Wraps the component with a [container component]({% url /guides/containers/index.html %}) that is responsible for fetching state from stores and passing it to the inner component.

<h3 id="isServer">Marty.isServer</h3>

True if the current process is being executed within node.js or io.js.

<h3 id="isBrowser">Marty.isBrowser</h3>

True if the current process is being executed within a browser.

<h3 id="warnings">Marty.warnings</h3>

Configurable list of warnings that Marty emits. Setting the key to false will stop the warning from happening. We will warn you when a feature is being depreciated so disabling warnings can make upgrading difficult in the future.

{% highlight js %}
Marty.warnings.reservedFunction = false;
{% endhighlight %}

<h4 id="withoutWarning">Marty.warnings.without(warningsToDisable*, callback, [context])</h4>

Disables a warning for the duration of the callback.

{% highlight js %}
Marty.warnings.without(['reservedFunction', 'superNotCalledWithOptions'], function () {
  // do something evil
});
{% endhighlight %}

<h3 id="version">Marty.version</h3>

The current version of Marty.
