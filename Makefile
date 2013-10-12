
build: components index.js aria-accordian.css
	@component build --dev

components: component.json
	@component install --dev

example: example.jade
	jade < $^ > $@.html

clean:
	rm -fr build components template.js example.html

.PHONY: clean
