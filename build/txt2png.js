/*jslint node:true white:false*/
/*global exports*/
/**
 * txt2png takes 2 arguments: txtfile pngfile
 * converts the text content into a png file
 * by converting the ASCII value of each character
 * to a color for each pixel in the image
 * Thi image can then be subjected to further compression
 * using, eg. optipng
 */
var fs = require("fs");
var Canvas = require("canvas");
var CanvasImage = Canvas.Image;

function verify(txt_file, png_file, onVerifyComplete) {

    var img = new CanvasImage(),
        originalText = fs.readFileSync(txt_file, "UTF-8");

    originalText = originalText.trim();

    img.onerror = function (err) {
        throw err;
    };
    img.onload = function () {
        var imagedata, verified, data, i, p, char, decodedText = "",
            width = img.width,
            height = img.height,
            canvas = new Canvas(width, height),
            ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0, width, height);
        imagedata = ctx.getImageData(0, 0, width, height);
        data = imagedata.data;

        for (i = 0; i < data.length; i += 4) {
            char = String.fromCharCode(data[i]);
            decodedText += char;
        }
        decodedText = decodedText.trim();
        if (originalText === decodedText) {
            console.log("verified " + png_file);
            verified = true;
        } else {
            console.log("WARNING: " + png_file + "was corrupted");
            for (i = 0; i < originalText.length; i++) {
                if (decodedText.charAt(i) !== originalText.charAt(i)) {
                    console.log("difference at " + i, originalText.charAt(i), decodedText.charAt(i));
                    console.log(originalText.substring(i - 20, i + 20));
                    console.log(decodedText.substring(i - 20, i + 40));
                    break;
                }
            }
            verified = false;
        }
        if (typeof onVerifyComplete === "function") {
            onVerifyComplete(verified, originalText, data);
        }
    };

    img.src = png_file;

}

function convert(txt_file, png_file, onComplete) {
    var canvas, ctx, imgSize, i, n, charIdx, charCode, row, col, txt_file_text, space = 'rgba(32,32,32,1)';
    //read file into string
    txt_file_text = fs.readFileSync(txt_file, 'UTF-8');
    //create Canvas context for constructing image data
    imgSize = Math.ceil(Math.sqrt(txt_file_text.length));
    canvas = new Canvas(imgSize, imgSize);
    ctx = canvas.getContext("2d");
    //space is the default character, in case there is an odd number
    //which cannot be converted exactly to the number of pixels in an image
    //any leftover pixels will just be spaces
    ctx.fillStyle = space;
    ctx.fillRect(0, 0, imgSize, imgSize);

    // set color to ascii value of corresponding char
    for (i = 0; i < txt_file_text.length; i++) {
        charCode = txt_file_text.charCodeAt(i);
        ctx.fillStyle = 'rgba(' + charCode + ',' + charCode + ',' + charCode + ',1)';
        row = Math.floor(i / imgSize);
        col = i % imgSize;
        //console.log(col, row, charCode);
        ctx.fillRect(col, row, 1, 1);
    }

    //write png
    //var out = fs.createWriteStream(__dirname + '/' + png_file),
    var out = fs.createWriteStream(png_file),
        stream = canvas.createPNGStream();

    stream.on('data', function (chunk) {
        out.write(chunk);
    });

    stream.on('end', function () {
        //there was a problem with the image not being readable yet
        //worked around this with a short timeout
        setTimeout(function () {
            verify(txt_file, png_file, onComplete);
        }, 100);
    });

}

//CLI usage
if (process.argv.length === 4) {
    var inputTextFile = process.argv[2];
    var outputImage = process.argv[3];
    convert(inputTextFile, outputImage, function () {
        console.log("converted " + inputTextFile);
    });
}
exports.convert = convert;
exports.verify = verify;
