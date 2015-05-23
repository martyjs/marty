---
layout: page
title: Application
id: application
section: Application
---

The `Application` is responsible for knowing about and instantiating all Stores, Action Creators, Queries, and State sources within your application. It also plays a central role in building [isomorphic applications]({% url /guides/isomorphism/index.html %}).

{% sample %}
classic
=======
// application.js
var Application = Marty.createApplication(function () {
    this.register('userStore', require('./stores/userStore'));
});

// views/user.js
...

module.exports = Marty.createContainer(User, {
    listenTo: 'userStore',
    fetch: {
        user: function () {
            return this.app.userStore.getUser();
        }
    }
});

// main.js
var app = new Application();

React.render(<User id={123} app={app} />, document.getElementById('app'));
es6
===
// application.js
class Application extends Marty.Application {
    constructor(options) {
        super(options);

        this.register('userStore', require('./stores/userStore'));
    }
}

// views/user.js
...

module.exports = Marty.createContainer(User, {
    listenTo: 'userStore',
    fetch: {
        user() {
            return this.app.userStore.getUser();
        }
    }
});

// main.js
var app = new Application();

React.render(<User id={123} app={app} />, document.getElementById('app'));
{% endsample %}

To tell the application about all the types in the system you use `register`. The two things you must specify are an Id (string) and a type (e.g. a `Store` or an `ActionCreator`). Internally `register` will create an instance of that type, passing the application instance into the constructor and then making it accessible on the application object.

You can also pass in an object literal to `register`, allowing you to register multiple types at once as well. If the object values are themselves objects then their Id's will be the path to the leaf node joined by `.`'s.

{% sample %}
classic
=======
var Application =  Marty.createApplication(function () {
    this.register({
        foo: {
            bar: {
                baz: BazStore
            }
        }
    });
});

var app = new Application();

console.log(app.foo.bar.baz.id, 'foo.bar.baz');

es6
===
class Application extends Marty.Application {
    constructor(options) {
        super(options);

        this.register({
            foo: {
                bar: {
                    baz: BazStore
                }
            }
        });
    }
}

var app = new Application();

console.log(app.foo.bar.baz.id, 'foo.bar.baz');

{% endsample %}

Once you have an instance of an application you need to make accessible to  your components. To do this you must first either wrap your component in a [container]({% url /guides/containers/index.html %}) or use the [state mixin]({% url /guides/state-mixin/index.html %})/[app mixin]({% url /api/app-mixin/index.html %}). Once you've done that you can pass the application instance to your root element via the prop `app` which makes it accessible to that component and any children (Internally we pass the application instance down through the [context](https://www.tildedave.com/2014/11/15/introduction-to-contexts-in-react-js.html)).

You can access the application instance by calling `this.app` in Stores, Action Creators, Queries, and State sources. This is also true for components as long as its wrapped in a container or you're using the [state mixin]({% url /guides/state-mixin/index.html %})/[app mixin]({% url /api/app-mixin/index.html %}).

{% sample %}
classic
=======
//views/user.js
var User = React.createClass({
    saveUser: function () {
        this.app.userActions.saveUser({
            id: this.props.user.id
        });
    }
})

module.exports = Marty.createContainer(User);

//main.js
var app = new Application();

React.render(<User app={app} />, document.getElementById('app'));
es6
===
//views/user.js
class User extends React.Component {
    saveUser() {
        this.app.userActions.saveUser({
            id: this.props.user.id
        });
    }
}

module.exports = Marty.createContainer(User);

//main.js
var app = new Application();

React.render(<User app={app} />, document.getElementById('app'));
{% endsample %}
