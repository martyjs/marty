---
layout: page
title: State Sources API
id: api-state-sources
section: State Sources
---

<h3 id="createStateSource">createStateSource(props)</h3>

To create a new repository, you call <code>Marty.createStateSource</code> passing in a set of properties. It returns your repository as a singleton.

{% highlight js %}
var UserRepository = Marty.createStateSource({
  createUser: function (user) {
    return $.get("/users");
  }
});
{% endhighlight %}


<h3 id="type">type</h3>

The type of the state source (e.g. 'http')

<h3 id="mixins">mixins</h3>

An (optional) array of mixins that can be passed in through the createStateSource method.
