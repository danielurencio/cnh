var width = window.innerWidth;
var height = window.innerHeight;

/*COLORES PARA LA SELECCIÓN DE NODOS*/
var peers = "tomato";
var actual = "black";
var mainOpacity = 0.6;
/*COLORES PARA LA SELECCIÓN DE NODOS*/

d3.select("#filtroEmpresas").style("height",height + "px");
d3.selectAll("ol").style("height",height + "px");
d3.selectAll("div#titulo").style("height","15%").style("padding-top","18px");
d3.select(".totalBloques").style("padding",0)

var infoWidth = d3.select("#info").style("width").split("px")[0];
//d3.select("#table").style("width",infoWidth);
//d3.select("table#ofertas>tbody").style("height",height*.3)

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
contenedor.attr.fill = 'transparent';//'rgba(0,0,0,0.25)';
contenedor.attr.transform = "translate(0,0)";
addElement(contenedor);

function reajustar() {
    if(width != window.innerWidth || height != window.innerHeight) {
	  d3.select("g#red").remove();
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
	  contenedor.selection = "svg#canvas"
	  contenedor.append = 1;
	  contenedor.type = "g";
	  contenedor.attr.id = "red";
	  addElement(contenedor);
	  //RECT
/*	  contenedor.selection = "g#red";
	  contenedor.type = "rect";
	  addElement(contenedor);
*/
	  contenedor.append =0;
	  delete contenedor.attr.class;
	  contenedor.selection = 'g#mapa>rect';
	  addElement(contenedor);
	//  RED(width,height)
	  d3.select("g.NODOS").attr("transform","translate(0,0)");
    }
};

//setInterval(reajustar,1000);

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
