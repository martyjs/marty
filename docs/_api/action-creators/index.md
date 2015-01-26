---
layout: page
title: Action Creators API
id: api-action-creators
section: Action Creators
---
<h2 id="createActionCreators">Marty.createActionCreators(props)</h2>

To create some new action creators, you call <code>Marty.createActionCreators</code> passing in an object literal. It returns your action creators as a singleton.

{% highlight js %}
var UserActionCreators = Marty.createActionCreators({
  addUser: UserActions.ADD_USER(function (name, email) {
    this.dispatch(name, email);
  })
});
{% endhighlight %}

<div class="alert alert-warning" role="alert">
  <strong>Warning!</strong> Please avoid using es6 arrow syntax for your callbacks since they are bound to the current context.
</div>

<h2 id="displayName">displayName</h2>

An (optional) display name for the action creator. Used for richer debugging.

<h2 id="dispatch">dispatch([...])</h2>

Dispatches an action payload. Any [action handlers](/api/stores/index.html#handleAction) will be invoked with the given action handlers.

Returns <code>Action</code>. You can rollback an action by calling <code>action.rollback()</code>.
