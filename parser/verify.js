/*jslint node:true white:false evil:true*/
/*globals METADATA */
/**
 * verify that the images generated, when the content
 * is extracted from them, is the same as the original text
 */
var fs = require("fs");
var Canvas = require("canvas");
var patterns_file = "patterns.js";

//use patterns file if provided as argument
if (process.argv.length === 3) {
    patterns_file = process.argv[2];
}
var patternData = fs.readFileSync(patterns_file, 'UTF-8');
var metaData = fs.readFileSync("metadata.js", "UTF-8");

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
    //load the metadata
    var img2 = new Canvas.Image();
    img2.onerror = function (err) {
        throw err;
    };
    img2.onload = function () {
        var width = img2.width,
            height = img2.height,
            canvas = new Canvas(width, height),
            ctx = canvas.getContext('2d');

        ctx.drawImage(img2, 0, 0, width, height);

        var imagedata = ctx.getImageData(0, 0, width, height);
        var data = imagedata.data;
        var i, p, char, metadata_str = "";
        for (i = 0; i < data.length; i += 4) {
            char = String.fromCharCode(data[i]);
            metadata_str += char;
        }
        metadata_str = metadata_str.trim();
        if (metaData === metadata_str) {
            console.log("verified metadata");
        } else {
            console.log("WARNING: metadata was corrupted");
        }
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
        //useful for debugging:
        for (i = 0; i < patternData.length; i++) {
            if (result.charAt(i) !== patternData.charAt(i)) {
                console.log("difference at " + i, patternData.charAt(i), result.charAt(i));
                console.log(patternData.substring(i - 20, i + 20));
                console.log(result.substring(i - 20, i + 40));
                break;
            }
        }
        //console.log(result);
    };
    img2.src = "metadata_o.png";
};

img.src = "data_o.png";
