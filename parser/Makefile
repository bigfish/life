#!/bin/bash
LEXICON := lexicon.htm
PNGS := data.png data_o.png metadata.png metadata_o.png

all: patterns.js data.png data_o.png results verify
.PHONY: all

clean: 
	rm -f $(PNGS) > /dev/null 2>&1

patterns.js:	$(LEXICON) parse.js
	node parse.js $(LEXICON)

#generate metadata.png and data.png (image-encoded pattern data)
data.png:	patterns.js
	node generate.js 

#post-process images to compress
data_o.png:	data.png metadata.png
	@optipng -quiet -out data_o.png data.png
	@optipng -quiet -out metadata_o.png -fix metadata.png

#show size of compressed files
results:
	@getK.sh

verify:
	@node verify.js
	


