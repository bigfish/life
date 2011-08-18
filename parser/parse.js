/*jslint node:true white:false*/
/**
 * Node.js script to parse Stephen Silver's life lexicon
 * extract patterns and generate JSON file
 */

var fs = require("fs");
if (process.argv.length < 3) {
    console.log("parse requires a life lexicon HTML file as argument");
    process.exit(1);
}
var lexicon_html_file = process.argv[2];
var lexicon_str = fs.readFileSync(lexicon_html_file, 'UTF-8');
var lines = lexicon_str.split("\n");
var patterns = [];
var line;
var insidePre = false;
var startPre = /^\s*<pre>/;
var endPre = /^\s*<\/pre>/;
var nameRe = /^<p>\:(?:<a name=[^>]*>)?<b>([^<]*)<\/b>/;
var patRe = /^\s*([.O]*)\s*$/;
var i;
var matches;
var patName = "";
var patLines = [];

for (i = 0; i < lines.length; i++) {
    line = lines[i];
    //get the name of the pattern
    matches = nameRe.exec(line);
    if (matches) {
        patName = matches[1];
        //remove slashes and quotes
        patName = patName.replace('"', '').replace("'", '').replace("\\", '');
    }
    //capture the pattern lines into an array
    if (insidePre) {
        matches = patRe.exec(line);
        if (matches) {
            patLines.push(matches[1]);
        }
    }
    if (endPre.test(line)) {
        insidePre = false;
        patterns.push({
            name: patName,
            pattern: patLines.join("\n")
        });
    }
    if (startPre.test(line)) {
        insidePre = true;
        patLines = [];
    }
}

//write patterns file for
fs.writeFileSync("patterns.js", "PATTERNS=" + JSON.stringify(patterns));

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
fs.writeFileSync("metadata.js", "METADATA=" + JSON.stringify(metadata));
var imgSize = Math.ceil(Math.sqrt(pixbuf.length));
var Canvas = require("canvas");
var canvas = new Canvas(imgSize, imgSize);
var ctx = canvas.getContext("2d");
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
    out = fs.createWriteStream(__dirname + '/data.png'),
    stream = canvas.createPNGStream();

stream.on('data', function (chunk) {
    out.write(chunk);
});

stream.on('end', function () {
    console.log('saved data.png');
});
