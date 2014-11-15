---
layout: docs
title: Overview
id: overview
description: Explaining the core concepts of Marty and how it all fits together
group: docs
order: 1
---

React's focus is the view where as Marty focuses on managing the state needed to build those views. 

It follows the Flux architecture which Facebook and Instagram created to help deal with building ever larger JS web applications. Flux makes your applications easier to understand, debug and test as well as scaling well as your application grows.


<h2 id="data-flow">Data flow</h2>

A core concept within Flux is the Flux update cycle which is a **unidirectional data flow** through the application. 

<center>
  <img src="/img/data-flow.png" alt="Data flow"/>
</center>

The flux update cycle starts with some new data from the view or the server. 

It gets passed to an [action creator](/docs/actionCreators.html) which transforms the data into an action, something that can be interpreted by the rest of the application.


{% highlight js %}
var TodoActionCreators = Marty.createActionCreator({
  createTodoItem: function (text) {
    this.dispatch("CREATE_TODO", {
      text: text
    });
  }
});

TodoActionCreators.createTodo("Learn Flux");
{% endhighlight %}


The [action creator](/docs/actionCreators.html) will pass that action to the [dispatcher](/docs/dispatcher.html) which is responsible for keeping a track of all [stores](/docs/stores.html) and passing on any actions to them.

The [store](/docs/stores.html) is where the applications state and logic live for a specific domain. A store could contain a collection of domain entities (Like a [Backbone Collection](http://backbonejs.org/#Collection)) or could be some specific information about something (Like a [Backbone Model](http://backbonejs.org/#Model)). 

{% highlight js %}
var TodoStore = Marty.createStore({
  handlers: {
    addTodo: "CREATE_TODO"
  },
  addTodo: function (todo) {
    this.state.push(todo);
    this.hasChanged();
  },
  getInitialState: function () {
    return [];
  }
});
{% endhighlight %}

Stores register handlers for actions which are responsible for updating their state. Once they have updated themselves, they emit an event telling anyone listening to it that it has updated. 

Finally, you want to update the view with the new state. To bind a stores state to a view you use the [state mixin](/docs/stateMixin.html).

{% highlight js %}
var Todos = React.createClass({
  mixins: [Marty.createStateMixin(TodoStore)],
  render: function () {
    return (
      <div className="todos">
        {this.state.map(function (todo) {
          return <Todo item={todo} />
        })}
      </div>
    );
  }
});
{% endhighlight %}

When the view first loads and any time the stores state changes after that the view's render function will be called and this.state will be whatever the current state of the store.

##Where should my code go?

Anything to do with storing and changing your applications state should live in the **[stores](/docs/stores.html)**. Views are allowed to call the [stores](/docs/stores.html) directly to get state (but not to write state) and so the [stores](/docs/stores.html) should contain all logic for getting data whether that be from an internal cache or from the server.

If you want to write data, that should live within an **[action creator](/docs/actionCreators.html)**. [Action creators](/docs/actionCreators.html) are the starting point for data flowing through the system and we want to make sure everyone knows about any state changes. 

When you want to communicate with the server, you should use an **[Http APIs](/docs/httpApi.html)**. The response to an http request should be handled by an [action creator](/docs/actionCreators.html).

##How do I handle asynchronous operations?

Every operation within a Flux application should be asynchronous by default. This allows you to have a consistent API that encapsulates any remote operations. 

Within a marty application this means that any get request against a store *might* not return a result and so you should make sure to guard against it within your views.

{% highlight js %}
var TodoStore = Marty.createStore({
  handlers: {
    addTodo: "CREATE_TODO"
  },
  getTodo: function (id) {
    var todo = this.state[id];

    if (todo) {
      return todo;
    }

    TodoAPI.getTodo(id);    
  },
  addTodo: function (todo) {
    this.state[todo.id] = todo;
    this.hasChanged();
  },
  getInitialState: function () {
    return {};
  }
});

var TodoState = Marty.createStateMixin({
  listenTo: TodoStore,
  getState: function () {
    return {
      // getTodo will return null until the API call is updated
      todo: TodoStore.getTodo(this.props.id);
    };
  }
});

var TodoView = React.createClass({
  mixins: [TodoState],
  render: function () {
    var todo = this.state.todo || {};
    return <div className="todo">{todo.text}</div>;
  }
});
{% endhighlight %}

