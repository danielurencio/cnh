var width = window.innerWidth;
var height = window.innerHeight;
var textoColor = "rgba(255,255,255,0.65)";
var fondoColor = "rgba(0,0,0,0.85)";

var svg = d3.select("body").append("svg")
 	.attr("width",width)
	.attr("height",height)
	.style("background",fondoColor)

var datos;

d3.queue()
.defer(d3.csv,"reportes.csv")
.defer(d3.csv,"lista_reportes.csv")
.defer(d3.xml,"page1.svg")
.await(function(err,data,lista,xml) {
  var xTextOffset = 270;
  var yTextOffset = 50;
  data.forEach(function(d) { d.REPORTES = d.REPORTE.split(";"); })
  datos = data;
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
//////////////////////////////// FUENTES ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
  var fuentes = svg.append("g").attr("class","fuentes");
  var rectWidth = 240;
  var rectHeight = 20;

  fuentes.selectAll("g").data(data)
     .enter().append("g").attr("class","Fuente")
.each(function(d,i) {
    d3.select(this).append("rect")
    .attr({
      "id": function() { return d.FUENTE; },
 /*     "y": function(d,i) {
	var offset = 10;
	var HH = Math.round(data.length/2);
	if( i<= HH ) return yTextOffset + (height/data.length + offset) * i;
	else return yTextOffset + (height/data.length + offset) * (i-HH-1)
      },
      "x": function(d,i) {
	var HH = Math.round(data.length/2);
	if( i <= HH ) return 10;
	else return xTextOffset;
      },*/
      "transform": function() {
	var offset = 10;
	var HH = Math.round(data.length/2);
	var Y;
	var X;
	if( i<=HH ) {
	  Y = yTextOffset + (height/data.length + offset) * i;
	  X = 10;
	}
	else {
	  Y = yTextOffset + (height/data.length + offset) * (i-HH-1);
	  X = xTextOffset;
	}
	return "translate(" + X + "," + Y + ")";
      },
      "width": rectWidth,
      "height": rectHeight,
      "stroke": function() {
	if(d.TRANSPONEDOR != "") return null;
	else return "black";
      },
      "stroke-width":0.5,
      "rx":3,
      "fill": function() {
	if(d.TRANSPONEDOR != "") return "rgba(47,141,255,1)";
	else return "transparent"
      }
    })

d3.select(this).append("text")
    .attr({
      "text-anchor":"middle",
      "transform": function() {
	var ATTRS = d3.select("rect#" + d.FUENTE).attr("transform");
	var X = Number(ATTRS.split(",")[0].split("(")[1]) + rectWidth/2;
	var Y = Number(ATTRS.split(",")[1].split(")")[0]) + rectHeight/2;
	return "translate(" + X + "," + Y + ")";
      },
      "alignment-baseline": "central",//"text-before-edge",
      "font-size":12,
      "fill": function() {
	if(d.TRANSPONEDOR != "") return "white";
	else return "black";
      },
      "font-weight": function() {
	if(d.TRANSPONEDOR != "") return 900
      }
    })
    .text(function() { return d.FUENTE; });

})
    var fuentesI = {}
    fuentesI.mouseover = function(x) {
	d3.select(this).select("rect").attr("fill","orange");
    }

//-------- INTERACCIÓN DESDE LAS FUENTES -----------------
    d3.selectAll("g.Fuente")
    .on("mouseover",function(d) {
	var selection = d3.select(this).select("rect");
	if(d.REPORTE != "") {
	  selection.attr("fill","orange");
	} else {
	  selection.attr("fill","rgba(255,99,71,1)");
	}
	d.REPORTES.forEach(function(reporte) {
	  par = d3.select("g>rect[tag='" + reporte + "']")
		.node()
	  if(par) {
	    d3.select(par.parentNode).select("svg").select("path")
	      .style("fill","orange")
	      .attr("tempTag","TEMP");
	  };
	})

	if(d.TRANSPONEDOR) {
	  var T = d.TRANSPONEDOR//.split(".")[0];
	  var fileT = d3.selectAll("text")
	}
    })
    .on("mouseout",function(d) {
	if(d.TRANSPONEDOR != "") {
	  d3.select(this).select("rect").attr("fill","rgba(47,141,255,1)");
	}
	else d3.select(this).select("rect").attr("fill","transparent");
	d3.selectAll("path[tempTag='TEMP']")
	    .style("fill",textoColor)
	    .attr("tempTag",null)
    });

/*
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
*/
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

/*
---------- CUADROS DE CATEGORÍAS ---------------
*/
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
      "stroke":"rgba(255,255,255,0.3)",
      "stroke-width":10,
      "rx":3,
      "fill":fondoColor
    })
    .style("stroke-width",2);


 var importedNode = document.importNode(xml.documentElement,true);
 var BOXES = d3.selectAll("g.reporte");

 for( var i in categorias ) {
   var str = categorias[i].split(" ").reduce(function(a,b) {
	return a + "_" + b;
   });

   var sel = d3.select("#"+str)
   var selRect = d3.select("#"+str+">rect")
   var X = sel.node().getBBox().x;
   var Y = sel.node().getBBox().y;
   var WW = selRect.node().getBBox().width;
   var HH = selRect.node().getBBox().height;

   sel.append("text")
	.attr("x",selRect.node().getBBox().x + selRect.node().getBBox().width/2)
	.attr("y",selRect.node().getBBox().y + 5)
	.attr("fill",textoColor)
	.attr("font-size",12)
	.attr("alignment-baseline","text-before-edge")
	.attr("text-anchor","middle")
	.text(categorias[i])

   var reportes = lista.filter(function(d) {
	return d.CLASE == categorias[i];
   })

   sel.append("g").attr("id","reportSet" + i).attr("class","reportSet")
    .selectAll("g").data(reportes)
     .enter().append("g")
    .attr({
      "transform": function(d,i) {
	var offset = HH*0.2;
	var px = X + i * offset;
	var py = Y;
	if( (i+1) < 4 ) { px = X+i*offset; py = Y; };
	if( (i+1) > 4 ) { px = X+(i-4)*offset; py = Y + offset*1; };
	if( (i+1) > 8 ) { px = X+(i-8)*offset; py = Y + offset*2; };
//	if( (i+1) > 9 ) { px = X+(i-9)*offset; py = Y + offset*3; };
	return "translate(" + px + "," + py + ")" //+ "scale(0.05)";
       },
    })
    .each(function(d,i) { var R = d.REPORTE;
       d3.select(this).append("rect")
	.attr("id","prueba")
	.attr("width",WW*0.125)
	.attr("height",WW*0.125)
	.attr("fill","transparent")
	.attr("tag", function(d) { return d.REPORTE; })

       var hoja = this.appendChild(importedNode.cloneNode(true));
       d3.select(hoja).attr("width",WW*0.12).attr("height",WW*0.12);
    });

    var reportSetAttrs = d3.select("g#"+str+">g#reportSet" + i).node().getBBox();
    var tX = (WW/2 - reportSetAttrs.width/2);
    var tY = (HH/2 - reportSetAttrs.height/2);
    d3.select("g#reportSet"+i)
	.attr("transform","translate(" + tX + "," + tY +")");


/*   sel.selectAll("text").data(reportes)
     .enter().append("text")
    .attr({
      "x": function(d) { return sel.node().getBBox().x + 5; },
      "y": function(d,i) {
	var Y = sel.node().getBBox().y;
	var HH = sel.node().getBBox().height;
	return 10 + Y + (i*12);
      },
      "font-size": 10,
      "alignment-baseline": "text-before-edge"
    }).text(function(d) { return d.REPORTE; })
*/
 }

  d3.selectAll("svg>g>path").style("fill",textoColor);
/*
---------- INTERACCIONES ------------------------ |
*/
  d3.selectAll("rect#prueba")
   .on("mouseover",function(d) {
     var texto = d3.select(this).attr("tag");
     var cuadro = d3.select(this.parentNode.parentNode.parentNode)
	.select("rect").node().getBBox();

     var contenedor = d3.select(this.parentNode.parentNode.parentNode);
     contenedor.append("text")
	.attr("id","textoTemporal")
	.attr("x",cuadro.x + cuadro.width/2)
	.attr("y",cuadro.y - 10 + cuadro.height)
	.attr("alignment-baseline","text-after-edge")
	.attr("text-anchor","middle")
	.attr("font-size",11)
	.attr("fill","orange")
	.text(texto);

     d3.select(this.parentNode).select("path").style("fill","orange");


	for(var i in datos) {
    	  for(var j in datos[i].REPORTES) {
            if(datos[i].REPORTES[j] == texto) {
	      console.log(datos[i].FUENTE);
	      d3.select("rect#" + datos[i].FUENTE).attr("fill","orange");
	      d3.select("rect#" + datos[i].FUENTE).attr("tempTag",texto);
	    }
    	  }
	}

   })
   .on("mouseout",function(d) {
     var texto = d3.select(this).attr("tag");
     d3.selectAll("#textoTemporal").remove()
     d3.select(this.parentNode).select("path").style("fill",textoColor);
     d3.select("rect[tempTag='" + texto + "']").attr("fill","transparent").attr("tempTag",null)
   })
   .on("click", function(d) {
//     BÚSQUEDA DE TRANSPONEDOR Y DE ARCHIVO O FUENTE.
        var texto = d3.select(this).attr("tag");
   });
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
		if(a.indexOf(b) < 0) { a.push(b); };
		return a; },[]);


  var transXoffset = 550;

  transConteiner.selectAll("g").data(transponedores)
     .enter().append("g")
	.attr("id",function(d) { return d.split(".")[0]; })
     .each(function(d,i) {
	d3.select(this)
	.append("rect")
	    .attr({
	      "id": function() { return d.split(".")[0]; },
	      "y": function() {
		return yTextOffset + (height/data.length + 20) * i
	      },
	      "x": function() {
		return transXoffset;
	      },
	      "width": 260,
	      "height": 30,
	      "fill": "transparent",//"rgba(255,64,35,1)",
	      "stroke": "rgba(255,64,35,1)",
	      "stroke-width":1.2,
	      "stroke-dasharray":"5,1",
	      "rx":1,
	    });


	  d3.select(this).append("text")
	    .attr({
	      "y": function() {
		var yCuadro = d3.select("rect#" + d.split(".")[0])
		  .node().getBBox().y;
		return yCuadro + 0;
		
	      },
	      "x": function() {
		var xCuadro = d3.select("rect#" + d.split(".")[0])
		  .node().getBBox().x;
		return xCuadro + 10;
	      },
	      "alignment-baseline": "text-before-edge",
	      "font-size":15,
	      "fill": "rgba(255,64,35,1)",
	      "font-weight": 700
	    })
	    .text(function() { return d; });
	  })
	  .on("mouseover", function(d) {
	    var dato = data.filter(function(e) { return e.TRANSPONEDOR == d; });
	    console.log(dato);
	  });

});

