---
layout: page
title: Test Utils
id: top-level
section: Test Utils
---

Marty's test utils are available by requiring `marty/test-utils`.

{% highlight js %}
var TestUtils = require('marty/test-utils');

var app = TestUtils.createApplication(Application, {
    ...
});
{% endhighlight %}

<h3 id="createApplication">createApplication(ApplicationType, options)</h3>

Creates an instance of the application with the given type while giving you the opportunity to control what actually gets instantiated.

<h4>Options</h4>

{% highlight js %}
var TestUtils = require('marty/test-utils');

var app = TestUtils.createApplication(Application, {
    include: ['foo', 'bar'],
    exclude: ['bar', 'baz'],
    stub: {
        fooAPI: {
            getFoo: sinon.stub().returns(Promise.done({ id: 123 }))
        }
    }
});
{% endhighlight %}

<table class="table table-bordered table-striped">
  <thead>
   <tr>
     <th style="width: 100px;">Name</th>
     <th style="width: 100px;">type</th>
     <th>description</th>
   </tr>
  </thead>
  <tbody>
   <tr>
     <td>stub</td>
     <td>object</td>
     <td>When registering, instead of creating an instance of the type it will use the stub instead</td>
   </tr>
   <tr>
     <td>include</td>
     <td>string array</td>
     <td>Will only create instances with Ids that are in this array</td>
   </tr>
   <tr>
     <td>include</td>
     <td>string array</td>
     <td>Will only create instances with Ids that are not in this array</td>
   </tr>
  </tbody>
</table>

<h3 id="createStore">createStore(properties)</h3>

Creates a mock store with the given properties. Useful when stubbing out a store.

{% highlight js %}
var app = TestUtils.createApplication(Application, {
    stub: {
        fooStore: TestUtils.createStore({
            getFoo: sinon.stub()
        })
    }
});
{% endhighlight %}

<h3 id="dispatch">dispatch(app, type, ...args)</h3>

Dispatches an action with given type and arguments from the applications dispatcher.

{% highlight js %}
var app = new Application();

TestUtils.dispatch(app, "RECEIVE_USER", { id: 123 });
{% endhighlight %}

<h3 id="getDispatchedActionsWithType">getDispatchedActionsWithType(app, type)</h3>

Returns all actions that have been dispatched with that type.

{% highlight js %}
var actions = TestUtils.getDispatchedActionsWithType(app, "RECEIVE_USER");
{% endhighlight %}

<h3 id="hasDispatched">hasDispatched(app, type, ...args)</h3>

Returns true if an action with the given type and arguments has been dispatched.

{% highlight js %}
expect(TestUtils.hasDispatched(app, "RECEIVE_USER", { id: 123 })).to.be.true;
{% endhighlight %}

