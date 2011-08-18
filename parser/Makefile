#!/bin/bash

all: patterns compress_patterns compress_metadata
.PHONY: all
	
#parse.js generates metadata.js and data.png (image-encoded pattern data)
patterns:	../lexicon/lexicon.htm
	node parse.js	

#post-process data.png to compress
compress_patterns:	data.png
	optipng -out data_o.png data.png

#metadata.js must be manually converted to metadata.png using js2png.php
#TODO: make command line version of this with node

#compress metadata.js
compress_metadata:	metadata.png
	optipng -out metadata_o.png metadata.png


