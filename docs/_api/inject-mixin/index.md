---
layout: page
id: api-inject-mixin
title: Inject Mixin API
section: Inject Mixin
---

{% highlight js %}
var User = React.createClass({
  mixins: [Marty.inject("fooActions", "barActions")],
  saveFoo() {
    this.fooActions.saveFoo();
  },
  deleteBar() {
    this.barActions.deleteBar();
  }
})
{% endhighlight %}

`Marty.inject(...dependencies)` will return a mixin which injects all application dependencies with the given Ids into the component. The component must be bound to the component for the dependencies to be available.