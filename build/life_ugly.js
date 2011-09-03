/*jslint evil:true *//*globals LIFE METADATA $ LOAD_JS_FROM_PNG*/window.LIFE=function(canvas,bg,fg,cellsize){function clear(){ctx.fillStyle=bg,ctx.fillRect(0,0,width,height),ctx.fillStyle=fg}function reset(){var a,b;for(a=0;a<rows;a++){cells[a]=[],oldCells[a]=[];for(b=0;b<cols;b++)cells[a][b]=0,oldCells[a][b]=0}clear()}function render(){var a,b;clear();for(a=0;a<rows;a++)for(b=0;b<cols;b++)cells[a][b]&&ctx.fillRect(b*size,a*size,size,size)}function display(a,b){$(a).style.display=b}function resize(){var a,b,c,d=window.innerHeight-50,e=window.innerWidth-200;width=height=e<d?e:d,canvas.setAttribute("width",width),canvas.setAttribute("height",height),cols=Math.floor(width/size),rows=Math.floor(height/size),c=[];for(a=0;a<rows;a++){c[a]=[];for(b=0;b<cols;b++)c[a][b]=cells[a]?cells[a][b]||0:0}cells=c,$("seeds").style.height=d+"px"}function applyRule(a,b){var c=0,d;for(d=0;d<b.length;d++)c+=b[d];return a?c<2?0:c>3?0:1:c===3?1:0}function random_seed(){var a,b,c;reset();for(a=0;a<rows*cols*.1;a++)b=Math.floor(Math.random()*rows),c=Math.floor(Math.random()*cols),cells[b][c]=1;render()}function iterate(){var a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s=oldCells;for(a=0;a<rows;a++){s[a]||(s[a]=[]),o=a===0,p=a===rows-1;for(b=0;b<cols;b++)q=b===0,r=b===cols-1,f=a?a-1:rows-1,g=a+1<rows?a+1:0,c=b+1<cols?b+1:0,d=b?b-1:cols-1,e=cells[f][b],h=cells[f][c],i=cells[a][c],j=cells[g][c],k=cells[g][b],l=cells[g][d],m=cells[a][d],n=cells[f][d],s[a][b]=applyRule(cells[a][b],[e,h,i,j,k,l,m,n])}oldCells=cells,cells=s,render()}function mkBtn(a,b){return"<a href='#' onclick='life."+a.toLowerCase()+"();return false'>"+(b?b:a)+"</a> "}var editor,width,height,patterns_menu,seed_textarea,t_canvas,size,timer,rows,cols,cells,oldCells,patterns,makeThumbnails,numPages,curPage,THUMBNAIL_WIDTH=100,THUMBNAIL_SIZE=100,ctx=canvas.getContext("2d")||window.alert("unable to initialize canvas. Check browser support.");return size=cellsize||1,cells=[],oldCells=[],{randomize:random_seed,start:function(){timer&&clearInterval(timer),timer=setInterval(iterate,1e3/30)},play:function(){this.start()},step:iterate,stop:function(){timer&&(clearInterval(timer),timer=null)},reset:reset,insertSeed:function(a){var b,c,d,e=a.split("\n"),f=Math.floor(rows/2)-Math.floor(e.length/2),g=Math.floor(cols/2)-Math.floor(e[0].length/2);reset(),seed_textarea.value=a,seed_textarea.setAttribute("rows",e.length+2),seed_textarea.setAttribute("cols",e[0].length+2);for(c=0;c<e.length;c++){b=e[c],b=b.trim();for(d=0;d<b.length;d++)cells[c+f][d+g]=b[d]==="."?0:1}render()},insertSeedNamed:function(a){var b;for(b=0;b<patterns.length;b++)patterns[b].name===a&&this.insertSeed(patterns[b].data)},init:function(textArea,ed){reset(),resize();var patterns_data=[],patterns_data_text="",pattern_str="";editor=ed,patterns=[],seed_textarea=textArea;var that=this;LOAD_JS_FROM_PNG("build/data_o.png",function(text,imagedata){var i,o,rows,cols,r,c,offset,links=[];for(i=0;i<imagedata.length;i+=4)patterns_data.push(imagedata[i]?".":"O");patterns_data_text=patterns_data.join(""),LOAD_JS_FROM_PNG("build/metadata_o.png",function(js_str){eval(js_str);for(o=0;o<METADATA.length;o+=4){pattern_str="",offset=METADATA[o+1],rows=METADATA[o+2],cols=METADATA[o+3];for(r=0;r<rows;r++)pattern_str+=patterns_data_text.substring(offset+r*cols,offset+(r+1)*cols),r<rows-1&&(pattern_str+="\n");links.push("<a href='#"+METADATA[o]+"' onclick='life.insertSeed(\""+pattern_str.replace(/\n/gm,"\\n")+"\");' >"+METADATA[o]+"</a>"),patterns.push({name:METADATA[o],rows:rows,cols:cols,data:pattern_str})}$("seeds").innerHTML=links.join(""),location.hash?that.insertSeedNamed(location.hash.substr(1)):that.insertSeed(patterns[0].data);var controlsHTML="",c,cmds=["Play","Stop","Step","Edit","Info"];for(c=0;c<cmds.length;c++)controlsHTML+=mkBtn(cmds[c]);$("controls").innerHTML="LIFE "+controlsHTML})}),window.onresize=function(){resize(),render()}},info:function(){$("info").style.display="block"},edit:function(){this.stop(),editor.style.display="block"},addEditedForm:function(){return editor.style.display="none",this.insertSeed(seed_textarea.value),!1},cancelEdit:function(){return editor.style.display="none",!1}}}