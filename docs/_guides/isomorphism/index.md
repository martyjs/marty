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

[``Marty.renderToString``]({% url /api/top-level-api/index.html#renderToString %}) is a smarter version of [``React.renderToString``](http://facebook.github.io/react/docs/top-level-api.html#react.rendertostring) which knows about what state. It will render your component and then see what [fetches it makes]({% url /api/stores/index.html#fetch %}). It will wait until all of those fetches are complete (or have failed) and then it will then re-render the component. The result of [``Marty.renderToString``]({% url /api/top-level-api/index.html#renderToString %}) is a promise which resolves to the rendered component.

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
                return UserQueries.getUser(id);
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
    listenTo: UserStore,
    fetch: {
        user() {
            return UserStore.getUser(this.props.id)
        }
    },
    failed(errors) {
        return <Errors errors={errors} />;
    }
})

// renderToString.js
Marty.renderToString({
    component: User,
    props: { id: 123 },
    context: Marty.createContext()
}).then(function (render) {
    res.send(render.html).end();
});
{% endhighlight %}

Rendering the HTML is only half the battle, we need a way of synchronizing the state of the stores between the server and browser. To solve this, Marty introduces the concept of dehydrating and rehydrating your application. When you call [``Marty.dehydrate()``]({% url /api/top-level-api/#dehydrate %}), it will iterate through all the stores, serializing their state to a JSON object (Use [``Store#dehyrdate``]({% url /api/stores/index.html#dehydrate %}) to control how a store is dehydrated). [``Marty.renderToString``]({% url /api/top-level-api/index.html#renderToString %}) automatically does this for you, adding the dehydrated state to the window object (``window.__marty``). When the application loads in the browser you should call [``Marty.rehydrate()``]({% url /api/top-level-api/#rehydrate %}) which will use the dehydrated state to return the stores to its state on the server (Use [``Store#rehydrate``]({% url /api/stores/index.html#rehydrate %}) to control how a store is rehydrated).

We've found its useful to know what fetches have been happening on the server (e.g. to identify fetches that are failing or taking too long) so [``Marty.renderToString``]({% url /api/top-level-api/index.html#renderToString %}) will also return diagnostic information about what fetches were made when rendering the component.

<h2 id="single-code-base">Single code base</h2>

Having a single code base that can be run in server and browser is going to improve productivity and reduce the number of defects you have. While things like [browserify](http://browserify.org/) help there are still many challenges to overcome.

You cannot make the same HTTP requests on the server as you do in the browser. The reason being there is a lot of implicit state in the browser we often forget about. For example when you make a request to `/bar`, your browser will automatically fully qualify the URL for you (e.g. http://foo.com/bar) and add in cookies and other HTTP headers. We'd like to keep using the same data fetching logic on the server and so we need a way of replicating all of this implicit state on the server.

There are many other inconsistencies between APIs on the server and in the browser. For example if you want to modify a cookie in the browser you would do ``document.cookie = "foo=bar"`` whereas on the server (using express.js) you would do ``res.cookie('foo', 'bar')``. Routing is another example which you need to define with two incompatible APIs.

[marty-express]({% url /guides/isomorphism/marty-express.html %}) is an [express.js](http://expressjs.com) middleware which aims to resolve these differences allowing you to have a single code base. It will do a number of things for your you:

* Consumes [react-router](https://github.com/rackt/react-router) routes and automatically renders them on the server. It will also manage ``Marty.renderToString`` for you.
* Modifies any requests made through [HTTP state source]({% url /api/state-sources/http.html %}), fully qualifying relative URLs and injecting headers from the original request.
* Modifies [CookieStateSource]({% url /api/state-sources/cookie.html %}) and [LocationStateSource]({% url /api/state-sources/location.html %}) so they are using the using the express.js request and response (e.g. ``UserCookies.set('foo', 'bar')`` will add a ``Set-Cookie`` response header).

<h2 id="concurrency">Concurrency</h2>

In Marty, there is only one dispatcher and instance of each store, action creator, query, state source. This becomes a problem when you have multiple requests are all trying to use the same store. So how do we deal with this?

The solution is to give each request their own set of instances to play with. Marty introduces [contexts]({%url /api/context/index.html %}) to solve this problem. A context is an object that has its own dispatcher as well as its own instances of stores, action creators, queries and state sources. They are created by [``Marty.createContext()``]({% url /api/top-level-api/index.html#createContext %}) which will create new instances of all types currently registered in the [``registry``]({% url /api/registry/index.html %}).

While contexts partially solve the problem, they introduce a new problem: How do I reference a specific instance belonging to the current context?

The result of you [registering]({% url /api/top-level-api/index.html#register %}) a store, action creator, query or state sources is an instance of that type. We call this the **default instance**. Contexts have a [resolve]({% url /api/context/index.html#resolve %}) function which accepts a default instance and will return the context's instance. So now we have a mechanism for resolving the current instance we need a way of accessing the current context.

When you call ``Marty.renderString`` you need to pass in a context. When we render the component we pass this context to all components using [React contexts](https://www.tildedave.com/2014/11/15/introduction-to-contexts-in-react-js.html). You can then access the context in your component by calling ``this.context.marty``. So to get the correct instance of a store from a component you would need to do

{% highlight js %}
var User = React.createClass({
    render() {
        var user = this.context.marty.resolve(UserStore).getUser(123);
        ...
    }
});
{% endhighlight %}

This tends to get a little verbose so all stores, action creators, queries and state sources have a ``for`` function which will do this for you

{% highlight js %}
var User = React.createClass({
    render() {
        var user = UserStore.for(this).getUser(123);
        ...
    }
});
{% endhighlight %}

For stores, action creators, queries and state sources the context is available at ``this.context``, however ``for`` still works in the same way

{% highlight js %}
var UserStore = Marty.createStore({
    getUser(id) {
        return this.fetch({
            id: id,
            locally() {
                return this.state[id];
            },
            remotely() {
                return UserQueries.for(this).getUser(id);
            }
        });
    }
});
{% endhighlight %}

What this means is if you want your code to run on the server you will need to remember to add ``.for(this)``. We will warn you if you do this accidentally so its worth watching you're logs.
