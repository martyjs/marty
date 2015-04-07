0.9.8 / 2015-07-04
===================

- Do not setState in container unless component is mounted (#265)
- Generate lifecycle methods at container creation (#263)
- Make it easier to use with webpack (#259)

0.9.7 / 2015-04-04
===================

- Fix bug where single instance of observer per container (#248)
- Allow you to pass in component life style hooks (componentWillReceiveProps, componentWillUpdate, componentDidUpdate, componentDidMount, componentWillUnmount and componentWillMount) (#249)

0.9.6 / 2015-03-30
===================

- Use latest props when container is updating fetches (#244)

0.9.5 / 2015-03-29
===================

- Don't swallow errors when fetching `locally` or `remotely` (#238)

0.9.4 / 2015-03-28
===================

- Add `Container#getInnerComponent`

0.9.3 / 2015-03-28
===================

- Allow you to specify your own contextTypes on the container #234
- Allow you to extend containers with your own functions (#224)

0.9.2 / 2015-03-27
===================

- Correctly listening to `componentWillReceiveProps` and passing props (#229)

0.9.1 / 2015-03-25
===================

- Fix issue where Marty would not work with window object (#219, #216)

0.9.0 / 2015-03-24
===================

**New features**

- Isomorphism (#13)
- CookieStateSource
- LocationStateSource
- ES6 Classes (#89)
- Add dataType option to http state source (#161)
- Lodash v3 instead of underscore (#136)
- Simplify action creators (#163, #93)
- replaceState and setState (#126)
- HttpStateSource hooks (#118)
- FetchResult#toPromise (#131)
- Clear fetch history in Store#clear (#149)
- Batch store change events (#112)
- Allow you to specify when function context (#76)
- Marty.createContainer (#204)
- Set request credentials to 'same-origin' (#209)

**Bugs**

- dependsOn doesn't update when dependent store updates (#113)
- Don't auto set content-type if using FormData (#140)
- Fetch API compatibility (#133)


0.8.15 / 2015-03-06
===================
- Add reactify as a dependency so you dont have to explicitly add it to parent project

0.8.14 / 2015-03-05
===================
- Remove dependency on Babel

0.8.13 / 2015-03-03
===================
- Hotfix for fetch incomaptibility in Chrome Canary [#133](https://github.com/jhollingworth/marty/issues/133)

0.8.12 / 2015-02-14
===================
- Added improved error logging [#129](https://github.com/jhollingworth/marty/issues/129)

0.8.11 / 2015-02-12
===================
- Improve documentation
- Fixes [#106](https://github.com/jhollingworth/marty/issues/106)
- Fixes [#74](https://github.com/jhollingworth/marty/issues/74)
- Fixes [#123](https://github.com/jhollingworth/marty/issues/123)

0.8.10 / 2015-02-03
==================
- Fixes documentation typos
- :green_heart: Fixes [#100](https://github.com/jhollingworth/marty/issues/100)
- Fixes [#94](https://github.com/jhollingworth/marty/issues/94)
- Fixes [#99](https://github.com/jhollingworth/marty/issues/99)
