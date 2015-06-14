---
layout: page
id: api-inject-app
title: Inject App API
section: Inject App
---

`Marty.injectApp(Component)` adds a property to the component prototype to make the application instance available at `this.app`.

{% highlight js %}
class User extends React.Component {
  saveFoo() {
    this.app.fooActions.saveFoo();
  }

  deleteBar() {
    this.app.barActions.deleteBar();
  }
})

Marty.injectApp(User);
{% endhighlight %}
