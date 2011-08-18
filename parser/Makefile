#!/bin/bash
LEXICON := "lexicon.htm"

all: clean patterns compress_patterns compress_metadata results
.PHONY: all

clean: 
	@if [ -f data_o.png ];then rm data_o.png; fi
	@if [ -f metadata_o.png ];then rm metadata_o.png; fi

#parse.js generates metadata.js and data.png (image-encoded pattern data)
patterns:
	node parse.js $(LEXICON)

#post-process data.png to compress
compress_patterns:	data.png
	@optipng -quiet -out data_o.png data.png

#metadata.js must be manually converted to metadata.png using js2png.php
#TODO: make command line version of this with node

#compress metadata.js
compress_metadata:	metadata.png
	@optipng -quiet -out metadata_o.png -fix metadata.png

results:
	@getK.sh
	


