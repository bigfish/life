/*jslint node:true evil:true */
/**
 * run all the life forms and return some stats about them:
 * lifespan: # of iterations before the pattern becomes static
 * repeats: (boolean) whether the pattern repeats
 * phase: # of iterations before repeat occurs
 *
 * input: patterns.js
 * output: patterns.js with 'lifespan' property added
 */
//load patterns
var fs = require("fs");
var Canvas = require("Canvas");
var patterns_js = fs.readFileSync("patterns.js", 'UTF-8');
var patterns_json = patterns_js.substring("PATTERNS=".length, patterns_js.length - 1);
var PATTERNS = JSON.parse(patterns_json);
var INCLUDE_STATIC = true;

if (process.argv.length === 3) {
    INCLUDE_STATIC = process.argv[2] === "true" ? true : false;
}

//var total_patterns = PATTERNS.length;
//make a canvas of 100x100 for testing
var imageData, width = 100,
    height = 100,
    canvas = new Canvas(width, height),
    ctx = canvas.getContext("2d");
var bg = "#000";
var fg = "#0F0";

//below is LIFE implementation without any rendering
var size, timer, rows, cols, cells, oldCells, width, height;

function clear() {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
}

function reset() {
    var r, c;
    for (r = 0; r < rows; r++) {
        cells[r] = [];
        oldCells[r] = [];
        for (c = 0; c < cols; c++) {
            cells[r][c] = 0;
            oldCells[r][c] = 0;
        }
    }
    clear();
}

function applyRule(cell, neighbours) {

    var sum = 0,
        i;
    for (i = 0; i < neighbours.length; i++) {
        sum += neighbours[i];
    }
    if (cell) {
        if (sum < 2) {
            return 0;
        } else if (sum > 3) {
            return 0;
        } else {
            return 1;
        }
    } else {
        if (sum === 3) {
            return 1;
        } else {
            return 0; //stay dead
        }
    }
}

function iterate() {
    var row, col, top, topright, right, botright, bottom, botleft, left, topleft;
    var topEdge = false,
        botEdge = false,
        leftEdge = false,
        rightEdge = false;
    var newCells = oldCells;
    for (row = 0; row < rows; row++) {
        topEdge = (row === 0);
        botEdge = (row === rows - 1);
        for (col = 0; col < cols; col++) {
            leftEdge = (col === 0);
            rightEdge = (col === cols - 1);
            //wrap cells if out of bounds
            //toprow = row ? row - 1 : rows - 1;
            //botrow = row + 1 < rows ? row + 1 : 0;
            //rightcol = col + 1 < cols ? col + 1 : 0;
            //leftcol = col ? col - 1 : cols - 1;
            //top = cells[toprow][col];
            //topright = cells[toprow][rightcol];
            //right = cells[row][rightcol];
            //botright = cells[botrow][rightcol];
            //bottom = cells[botrow][col];
            //botleft = cells[botrow][leftcol];
            //left = cells[row][leftcol];
            //topleft = cells[toprow][leftcol];
            //set out-of-bounds to 0
            top = topEdge ? 0 : cells[row - 1][col];
            topright = (topEdge || rightEdge) ? 0 : cells[row - 1][col + 1];
            right = rightEdge ? 0 : cells[row][col + 1];
            botright = (botEdge || rightEdge) ? 0 : cells[row + 1][col + 1];
            bottom = botEdge ? 0 : cells[row + 1][col];
            botleft = (botEdge || leftEdge) ? 0 : cells[row + 1][col - 1];
            left = leftEdge ? 0 : cells[row][col - 1];
            topleft = (topEdge || leftEdge) ? 0 : cells[row - 1][col - 1];

            newCells[row][col] = applyRule(cells[row][col], [top, topright, right, botright, bottom, botleft, left, topleft]);
        }
    }
    //oldCells
    oldCells = cells;
    cells = newCells;
}

var LIFE = {

    init: function () {
        size = 1;
        cells = [];
        oldCells = [];

        //set size
        cols = Math.floor(width / size);
        rows = Math.floor(height / size);
        reset();
    },

    step: iterate,

    reset: reset,

    insert_seed: function (seedText) {
        var line, r, c;
        var lines = seedText.split('\n');
        var row_offset = 20;
        var col_offset = 20;
        for (r = 0; r < lines.length; r++) {
            line = lines[r];
            line = line.trim();
            for (c = 0; c < line.length; c++) {
                if (line[c] === '.') {
                    cells[r + row_offset][c + col_offset] = 0;
                } else {
                    cells[r + row_offset][c + col_offset] = 1;
                }
            }
        }
    }

};

function arrayEquals(a, b) {
    var j;
    if (a.length !== b.length) {
        return false;
    }
    for (j = 0; j < a.length; j++) {
        if (typeof a[j] === "number") {
            if (a[j] !== b[j]) {
                return false;
            }
            //recurse if array
        } else if (typeof a[j] === "object" && a[j].splice) {
            if (!arrayEquals(a[j], b[j])) {
                return false;
            }
        }
    }
    return true;
}

function live() {
    var i;
    for (i = 0; i < 100; i++) {
        LIFE.step();
        if (arrayEquals(cells, oldCells)) {
            return i;
        }
    }
    return i;
}
//MAIN
var filtered_patterns = [];
var p, years;
LIFE.init();
for (p = 0; p < PATTERNS.length; p++) {
    LIFE.reset();
    LIFE.insert_seed(PATTERNS[p].pattern);
    //get lifespan
    years = live();
    //if (years < 100) {
    ////PATTERNS[p].lifespan = years;
    //} else {
    //PATTERNS[p].lifespan = 100;
    //}
    //apply filter
    if (INCLUDE_STATIC || years > 0) {
        filtered_patterns.push(PATTERNS[p]);
    }
}
fs.writeFileSync("patterns_filtered.js", "PATTERNS=" + JSON.stringify(filtered_patterns) + ";");
