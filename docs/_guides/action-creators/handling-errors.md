---
layout: page
title: Handling Errors
id: handling-errors-action-creators
section: Action Creators
---


Sooner or later you're going to create an action that has the potential to fail. Whether theres a fault in the system or you have validation errors you will need a way to handle these errors. Thanks to the [HTTP state source]({% url /api/state-sources/http.html %}) returning promises this process is relatively straightforward. All you need to do is add a ``catch`` callback to the promise returned from the state source and then deal with the error in there. ``Marty.createConstants(...)`` will automatically create a ``{action type}_FAILED`` constant for you if you want to dispatch the error to the rest of the system.

{% sample %}
classic
=======
var UserActionCreators = Marty.createActionCreators({
  id: 'UserActionCreators',
  saveUser: function (user) {
    this.dispatch(UserConstants.SAVE_USER, user);

    UserAPI.saveUser(user).then(function () {
      this.dispatch(UserConstants.SAVE_USER_DONE, user);
    }.bind(this)).catch(function (err) {
      this.dispatch(UserConstants.SAVE_USER_FAILED, user, err);
    }.bind(this));
  }
});

es6
===
class UserActionCreators extends Marty.ActionCreators {
  saveUser(user) {
    this.dispatch(UserConstants.SAVE_USER, user);

    UserAPI.saveUser(user)
      .then(() => this.dispatch(UserConstants.SAVE_USER_DONE, user))
      .catch((err) => this.dispatch(UserConstants.SAVE_USER_FAILED, user, err));
  }
}
{% endsample %}
