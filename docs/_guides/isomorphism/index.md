---
layout: page
title: Isomorphism
id: isomorphism
section: Isomorphism
---

When we talk about isomorphism we are referring to a JS applications ability to run either in the browser or on the server (using node.js or io.js on the server). There are number of benefits to this, most prominently speed. The server responds with the full HTML so the users does not have to wait for the JS and data to load before seeing something. However there are a number of challenges you face with building isomorphic applications which Marty helps you solve.

<h2 id="fetching-state">Fetching state</h2>

Thanks to [React.renderToString](http://facebook.github.io/react/docs/top-level-api.html#react.rendertostring) rendering individual React components on the server is trivial. However components on their own are useless without some state. So how do we know what state we need? How do we determine its OK to render?

A naive approach would be for you to put all the required state into the stores before rendering the component. This isn't a scalable solution and tends to be error prone. We've found a better approach is to have the components tell us what state it needs using the same APIs they would in the browser and we will handle satisfying those requests on server.

[Marty.renderToString]({% url /api/top-level-api/#renderToString %}) behaves similarly to React.renderToString however has the added benefit of knowing about state. While rendering it will see what [fetches it makes]({% url /api/stores/index.html#fetch %}). It will then wait until all of those fetches are complete (or have failed) and then it will re-render the component. ``Marty.renderToString()`` returns a promise which will be resolved with the HTML once the component has been re-rendered.

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

To help you debug server side rendering we will also return you some diagnostic information about what fetches occurred, how long they took and what state was returned. For example, in the [chat example we render all this information to the console](https://github.com/jhollingworth/marty-chat-example/blob/v0.9/app/server/index.js#L32-L49).

<h2 id="implicit-state">Implicit state</h2>

Unfortunately you cannot make the same HTTP requests on the server as you do in the browser. The major problem being there is a lot of implicit state in the browser we often forget about. For example when you make a request to `/bar`, your browser will automatically fully qualify the URL for you (e.g. http://foo.com/bar) and add in cookies and other HTTP headers. If you were to make the same request on the server it would fail so we need a way of replicating this state on the server.

[marty-express]({% url /guides/isomorphism/marty-express.html %}) helps here by filling in as of this information as it can. When you make a request to the [HTTP state source]({% url /api/state-sources/http.html %}) on the server, [marty-express]({% url /guides/isomorphism/marty-express.html %}) will fully qualify the URL for you (if it isn't already) and also inject in HTTP headers that were in the original request. This way you can share the same fetching code across all the browser and server.

Unfortunately we can't replicate all browser state on the server so [Local Storage state source]({% url /api/state-sources/local-storage.html %}), [Session Storage state source]({% url /api/state-sources/session-storage.html %}) and [JSON Storage state source]({% url /api/state-sources/json-storage.html %}) will return undefined values.

<h2 id="concurrency">Concurrency</h2>

In Marty, there is only one instance of each store, action creator, query, state source and dispatcher. This is a problem where you might have multiple requests which are all trying to use the same store. So how do we deal with concurrency?

The obvious solution is to give each request their own set of instances to play with. Marty introduces [contexts]({%url /api/context/index.html %}) to solve this problem. A context is an object that has its own dispatcher as well as its own instances of stores, action creators, queries and state sources. They are created by [``Marty.createContext()``]({% url /api/top-level-api/index.html#createContext %}) which will create new instances of all types currently registered in the [``container``]({% url /api/container/index.html %}).

While contexts partially solve the problem, they introduce a new problem: How do I reference a specific instance belonging to the current context?

The result of you [registering]({% url /api/top-level-api/index.html#register %}) a store, action creator, query or state sources is instance of that type. We call this the **default instance**. Contexts have a [resolve](http://martyjs.org/v/0.9.0-rc2/api/context/index.html#resolve) function which accepts a default instance and will return the context's instance with the same type. So now we have a mechanism for resolving the current instance we need a way of accessing the current context.

When you call ``Marty.renderString`` you need to pass in a context. When we render the component we pass this context to all components using [React contexts](https://www.tildedave.com/2014/11/15/introduction-to-contexts-in-react-js.html) so you can get the current context in all components by calling ``this.context.marty``. So to get the correct instance of a store from a component you would need to do

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

For stores, action creators, queries and state sources the context is available at ``this.context`` however ``for`` still works in the same way

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

What this means is if you want you're code to run on the server you will need to remember to add ``.for(this)``. We will warn you if you do this accidentally so its worth watching you're logs.

<h2 id="inconsistent-apis">Inconsistent APIs</h2>

Another big problem is the irregularities of the server and browser APIs. For example if you want to modify a cookie in the browser you would do ``document.cookie = "foo=bar"`` whereas on the server (using express.js) you would do ``res.cookie('foo', 'bar')``. We need a way to abstract away these differences so our code can run anywhere.

State sources were originally introduced to help solve this type of problem so all we needed to introduce a couple more that help building isomorphic applications. Two new ones we've introduced are the [cookie state source]({% url /api/state-sources/cookie.html %}) for reading and modifying cookies on the browser and server and the [location state source]({% url /api/state-sources/location.html %}) for getting and changing your location.


