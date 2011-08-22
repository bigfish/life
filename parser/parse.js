/*jslint node:true white:false*/
/**
 * Node.js script to parse Stephen Silver's life lexicon
 * extract patterns and generate JSON file
 */

var fs = require("fs");
var Canvas = require("canvas");
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
        //normalize number of cols in rows 
        //perhaps irregular patterns should be discarded as they may be wrong ?
        if (patLines.length) {
            var q, len = patLines[0].length;
            for (q = 0; q < patLines.length; q++) {
                //truncate extra long lines
                if (patLines[q].length > len) {
                    patLines[q] = patLines[q].slice(0, len);
                } else if (patLines[q].length < len) {
                    //pad short line with dots -- in the one known case,
                    //LWSS, I think this is the correct solution
                    while (patLines[q].length < len) {
                        patLines[q] += '.';
                    }
                }
            }
        }
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

//write patterns file 
fs.writeFileSync("patterns.js", "PATTERNS=" + JSON.stringify(patterns) + ";");
