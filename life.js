/*jslint evil:true */
/*globals METADATA $ LOAD_JS_FROM_PNG*/
window.LIFE = function (canvas, width, height, bg, fg, cellsize) {
    var editor, patterns_menu, seed_textarea, t_canvas, size, timer, rows, cols, cells, oldCells, patterns, makeThumbnails, numPages, curPage, THUMBNAIL_WIDTH = 100,
        THUMBNAIL_SIZE = 100,
        AUTO_CLEAR = true,
        AUTO_PLAY = true,
        WRAP = true,
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
                if (WRAP) {
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

                } else {
                    //set out-of-bounds to 0
                    top = topEdge ? 0 : cells[row - 1][col];
                    topright = (topEdge || rightEdge) ? 0 : cells[row - 1][col + 1];
                    right = rightEdge ? 0 : cells[row][col + 1];
                    botright = (botEdge || rightEdge) ? 0 : cells[row + 1][col + 1];
                    bottom = botEdge ? 0 : cells[row + 1][col];
                    botleft = (botEdge || leftEdge) ? 0 : cells[row + 1][col - 1];
                    left = leftEdge ? 0 : cells[row][col - 1];
                    topleft = (topEdge || leftEdge) ? 0 : cells[row - 1][col - 1];

                }

                newCells[row][col] = applyRule(cells[row][col], [top, topright, right, botright, bottom, botleft, left, topleft]);
            }
        }
        oldCells = cells;
        cells = newCells;
        render();
    }

    function mkBtn(cmd, label) {
        return "<a href='#' onclick='life." + cmd + "();return false'>" + (label ? label : cmd.toUpperCase()) + "</a> ";
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

        step: iterate,

        stop: function () {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        },
        reset: reset,

        insert_seed: function (seedText) {
            var line, r, c, lines = seedText.split('\n'),
                row_offset = Math.floor(rows / 2) - Math.floor(lines.length / 2),
                col_offset = Math.floor(cols / 2) - Math.floor(lines[0].length / 2);
            if (AUTO_CLEAR) {
                reset();
            }
            seed_textarea.value = seedText;
            for (r = 0; r < lines.length; r++) {
                line = lines[r];
                line = line.trim();
                for (c = 0; c < line.length; c++) {
                    cells[r + row_offset][c + col_offset] = (line[c] === '.') ? 0 : 1;
                }
            }
            render();
            if (AUTO_PLAY) {
                this.start();
            }

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

                    that.makeThumbnails(THUMBNAIL_SIZE, THUMBNAIL_SIZE);

                    that.insert_seed(patterns[0].data);

                });
            });
        },

        renderPageLinks: function () {
            //add controls
            var controlsHTML = "";
            var c, cmds = ["start", "stop", "step", "reset", "edit"];
            for (c = 0; c < cmds.length; c++) {
                controlsHTML += mkBtn(cmds[c]);
            }
            $("controls").innerHTML = controlsHTML;
            //add thumbnails nav
            var i, html = mkBtn("showPrev", "<<");
            for (i = 0; i < numPages; i++) {
                html += "<a href='#' class='" + (i === curPage ? "active" : "") + "'onclick='life.showPage(" + i + ");return false;'>" + (i + 1) + "</a>\n";
            }
            html += mkBtn("showNext", ">>");
            $("thumbnails_controls").innerHTML = html;
        },

        makeThumbnails: function (t_width, t_height, page) {
            var p, pattern, c, r, scale_x, scale_y, rows, canvasEl = $("thumbnails"),
                ctx = canvasEl.getContext("2d"),
                numPatterns = patterns.length,
                space = 5,
                tooltip,
                //determine how many cols can be fit in the available space
                //TODO: consider if not enough space is available for even one
                //the game area should be reduced to allow size for it
                t_cols = Math.floor((window.innerWidth - 650) / (t_width + space)) || 1,
                t_rows = Math.floor(600 / (t_height + space)) || 1,
                c_width = t_cols * (t_width + space),
                c_height = t_rows * (t_height + space);

            curPage = page === undefined ? 0 : page;
            numPages = Math.ceil(numPatterns / (t_cols * t_rows));
            this.renderPageLinks();
            t_canvas = canvasEl;

            canvasEl.setAttribute("width", c_width + "px");
            //calculate height required
            canvasEl.setAttribute("height", c_height + "px");
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, c_width, c_height);
            ctx.fillStyle = "#CCC";
            //render page of thumbnails
            for (p = 0; p < t_rows * t_cols; p++) {
                pattern = patterns[p + (t_cols * t_rows * curPage)];
                if (!pattern) {
                    break;
                }
                scale_x = t_width / pattern.cols;
                scale_y = t_height / pattern.rows;
                //preserve aspect ratio
                if (scale_y > scale_x) {
                    scale_y = scale_x;
                } else {
                    scale_x = scale_y;
                }
                rows = pattern.data.split("\n");
                for (r = 0; r < pattern.rows; r++) {
                    for (c = 0; c < pattern.cols; c++) {
                        if (rows[r].charAt(c) === "O") {
                            ctx.fillRect((Math.floor(p / t_rows) * (t_width + space)) + Math.floor(c * scale_x), Math.floor((p % t_rows) * (t_height + space) + r * scale_y), scale_x, scale_y);
                        }
                    }
                }
            }

            var that = this;

            function getRelPos(event) {
                var mouseX, mouseY;
                if (event.offsetX) {
                    mouseX = event.offsetX;
                    mouseY = event.offsetY;
                } else {
                    mouseX = event.pageX - event.target.offsetLeft;
                    mouseY = event.pageY - event.target.offsetTop;
                }
                return [mouseX, mouseY];
            }

            function processClick(event) {
                var col, row, idx, node = event.target,
                    x = event.clientX,
                    y = event.clientY;
                while (node) {
                    x -= node.offsetLeft - node.scrollLeft;
                    y -= node.offsetTop - node.scrollTop;
                    node = node.offsetParent;
                }
                col = Math.floor((event.target.parentNode.scrollLeft + x) / (t_width + space));
                row = Math.floor((event.target.parentNode.scrollTop + y) / (t_height + space));
                idx = (curPage * t_rows * t_cols) + col * t_rows + row;
                if (idx < patterns.length) {
                    that.insert_seed(patterns[idx].data);
                    patterns_menu.selectedIndex = idx;
                }
            }

            t_canvas.onmouseover = t_canvas.onmousemove = function onThumbnailsHover(event) {

                var pos = getRelPos(event),
                    x = pos[0],
                    y = pos[1],
                    col = Math.floor(x / (t_width + space)),
                    row = Math.floor(y / (t_height + space)),
                    idx = (curPage * t_rows * t_cols) + (col * t_rows) + row;
                if (idx < patterns.length) {
                    //insert tooltip
                    if (!tooltip) {
                        tooltip = document.createElement("div");
                        tooltip.setAttribute('class', 'tooltip');
                        document.body.appendChild(tooltip);
                        t_canvas.onmouseout = function () {
                            tooltip.style.display = "none";
                        };
                    }
                    tooltip.style.display = "block";
                    tooltip.style.left = event.target.offsetLeft + 8 + x + "px";
                    tooltip.style.top = event.target.offsetTop + 15 + y + "px";
                    tooltip.innerHTML = patterns[idx].name;
                }

            };

            t_canvas.addEventListener('click', processClick, false);
            document.onkeypress = function (e) {
                console.log(e.keyCode);
                if (e.keyCode === 13) { //return => clear
                    if (timer) {
                        that.stop();
                    } else {
                        that.start();
                    }
                }
                if (e.keyCode === 32) { //space => pause / play 
                    that.reset();
                }
            };

        },

        showNext: function () {
            this.makeThumbnails(THUMBNAIL_SIZE, THUMBNAIL_SIZE, curPage < numPages ? curPage + 1 : 0);
        },
        showPrev: function () {
            this.makeThumbnails(THUMBNAIL_SIZE, THUMBNAIL_SIZE, curPage ? curPage - 1 : numPages - 1);
        },
        showPage: function (n) {
            this.makeThumbnails(THUMBNAIL_SIZE, THUMBNAIL_SIZE, n);
        },
        setWrap: function (wrap) {
            WRAP = wrap;
        },
        setAutoClear: function (ac) {
            AUTO_CLEAR = ac;
        },
        setAutoPlay: function (ap) {
            AUTO_PLAY = ap;
        },
        edit: function () {
            editor.style.display = "block";
            editor.style.left = 600 + "px";
            editor.style.top = 20 + "px";
        },
        addEditedForm: function () {
            this.insert_seed(seed_textarea.value);
        },
        cancelEdit: function () {
            editor.style.display = "none";
            seed_textarea.value = patterns_menu.value;
        }



    };


};
