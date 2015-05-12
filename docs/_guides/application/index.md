---
layout: page
title: Application
id: application
section: Application
---

The `Application` is responsible for knowing about and instantiating all Stores, Action Creators, Queries, and State sources within your application. It also plays a central role in building [isomorphic applications]({% url /guides/isomorphism/index.html %}).

The two most important functions to know about in the application are `register` and `bindTo`.

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
var User = app.bindTo(require('./views/user'));

React.render(<User id={123} />, document.getElementById('app'));
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
var User = app.bindTo(require('./views/user'));

React.render(<User id={123} />, document.getElementById('app'));
{% endsample %}

`Application#register` accepts an id and a type (e.g. a `Store` or an `ActionCreator`). Internally `register` will create an instance of that type, passing the application instance into the constructor and then making it accessible on the application object. Instead of passing in an id & type you can pass in an object literal, allowing you to register multiple types at once as well. If the object values are themselves objects then their Id's will be the path to the leaf node joined by `.`'s.

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

`Application#bindTo(Component)` passes the application instance to the given component and any children it has. If you want to access the application from within a component you can wrap the component with a [container]({% url /guides/containers/index.html %}) which will pass the application down through the props (`this.props.app`). Alternatively you can set the components `contextTypes` to `Marty.contextTypes` which makes the application available in the context (`this.context.app`).

{% sample %}
classic
=======
var User = React.createClass({
    ...
    contextTypes: Marty.contextTypes,
    saveUser: function () {
        // Using props
        var userActions = this.props.app.userActions;

        // Using contextTypes
        var userActions = this.context.app.userActions;

        userActions.saveUser({
            id: this.props.user.id
        });
    }
})

module.exports = Marty.createContainer(User);

es6
===
class User extends React.Component {
    saveUser() {
         // Using props
        var { userActions } = this.props.app;

        // Using contextTypes
        var { userActions } = this.context.app;

        this.props.app.saveUser({
            id: this.props.user.id
        });
    }
}

User.contextTypes = Marty.contextTypes;

module.exports = Marty.createContainer(User);
{% endsample %}
