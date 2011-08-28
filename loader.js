/*jslint evil:true*/
/*global LIFE LOAD_JS_FROM_PNG*/
//load the life_o.png image and extract the javascript code from it
window.LOAD_JS_FROM_PNG = function (png, onLoad) {
    var width, height, imagedata, i, o, js = [],
        img = new Image(),
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext("2d");
    img.onerror = function () {
        console.log("failed to load image: " + png);
    };
    img.onload = function () {
        width = img.width;
        height = img.height;
        canvas.setAttribute("width", width + "px");
        canvas.setAttribute("height", height + "px");
        ctx.drawImage(img, 0, 0, width, height);
        imagedata = ctx.getImageData(0, 0, width, height).data;
        for (i = 0; i < imagedata.length; i += 4) {
            js.push(String.fromCharCode(imagedata[i]));
        }
        eval(js.join(""));
        onLoad();

    };
    img.src = png;
};

LOAD_JS_FROM_PNG("build/life_o.png", function () {
    LIFE.init("canvas", 600, 600, "#000000", "#00FF00", 4);
    LIFE.loadPatterns(document.getElementById("patterns"), document.getElementById("seed_text"));
});
