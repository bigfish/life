/*jslint evil:true */
/*globals METADATA */
(function () {
    var canvas, t_canvas, ctx, fg, bg, size, timer, rows, cols, cells, oldCells, width, height, patterns, makeThumbnails, numPages, curPage;
    var THUMBNAIL_WIDTH = 100;
    var THUMBNAIL_HEIGHT = 100;
    var WRAP = true;

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

    function render() {
        var row, col;
        clear();
        ctx.fillStyle = fg;
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
        //set color to fg
        ctx.fillStyle = fg;
        //set some random pixels to be 'on' -- about a third of all pixels
        for (i = 0; i < rows * cols * 0.1; i++) {
            row = Math.floor(Math.random() * rows);
            col = Math.floor(Math.random() * cols);
            cells[row][col] = 1;
        }
        render();
    }

    function iterate() {
        var row, col, rightcol, leftcol, top, toprow, botrow, topright, right, botright, bottom, botleft, left, topleft;
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
        //oldCells
        oldCells = cells;
        cells = newCells;
        render();
    }




    window.LIFE = {

        init: function (canvasEl, _width, _height, background, foreground, cellsize) {
            canvas = document.getElementById(canvasEl);
            ctx = canvas && canvas.getContext("2d");
            fg = foreground || "#00FF00";
            bg = background || "#000000";
            width = _width;
            height = _height;
            size = cellsize || 1;
            cells = [];
            oldCells = [];

            if (!ctx) {
                window.alert("unable to initialize HTML Canvas. You might want to try another browser.");
                return;
            }
            //set size
            canvas.setAttribute("width", width);
            canvas.setAttribute("height", height);
            cols = Math.floor(width / size);
            rows = Math.floor(height / size);
            reset();
        },

        random_seed: random_seed,

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
            var line, r, c;
            var lines = seedText.split('\n');
            var row_offset = 30;
            var col_offset = 30;
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
            render();
        },

        loadPatterns: function (menu, textArea) {
            var patterns_img = new Image(),
                metadata_img = new Image(),
                canvas = document.createElement('canvas'),
                ctx = canvas.getContext("2d"),
                patterns_data = [],
                patterns_data_text = "",
                pattern_str = "",
                patterns_metadata = [],
                patterns_metadata_text = "";
            patterns = [];
            var that = this;
            patterns_img.onload = function () {
                var i, o, imagedata, rows, cols, r, c, offset, options = [],
                    width = patterns_img.width,
                    height = patterns_img.height;
                canvas.setAttribute("width", width + "px");
                canvas.setAttribute("height", height + "px");
                ctx.drawImage(patterns_img, 0, 0, width, height);
                imagedata = ctx.getImageData(0, 0, width, height).data;
                for (i = 0; i < imagedata.length; i += 4) {
                    patterns_data.push(imagedata[i] ? '.' : 'O');
                }
                patterns_data_text = patterns_data.join("");
                //load metadata
                metadata_img.onload = function () {
                    width = metadata_img.width;
                    height = metadata_img.height;
                    canvas.setAttribute("width", width + "px");
                    canvas.setAttribute("height", height + "px");
                    ctx.drawImage(metadata_img, 0, 0, width, height);
                    imagedata = ctx.getImageData(0, 0, width, height).data;
                    for (i = 0; i < imagedata.length; i += 4) {
                        patterns_metadata.push(String.fromCharCode(imagedata[i]));
                    }
                    eval(patterns_metadata.join(""));
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
                        textArea.value = menu.options[menu.selectedIndex].value;
                    };
                    that.makeThumbnails(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
                };
                metadata_img.src = "parser/metadata_o.png";
            };
            patterns_img.onerror = function () {
                console.log("failed to load patterns data image");
            };
            patterns_img.src = "parser/data_o.png";
        },
        renderPageLinks: function () {
            var i, html = "";
            for (i = 0; i < numPages; i++) {
                html += "<a href='#' class='" + (i === curPage ? "active" : "") + "'onclick='LIFE.showPage(" + i + ");return false;'>" + (i + 1) + "</a>\n";
            }
            document.getElementById("pages_nav").innerHTML = html;
        },
        makeThumbnails: function (t_width, t_height, page) {
            var p, pattern, c, r, scale_x, scale_y, rows, canvasEl = document.getElementById("thumbnails"),
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

            function findPos(obj) {
                var curleft = 0,
                    curtop = 0;
                if (obj.offsetParent) {
                    do {
                        curleft += obj.offsetLeft;
                        curtop += obj.offsetTop;
                    } while (Boolean(obj = obj.offsetParent));
                    return [curleft, curtop];
                }
            }

            function getEventPos(e) {}


            function processClick(event) {
                var node = event.target;
                var x = event.clientX;
                var y = event.clientY;
                while (node) {
                    x -= node.offsetLeft - node.scrollLeft;
                    y -= node.offsetTop - node.scrollTop;
                    node = node.offsetParent;
                }
                var col = Math.floor((event.target.parentNode.scrollLeft + x) / (t_width + space));
                var row = Math.floor((event.target.parentNode.scrollTop + y) / (t_height + space));
                var idx = (curPage * t_rows * t_cols) + col * t_rows + row;
                if (idx < patterns.length) {
                    that.insert_seed(patterns[idx].data);
                }

            }

            function onThumbnailsHover(event) {

                var node = event.target;
                var pos = findPos(node);
                var x = event.clientX - pos[0];
                var y = event.clientY - pos[1];
                console.log(curPage);
                var col = Math.floor(x / (t_width + space));
                var row = Math.floor(y / (t_height + space));
                var idx = (curPage * t_rows * t_cols) + (col * t_rows) + row;
                if (idx < patterns.length) {
                    //insert tooltip
                    if (!tooltip) {
                        tooltip = document.createElement("div");
                        tooltip.setAttribute('class', 'tooltip');
                        document.body.appendChild(tooltip);
                        t_canvas.addEventListener('mouseout', function () {
                            tooltip.style.display = "none";
                        }, false);
                    }
                    tooltip.style.display = "block";
                    tooltip.style.left = pos[0] + 8 + x + "px";
                    tooltip.style.top = pos[1] + 15 + y + "px";
                    tooltip.innerHTML = patterns[idx].name;
                }

            }

            t_canvas.addEventListener('click', processClick, false);
            t_canvas.addEventListener('mousemove', onThumbnailsHover, false);
        },


        saveThumbnails: function () {
            document.write("<img src='" + t_canvas.toDataURL("image/png") + "' >");
        },

        showNext: function () {
            this.makeThumbnails(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, curPage < numPages ? curPage + 1 : 0);
        },

        showPrev: function () {
            this.makeThumbnails(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, curPage ? curPage - 1 : numPages - 1);
        },
        showPage: function (n) {
            this.makeThumbnails(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, n);
        }

    };


}());
