BIN = ./node_modules/.bin

.PHONY: bootstrap bootstrap-js bootstrap-ruby start test test-server test-browser docs release-docs build build-browser build-server server-watch;

SRC = $(shell find ./lib ./errors ./http ./constants ./*.js -type f -name '*.js')
ES6_SRC = $(shell find ./lib ./marty.js -type f -name '*.js')

test: lint test-server test-browser

test-server:
	@./build/test-server.sh

test-browser: lint
	@./build/test-browser.sh

test-watch:
	@./build/test-watch.sh

bootstrap: bootstrap-js bootstrap-ruby

bootstrap-js: package.json
	@npm install

bootstrap-ruby: docs/Gemfile
	@which bundle > /dev/null || gem install bundler
	@cd docs && bundle install

lint: bootstrap-js
	@$(BIN)/jscs --esprima=esprima-fb $(SRC);
	@$(BIN)/jsxhint $(SRC);

release: test
	@inc=$(inc) sh ./build/release.sh

watch:
	@mkdir -p dist
	@$(BIN)/babel -w -d dist/node $(ES6_SRC)

build: lint build-browser build-server

build-server:
	@mkdir -p dist/node
	@rm -rf dist/node
	@$(BIN)/babel -d dist/node $(ES6_SRC)

build-browser:
	@mkdir -p dist/browser
	@$(BIN)/browserify  --transform babelify --plugin bundle-collapser/plugin --require ./marty.js --exclude react --standalone Marty > dist/browser/marty.js
	@cat dist/browser/marty.js | $(BIN)/uglifyjs -m -c "comparisons=false,keep_fargs=true,unsafe=true,unsafe_comps=true,warnings=false" -b "ascii_only=true,beautify=false" -o dist/browser/marty.min.js
	@gzip --best dist/browser/marty.min.js -c > dist/browser/marty.min.js.gz

docs: bootstrap-ruby
	@cd docs && bundle exec jekyll serve -w

release-docs: bootstrap-ruby
	@cd docs && bundle exec rake release