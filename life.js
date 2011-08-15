(function () {

    window.LIFE = function (canvasEl, width, height, background, foreground, cellsize) {
        //initialize canvas 2D context
        var canvas = document.getElementById(canvasEl);
        var ctx = canvas && canvas.getContext("2d");
        var fg = foreground || "#00FF00";
        var bg = background || "#000000";
        var size = cellsize || 1;
        var timer;
        var rows, cols;
        var cells = [];

        if (!ctx) {
            window.alert("unable to initialize HTML Canvas. You might want to try another browser.");
            return;
        }
        //set size
        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);

        function clear() {
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width, height);
        }

        function reset() {
            var r, c;
            for (r = 0; r < rows; r++) {
                cells[r] = [];
                for (c = 0; c < cols; c++) {
                    cells[r][c] = 0;
                }
            }
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
                }
            }
            return 0;

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

        function init() {
            var i, row, col;
            cols = Math.floor(width / size);
            rows = Math.floor(height / size);
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
            var row, col, toprow, botrow, leftcol, rightcol, top, topright, right, botright, bottom, botleft, left, topleft;
            for (row = 0; row < rows; row++) {
                for (col = 0; col < cols; col++) {
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

                    cells[row][col] = applyRule(cells[row][col], [top, topright, right, botright, bottom, botleft, left, topleft]);
                }
            }
            render();
        }

        function start() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(iterate, 1000 / 30);
        }

        init();
        start();
    };


}());
