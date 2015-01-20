---
layout: page
title: Overview of Marty
id: concepts-overview
section: Concepts
---

State is a big problem in the UI. Most JS applications have few restrictions on how state is changed. This makes it difficult to understand why something happens. Anyone who's spent late nights trying to understand why their application suddenly stopped working after removing an innocuous line should understand this.

Flux is an answer to that problem. At its most basic level it's a set of rules about how to manage your applications state. Specifically who can change it, where they can change it and in what direction those changes should be propagated through your application.

There are 4 things you will need to understand: How to tell the application to change its state ([Action creators](/guides/action-creators/index.html)), How to change the applications state ([Stores](/guides/stores/index.html)), how to tell the view that the state has changed ([State mixins](/guides/state-mixin/index.html)) and how to tie them all together ([Constants](/guides/constants/index.html)).

Action Creators are where any changes to your applications state starts. Actions are functions that are responsible for coordinating changes to local and remote state. Actions have a type which is a string describing the action (e.g. "UPDATE\_USER_EMAIL").

We want to be explicit about the action types in your application so we define them as ([Constants](/guides/constants/index.html)). Constants allow you to loosely couple your application as well as documenting what actions are available (Useful for understanding what your application can do). Constants are also responsible for creating action creators.

{% highlight js %}
var UserConstants = Marty.createConstants(["UPDATE_USER_EMAIL"]);

var UserActionCreators = Marty.createActionCreators({
  updateUserEmail: UserConstants.UPDATE_USER_EMAIL(function (userId, email) {
    this.dispatch(userId, email);
  })
});

UserActionCreators.updateUserEmail(122, "foo@bar.com");
{% endhighlight %}

In the above scenario, ``UserConstants.UPDATE_USER_EMAIL`` creates an action creator which, when invoked, will create an action with type `UPDATE_USER_EMAIL`.

If an action is making a change to your local state then it can pass its type data along to something called a dispatcher. The dispatcher is a just a big registry of callbacks (similar to an event emitter). Anyone interested can register to be notified when an action is dispatched.

{% highlight js %}
var Dispatcher = require('marty/dispatcher');

Dispatcher.register(function (action) {
  console.log('action with type', action.type', has been dispatched) ;
});

Dispatcher.dispatch({
  type: 'foo'
});
{% endhighlight %}

Normally you don't manually register callbacks with the dispatcher, instead you create stores which do this for you. Stores hold information about a domain. That domain could be a collection of entities (Like a [Backbone Collection](http://backbonejs.org/#Collection)) or it could be some information about something specific (Like a [Backbone Model](http://backbonejs.org/#Model)).

{% highlight js %}
var UserStore = Marty.createStore({
  handlers: {
    updateEmail: UserConstants.UPDATE_USER_EMAIL
  },
  getInitialState: function () {
    return {};
  },
  getUser: function (userId) {
    return this.state[userId];
  },
  updateEmail: function (userId, email) {
    this.state[userId].email = email;
    this.hasChanged();
  }
});
{% endhighlight %}

When your application starts, each store automatically starts listening to the dispatcher. When an action is dispatched, each store checks its [``handlers`` hash](/api/stores/index.html#handlers) to see if the store has a handler for the actions type. If it does it will call that handler, passing in the actions data. The action handler then updates its internal state (all stored in ``this.state``).

The next (and final) step is to notify views about the new data. Like the dispatcher, you can register to be notified of any changes to a store.

{% highlight js %}
UserStore.addChangeListener(function (state) {
  console.log('User store has changed', state);
});
{% endhighlight %}

If you have a view thats interested in a domain, it can ask the store to notify it of any changes. When the store updates, your view just rerenders itself with the new state. You might ask, "what if the store changed something your view isn't interested in (e.g. a different entity)?". Thanks to Reacts virtual DOM it doesn't really matter, if the state is the same then the view just returns the same DOM tree and React does nothing. This makes your views *significantly simpler* since you just render whatever the store tells you to render.

{% highlight js %}
var User = React.createClass({
  render: function () {
    return (
      <div className="user">
        <input type="text"
               onChange={this.updateEmail}
               value={this.state.user.email}></input>
      </div>
    );
  },
  updateEmail: function (e) {
    var email = e.target.value;
    UserActionCreators.updateUserEmailthis.props.userId, email);
  }
  getInitialState: function () {
    return {
      user: UserStore.getUser(this.props.userId)
    };
  },
  componentDidMount: function () {
    this.userStoreListener = UserStore.addChangeListener(this.onUserStoreChanged);
  },
  componentWillUnmount: function (nextProps) {
    this.userStoreListener.dispose();
  },
  onUserStoreChanged: function () {
    this.setState({
      user: UserStore.getUser(this.props.userId)
    });
  }
});
{% endhighlight %}

As your application grows you start to find that there is a lot of boilerplate code to get views to listen to stores. [State mixins](/guides/state-mixin/index.html) are our solution to this problem. State mixins manage listening to stores for you as well as providing a simpler API to implement:

{% highlight js %}
var UserStateMixin = Marty.createStateMixin({
  listenTo: UserStore,
  getState: function () {
    return {
      user: UserStore.getUser(this.props.userId)
    };
  }
});

var User = React.createClass({
  mixins: [UserStateMixin],
  render: function () {
    return (
      <div className="user">
        <input type="text"
               onChange={this.updateEmail}
               value={this.state.user.email}></input>
      </div>
    );
  },
  updateEmail: function (e) {
    var email = e.target.value;
    UserActionCreators.updateUserEmailthis.props.userId, email);
  }
});
{% endhighlight %}

Whenever you want to change a value within your application your data must follow this flow of [Action creator](/guides/action-creators/index.html) **->** [Dispatcher](/guides/dispatcher/index.html) **->** [Store](/guides/stores/index.html) **->** [State mixin](/guides/state-mixin/index.html) **->** View. This is known as a **unidirectional data flow**.

<center>
  <img src="/img/data-flow.png" alt="Data flow"/>
</center>

While this seems superfluous at first it turns out to have some great benefits. First and foremost, its really easy to debug. There's only one place your application state can change so you don't have to dig into all the views to work out where a value was changed (it's even easier if you're using [immutable data collections](/guides/stores/immutable-data-collections.html)). Thanks to action types being strings you have a loosely coupled [Law of Demeter](http://en.wikipedia.org/wiki/Law_of_Demeter) architecture which is easy to grow without increasing the complexity of the code base.