BIN = ./node_modules/.bin
UNIT_TESTS = test/unit
INTEGRATION_TESTS = test/integration

.PHONY: bootstrap start clean test;

SRC = $(shell find ./lib ./build ./GruntFile.js ./index.js ./test -type f -name '*.js')

start: lint
	@$(BIN)/grunt serve

test: lint
	@$(BIN)/mocha -R spec

lint: bootstrap
ifeq ($(ENV),CI)
	@$(BIN)/jsxcs -r checkstyle $(SRC) > reports/karma-tests.xml;
	@$(BIN)/jsxhint --reporter checkstyle $(SRC) > reports/stylechecker-results.xml;
else 
	@$(BIN)/jsxcs $(SRC);
	@$(BIN)/jsxhint $(SRC);
endif

release: test
	@$(BIN)/grunt release

clean:
	@rm -rf reports

bootstrap: clean package.json
	@npm install;