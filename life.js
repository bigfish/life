/*jslint evil:true */
/*globals METADATA $ LOAD_JS_FROM_PNG*/
window.LIFE = function (canvas, width, height, bg, fg, cellsize) {
    var editor, patterns_menu, seed_textarea, t_canvas, size, timer, rows, cols, cells, oldCells, patterns, makeThumbnails, numPages, curPage, THUMBNAIL_WIDTH = 100,
        THUMBNAIL_SIZE = 100,
        ctx = canvas.getContext("2d") || window.alert("unable to initialize canvas. Check browser support.");
    size = cellsize || 1;
    cells = [];
    oldCells = [];

    //set size
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    cols = Math.floor(width / size);
    rows = Math.floor(height / size);

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

    reset();

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

    function random_seed() {
        var i, row, col;
        reset();
        //set some random pixels to be 'on' -- about a third of all pixels
        for (i = 0; i < rows * cols * 0.1; i++) {
            row = Math.floor(Math.random() * rows);
            col = Math.floor(Math.random() * cols);
            cells[row][col] = 1;
        }
        render();
    }

    function iterate() {
        var row, col, rightcol, leftcol, top, toprow, botrow, topright, right, botright, bottom, botleft, left, topleft, topEdge, botEdge, leftEdge, rightEdge;
        var newCells = oldCells;
        for (row = 0; row < rows; row++) {
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
        return "<a href='#' onclick='life." + cmd.toLowerCase() + "();return false'>" + (label ? label : cmd) + "</a> ";
    }


    //export an object with useful methods
    return {

        randomize: random_seed,

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

        restart: function () {
            reset();
            this.insert_seed(patterns_menu.options[patterns_menu.selectedIndex].value);
        },

        goTo: function (incr) {
            var next_idx = patterns_menu.selectedIndex + incr;
            next_idx = next_idx < patterns_menu.options.length ? next_idx : 0;
            next_idx = next_idx >= 0 ? next_idx : patterns_menu.options.length - 1;
            patterns_menu.selectedIndex = next_idx;
            this.insert_seed(patterns_menu.options[next_idx].value);
        },
        next: function () {
            this.goTo(1);
        },

        prev: function () {
            this.goTo(-1);
        },

        insert_seed: function (seedText) {
            var line, r, c, lines = seedText.split('\n'),
                row_offset = Math.floor(rows / 2) - Math.floor(lines.length / 2),
                col_offset = Math.floor(cols / 2) - Math.floor(lines[0].length / 2);
            reset();
            seed_textarea.value = seedText;
            for (r = 0; r < lines.length; r++) {
                line = lines[r];
                line = line.trim();
                for (c = 0; c < line.length; c++) {
                    cells[r + row_offset][c + col_offset] = (line[c] === '.') ? 0 : 1;
                }
            }
            render();
        },

        loadPatterns: function (menu, textArea, ed) {
            var patterns_data = [],
                patterns_data_text = "",
                pattern_str = "";
            editor = ed;
            patterns = [];
            patterns_menu = menu;
            seed_textarea = textArea;
            var that = this;
            LOAD_JS_FROM_PNG("build/data_o.png", function (text, imagedata) {
                var i, o, rows, cols, r, c, offset, options = [];
                //normalize the binary format used for compression to usable characters '.' or 'O'
                for (i = 0; i < imagedata.length; i += 4) {
                    patterns_data.push(imagedata[i] ? '.' : 'O');
                }
                patterns_data_text = patterns_data.join("");
                //load metadata
                LOAD_JS_FROM_PNG("build/metadata_o.png", function (js_str) {
                    eval(js_str);
                    //construct options for menu
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
                        options.push("<option value='" + pattern_str + "' >" + METADATA[o] + "</option>");
                        //add to patterns collection
                        patterns.push({
                            name: METADATA[o],
                            rows: rows,
                            cols: cols,
                            data: pattern_str
                        });
                    }
                    menu.innerHTML = options.join("");
                    menu.onchange = function () {
                        that.reset();
                        $('seed_text').value = menu.options[menu.selectedIndex].value;
                        that.insert_seed($('seed_text').value);
                    };

                    that.insert_seed(patterns[0].data);
                    //add controls
                    var controlsHTML = "";
                    var c, cmds = ["Play", "Stop", "Step", "Restart", "Next", "Prev", "Edit"];
                    for (c = 0; c < cmds.length; c++) {
                        controlsHTML += mkBtn(cmds[c]);
                    }
                    $("controls").innerHTML = controlsHTML;
                });
            });
        },

        edit: function () {
            this.stop();
            editor.style.display = "block";
            editor.style.left = "0px";
            editor.style.top = "20px";
        },
        addEditedForm: function () {
            editor.style.display = "none";
            this.insert_seed(seed_textarea.value);
        },
        cancelEdit: function () {
            editor.style.display = "none";
            seed_textarea.value = patterns_menu.value;
        }
    };
};
