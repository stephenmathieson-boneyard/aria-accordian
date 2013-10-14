
build: components index.js aria-accordian.css
	@component build --dev

components: component.json
	@component install --dev

index: index.jade
	jade < $^ > $@.html

clean:
	rm -fr build components template.js index.html

.PHONY: clean
