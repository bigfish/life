#!/bin/bash
LEXICON := lexicon.htm
PNGS := data.png metadata.png 
OPTIMIZED_PNGS := data_o.png metadata_o.png
INCLUDE_STATIC_LIFEFORMS := false

all: patterns.js data.png data_o.png results verify
.PHONY: all

patterns.js:	$(LEXICON) parse.js
	@node parse.js $(LEXICON)
	echo "parsing lexicon"

#filter out the lifeforms which do not move
patterns_filtered.js:	patterns.js filter.js
	@echo "filtering patterns (this may take a few minutes)"
	@node filter.js $(INCLUDE_STATIC_LIFEFORMS)

#generate metadata.png and data.png (image-encoded pattern data)
data.png:	patterns_filtered.js generate.js txt2png.js
	@echo "generating png files"
	@rm -f $(PNGS) > /dev/null 2>&1
	@node generate.js patterns_filtered.js 

#post-process images to compress
data_o.png:	data.png metadata.png
	@echo "compressing png files"
	@rm -f $(OPTIMIZED_PNGS) > /dev/null 2>&1
	@optipng -quiet -out data_o.png data.png
	@optipng -quiet -out metadata_o.png -fix metadata.png

#show size of compressed files
results:
	@getK.sh

verify:
	@node verify.js "patterns_filtered.js"
	


