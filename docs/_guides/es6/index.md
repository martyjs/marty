---
layout: page
title: ES6
id: es6
section: ES6
---

Marty provides support for defining everything using ES6 classes. For all inbuilt types you will find their base class available on ``Marty`` object (e.g. ``Marty.HttpStateSource``, ``Marty.ActionCreators``, ``Marty.Store``).

##Registration

All types must be registered within Marty's container. When defining your types with the ES5 syntax we will automatically register do this for you.

{% highlight js %}
var FooStore = Marty.createStore({
    ...
});
{% endhighlight %}

Unfortunately there's no way to do this automatically when defining a class so you must manually call ``Marty.register`` passing in the class and (optionally) its Id.

{% highlight js %}
class FooStore extends Marty.Store {
    getFoo() {
        ...
    }
}

var store = Marty.register(FooStore, 'foo');
{% endhighlight %}

##Default instance

In most cases it's much easier for us to have a single instance of each type. This saves us having to manually manage the lifecycle of each object. This is why Marty will return an instance of type registered type from ``Marty.register`` known as the **default instance**.

In almost all cases the default instance is what you want to be using so if you're using a module loader (e.g. browserify, webpack, requirejs) we recommend you export the default instance from the file.

{% highlight js %}
//stores/fooStore.js
class FooStore extends Marty.Store {
    getFoo() {
        ...
    }
}

module.exports = Marty.register(FooStore);

//views/foo.js
var FooStore = require('../stores/fooStore');

var foo = FooStore.getFoo();
{% endhighlight %}

There are occasions when you might want to access the underlying type. In those cases we tend to create a folder for the type, that contains 2 files:

1. type.js - containing the class
2. index.js - containing ``module.exports = Marty.register('./type')``

This allows you call ``require('./stores/fooStore')`` when you want the default instance and ``require('./stores/fooStore/type')`` when you want the type.
