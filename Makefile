TESTS += test/collection.test.js
TESTS += test/model.test.js

TESTS_ALL = $(find test -type f -name '*.test.js')

test:
	@./node_modules/.bin/mocha \
		--ui exports \
		--reporter list \
		--slow 2000ms \
		--bail \
		$(TESTS)

.PHONY: test
