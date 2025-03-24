install:
	npm ci

publish:
	npm install --dry-run

lint:
	npx eslint .

test:
	npm test