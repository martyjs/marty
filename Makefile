BIN = ./node_modules/.bin

.PHONY: bootstrap start clean test;

SRC = $(shell find ./lib ./index.js ./test -type f -name '*.js')

test: lint
	@$(BIN)/karma start --single-run

test-watch: lint
	@$(BIN)/karma start

lint: bootstrap clean
	@$(BIN)/jsxcs $(SRC);
	@$(BIN)/jsxhint $(SRC);

release: lint
	@$(BIN)/browserify --transform reactify --require ./index.js --standalone Marty | $(BIN)/uglifyjs > dist/marty.js
	@echo "release version available in dist/marty.js"

clean:
	@rm -rf dist
	@mkdir dist

bootstrap: package.json
	@npm install;