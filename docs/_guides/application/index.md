---
layout: page
title: Application
id: application
section: Application
---

The `Application` is responsible for knowing about and instantiating all Stores, Action Creators, Queries, and State sources within your application.

{% highlight js %}
class Application extends Marty.Application {
    constructor(options) {
        super(options);

        this.register({
            userStore: UserStore,
            userQueries: require('./queries/userQueries'),
            userActionCreators: require('./actions/userActionCreators')
        });

        this.register('userAPI', require('./sources/userAPI'));
    }
}

var app = new Application();

app.userAPI.getUser(123).then(user => console.log(user));

var User = app.bindTo(require('./views/user'));

React.render(<User id={123} />, document.getElementById('app'));
{% endhighlight %}

The two most important functions to know about are `register` and `bindTo`. `register` accepts an `id` and a type (e.g. a `Store` or an `ActionCreator`). Internally `register` will create an instance of that type, passing the application instance into the constructor as well as making it accessible on the application object. You can also pass in an object literal into `register`, allowing you to register multiple types at once as well as allowing namespaces, e.g.

{% highlight js %}

class UserStore extends Marty.Store {
    constructor(options) {
        super(options);
        console.log(options.id, options.app);
    }

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
}

class Application extends Marty.Application {
    constructor(options) {
        super(options);

        this.register({
            user: {
                store: UserStore
            }
        });

        this.register({
            foo: {
                bar: {
                    baz: require('./api/bazAPI')
                }
            }
        });
    }
}

var app = new Application();

app.foo.bar.baz.getBaz().then(baz => console.log(baz));
{% endhighlight %}

`bindTo` is 


The dispatcher is the central hub in which all application data flows throw. When a store is created it [registers](http://facebook.github.io/flux/docs/dispatcher.html#api) a callback with the dispatcher. Whenever an [action creator]({% url /guides/action-creators/index.html %}) creates an action and you call ``this.dispatch()``, the action will be passed to the dispatcher, which passes it to any registered stores. The dispatcher will call each registered callback synchronously. Any actions that are dispatched during this process will be queued until all callbacks are called.

Marty uses [facebook's dispatcher](https://github.com/facebook/flux/).

{% highlight js %}
var Dispatcher = require('marty').dispatcher.getDefault();

var dispatchToken = Dispatcher.register(function (action) {
  console.log(action);
});

Dispatcher.dispatchAction({ type: 'CREATE_FOO' });
{% endhighlight %}
