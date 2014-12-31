---
layout: docs
title: HTTP API
description: How you communicate with the server
id: http-api
group: docs
header_colour: D9544D
order: 5
---

It's likely at some point that you will need to communicate with the server. HTTP APIs encapsulate that communication for you.

HTTP APIs allow you to define functions that create HTTP requests. We use the [fetch](https://github.com/github/fetch) polyfill for making requests but you can use easily roll your own if you like.

All requests return a promise (Promises/A) that allow you to easily define what happens when a request has finished.

{% highlight js %}
var UsersAPI = Marty.createHttpAPI({
  baseUrl: 'http://foo.com'
  getAll: function (users) {
    return this.get('/users').then(function (res) {
      UserActionCreators.receiveAll(res.body);
    });
  },
  createUser: function (user) {
    this.post({ url: '/users', body: user })
        .then(function (res) {
          UserActionCreators.receiveUser(res.body);
        });
  }
});
{% endhighlight %}

If the request is successful then the promise resolves with a response object. If the response content type is ``application/json`` then Marty will attempt to deserialize the body which is accessible at ``res.body``.

{% highlight js %}
this.get('/foo').then(function(res) {
  console.log(res.body);
  console.log(res.headers.get('Content-Type'));
  console.log(res.headers.get('Date'));
  console.log(res.status);
  console.log(res.statusText);
})
{% endhighlight %}

<h2 id="api">API</h2>

<h3 id="createHttpAPI">createHttpAPI(props)</h3>

To create a new HTTP API, you call <code>Marty.createHttpAPI</code> passing in a set of properties. It returns your HTTP API as a singleton.

{% highlight js %}
var UsersAPI = Marty.createHttpAPI({
  createUser: function (user) {
    this.post({ url: '/users', body: user })
        .then(function (res) {
          UserActionCreators.receiveUser(res.body);
        });
  }
});
{% endhighlight %}

<h3 id="baseUrl">baseUrl</h3>

An (optional) base url to prepend to any urls.

<h3 id="requestOptions">request(options)</h3>

Starts an HTTP request with the given <code>method</code> and <code>options</code>. We use the [fetch](https://github.com/github/fetch) polyfill however you can override ``request()`` with your own implementation. The only requirement is it returns a <code>Promise</code>.

{% highlight js %}
var UsersAPI = Marty.createHttpAPI({
  createUser: function (user) {
    this.request({
      url: '/users',
      method: 'POST',
      body: { name: 'foo' }
    });
  }
});
{% endhighlight %}

<h4>Options</h4>

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
     <td>body</td>
     <td>string | object</td>
     <td></td>
     <td>entity body for `PATCH`, `POST` and `PUT` requests.</td>
   </tr>
   <tr>
     <td>contentType</td>
     <td>string</td>
     <td>application/json</td>
     <td>Content type of request</td>
   </tr>
  </tbody>
</table>

<h3 id="getUrl">get(url)</h3>

Same as <code>request({ method: 'GET', url: url })</code>

<h3 id="getOptions">get(options)</h3>

Same as <code>request(_.extend(options, { method: 'GET'})</code>

<h3 id="postUrl">post(url)</h3>

Same as <code>request({ method: 'POST', url: url })</code>

<h3 id="postOptions">post(options)</h3>

Same as <code>request(_.extend(options, { method: 'POST'})</code>

<h3 id="putUrl">put(url)</h3>

Same as <code>request({ method: 'PUT', url: url })</code>

<h3 id="putOptions">put(options)</h3>

Same as <code>request(_.extend(options, { method: 'PUT'})</code>

<h3 id="deleteUrl">delete(url)</h3>

Same as <code>request({ method: 'DELETE', url: url })</code>

<h3 id="deleteOptions">delete(options)</h3>

Same as <code>request(_.extend(options, { method: 'DELETE'})</code>