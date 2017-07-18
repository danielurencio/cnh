var width = window.innerWidth;
var height = window.innerHeight;

var svgCanvas = {
 selection:"svg#canvas",
 type:"svg",
 append:0,
 attr: {
  "width":width,
  "height":height
 }
}

var contenedor = {
 selection:'g#mapa',
 type:'rect',
 append:1,
 attr: {
   fill:"transparent",
   width:width/2,
   height:height,
   x:0,
   y:0,
   transform:'translate(' + width/2 + ',0)'
 }
};

addElement(svgCanvas);
addElement(contenedor);
contenedor.selection = 'g#red';
contenedor.attr.fill = 'rgba(0,0,0,0.25)';
contenedor.attr.transform = "translate(0,0)";
addElement(contenedor);

function reajustar() {
  width = window.innerWidth;
  height = window.innerHeight;
//  console.log(width,height);
//  d3.select("svg#canvas").attr("width",width)
//  d3.select("g#red>rect").attr("width",width/2)
  svgCanvas.attr.width = width;
  svgCanvas.attr.height = height;
  addElement(svgCanvas);
  contenedor.attr.width = width/2;
  contenedor.attr.height = height;
  contenedor.append = 0;
  contenedor.selection = "g#red>rect";
  addElement(contenedor);
  contenedor.selection = 'g#mapa>rect';
  addElement(contenedor);
};

setInterval(reajustar,1000);

function addElement(obj) {
  var sel;
  if(obj.append) {
    sel = d3.select(obj.selection)
      .append(obj.type)
	.attr(obj.attr)
	.style(obj.style);
  } else {
    sel = d3.select(obj.selection)
	.attr(obj.attr)
	.style(obj.style);
  }
};
