---
layout: page
id: api-app-mixin
title: App Mixin API
section: App Mixin
---

`Marty.createAppMixin()` returns a mixin that makes the application instance available in the component at `this.app`.

{% highlight js %}
var User = React.createClass({
  mixins: [Marty.createAppMixin()],
  saveFoo() {
    this.app.fooActions.saveFoo();
  },
  deleteBar() {
    this.app.barActions.deleteBar();
  }
})
{% endhighlight %}
