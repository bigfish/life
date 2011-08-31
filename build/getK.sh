#!/bin/bash
echo "******** SIZE REPORT ********"
loaderSize=`ls -la loader_ugly.js | awk '{print $5}'`
htmlSize=`ls -la ../index.html | awk '{ print $5 }'`
cssSize=`ls -la lifestyles-min.css | awk '{ print $5 }'`
#pngSize=`find . -name "*_o.png" | xargs ls -la | awk '{sum += $5} END {print sum}'`
dataSize=`ls -la data_o.png | awk '{print $5}'`
metaDataSize=`ls -la metadata_o.png | awk '{print $5}'`
lifeSize=`ls -la life_o.png | awk '{print $5}'`
echo "index.html: ${htmlSize}"
echo "lifestyles-min.css: ${cssSize}"
echo "loader_ugly.js: $loaderSize"
echo "data png: $dataSize"
echo "metadata png: $metaDataSize"
echo "life png: $lifeSize"
total=`echo "($htmlSize+$cssSize+$loaderSize+$dataSize+$metaDataSize+$lifeSize)/1024" | bc -l`
echo -n "******** TOTAL: ${total:0:5}K ******** "


