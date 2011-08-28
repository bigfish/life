/*jslint node:true white:false evil:true*/
/*globals METADATA */
/**
 * verify that the images generated, when the content
 * is extracted from them, is the same as the original text
 */
var fs = require("fs");
var Canvas = require("canvas");
var patterns_file = "patterns.js";
var txt2png = require("./txt2png.js");

//use patterns file if provided as argument
if (process.argv.length === 3) {
    patterns_file = process.argv[2];
}
var patternData = fs.readFileSync(patterns_file, 'UTF-8');

var img = new Canvas.Image();
img.onerror = function (err) {
    throw err;
};

img.onload = function () {
    var width = img.width,
        height = img.height,
        canvas = new Canvas(width, height),
        ctx = canvas.getContext('2d');

    ctx.drawImage(img, 0, 0, width, height);

    var imagedata = ctx.getImageData(0, 0, width, height);
    var data = imagedata.data;
    var i, patterns_str = "",
        patterns_data = [];
    for (i = 0; i < data.length; i += 4) {
        patterns_str += data[i] ? "." : "O";
    }
    //verify the metadata
    txt2png.verify("metadata.js", "metadata_o.png", function (verified, metadata_str) {
        var p;
        //now reconstruct the patterns.js data
        eval(metadata_str);
        var rows, rowstr, r, cols, start, patLines;
        for (p = 0; p < METADATA.length; p += 4) {
            patLines = [];
            start = METADATA[p + 1];
            rows = METADATA[p + 2];
            cols = METADATA[p + 3];
            for (r = 0; r < rows; r++) {
                rowstr = patterns_str.substring(start + r * cols, start + (r + 1) * cols);
                patLines.push(rowstr);
            }
            patterns_data.push({
                name: METADATA[p],
                pattern: patLines.join("\n")
            });
        }
        var result = "PATTERNS=" + JSON.stringify(patterns_data) + ";";
        if (result === patternData) {
            console.log("verified patterns");
        } else {
            console.log("WARNING: pattern data was corrupted");
        }
    });
};
img.src = "data_o.png";
