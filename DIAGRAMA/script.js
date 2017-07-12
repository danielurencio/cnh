var width = window.innerWidth;
var height = window.innerHeight;

var svg = d3.select("body").append("svg")
 	.attr("width",width)
	.attr("height",height)

var datos;

d3.queue()
.defer(d3.csv,"reportes.csv")
.defer(d3.csv,"lista_reportes.csv")
.await(function(err,data,lista) {
  var xTextOffset = 270;
  var yTextOffset = 50;
//  datos = data;
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
//////////////////////////////// FUENTES ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
  var fuentes = svg.append("g").attr("class","fuentes");

  fuentes.selectAll("rect").data(data)
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


  fuentes.selectAll("text").data(data)
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

  fuentes.attr("transform","translate(" + width*.6 + ",0)");


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
//////////////////////////// REPORTES ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
var reportes = svg.append("g").attr("class","reportes");

var categorias = lista
	.filter(function(d) { return d.CLASE; })
	.map(function(d) { return d.CLASE; })
	.reduce(function(a,b) {
	    if(a.indexOf(b) < 0) { a.push(b); };
	    return a;
	},[]);


 var boxWidth = 0.33 
 reportes.selectAll("g").data(categorias)
      .enter().append("g")
    .attr("class","reporte")
    .attr("id", function(d) {
	var str = d.split(" ")
	.reduce(function sum(a,b) { return a + "_" + b; });
	return str;
    })
    .append("rect")
    .attr({
      "width": (width*boxWidth) / 2,
      "height": height/4,
      "x":function(d,i) {
	if( (i+1)%2 == 0 ) { return (width*boxWidth)/2; }
	else return 0;
      },
      "y":function(d,i) {
	var Y;
	if( (i+1) > 0 ) { Y = 0; };
	if( (i+1) > 2 ) { Y = height/4; };
	if( (i+1) > 4 ) { Y = 2*(height/4) };
	if( (i+1) > 6 ) { Y = 3*(height/4) };
	return Y;
      },
      "stroke":"white",
      "rx":5,
      "fill":"rgba(0,0,0,0.5)"
    })
    .style("stroke-width",2);


 var BOXES = d3.selectAll("g.reporte");

 for( var i in categorias ) {
   var str = categorias[i].split(" ").reduce(function(a,b) {
	return a + "_" + b;
   });

   var sel = d3.select("#"+str)
   var reportes = lista.filter(function(d) { return d.CLASE == categorias[i]; })
//   console.log(reportes)

   sel.selectAll("text").data(reportes)
     .enter().append("text")
    .attr({
      "x": function(d) { return sel.node().getBBox().x; },
      "y": function(d,i) {
	var Y = sel.node().getBBox().y
	return Y + (i+0);
      }
    }).text(function(d) { return d.REPORTE; })
 }

/*
 BOXES.selectAll("text").data(lista)
       .enter().append("text")
    .attr({
      "x": function(d,i) {
	var str = d.CLASE.split(" ")
	  .reduce(function sum(a,b) { return a + "_" + b; });
	var X = d3.select("g#"+str).node().getBBox().x;
	console.log(d3.select(this).node().parentNode.id);
	return X;
      },
      "y": function(d,i) {
	var str = d.CLASE.split(" ")
	  .reduce(function sum(a,b) { return a + "_" + b; });
	var Y = d3.select("g#" + str + ">rect").node().getBBox().y;
	return Y + (i*15);
      }
    })
    .text(function(d) {
	var texto;
	var str = d.CLASE.split(" ")
	  .reduce(function sum(a,b) { return a + "_" + b; });

        var sel = d3.select(this).node().parentNode.id;
	if( str == sel ) texto = d.REPORTE;
	else texto = null;

	return texto;
    });
*/

///////////////////////////////////////////////////////////////////////////////
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


  var transXoffset = 550;

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

});

