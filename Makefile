BIN = ./node_modules/.bin

.PHONY: bootstrap bootstrap-js bootstrap-ruby start test test-server test-browser docs release-docs build build-browser build-server server-watch;

SRC = $(shell find ./lib ./errors ./http ./constants ./*.js -type f -name '*.js')

test: lint test-server test-browser

test-server:
	@./build/test-server.sh

test-browser: lint
	@./build/test-browser.sh

test-watch: lint
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

server-watch:
	@mkdir -p dist
	@$(BIN)/babel -w -d dist/es6 $(SRC)

build: lint build-browser build-server

build-server:
	@mkdir -p dist
	@rm -rf dist/es6
	@$(BIN)/babel -d dist/es6 $(SRC)

build-browser:
	@mkdir -p dist
	@$(BIN)/browserify --transform babelify --require ./browser.js --exclude react --standalone Marty > dist/marty.js
	@cat dist/marty.js | $(BIN)/uglifyjs > dist/marty.min.js
	@gzip dist/marty.min.js -c > dist/marty.min.js.gz

docs: bootstrap-ruby
	@cd docs && bundle exec jekyll serve -w

release-docs: bootstrap-ruby
	@cd docs && bundle exec rake release