#!/bin/bash
LEXICON := lexicon.htm
PNGS := data.png metadata.png life_png
OPTIMIZED_PNGS := data_o.png metadata_o.png life_o.png
INCLUDE_STATIC_LIFEFORMS := false
MIN_LIFESPAN := 100
MAX_NUM_FORMS := 100

all: loader_ugly.js lifestyles-min.css life_o.png patterns.js data.png data_o.png results verify
.PHONY: all

loader_ugly.js:	../loader.js
	@uglifyjs -o loader_ugly.js ../loader.js

life_o.png:	../life.js txt2png.js
	@echo "compressing life.js"
	@rm -f life_ugly.js life.png > /dev/null 2>&1
	@uglifyjs -o life_ugly.js ../life.js
	@node txt2png.js life_ugly.js life.png

lifestyles-min.css: ../lifestyles.css
	java -jar ${YUICOMPRESSOR} --type css -o lifestyles-min.css ../lifestyles.css  
	
patterns.js:	$(LEXICON) parse.js
	@echo "parsing lexicon"
	@node parse.js $(LEXICON)

#filter out the lifeforms which do not move
patterns_filtered.js:	patterns.js filter.js
	@echo "filtering patterns (this may take a few minutes)"
	@node filter.js $(INCLUDE_STATIC_LIFEFORMS) $(MIN_LIFESPAN) $(MAX_NUM_FORMS)

#generate metadata.png and data.png (image-encoded pattern data)
data.png:	patterns_filtered.js generate.js txt2png.js
	@echo "generating png files"
	@rm -f $(PNGS) > /dev/null 2>&1
	@node generate.js patterns_filtered.js 

#post-process images to compress
data_o.png:	data.png metadata.png life.png
	@echo "compressing png files"
	@rm -f $(OPTIMIZED_PNGS) > /dev/null 2>&1
	@optipng -quiet -out life_o.png life.png
	@optipng -quiet -out data_o.png data.png
	@optipng -quiet -out metadata_o.png -fix metadata.png

#show size of compressed files
results:
	@getK.sh

verify: txt2png.js
	@node verify.js "patterns_filtered.js"
	


