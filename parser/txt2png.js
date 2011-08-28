/*jslint node:true white:false*/
/**
 * txt2png takes 2 arguments: txtfile pngfile
 * converts the text content into a png file
 * by converting the ASCII value of each character
 * to a color for each pixel in the image
 * Thi image can then be subjected to further compression
 * using, eg. optipng
 */
var canvas, ctx, imgSize, i, n, charIdx, charCode, row, col, txt_file, txt_file_text, png_file, space = 'rgba(32,32,32,1)';

//use patterns file if provided as argument
if (process.argv.length === 4) {
    txt_file = process.argv[2];
    png_file = process.argv[3];
} else {
    console.log("txt2png requires a text-filename and an output png filename as arguments");
    process.exit(1)
}
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
var out = fs.createWriteStream(__dirname + '/' + png_file),
    stream = canvas.createPNGStream();

stream.on('data', function (chunk) {
    out.write(chunk);
});

stream.on('end', function () {
    console.log('saved metadata.png');
});
