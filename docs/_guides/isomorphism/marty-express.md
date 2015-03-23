---
layout: page
title: marty-express
id: marty-express
section: Isomorphism
---

[marty-express](http://github.com/jhollingworth/marty-express) is an [express.js](http://expressjs.com/) middleware which makes it easier to build isomorphic applications using express and [react-router](https://github.com/rackt/react-router).

marty-express will take your react-router routes and automatically serve them as if they were in the browser meaning you have a single place to define your routes. If a user requests one of these routes, it will use [``Marty.renderToString``]({% url /api/top-level-api/index.html#renderToString %}) to render the component on the server and then pass the result to the view for rendering.

If you make any requests through the HTTP state source then requests are automatically fully qualified and any HTTP headers in the original request are automatically added. It will [LocationStateSource](/api/state-sources/location.html) and the [CookieStateSource](/api/state-sources/cookie.html) so that they use the express.js ``req`` and ``res``.

{% highlight js %}
var Marty = require('marty');
var Router = require('react-router');

var routes = [
    <Route name='foo' path='/foo/:id' handler={Foo} />,
    <Route name='var' path='/bar/:id' handler={Bar} />
];

var app = express();

app.use(require('marty-express')({
  routes: routes,
  marty: require('marty'),
  rendered: function (diagnostics) {
    console.log('Page rendered', diagnostics);
  }
}));
{% endhighlight %}
