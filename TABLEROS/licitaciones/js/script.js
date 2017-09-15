var width = window.innerWidth;
var height = window.innerHeight;

/*COLORES PARA LA SELECCIÓN DE NODOS*/
var peers = "tomato";
var actual = "black";
var mainOpacity = 0.6;
/*COLORES PARA LA SELECCIÓN DE NODOS*/

d3.selectAll("ol").style("height",height + "px");

var cintilla = +d3.select("svg#cintilla").style("height").split("px")[0];

d3.select("content").style("padding-top",cintilla + "px")
 .style("height",function() {
   var HH = window.innerHeight// - cintilla;
   return HH + "px";
 });

d3.select("#filtroEmpresas").style("height",height-cintilla + "px");


d3.select("#red").style("height","inherit")

d3.select("svg#canvas")
 .style("height",function() {
   var HH = window.innerHeight - cintilla;
   return HH + "px";
 })
 .style("width","100%");

d3.selectAll("div#titulo").style("height","15%").style("padding-top","0px");
d3.select(".totalBloques").style("padding",0)

var infoWidth = d3.select("#info").style("width").split("px")[0];
//d3.select("#table").style("width",infoWidth);
//d3.select("table#ofertas>tbody").style("height",height*.3)

var svgCanvas = {
 selection:"svg#canvas",
 type:"svg",
 append:0,
 style: {
  "width":width,
  "height":"inherit"
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

//addElement(svgCanvas);
addElement(contenedor);
contenedor.selection = 'g#red';
contenedor.attr.fill = 'transparent';//'rgba(0,0,0,0.25)';
contenedor.attr.transform = "translate(0,0)";
addElement(contenedor);

//RED(width/2,height);

function reajustar() {
    if(width != window.innerWidth || height != window.innerHeight) {
      width = window.innerWidth;
      height = window.innerHeight;
      d3.selectAll("g#red>g").remove();
      d3.select("svg#verLista").remove();
      d3.select("g#tituloRed_").remove();
      d3.select("div#remporal").remove();
      d3.select("svg#cintilla>text").remove();
      d3.selectAll("div[class='chosen-container chosen-container-multi']").remove()
      RED(width/2,height);
    }
};

//setInterval(reajustar,500);

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

