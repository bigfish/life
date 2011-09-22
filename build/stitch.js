/*jslint node:true */
/**
 * this script will inline CSS and JS files in a HTML file
 * while compressing them with YUI Compressor, and UglifyJS, respectively
 * This may be a preparatory step for imageifying and writing the doc with JS
 * for super compression powers
 */

var fs = require("fs");
var exec = require("child_process").exec;
var input_file;
var CSS_RE = /<link[^>]*rel\s?=\s?"stylesheet"[^>]*href\s?=\s?"([^"]*)"[^>]*>/m;
var JS_RE = /<script[^>]*src\s?=\s?"([^"]*)"[^>]*>\s*<\/script>/m;
//get input file as first argument
if (process.argv.length > 1) {
    input_file = process.argv[2];
} else {
    console.log("input file is required argument");
    process.exit(1);
}
var html = fs.readFileSync(input_file, "UTF-8");
//chomp everything up and including the <head> tag
html = html.split("<head>\n")[1];

function compressCSS(text, css_link, stylesheet, done) {
    //execute YUI compressor on the CSS and capture the result
    exec("java -jar ${YUICOMPRESSOR} --type css ../" + stylesheet, function (error, stdout, stderr) {
        done(text.replace(css_link, "<style>" + stdout + "</style>"));
    });
}

function compressJS(text, js_link, js_src, done) {
    exec("java -jar ${YUICOMPRESSOR} --type js ../" + js_src, function (error, stdout, stderr) {
        done(text.replace(js_link, "<script>" + stdout + "</script>"));
    });
    //compress the js using uglify js, asynchronously
/*exec("uglifyjs -nc ../" + js_src, function (err, stdout, stderr) {
        //when complete, recurse
        done(text.replace(js_link, "<script>" + stdout + "</script>"));
    });*/
}

function inline(text, regex, compress, cb) {

    var link = regex.exec(text);
    if (link) {
        compress(text, link[0], link[1], function (result) {
            //when complete, recurse
            inline(result, regex, compress, cb);
        });
    } else { //no more matches, just return current text
        cb(text);
    }
}

function inlineJS(text, regex, cb) {
    JS_RE.lastIndex = 0;
    inline(text, regex, compressJS, cb);
}

function inlineCSS(text, regex, cb) {
    CSS_RE.lastIndex = 0;
    inline(text, CSS_RE, compressCSS, cb);
}


inlineJS(html, JS_RE, function (result) {
    inlineCSS(result, CSS_RE, function (result2) {
        result2 = result2.replace(/\'/g, "\\'");
        result2 = result2.replace(/\\\\\'/g, "\\\'");
        result2 = result2.replace(/\n/g, '');
        //result2 = result2.replace(/<script>/g, "<scr'+'ipt>");
        result2 = result2.replace(/<\/script>/g, "</'+'script>");
        console.log("<html><head><script>document.write('" + result2 + "');</script>");
    });
});
