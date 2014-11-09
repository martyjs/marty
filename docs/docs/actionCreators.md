---
layout: docs
title: Action Creators
id: action-creators
group: docs
order: 3
---

{% highlight js %}
var UserActionCreators = Marty.createActionCreators({
  receiveAll: function (users) {
    this.dispatch(Constants.RECEIVE_USERS, users);
  }
});
{% endhighlight %}