---
layout: page
title: Isomorphism
id: isomorphism
section: Isomorphism
---

When the web started your web page had to be constructed on the server. Then AJAX came along and developers realized you could build more responsive applications in the browser using just JavaScript. However moving rendering your application in the browser had some drawbacks.

* It took a long time before a user saw anything because they were waiting for the JS to load and API calls to respond.
* You wouldn't see anything at all if you didn't have JavaScript turned on.
* You have to have two separate code bases for the client and server.
* Search engines aren't terribly good at indexing JS applications and so SEO was impacted.

A [number](http://blog.nodejitsu.com/scaling-isomorphic-javascript-code/) [of](https://asana.com/luna) [companies](http://nerds.airbnb.com/isomorphic-javascript-future-web-apps/) have found you can solve these problems by doing the initial render of your client on the server using [node.js](nodejs.org). They called this approach [isomorphic JavaScript](http://isomorphic.net/).

Thanks to [React.renderToString](http://facebook.github.io/react/docs/top-level-api.html#react.rendertostring) rendering individual React components on the server is trivial. However that is only one of many challenges you must solve to have a fully working isomorphic JavaScript application.

So how does Marty help?

<h2 id="fetching-state">Fetching state</h2>

One of the first questions you will probably ask is how to get the right state into your components.

A naive approach would be for you to put all the required state into the stores before rendering the component. We've found having an imperative data fetching strategy isn't a scalable solution. A better approach is to have the components tell us what state it needs using the same APIs they would in the browser and we will handle satisfying those requests on server.

[``Application#renderToString``]({% url /api/application/index.html#renderToString %}) is a smarter version of [``React.renderToString``](http://facebook.github.io/react/docs/top-level-api.html#react.rendertostring) which knows about what state. It will render your component and then see what [fetches it makes]({% url /api/stores/index.html#fetch %}). It will wait until all of those fetches are complete (or have failed) and then it will then re-render the component. The result of [``Application#renderToString``]({% url /api/application/index.html#renderToString %}) is a promise which resolves to the rendered component.

{% highlight js %}
// stores/userStore.js
var UserStore = Marty.createStore({
    handlers: {
        addUser: UserConstants.RECEIVE_USER
    },
    addUser(user) {
        this.state[user.id] = user;
        this.hasChanged();
    },
    getUser(id) {
        return this.fetch({
            id: id,
            locally() {
                return this.state[id];
            },
            remotely() {
                return this.app.userQueries.getUser(id);
            }
        });
    }
});

// components/user.js
var User = React.createClass({
    render() {
        return <div>{this.props.user.name}</div>;
    }
});

module.exports = Marty.createContainer(User, {
    listenTo: 'userStore',
    fetch: {
        user() {
            return this.userStore.getUser(this.props.id)
        }
    },
    failed(errors) {
        return <Errors errors={errors} />;
    }
})

// renderToString.js

var User = app.bindTo(require('./components/user'));

app.renderToString(<User id={123} />)
   .then(render => res.send(render.html).end());

{% endhighlight %}

Rendering the HTML is only half the battle, we need a way of synchronizing the state of the stores between the server and browser. To solve this, Marty introduces the concept of dehydrating and rehydrating your application. When you call [``Application#dehydrate()``]({% url /api/application/index.html#dehydrate %}), it will iterate through all the stores, serializing their state to a JSON object (Use [``Store#dehyrdate``]({% url /api/stores/index.html#dehydrate %}) to control how a store is dehydrated). [``Application#renderToString``]({% url /api/application/index.html#renderToString %}) automatically does this for you, adding the dehydrated state to the window object (``window.__marty``). When the application loads in the browser you should call [``Application#rehydrate()``]({% url /api/application/index.html#rehydrate %}) which will use the dehydrated state to return the stores to its state on the server (Use [``Store#rehydrate``]({% url /api/stores/index.html#rehydrate %}) to control how a store is rehydrated).

We've found its useful to know what fetches have been happening on the server (e.g. to identify fetches that are failing or taking too long) so [``Application#renderToString()``]({% url /api/application/index.html#renderToString %}) will also return diagnostic information about what fetches were made when rendering the component.

<h2 id="single-code-base">Single code base</h2>

Having a single code base that can be run in server and browser is going to improve productivity and reduce the number of defects you have. While things like [browserify](http://browserify.org/) help there are still many challenges to overcome.

You cannot make the same HTTP requests on the server as you do in the browser. The reason being there is a lot of implicit state in the browser we often forget about. For example when you make a request to `/bar`, your browser will automatically fully qualify the URL for you (e.g. http://foo.com/bar) and add in cookies and other HTTP headers. We'd like to keep using the same data fetching logic on the server and so we need a way of replicating all of this implicit state on the server.

There are many other inconsistencies between APIs on the server and in the browser. For example if you want to modify a cookie in the browser you would do ``document.cookie = "foo=bar"`` whereas on the server (using express.js) you would do ``res.cookie('foo', 'bar')``. Routing is another example which you need to define with two incompatible APIs.

[marty-express]({% url /guides/isomorphism/marty-express.html %}) is an [express.js](http://expressjs.com) middleware which aims to resolve these differences allowing you to have a single code base. It will do a number of things for your you:

* Consumes [react-router](https://github.com/rackt/react-router) routes and automatically renders them on the server. It will also manage ``Application#renderToString()`` for you.
* Modifies any requests made through [HTTP state source]({% url /api/state-sources/http.html %}), fully qualifying relative URLs and injecting headers from the original request.
* Modifies [CookieStateSource]({% url /api/state-sources/cookie.html %}) and [LocationStateSource]({% url /api/state-sources/location.html %}) so they are using the using the express.js request and response (e.g. ``UserCookies.set('foo', 'bar')`` will add a ``Set-Cookie`` response header).