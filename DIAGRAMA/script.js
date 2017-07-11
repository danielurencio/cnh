var width = window.innerWidth;
var height = window.innerHeight;

var svg = d3.select("body").append("svg")
 	.attr("width",width)
	.attr("height",height)

var datos;

d3.csv("reportes.csv", function(err,data) {
  var xTextOffset = 270;
  var yTextOffset = 50;
  datos = data;
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
//////////////////////////////// FUENTES ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

  svg.selectAll("rect").data(data)
     .enter().append("rect")
    .attr({
      "id": function(d) { return d.FUENTE; },
      "y": function(d,i) {
	var offset = 10;
	var HH = Math.round(data.length/2);
	if( i<= HH ) return yTextOffset + (height/data.length + offset) * i;
	else return yTextOffset + (height/data.length + offset) * (i-HH-1)
      },
      "x": function(d,i) {
	var HH = Math.round(data.length/2);
	if( i <= HH ) return 10;
	else return xTextOffset;
      },
      "width": 240,
      "height": 20,
//      "fill": "transparent",
      "stroke": function(d) {
	if(d.TRANSPONEDOR != "") return null;
	else return "black";
      },
      "stroke-width":0.5,
      "rx":3,
      "fill": function(d) {
	if(d.TRANSPONEDOR != "") return "rgba(47,141,255,1)";
	else return "transparent"
      }
    });


  svg.selectAll("text").data(data)
     .enter().append("text")
    .attr({
      "y": function(d,i) {
	var yCuadro = d3.select("rect#" + d.FUENTE).node().getBBox().y
	return yCuadro + 2;
	
      },
      "x": function(d,i) {
	var xCuadro = d3.select("rect#" + d.FUENTE).node().getBBox().x
	return xCuadro + 10;
      },
      "alignment-baseline": "text-before-edge",
      "font-size":12,
      "fill": function(d) {
	if(d.TRANSPONEDOR != "") return "white";
	else return "black";
      },
      "font-weight": function(d) {
	if(d.TRANSPONEDOR != "") return 900
      }
    })
    .text(function(d) { return d.FUENTE; });


////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
//////////////////////////// TRANSPONEDORES //////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
 var transConteiner = svg.append("g").attr("class","transponedores");

 var transponedores = data
	.filter(function(d) { return d.TRANSPONEDOR; })
	.map(function(d) { return d.TRANSPONEDOR; })
	.reduce(function(a,b){
		if(a.indexOf(b) < 0) { a.push(b); }
		; return a; },[]);


  var transXoffset = 550; console.log(transXoffset);
  

  transConteiner.selectAll("rect").data(transponedores)
     .enter().append("rect")
    .attr({
      "id": function(d) { return d.split(".")[0]; },
      "y": function(d,i) {
	return yTextOffset + (height/data.length + 20) * i
      },
      "x": function(d,i) {
	return transXoffset;
      },
      "width": 260,
      "height": 30,
      "fill": "transparent",//"rgba(255,64,35,1)",
      "stroke": "rgba(255,64,35,1)",
      "stroke-width":1,
      "stroke-dasharray":"5,1",
      "rx":3,
    });


  transConteiner.selectAll("text").data(transponedores)
     .enter().append("text")
    .attr({
      "y": function(d,i) {
	var yCuadro = d3.select("rect#" + d.split(".")[0]).node().getBBox().y;
	return yCuadro + 0;
	
      },
      "x": function(d,i) {
	var xCuadro = d3.select("rect#" + d.split(".")[0]).node().getBBox().x;
	return xCuadro + 10;
      },
      "alignment-baseline": "text-before-edge",
      "font-size":15,
      "fill": "rgba(255,64,35,1)",
      "font-weight": 700
    })
    .text(function(d) { return d; });

/*
   transConteiner.attr("transform", function(d) {
	var HH = transConteiner.node().getBBox().height;
	return "translate(0," + (height/2 - HH/2 - 20) +")"
   });
*/

  svg.selectAll("line").data(data)
    .enter().append("line")
    .attr({
      "x1":function(d) {
	var x = d3.select("rect#" + d.FUENTE).node().getBBox().x;
//	console.log(d)
	if(x) return x;
      },
      "y1":function(d) {
	var y = d3.select("rect#" + d.FUENTE).node().getBBox().y;
	if(y) return y;
      },
      "x2":function(d) {
	var x = d3.select("rect#" + d.TRANSPONEDOR.split('.')[0]).node().getBBox().x;
	if(x) return x;
      },
      "y2":function(d) {
	var y = d3.select("rect#" + d.TRANSPONEDOR.split('.')[0]).node().getBBox().y;
	if(y) return y;
      }
    });

});

