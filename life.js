/*jslint evil:true */
/*globals LIFE METADATA $ LOAD_JS_FROM_PNG*/
window.LIFE = function (canvas, bg, fg, cellsize) {
    var editor, width, height, patterns_menu, seed_textarea, t_canvas, size, timer, rows, cols, cells, oldCells, patterns, makeThumbnails, numPages, curPage, THUMBNAIL_WIDTH = 100,
        THUMBNAIL_SIZE = 100,
        H = function (e, h) {
            $(e).innerHTML = h;
        },
        A = function (e, a, v) {
            e.setAttribute(a, v);
        },
        ctx = canvas.getContext("2d");//stripping error handling to bum some bytes

    size = cellsize || 1;
    cells = [];
    oldCells = [];

    function clear() {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = fg;
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

    function render() {
        var row, col;
        clear();
        for (row = 0; row < rows; row++) {
            for (col = 0; col < cols; col++) {
                if (cells[row][col]) {
                    ctx.fillRect(col * size, row * size, size, size);
                }
            }
        }
    }

    function display(el, val) {
        el.style.display = val;
    }

    function resize() {
        var row, col, tmpCells,
            dh = window.innerHeight - 30,
            dw = window.innerWidth - 200;
        width = height = dw < dh ? dw : dh;
        //set size
        A(canvas, "width", width);
        A(canvas, "height", height);
        cols = Math.floor(width / size);
        rows = Math.floor(height / size);
        //truncate or extend the cells array
        tmpCells = [];
        for (row = 0; row < rows; row++) {
            tmpCells[row] = [];
            for (col = 0; col < cols; col++) {
                tmpCells[row][col] = cells[row] ? (cells[row][col] || 0) : 0;
            }
        }
        cells = tmpCells;
        $("seeds").style.height = dh + "px";
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
        var row, col, rightcol, leftcol, top, toprow, botrow, topright, right, botright, bottom, botleft, left, topleft, topEdge, botEdge, leftEdge, rightEdge,
            newCells = oldCells;
        for (row = 0; row < rows; row++) {
            //in case the number of rows increased
            if (!newCells[row]) {
                newCells[row] = [];
            }
            topEdge = (row === 0);
            botEdge = (row === rows - 1);
            for (col = 0; col < cols; col++) {
                leftEdge = (col === 0);
                rightEdge = (col === cols - 1);
                //wrap cells if out of bounds
                toprow = row ? row - 1 : rows - 1;
                botrow = row + 1 < rows ? row + 1 : 0;
                rightcol = col + 1 < cols ? col + 1 : 0;
                leftcol = col ? col - 1 : cols - 1;
                top = cells[toprow][col];
                topright = cells[toprow][rightcol];
                right = cells[row][rightcol];
                botright = cells[botrow][rightcol];
                bottom = cells[botrow][col];
                botleft = cells[botrow][leftcol];
                left = cells[row][leftcol];
                topleft = cells[toprow][leftcol];

                newCells[row][col] = applyRule(cells[row][col], [top, topright, right, botright, bottom, botleft, left, topleft]);
            }
        }
        oldCells = cells;
        cells = newCells;
        render();
    }

    function mkBtn(cmd, label) {
        return "<a href='#' onclick='" + cmd + ";return false'>" + (label ? label : cmd) + "</a> ";
    }


    //export an object with public methods
    return {

        start: function () {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(iterate, 1000 / 30);
        },

        play: function () {
            this.start();
        },

        step: iterate,

        stop: function () {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        },

        reset: reset,

        insertSeed: function (seedText) {
            var line, r, c, lines = seedText.split('\n'),
                row_offset = Math.floor(rows / 2) - Math.floor(lines.length / 2),
                col_offset = Math.floor(cols / 2) - Math.floor(lines[0].length / 2);
            reset();
            seed_textarea.value = seedText;
            A(seed_textarea, "rows", lines.length + 2);
            A(seed_textarea, "cols", lines[0].length + 2);
            for (r = 0; r < lines.length; r++) {
                line = lines[r];
                line = line.trim();
                for (c = 0; c < line.length; c++) {
                    cells[r + row_offset][c + col_offset] = (line[c] === '.') ? 0 : 1;
                }
            }
            render();
        },

        insertSeedNamed: function (name) {
            var i;
            for (i = 0; i < patterns.length; i++) {
                if (patterns[i].name === name) {
                    this.insertSeed(patterns[i].data);
                }
            }
        },

        init: function (textArea, ed) {
            reset();
            resize();
            var patterns_data = [],
                patterns_data_text = "",
                pattern_str = "",
                that = this;
            editor = ed;
            patterns = [];
            seed_textarea = textArea;
            LOAD_JS_FROM_PNG("build/data_o.png", function (text, imagedata) {
                var i, o, rows, cols, r, c, offset,
                    links = [],
                    controlsHTML = "",
                    cmds = ["Play", "Stop", "Step", "Edit", "Info"];
                //normalize the binary format used for compression to usable characters '.' or 'O'
                for (i = 0; i < imagedata.length; i += 4) {
                    patterns_data.push(imagedata[i] ? '.' : 'O');
                }
                patterns_data_text = patterns_data.join("");
                //load metadata
                LOAD_JS_FROM_PNG("build/metadata_o.png", function (js_str) {
                    eval(js_str);
                    for (o = 0; o < METADATA.length; o += 4) {
                        pattern_str = "";
                        offset = METADATA[o + 1];
                        rows = METADATA[o + 2];
                        cols = METADATA[o + 3];
                        for (r = 0; r < rows; r++) {
                            pattern_str += patterns_data_text.substring(offset + r * cols, offset + (r + 1) * cols);
                            if (r < rows - 1) {
                                pattern_str += "\n";
                            }
                        }
                        links.push("<a href='#" + METADATA[o] + "' onclick='life.insertSeed(\"" + pattern_str.replace(/\n/gm, '\\n') + "\");' >" + METADATA[o] + "</a>");
                        //add to patterns collection
                        patterns.push({
                            name: METADATA[o],
                            rows: rows,
                            cols: cols,
                            data: pattern_str
                        });
                    }
                    $("seeds").innerHTML = links.join("");
                    if (location.hash) {
                        that.insertSeedNamed(location.hash.substr(1));
                    } else {
                        that.insertSeed(patterns[0].data);
                    }
                    //add controls
                    for (c = 0; c < cmds.length; c++) {
                        controlsHTML += mkBtn('life.' + cmds[c].toLowerCase() + '()', cmds[c]);
                    }
                    H("controls", "LIFE " + controlsHTML);
                    H("forms-title", mkBtn("life.prev()", "&lt;&lt;") + " FORMS " + mkBtn("life.next()", "&gt;&gt;"));
                    H("edCloseBtn", mkBtn("life.cancelEdit()", 'X'));
                    H("addBtn", mkBtn("life.addEditedForm()", "Add"));
                    H("infoCloseBtn", mkBtn("life.cancelInfo()", "X"));
                });
            });
            window.onresize = window.onorientationchange = function () {
                resize();
                render();
            };
        },
        info: function () {
            display($("info"), "block");
        },
        edit: function () {
            this.stop();
            display(editor, "block");
        },
        addEditedForm: function () {
            display(editor, "none");
            this.insertSeed(seed_textarea.value);
            return false;
        },
        cancelEdit: function () {
            display(editor, "none");
            //seed_textarea.value = patterns_menu.value;
            return false;
        },
        cancelInfo: function () {
            display($("info"), "none");
        },
        shift: function (dir) {
            $("seeds").scrollTop += dir *  100;
        },
        next: function () {
            this.shift(1);
        },
        prev: function () {
            this.shift(-1);
        }
    };
};
