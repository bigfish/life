#!/bin/bash
LEXICON := "lexicon.htm"

all: clean patterns compress_patterns compress_metadata results verify
.PHONY: all

clean: 
	@rm data.png data_o.png metadata.png metadata_o.png > /dev/null 2>&1

#parse.js generates metadata.png and data.png (image-encoded pattern data)
patterns:
	node parse.js $(LEXICON)

#post-process data.png to compress
compress_patterns:	data.png
	@optipng -quiet -out data_o.png data.png

#compress metadata.js
compress_metadata:	metadata.png
	@optipng -quiet -out metadata_o.png -fix metadata.png

results:
	@getK.sh

verify:
	@node verify.js
	


