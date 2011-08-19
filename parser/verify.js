/*jslint node:true white:false*/
/**
 * verify that the images generated, when the content
 * is extracted from them, is the same as the original text
 */
var fs = require("fs");
var Canvas = require("canvas");

var patternData = fs.readFileSync("patterns.js", 'UTF-8');
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
    var i, str = "";
    for (i = 0; i < data.length; i += 4) {
        str += data[i] ? "O" : ".";
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
        var i, char, str = "";
        for (i = 0; i < data.length; i += 4) {
            char = String.fromCharCode(data[i]);
            str += char;
        }
        str = str.trim();
        if (metaData === str) {
            console.log("verified metadata");
        }
    };
    img2.src = "metadata.png";
};

img.src = "data_o.png";
