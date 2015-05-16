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
            return this.userStore.getUser();
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
            return this.userStore.getUser();
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

`Application#bindTo(Component)` makes the application instance available to the given component and its children. It does this by wrapping your component with a component that adds the application to the [context](https://www.tildedave.com/2014/11/15/introduction-to-contexts-in-react-js.html). While contexts are the easiest way of making the application instance available to components, making use of the application tends to be quite verbose. To solve this you can inject dependencies in to your component using [containers]({% url /api/containers/index.html#inject %}), [state mixins]({% url /api/state-mixin/index.html#inject %}) and the [inject mixin]({% url /api/inject-mixin/index.html %}).

{% sample %}
classic
=======
//views/user.js
var User = React.createClass({
    saveUser: function () {
        this.userActions.saveUser({
            id: this.props.user.id
        });
    }
})

module.exports = Marty.createContainer(User, {
    inject: 'userActions'
});

//main.js
var app = new Application();
var User = app.bindTo(require('./views/user'));

React.render(<User />, document.getElementById('app'));
es6
===
//views/user.js
class User extends React.Component {
    saveUser() {
        this.userActions.saveUser({
            id: this.props.user.id
        });
    }
}

module.exportsdow = Marty.createContainer(User, {
    inject: 'userActions'
});

//main.js
var app = new Application();
var User = app.bindTo(require('./views/user'));

React.render(<User />, document.getElementById('app'));
{% endsample %}
