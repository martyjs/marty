---
layout: page
title: HTTP State Source
id: state-source-http
section: State Sources
---

Provides a simple way of making HTTP requests.

{% sample %}
classic
=======
var UsersAPI = Marty.createStateSource({
  type: 'http',
  createUser: function (user) {
    return this.post({ url: '/users', body: user }).then(function (res) {
      if (res.ok) {
        return res.json();
      }

      throw new Error('Failed to create user', res);
    });
  }
});

es6
===
class UsersAPI extends Marty.HttpStateSource {
  createUser(user) {
    return this.post({ url: '/users', body: user }).then(res => {
      if (res.ok) {
        return res.json();
      }

      throw new Error('Failed to create user', res);
    });
  }
}
{% endsample %}

<h2 id="baseUrl">baseUrl</h2>

An (optional) base url to prepend to any urls.

<h2 id="requestOptions">request(options)</h2>

Starts an HTTP request with the given <code>method</code> and <code>options</code>. We use the [fetch](https://github.com/github/fetch) polyfill however you can override ``request()`` with your own implementation. The only requirement is it returns a <code>Promise</code>.

{% sample %}
classic
=======
var UsersAPI = Marty.createStateSource({
  type: 'http',
  createUser: function (user) {
    return this.request({
      url: '/users',
      method: 'POST',
      body: { name: 'foo' },
      contentType: 'application/json'
    });
  }
});

es6
===
class UsersAPI extends Marty.HttpStateSource {
  createUser(user) {
    return this.request({
      url: '/users',
      method: 'POST',
      body: { name: 'foo' }
    });
  }
}
{% endsample %}

<h3>Options</h3>

<table class="table table-bordered table-striped">
  <thead>
   <tr>
     <th style="width: 100px;">Name</th>
     <th style="width: 100px;">type</th>
     <th style="width: 50px;">default</th>
     <th>description</th>
   </tr>
  </thead>
  <tbody>
   <tr>
     <td>url</td>
     <td>string</td>
     <td></td>
     <td>Url of resource</td>
   </tr>
   <tr>
     <td>method</td>
     <td>string</td>
     <td>get</td>
     <td>http method</td>
   </tr>
   <tr>
     <td>headers</td>
     <td>object</td>
     <td>{}</td>
     <td>http headers</td>
   </tr>
   <tr>
     <td>contentType</td>
     <td>string</td>
     <td>application/json</td>
     <td>Content type of request</td>
   </tr>
   <tr>
     <td>dataType</td>
     <td>string</td>
     <td>json</td>
     <td>The type of data that you're expecting back from the server. <code>xml</code>, <code>json</code>, <code>script</code>, or <code>html</code></td>
   </tr>
  </tbody>
</table>

<h2 id="getUrl">get(url)</h2>

Same as <code>request({ method: 'GET', url: url })</code>

<h2 id="getOptions">get(options)</h2>

Same as <code>request(_.extend(options, { method: 'GET'})</code>

<h2 id="postUrl">post(url)</h2>

Same as <code>request({ method: 'POST', url: url })</code>

<h2 id="postOptions">post(options)</h2>

Same as <code>request(_.extend(options, { method: 'POST'})</code>

<h2 id="putUrl">put(url)</h2>

Same as <code>request({ method: 'PUT', url: url })</code>

<h2 id="putOptions">put(options)</h2>

Same as <code>request(_.extend(options, { method: 'PUT'})</code>

<h2 id="deleteUrl">delete(url)</h2>

Same as <code>request({ method: 'DELETE', url: url })</code>

<h2 id="deleteOptions">delete(options)</h2>

Same as <code>request(_.extend(options, { method: 'DELETE'})</code>

<h2 id="hooks">Hooks</h2>

Hooks allows you to make changes to requests before they are sent and as well as when responses are received. This can be useful when you want to do things like automatically converting all JSON responses to immutable objects.

Hooks are object literals which have 4 optional keys: ``id``, ``before``, ``after`` and ``priority``. ``id`` is required if you wish to have multiple hooks registered. If ``before`` is present then it will be called with the request as its argument. If ``after`` is present then it will be called after the response is received with the response as its argument. Setting a priority allows you to alter in what order the hook is executed (The smaller the number, the earlier it will be executed).

{% highlight js %}
var Marty = require('marty');

Marty.HttpStateSource.addHook({
  id: 'SomeHook',
  priority: 1,
  before(req) {
    req.headers['Foo'] = 'bar';
  },
  after(res) {
    return res.json();
  }
});
{% endhighlight %}

<h3 id="addHook">addHook</h3>

Registers the hook in the pipeline

{% highlight js %}
var Marty = require('marty');

Marty.HttpStateSource.addHook({
  id: 'AnotherHook',
  priority: 1,
  before: function (req) {
    req.headers['Foo'] = 'bar';
  },
  after: function (res) {
    return res.json();
  }
});
{% endhighlight %}

<h3 id="removeHook">removeHook</h3>

Removes the hook from the pipline.

{% highlight js %}
var Marty = require('marty');
var ParseJSON = require('marty/http/hooks/parseJSON');

Marty.HttpStateSource.removeHook(ParseJSON);
{% endhighlight %}
