all: install

configure:
	sudo npm install -g grunt-cli

install:
	npm install

clean:
	rm -Rf $(CURDIR)/node_modules
	test -e npm-debug.log && rm npm-debug.log || true
