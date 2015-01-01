---
layout: page
title: HTTP API
id: api-http-api
section: HTTP API
---

<h2 id="createHttpAPI">Marty.createHttpAPI(props)</h2>

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

<h2 id="baseUrl">baseUrl</h2>

An (optional) base url to prepend to any urls.

<h2 id="requestOptions">request(options)</h2>

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