# These are mainly notes for Richard to make these automated with Flask

# If COFFEE is defined in the user's environment, use that.  Below,
# for each line where COFFEE is not defined, set it to that option if
# it exists.
COFFEE=node_modules/.bin/coffee 
# COFFEE:=$(or $(COFFEE), $(if $(shell which coffee),coffee))
# COFFEE:=$(or $(COFFEE), $(if $(wildcard ./node_modules/.bin/coffee),$(PWD)/../node_modules/.bin/coffee))
# COFFEE:=$(or $(COFFEE), $(if $(wildcard $(PWD)/../node_modules/coffee-script/coffee),$(PWD)/../node_modules/coffee-script/bin/coffee))
# COFFEE:=$(or $(COFFEE), $(if $(wildcard /home/darstr1/transit/node_modules/.bin/coffee),/home/darstr1/transit/node_modules/.bin/coffee))


ASSETS=assets
BUILD=build
CP=cp -p

HTML_ASSETS=$(subst $(ASSETS)/html/, $(BUILD)/, $(wildcard $(ASSETS)/html/*))
CSS_ASSETS:=$(shell find assets/css/ ! -type d)
CSS_ASSETS:=$(subst $(ASSETS)/css/, $(BUILD)/css/, $(CSS_ASSETS))

#LIB_ASSETS=$(subst $(ASSETS)/lib/, $(BUILD)/lib/, \
#             $(wildcard $(ASSETS)/lib/*) \
#             $(wildcard $(ASSETS)/lib/*/*) \
#             $(wildcard $(ASSETS)/lib/*/*/*))
LIB_ASSETS:=$(shell find assets/lib/ ! -type d)
LIB_ASSETS:=$(subst $(ASSETS)/lib/, $(BUILD)/lib/, $(LIB_ASSETS))
#ALLA=$(shell find assets/ \( \( -name html -o -name coffee \) -prune \) -o ! -name '*~' -type f)
#ALL=$(subst $(ASSETS)/, $(BUILD)/, $(ALLA))

JS_ASSETS:=$(shell find $(ASSETS)/js0/ ! -type d)
JS_ASSETS:=$(subst $(ASSETS)/js0/, $(BUILD)/js0/, $(JS_ASSETS))

COFFEE_ASSETS:=$(shell find $(ASSETS)/coffee/ ! -type d -name '*.coffee')
COFFEE_ASSETS:=$(subst $(ASSETS)/coffee/, $(BUILD)/js/, $(COFFEE_ASSETS))
COFFEE_ASSETS:=$(subst .coffee,.js, $(COFFEE_ASSETS))

default: html css lib js coffee
# HTML assets
html: $(HTML_ASSETS)
build/%: assets/html/%
	$(CP) $< $@

# Lib assets
lib: $(LIB_ASSETS)
build/lib/%: assets/lib/%
	@mkdir -p $(dir $@)
	$(CP) $< $@

# CSS assets
css: $(CSS_ASSETS)
build/css/%: assets/css/%
	@mkdir -p $(BUILD)/css/
	$(CP) $< $@

# Pure JS assets.
js: $(JS_ASSETS) #copyJS
build/js/%: assets/js/%
	@mkdir -p $(BUILD)/js/
	$(CP) $(ASSETS)/js/$* $@

# Coffee assets
coffee: $(COFFEE_ASSETS) #compileCoffees
build/js/%.js: assets/coffee/%.coffee
	@mkdir -p $(BUILD)/js/
	$(COFFEE) -o $(BUILD)/js/ -c $(ASSETS)/coffee/$*.coffee



# This was the old stuff that built everything at once every time it was run.
old_default: mkdirs copyHTML copyJS copyCSS copyLib compileCoffees

mkdirs:
#	mkdir -p $(BUILD)/html/
	mkdir -p $(BUILD)/js/
	mkdir -p $(BUILD)/css/
	mkdir -p $(BUILD)/lib/

compileCoffeeFile:
	-$(COFFEE) -o $(BUILD)/www/js/test.js -c $(ASSETS)/coffee/test.coffee -m

compileCoffees:
	-$(COFFEE) -o $(BUILD)/js/ -c $(ASSETS)/coffee/

copyHTML:
	-cp -r $(ASSETS)/html/* $(BUILD)/

copyJS:
	-cp -r $(ASSETS)/js/* $(BUILD)/js/

copyCSS:
	-cp -r $(ASSETS)/css/* $(BUILD)/css/

copyLib:
	-cp -r $(ASSETS)/lib/* $(BUILD)/lib/

clean:
# Danger - ensure that rm -rf + empty variable doesn't result in "rm -rf /"
	-rm -rf ./$(BUILD)/*
