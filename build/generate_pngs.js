/*jslint node:true white:false*/
/**
 * input: patterns file
 * output: metadata.js, metadata.png, data.png
 */
var fs = require("fs");
var Canvas = require("canvas");
var patterns_file = "metadata.js";
//use patterns file if provided as argument
if (process.argv.length === 3) {
    patterns_file = process.argv[2];
}
var patterns_js = fs.readFileSync("patterns.js", 'UTF-8');
var patterns_json = patterns_js.substring("PATTERNS=".length, patterns_js.length - 1);
var patterns = JSON.parse(patterns_json);
//generate metadata and pixel data
var metadata = [];
var pixbuf = []; //raw array of 0s & 1s which will be output to image
patterns.forEach(function (pattern, i, a) {
    //console.log(pattern.name);
    var c, char, patternData = pattern.pattern,
        rows = patternData.split("\n");
    metadata = metadata.concat([
        pattern.name
        , pixbuf.length
        , rows.length
        , rows[0].length
        ]);

    for (c = 0; c < patternData.length; c++) {
        char = patternData[c];
        if (char === 'O') {
            pixbuf.push(1);
        } else if (char === '.') {
            pixbuf.push(0);
        }
    }
});
//write metadata file
var metadata_str = "METADATA=" + JSON.stringify(metadata) + ";";
fs.writeFileSync("metadata.js", metadata_str);

//generate 8-bit metadata.png using metadata.js converted from ASCII to 0-255
var imgSize = Math.ceil(Math.sqrt(metadata_str.length));
var canvas = new Canvas(imgSize, imgSize);
var ctx = canvas.getContext("2d");
var col;
var i, n, charIdx, charCode;
var space = 'rgba(32,32,32,1)';
var row, col;
ctx.fillStyle = space;
ctx.fillRect(0, 0, imgSize, imgSize);

// set color to ascii value of corresponding char
for (i = 0; i < metadata_str.length; i++) {
    charCode = metadata_str.charCodeAt(i);
    ctx.fillStyle = 'rgba(' + charCode + ',' + charCode + ',' + charCode + ',1)';
    row = Math.floor(i / imgSize);
    col = i % imgSize;
    //console.log(col, row, charCode);
    ctx.fillRect(col, row, 1, 1);
}

//write png
var out = fs.createWriteStream(__dirname + '/metadata.png'),
    stream = canvas.createPNGStream();

stream.on('data', function (chunk) {
    out.write(chunk);
});

stream.on('end', function () {
    console.log('saved metadata.png');
});

//generate data.png image with pattern data as black & white pixels
imgSize = Math.ceil(Math.sqrt(pixbuf.length));
canvas = new Canvas(imgSize, imgSize);
ctx = canvas.getContext("2d");
var out2, stream2;
var p;
//set entire img to white
ctx.fillStyle = "#FFF";
ctx.fillRect(0, 0, imgSize, imgSize);
//paint 'on' pixels in black
ctx.fillStyle = "#000";
for (p = 0; p < pixbuf.length; p++) {
    if (pixbuf[p] === 1) {
        ctx.fillRect(p % imgSize, Math.floor(p / imgSize), 1, 1);
    }
}
//write png
var fs = require('fs'),
    out2 = fs.createWriteStream(__dirname + '/data.png'),
    stream2 = canvas.createPNGStream();

stream2.on('data', function (chunk) {
    out2.write(chunk);
});

stream2.on('end', function () {
    console.log('saved data.png');
});
