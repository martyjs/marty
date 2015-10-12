
### Marty is no longer actively maintained. Use [Alt](http://alt.js.org) or [Redux](https://github.com/gaearon/redux) instead. [More info](http://martyjs.org/blog/2015/08/02/marty-last.html).


[Marty](http://martyjs.org) is a Javascript library for state management in React applications. It is an implementation of the [Flux architecture](http://facebook.github.io/flux/docs/overview.html).

[![Join the chat at https://gitter.im/martyjs/marty](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/martyjs/marty?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/jhollingworth.svg)](https://saucelabs.com/u/jhollingworth)

## Quick start

```
make build        # rebuild source
make docs         # show documentation on http://localhost:4000
```

## Releasing

```
make release           # inc's patch, builds, creates tag, pushes to github and then publishes to npm
make release inc={inc} # specify what to version part to increment (major, premajor, minor, preminor, patch, prepatch, prerelease)
make release-docs      # builds documentation and copies into ../marty-gh-pages
```

## TypeScript

A TypeScript definition is available at `marty.d.ts`. Please note that it requires the React definition from [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped/blob/master/react/react.d.ts).

## Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally
* Consider starting the commit message with an applicable emoji:
    * :lipstick: `:lipstick:` when improving the format/structure of the code
    * :racehorse: `:racehorse:` when improving performance
    * :non-potable_water: `:non-potable_water:` when plugging memory leaks
    * :memo: `:memo:` when writing docs
    * :penguin: `:penguin:` when fixing something on Linux
    * :apple: `:apple:` when fixing something on Mac OS
    * :checkered_flag: `:checkered_flag:` when fixing something on Windows
    * :bug: `:bug:` when fixing a bug
    * :fire: `:fire:` when removing code or files
    * :green_heart: `:green_heart:` when fixing the CI build
    * :white_check_mark: `:white_check_mark:` when adding tests
    * :lock: `:lock:` when dealing with security
    * :arrow_up: `:arrow_up:` when upgrading dependencies
    * :arrow_down: `:arrow_down:` when downgrading dependencies

(From [atom](https://atom.io/docs/latest/contributing#git-commit-messages))

## Maintainers

* [James Hollingworth](http://github.com/jhollingworth)

## License

* [MIT](https://raw.github.com/martyjs/marty/master/LICENSE)
