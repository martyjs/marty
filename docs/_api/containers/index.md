---
layout: page
id: api-container
title: Container API
section: Container
---
{% highlight js %}
class User extends React.Component {
  render() {
    return <div className="User">{this.props.user}</div>;
  }
}

module.exports = Marty.createContainer(User, {
  listenTo: 'userStore',
  fetch: {
    user() {
      return this.userStore.getUser(this.props.id);
    },
    friends() {
      return this.userStore.getFriends(this.props.id);
    }
  },
  failed(errors) {
    return <div className="User User-failedToLoad">{errors}</div>;
  },
  pending(results) {
    _.defaults(results, {
      user: DEFAULT_USER,
      friends: []
    });

    return this.done(results);
  }
});
{% endhighlight %}

<h3 id="listenTo">listenTo</h3>

Must be either a [store]({% url /api/stores/index.html %}) or an array of [stores]({% url /api/stores/index.html %}). When the store changes then all state is re-fetched and passed to inner component.

<h3 id="inject">inject</h3>

Accepts an array of application dependency Ids (or a single dependency Id) and makes the dependencies available in the container and inner component. Anything you [listenTo](#listenTo) is automatically injected in.

{% highlight js %}
class User extends React.Component {
  saveUser() {
    this.userActions.saveUser(this.state.user);
  }
}

module.exports = Marty.createContainer(User, {
  inject: ['userActions']
});
{% endhighlight %}

<h3 id="fetch">fetch</h3>

``fetch`` is an object hash. The value is a function which is invoked and the result is passed to the inner component as a prop. The prop key is determined by the key in the hash.

``fetch`` can also be a function. If it is then you must return an object hash where the values are the values you want to pass to the inner component.

{% highlight js %}
module.exports = Marty.createContainer(User, {
  listenTo: ['userStore'],
  fetch() {
    return {
      user: this.userStore.getUser(this.props.id);
    }
  }
});
{% endhighlight %}

If any of the values within the object hash are [fetch results]({% url /api/stores/index.html#fetch-result %}) then Marty will wait for the fetches to complete before rendering the inner component. Marty will call the [pending](#pending) handler if any of the fetches are pending and the [failed](#failed) handler if any have failed.

<h3 id="done">done(props)</h3>

Creates the inner components, passing through the result of the [fetch](#fetch) via props. Override if you want more control about how the inner component is created. You should ensure the component should have the ref ``innerComponent``.

<h3 id="pending">pending(finishedFetches)</h3>

Invoked when any of the fetches are pending. Default is to return an empty ``div``. Any fetches that are done are passed into the `pending` handler as an object hash.

Any fetch results that have finished are passed in.

<h3 id="failed">failed(errors)</h3>

Invoked when any of the fetches have failed. An object hash is passed in where the key is name of the fetch and the value is the error. Default is to throw an error.

{% highlight js %}
module.exports = Marty.createContainer(User, {
  inject: 'userStore'
  fetch() {
    return {
      user: this.userStore.getUser(this.props.id);
    }
  },
  failed(errors) {
    console.error('Failed to fetch user', errors.user.message);
  }
});
{% endhighlight %}

<h3 id="getInnerComponent">getInnerComponent()</h3>

Returns the inner component.

<h3 id="app">app</h3>

Returns the instances application.
