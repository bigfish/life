/*jslint evil:true*//*global LIFE LOAD_JS_FROM_PNG*///load the life_o.png image and extract the javascript code from it
window.LOAD_JS_FROM_PNG=function(a,b){var c,d,e,f,g,h,i=[],j=new Image,k=document.createElement("canvas"),l=k.getContext("2d");j.onerror=function(){console.log("failed to load image: "+a)},j.onload=function(){c=j.width,d=j.height,k.setAttribute("width",c+"px"),k.setAttribute("height",d+"px"),l.drawImage(j,0,0,c,d),e=l.getImageData(0,0,c,d).data;for(f=0;f<e.length;f+=4)i.push(String.fromCharCode(e[f]));h=i.join(""),b(h,e)},j.src=a};var $=function(a){return document.getElementById(a)};LOAD_JS_FROM_PNG("build/life_o.png",function (result) {eval(result);life=LIFE($("canvas"),"#000000","#00FF00",4);life.init($("seed_text"),$("editor"));});
