(function () {
    var canvas, ctx, fg, bg, size, timer, rows, cols, cells, oldCells, width, height;

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
        }
    };


}());
