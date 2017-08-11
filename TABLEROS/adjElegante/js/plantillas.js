function resumen(data,adj,licRondas,pmts,ofertas,RONDA_LIC,tabla,procesos) {
  if(d3.select("div#temporal")[0][0]) d3.select("div#temporal").remove()
// HABRÁ QUE FILTRAR POR RONDA Y LICITACIÓN PARA REUTILIZAR ESTA FUNCIÓN.
  var TABLA;
  var FILTRO;
  var colorBarras = "rgba(255,15,0,0.65)"
  var texto = {
    'resumen':'RESUMEN'
  };


  if(!RONDA_LIC) {
    TABLA = tabla;
    FILTRO = licRondas;
  } else {
    if( typeof(RONDA_LIC) != 'object' ) {
      FILTRO = licRondas.filter(function(d) { return d.RONDA == RONDA_LIC; });
      texto.resumen = "RONDA " + RONDA_LIC;
      colorBarras = "rgba(255,45,0,0.65)";
    } else {
// SI ES VERDAD QUE NO EXISTE LA DISTANCIA DEL OBJETO (ES UN DICCIONARIO)
      if(!RONDA_LIC.length) {
        FILTRO = licRondas.filter(function(d) {
	  return d.RONDA == RONDA_LIC.ronda && d.LICITACION == RONDA_LIC.lic;
        });
        texto.resumen = "RONDA " + RONDA_LIC.ronda + " - LICITACIÓN "
	  + RONDA_LIC.lic;
        colorBarras = "rgba(255,75,0,0.65)";
      } else {
	TABLA = [];
	FILTRO = [];
// SI ES VERDAD QUE EXISTE LA DISTANCIA DEL OBJETO (ES UN ARRAY)
	for(var j in RONDA_LIC) {
	  var tempTabla = tabla.filter(function(d) {
	    return d.RONDA == RONDA_LIC[j].ronda
		&& d.LICITACION == RONDA_LIC[j].lic;
	  });

	  var tempFilt = licRondas.filter(function(d) {
	    return d.RONDA == RONDA_LIC[j].ronda
		&& d.LICITACION == RONDA_LIC[j].lic;
	  });
	  TABLA = TABLA.concat(tempTabla);
	  FILTRO = FILTRO.concat(tempFilt);
	};

      };
    };
  };


  var filtrar_LIC = FILTRO.map(function(d) { return d.ID_LICITANTE_OFERTA; })
	.reduce(function(a,b) {
	  if( a.indexOf(b) < 0 ) { a.push(b); };
	  return a;
	},[]).sort();


  var empresas = [];

  for(var i in filtrar_LIC) {
    var emps;
    emps = data.filter(function(d) { return d.ID_LICITANTE == filtrar_LIC[i]; })
	.map(function(d) { return d.ID_EMPRESA; });
    empresas = empresas.concat(emps);
  };

  empresas = empresas.reduce(function(a,b) {
    if( a.indexOf(b) < 0 ) { a.push(b); };
    return a;
  },[]).sort();

  for(var i in empresas) {
    var pais = data.filter(function(d) { return d.ID_EMPRESA == empresas[i]; })[0];
    empresas[i] = { 'EMPRESA':empresas[i],'PAIS':pais.PAIS };
  };

  var paises = _.countBy(empresas,"PAIS");
  var paisesData = [];

  for (var k in paises) {
    paisesData.push([k, paises[k]]);
  }

  paisesData.sort(function(a, b) {
    return b[1] - a[1];
  });

  var maxPaises = d3.max(paisesData,function(d) { return d[1]; });


     var contenido =
      '<div id="mitades" style="height:20px">'+
       '<div id="mitad1" style="float:left;clear:left;width:33%;height:inherit"></div>' +
       '<div id="mitad2" style="float:left;width:33%;height:inherit">'+
	'<svg style="width:100%;height:inherit;"></svg>'+
       '</div>' +
       '<div id="mitad3" style="float:left;width:33%;height:inherit"></div>' +

      '</div>' +
      '<div id="barras" style="padding:0px;width:100%; height:10%"></div>';

          var plantilla = 
'<div id="titulo" style="height:15%; font-size:28px;">'+
   texto.resumen +
'<div class="totalBloques" style="padding: 0px;">'+
'<svg id="sumas" style="width:100%;height:80px;background-color:transparent"></svg>' +
'<svg id="pestañas" style="width:100%;height:30px;"></svg>'
+'</div>' +  
'</div>' +
 '<div id="graficos">' + 
  contenido + 
 '</div>' +
'</div>';

  d3.select("#info").append("div")
    .attr("id","temporal")
    .html(plantilla);

//------CÁLCULO DE SUMAS--------------//
var SUMAS = calculoSumas(licRondas,ofertas,adj,RONDA_LIC,procesos,data,tabla);
//-----------------------------------//

 var sumas = d3.select("svg#sumas"); 
// var nums = [1,2,3,4,5];

 var nums = sumas.append("g").selectAll("text")
  .data(SUMAS.pre).enter()
  .append("text")
   .style("font-weight",300)
   .attr("id",function(d,i) {
     return "suma_" + String(i);
   })
   .attr("fill","rgba(0,0,0,0.5)")
   .attr("opacity",0)
   .attr("alignment-baseline","alphabetic")
   .attr("text-anchor","middle")
   .attr("x",function(d,i) {
     var width = d3.select("svg#sumas").style("width").split("px")[0];
     var objLength = Object.keys(SUMAS.pre).length;
     return (width / objLength*i) + (width/objLength/2);
   })
   .attr("y",function() {
     var height = +d3.select("svg#sumas").style("height").split("px")[0];
     return height / 2;
   }).text(function(d) { return d.val; });

 var tits__ = SUMAS.pre.map(function(d) { return d.key; });
 var tits = sumas.append("g").selectAll("text")
  .data(tits__).enter()
  .append("text")
   .style("font-weight",600)
   .style("font-size",10)
   .attr("opacity",1)
   .attr("alignment-baseline","text-before-edge")
   .attr("text-anchor","middle")
   .attr("x",function(d,i) {
     var width = d3.select("svg#sumas").style("width").split("px")[0];
     return (width / tits__.length)*i + (width/tits__.length/2);
   })
   .attr("y",function(d,i) {
     var sel = d3.select("#suma_" + String(i)).node().getBBox();
     var y = sel.y;
     var height = sel.height; 
     return y + height + 8;
   }).text(function(d) { return d; });

  var t0 = nums.transition().duration(750).attr("opacity",1)

//////////////////////////////////////////////////////////////////////////////
///////////////---- GRÁFICO PAÍSES ---- /////////////////////////////////////
////////////////////////////////////////////////////////////////////////////


  function GRAFICOS() {
      d3.select("#graficos").html(contenido);

      var hT = +d3.select("#titulo").style("height").split("px")[0];
      var alturaGraficas = (window.innerHeight - cintilla - hT) *.5;

      d3.select("#mitades").style("height",alturaGraficas + "px");
      d3.select("#barras").style("height",alturaGraficas + "px");
	var bOf = SUMAS.pre.filter(function(d) {
	  return d.key == "Bloques ofertados";
	})[0].val;

	var bAdj = SUMAS.after.filter(function(d) {
	  return d.key == "Bloques adjudicados";
	})[0].val;

	var bNoAdj = bOf - bAdj;

	var precalif = SUMAS.pre.filter(function(d) {
	  return d['key'] == 'Empresas precalificadas';
	})[0].val;

	var participaron = SUMAS.after.filter(function(d) {
	  return d['key'] == 'Empresas que participaron';
	})[0].val;

	var interesadas = SUMAS.pre.filter(function(d) {
	  return d['key'] == 'Empresas interesadas';
	})[0].val;

	var noPrecalif = interesadas - precalif;
	var precalifNoOf = precalif - participaron;

	var serieEmpresas = [
	  ["No precalificadas",noPrecalif],
	  ["No ofertaron",precalifNoOf],
	  ["Ofertaron",participaron]
	];

	Highcharts.setOptions({
	  colors: ['rgba(0,0,0,0.2)','rgba(0,0,0,0.35)',colorBarras]
	});

	var empresas_precalif = Highcharts.chart({
	    credits: { enabled:false },
            chart: {
                renderTo: 'mitad1',
                type: 'pie'
            },
           title: {
                text: "EMPRESAS",
		style: {
		  'font-family':'Open Sans, sans-serif',
		  'font-weight':600,
		  'font-size':16
		}

            },
           tooltip: {
                formatter: function() {
                    return '<b>'+ this.point.name +'</b>: '+ this.y;
                }
            },
            series: [{
                name: 'Empresas',
                data:serieEmpresas,
                size: '90%',
                innerSize: '65%',
                showInLegend:true,
                dataLabels: {
                    enabled: true,
		    distance:15,
		    style: {
		      'font-family':'Open Sans, sans-serif',
		      'font-size':8,
		      'color':"black",
		      'stroke-width':"0px"
		    },
		    formatter: function() {
		      return this.y;
		    }
                }
            }]
        });
///////////////////////////////////////////////////////////////////////////
///////// DATOS DEL SEGUDO TERCIO
/////////////////////////////////////////////////////////////////////////
  var medio = d3.select("#mitad2>svg");

  var inv = SUMAS.after.filter(function(d) {
    return d.key == 'Inversión comprometida'
  })[0];

  var ofertasXbloque = SUMAS.after.filter(function(d) {
    return d.key == 'Promedio de ofertas por bloque';
  })[0];

  var area = SUMAS.after.filter(function(d) {
    return d.key == 'Área adjudicada (km\u00B2)';
  })[0];

  var valores = [area,inv,ofertasXbloque]
//  medio.style("background-color","rgba(0,0,0,0.1");

  var figuras = medio.append("g").selectAll("text")
   .data(valores).enter()
   .append("text")
   .attr({
    'opacity':0,
    'fill':function(d,i) { 
      var c = i == 1 ? colorBarras : 'black';
      return c;
    },
    'text-anchor':'middle',
    'alignment-baseline':'text-after-edge',
    'x':function() {
      var x = +d3.select('#mitad2').style("width").split("px")[0];
      return x/2;
    },
    'y':function(d,i) {
      var y = +d3.select('#mitad2').style("height").split("px")[0];
      //var Y = i == 0 ? (y/4) : (y/4)*3;
      return (y/valores.length*(i+1)) - (y/valores.length/2);
    },
    'font-weight':function(d,i) {
      var w = i == 1 ? 800 : 800;
      return w;
    },
    'font-size':function(d,i) {
      var s = i == 1 ? 35 : 22;
      return s;
    }
   })
   .text(function(d,i) {
	var T = String(d.val).split("K");
	if(T.length == 1) T = Number(T[0]).toLocaleString();
        if(T.length ==2) T = Number(T[0]).toLocaleString() + "K";
	return T;
   });

  figuras.transition().duration(1000).attr("opacity",1);

  medio.append("g").selectAll("text")
   .data(valores).enter()
   .append("text")
   .attr({
    'fill':function(d,i) { 
      var c = i == 1 ? colorBarras : 'black';
      return c;
    },
    'text-anchor':'middle',
    'alignment-baseline':'text-before-edge',
    'x':function() {
      var x = +d3.select('#mitad2').style("width").split("px")[0];
      return x/2;
    },
    'y':function(d,i) {
      var y = +d3.select('#mitad2').style("height").split("px")[0];
      //var Y = i == 0 ? (y/4) : (y/4)*3;
      return (y/valores.length*(i+1)) - (y/valores.length/2);
    },
    'font-weight':function(d,i) {
      var w = i == 1 ? 700 : 400;
      return w;
    },
    'font-size':function(d,i) {
      var s = i == 1 ? 14 : 11;
      return s;
    }
   })
   .text(function(d,i) {
	return d.key;
   });

//////////////////////////////////////////////////////////////////////////
	Highcharts.setOptions({
	  colors: [colorBarras,'rgba(0,0,0,0.35)']
	});


	var barras = Highcharts.chart('barras', {
	    chart: {
		type: 'column'
	    },
	    title: {
		text:'PAÍSES',
		style: {
		  "font-weight":600,
		  "font-family":'Open Sans, sans-serif'
		}
	    },
	    credits: { enabled:false },
	    xAxis: {
		type: 'category',
		labels: {
		    rotation: -34,
		    style: {
			fontSize: '10.5px',
			'font-weight':300,
			fontFamily: 'Open Sans, sans-serif'
		    }
		}
	    },
	    yAxis: {
		labels: {
		  style: {
		    'fontFamily':'Open Sans, sans-serif',
		    'font-weight':300
		  }
		},
		min: 0,
		max: (maxPaises),
	 	tickInterval:2,
		title: {
		    text: 'Empresas por país',
		    style: { fontFamily:'Open Sans, sans-serif' }
		}
	    },
	    legend: {
		enabled: false
	    },
	    tooltip: {
		style: { color:"white",stroke:null },
		backgroundColor:colorBarras,
		borderColor:"transparent",
		pointFormat: '<b>{point.y:.1f}</b>'
	    },
	    plotOptions: {
		series: {
		  color: colorBarras,
		}
	    },
	    series: [{
		name: 'número',
		data: paisesData,
		dataLabels: {
		    enabled: false,
		    rotation: -90,
		    color: 'rgba(255,0,0,0.65)',
		    align: 'right',
		    format: '{point.y:.1f}',
		    y: 10,
		    style: {
			fontSize: '13px',
			fontFamily: 'Open Sans'
		    }
		}
	    }]
	});

      d3.selectAll('.highcharts-grid-line').remove();


	var bloques = Highcharts.chart({
	    credits: { enabled:false },
            chart: {
                renderTo: 'mitad3',
                type: 'pie'
            },
           title: {
                text: "BLOQUES",
		style: {
		  'font-family':'Open Sans, sans-serif',
		  'font-weight':600,
		  'font-size':16
		}
            },
           tooltip: {
                formatter: function() {
                    return '<b>'+ this.point.name +'</b>: '+ this.y;
                }
            },
            series: [{
                name: 'Bloques',
                data: [["Adjudicados",bAdj],["No adjudicados",bNoAdj]],
                size: '90%',
                innerSize: '65%',
                showInLegend:true,
                dataLabels: {
                    enabled: true,
		    distance:15,
		    style: {
		      'font-family':'Open Sans, sans-serif',
		      'class':"ll",
		      'font-weight':'light',
		      'font-size':8,
		      'color':"black",
		      'stroke-width':"0px"
		    },
		    formatter: function() {
		      return this.y;
		    }
                }
            }]
        });

	d3.selectAll("tspan.highcharts-text-outline").remove()
  }; GRAFICOS();
/////////////////////////////////////////////////////////////////////////////////
///////////////---- GRÁFICO PAÍSES ---- ////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////////////////////////////
//------------------ TABLA ------------------------------------------------------
/////////////////////////////////////////////////////////////////////////////////

  function RenderTabla() {
	 d3.select("table#tBody")
	  .selectAll("tr").data(TABLA).enter()
	  .append("tr")
	.attr("class","datosMod")
	.attr("id","new")
	  .style("font-weight","lighter")
	  .html(function(d,i) {
	   var ronda = d.RONDA;
	   var licitacion = d.LICITACION;
	   var bloque = d.ID_BLOQUE;
	   var licitantes = d.ID_LICITANTE_OFERTA;
	   var VPO = Number(d.VPO).toFixed(1);

	  if(VPO == 0) VPO = "-"
	   
	   var str = "<th>"+ronda + "-" + licitacion +"</th>" +

		     "<th>" + bloque + "</th>" +
		     "<th>"+ d.HIDRO_PRINCIPAL +"</th>"+
		     "<th>"+ licitantes +"</th>"+
		     "<th>"+ d.VAR_ADJ1 +"</th>" +
		     "<th>"+ d.VAR_ADJ2 +"</th>" +
		     "<th>"+ VPO +"</th>" +
		     "<th>"+ d.BONO +"</th>";
	   return str;
	   });
  };
/*
	   var cell = d3.select("th#licitantes[tag='"+i+"']");
	   if(licitantes.length > 1) {
	    cell.append("ul")//.style("list-style","none")
	      .selectAll("li")
		.data(licitantes).enter()
	      .append("li").html(function(d,i) { return (i+1) + ") " + d; })
		.style("font-size","8.5px");
	   } else {
	     cell.html("-")
	   };
*/

//////////////////////////////////////////////////////////////////////////////////
//------------------ TABLA ------------------------------------------------------
/////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////
//------------------ PESTAÑAS ---------------------------------------------------
/////////////////////////////////////////////////////////////////////////////////

  var botones = ["Gráficos","Ofertas"];
  var attrGeneralesBotones = {
    'rx':2,
    'ry':2,
    'fill':'rgba(0,0,0,0.65)',
    'stroke':'black',
    'stroke-width':0
  };

  var attrGeneralesTexto = {
    'fill':'white',
    'font-size':11,
    'font-weight':300,
    'text-anchor':'middle',
    'alignment-baseline':'central'
  };

  var pests = d3.select("svg#pestañas").append("g")
	.selectAll("rect")
	.data(botones).enter()
	.append("rect")
	.attr(attrGeneralesBotones)
    .attr({
      'class':'boton',
      'id':function(d,i) {
	var id = d.split(" ").reduce(function sum(a,b) { return a + "_" + b; });
	return id;
      },
      'width':function(d,i) {
	return 60;
      },
      'height':function(d,i) {
	var h = +d3.select("svg#pestañas").style("height").split("px")[0];
	return h - 5;
      },
      'x':function(d,i) {
	var w = +d3.select(this).attr("width").split("px")[0]// + 5;
	return 2 + (w+3)*i;
      },
      'y':function(d,i) {
	return 3;
      }
    });

    d3.select("#Gráficos")
	.attr("fill","rgba(255,15,0,0.65)")
	.attr("stroke-width","0.5px");

  var textoPests = d3.select("svg#pestañas").append("g")
	.selectAll("text")
	.data(botones).enter()
	.append("text")
	.attr(attrGeneralesTexto)
    .attr({
      'x':function(d,i) {
	var id = d.split(" ").reduce(function sum(a,b) { return a + "_" + b; });
	var sel = d3.select("rect#" + id);
	var x = +sel.attr("x").split("px")[0];
	var offset = +sel.attr("width").split("px")[0];
	return x + offset/2;
      },
      'y':function(d,i) {
	var id = d.split(" ").reduce(function sum(a,b) {
	  return a + "_" + b;
	});
	var sel = d3.select("rect#" + id);
	var x = +sel.attr("y").split("px")[0];
	var offset = +sel.attr("height").split("px")[0];
	return x + offset/2;
      }
    }).text(function(d) { return d; })
    .on("mouseover",function() {
      d3.select(this).style("cursor","pointer");
    })
    .on("click",function(d) {
      d3.selectAll("rect.boton").attr("fill","rgba(0,0,0,0.65)");
      d3.selectAll("rect.boton").attr("tag",null);
      d3.selectAll("rect.boton").attr("stroke-width","0px");
      var id = d.split(" ").reduce(function sum(a,b) { return a + "_" + b; });
      d3.select("#" + id).attr("fill",colorBarras).attr("stroke-width","0.5px");
      if(d == "Ofertas") {
	OFERTAS();
	RenderTabla();
      };

      if(d == "Gráficos") {
	GRAFICOS();
      };

    });

////////////////////////////////////////////////////////////////////////////---------------- PESTAÑAS ---------------------------------------------------
/////////////////////////////////////////////////////////////////////////////////


};


function plantillaEmpresa(d,adj,data,licRondas,pmts,tabla,procesos,ofertas,OFERTAS_) {
  console.log(OFERTAS_);
  var id_empresa = d.id;
  if(d3.select("div#temporal")[0][0]) d3.select("div#temporal").remove();

  function filtroEmp(E) { return +E.ID_EMPRESA == +d.id; };
  var objAdj = adj.filter(filtroEmp);
  var objEmp = data.filter(filtroEmp);

  var contenido =
    '<div id="mitades" style="height:20px">'+
     '<div id="mitad1" style="float:left;clear:left;width:33%;height:inherit"></div>' +
     '<div id="mitad2" style="float:left;width:33%;height:inherit">'+
        '<svg style="width:100%;height:inherit;"></svg>'+
     '</div>' +
     '<div id="mitad3" style="float:left;width:33%;height:inherit"></div>' +

    '</div>' +
    '<div id="barras" style="padding:0px;width:100%; height:10%"></div>';

  var plantilla = 
  '<div id="titulo" style="height:15%; font-size:20px;padding-top:10px;">'+
	objEmp[0].EMPRESA.split(",")[0] +
   '<div class="totalBloques" style="padding: 0px;">'+
    '<svg id="sumas" style="width:100%;height:80px;"></svg>' +
'   <svg id="pestañas" style="width:100%;height:30px;"></svg>' +
   '</div>' +
  '</div>' +
  '<div id="graficos">' + contenido + '</div>' +
 '</div>';

  d3.select("#info").append("div")
    .attr("id","temporal")
    .html(plantilla);

  for(var i in objAdj) {
    var licitantes = licRondas.filter(function(d) {
      var cond1 = objAdj[i].ID_LICITANTE_ADJ == d.ID_LICITANTE_ADJ;
      var cond2 = objAdj[i].ID_LICITANTE_ADJ == d.ID_LICITANTE_OFERTA;
      return cond1 && cond2;
    })[0].LICITANTE;
  };

  var total = objAdj.map(function(d) { return d.ADJUDICADOS; })

  if(total.length == 0)  {
    total = 0;
  } else {
    total = total.reduce(function sum(a,b) { return +a + +b; });	  
  };

  var inv_pmt = ofertas.filter(function(e) {
    return +d.id == +e.ID_EMPRESA;
  }).filter(function(d) { return d.PMT_TOTAL; });

  if(inv_pmt.length != 0) {
    inv_pmt = inv_pmt.map(function(d) { return d.PMT_TOTAL; })
    .reduce(SUM);
  } else {
    inv_pmt = 0;
  };

  var area;
  if(objAdj.length != 0) {
    area = objAdj.map(function(d) { return +d.AREA; }).reduce(SUM)
    .toFixed(1);
  } else {
    area = 0;
  };

  var SUMAS = [
    { 'key':'Bloques adjudicados', 'val':total },
    { 'key':'Área adjudicada (km\u00B2)','val':area },
    { 'key':'Inversión comprometida', 'val':inv_pmt }
  ];

 var sumas = d3.select("svg#sumas"); 
 var nums = sumas.append("g").selectAll("text")
  .data(SUMAS).enter()
  .append("text")
   .style("font-weight",300)
   .attr("id",function(d,i) {
     return "suma_" + String(i);
   })
   .attr("class", function(d) {
     var t = d.key.split(" ").reduce(function concat(a,b) {
       return a + "_" + b;
     });
     return t;
   })
   .attr("fill","rgba(0,0,0,0.5)")
   .attr("opacity",0)
   .attr("alignment-baseline","alphabetic")
   .attr("text-anchor","middle")
   .attr("x",function(d,i) {
     var width = d3.select("svg#sumas").style("width").split("px")[0];
     var objLength = Object.keys(SUMAS).length;
     return (width / objLength*i) + (width/objLength/2);
   })
   .attr("y",function() {
     var height = +d3.select("svg#sumas").style("height").split("px")[0];
     return height / 2;
   }).text(function(d) {
      var t;
      if( d3.select(this).attr("class") == "Inversión_comprometida" ) {
	t = Number((d.val/1000).toFixed(0)).toLocaleString() + "K";
      } else {
	t = Number(d.val).toLocaleString();
      };
      return t;
   });

 var tits__ = SUMAS.map(function(d) { return d.key; });
 var tits = sumas.append("g").selectAll("text")
  .data(tits__).enter()
  .append("text")
   .style("font-weight",600)
   .style("font-size",10)
   .attr("opacity",1)
   .attr("alignment-baseline","text-before-edge")
   .attr("text-anchor","middle")
   .attr("x",function(d,i) {
     var width = d3.select("svg#sumas").style("width").split("px")[0];
     return (width / tits__.length)*i + (width/tits__.length/2);
   })
   .attr("y",function(d,i) {
     var sel = d3.select("#suma_" + String(i)).node().getBBox();
     var y = sel.y;
     var height = sel.height; 
     return y + height + 8;
   }).text(function(d) { return d; });

  var t0 = nums.transition().duration(750).attr("opacity",1);

/////////////////////////////////////////////////////////////////////////
//////////////////////////// PESTAÑAS //////////////////////////////////
///////////////////////////////////////////////////////////////////////
  var botones = ["Gráficos","Ofertas"];
  var attrGeneralesBotones = {
    'rx':2,
    'ry':2,
    'fill':'rgba(0,0,0,0.65)',
    'stroke':'black',
    'stroke-width':0
  };

  var attrGeneralesTexto = {
    'fill':'white',
    'font-size':11,
    'font-weight':300,
    'text-anchor':'middle',
    'alignment-baseline':'central'
  };

  var pests = d3.select("svg#pestañas").append("g")
	.selectAll("rect")
	.data(botones).enter()
	.append("rect")
	.attr(attrGeneralesBotones)
    .attr({
      'class':'boton',
      'id':function(d,i) {
	var id = d.split(" ").reduce(function sum(a,b) { return a + "_" + b; });
	return id;
      },
      'width':function(d,i) {
	return 60;
      },
      'height':function(d,i) {
	var h = +d3.select("svg#pestañas").style("height").split("px")[0];
	return h - 5;
      },
      'x':function(d,i) {
	var w = +d3.select(this).attr("width").split("px")[0]// + 5;
	return 2 + (w+3)*i;
      },
      'y':function(d,i) {
	return 3;
      }
    });

  var textoPests = d3.select("svg#pestañas").append("g")
	.selectAll("text")
	.data(botones).enter()
	.append("text")
	.attr(attrGeneralesTexto)
    .attr({
      'x':function(d,i) {
	var id = d.split(" ").reduce(function sum(a,b) { return a + "_" + b; });
	var sel = d3.select("rect#" + id);
	var x = +sel.attr("x").split("px")[0];
	var offset = +sel.attr("width").split("px")[0];
	return x + offset/2;
      },
      'y':function(d,i) {
	var id = d.split(" ").reduce(function sum(a,b) {
	  return a + "_" + b;
	});
	var sel = d3.select("rect#" + id);
	var x = +sel.attr("y").split("px")[0];
	var offset = +sel.attr("height").split("px")[0];
	return x + offset/2;
      }
    }).text(function(d) { return d; })
    .on("mouseover",function() {
      d3.select(this).style("cursor","pointer");
    })
    .on("click",function(d) {
      var colorBarras = "rgba(255,15,0,0.65)";
      d3.selectAll("rect.boton").attr("fill","rgba(0,0,0,0.65)");
      d3.selectAll("rect.boton").attr("tag",null);
      d3.selectAll("rect.boton").attr("stroke-width","0px");
      var id = d.split(" ").reduce(function sum(a,b) { return a + "_" + b; });
      d3.select("#" + id).attr("fill",colorBarras).attr("stroke-width","0.5px");
      if(d == "Ofertas") {
	OFERTAS();
	console.log(OFERTAS_);

	var TABLA;
        var TABLA1 = ofertas.filter(function(d) {
	  return +d.ID_EMPRESA == +id_empresa;
	});

	if(TABLA1.length == 0) {
	  TABLA = OFERTAS_.filter(function(d) {
	    return +d.ID_EMPRESA == +id_empresa;
	  });
	} else {
	  TABLA = TABLA1;
	};
	console.log(TABLA)
	RenderTablaEmpresa(TABLA);
      };

      if(d == "Gráficos") {
	//GRAFICOS();
      };

    });

    d3.select("#Gráficos")
	.attr("fill","rgba(255,15,0,0.65)")
	.attr("stroke-width","0.5px");
///////////////////////////////////////////////////////////////////////////
/////////////////////// TABLA-EMPRESA ////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

  function RenderTablaEmpresa(TABLA) {
	 d3.select("table#tBody")
	  .selectAll("tr").data(TABLA).enter()
	  .append("tr")
	.attr("class","datosMod")
	.attr("id","new")
	  .style("font-weight","lighter")
	  .html(function(d,i) {
	    var ronda = d.RONDA;
	    var licitacion = d.LICITACION;
	    var bloque = d.ID_BLOQUE;
	    var licitantes = d.ID_LICITANTE_OFERTA;
	    var VPO = Number(d.VPO).toFixed(1);

	    var HIDRO_PRINCIPAL = tabla.filter(function(o) {
	      return o.ID_BLOQUE == bloque;
	    })[0].HIDRO_PRINCIPAL;

	    if(VPO == 0) VPO = "-"
	   
	    var str = "<th>"+ronda + "-" + licitacion +"</th>" +
		     "<th>" + bloque + "</th>" +
		     "<th>"+ HIDRO_PRINCIPAL +"</th>"+
		     "<th>"+ licitantes +"</th>"+
		     "<th>"+ d.VAR_ADJ1 +"</th>" +
		     "<th>"+ d.VAR_ADJ2 +"</th>" +
		     "<th>"+ VPO +"</th>" +
		     "<th>"+ d.BONO +"</th>";
	    return str;
	    });
  };
/*
	   var cell = d3.select("th#licitantes[tag='"+i+"']");
	   if(licitantes.length > 1) {
	    cell.append("ul")//.style("list-style","none")
	      .selectAll("li")
		.data(licitantes).enter()
	      .append("li").html(function(d,i) { return (i+1) + ") " + d; })
		.style("font-size","8.5px");
	   } else {
	     cell.html("-")
	   };
*/
///////////////////////////////////////////////////////////////////////////
/////////////////////// TABLA-EMPRESA ////////////////////////////////////
/////////////////////////////////////////////////////////////////////////


}

function plantillaEmpresa1(d,adj,data,licRondas,pmts) {
	var plantilla = '<div id="titulo" class="NombreEmpresa" style="height: 15%; padding-top: 18px;">Nombre de la empresa   <div id="nombre" class="NombreEmpresa"></div>  </div>  <div id="titulo" class="PaisEmpresa" style="height: 15%; padding-top: 18px;">País   <div id="pais" class="PaisEmpresa"></div>  </div>  <div id="titulo" class="ModalidadEmpresa" style="height: 15%; padding-top: 18px;">Bloques adjudicados  <table id="adjudicaciones">   <tbody><tr id="titulos">    <th clas="old">No. de bloques</th>    <th class="old">Modalidad</th>    <th class="old">Licitantes</th>    <th class="old">Inversión total<br><span>(millones de dólares)</span></th> <th class="old">Área<br><span>(km<sup>2</sup>)</span></th>   </tr>  </tbody></table>   <div class="totalBloques" style="padding: 0px;">  </div>';

	if(d3.select("div#temporal")[0][0]) d3.select("div#temporal").remove()

  	if(!d3.select("div#info>div#titulo")[0][0]){
    	  d3.select("#info")
	    .append("div").attr("id","temporal")
	    .html(plantilla);
  	}

	d3.selectAll(".datosMod").remove();

	d3.select("div#nombre").html("-");
	d3.select("div#pais").html("-");
        function filtroEmp(E) { return +E.ID_EMPRESA == +d.id; };
	var objAdj = adj.filter(filtroEmp);
	var objEmp = data.filter(filtroEmp);

	d3.select("div#nombre").html(objEmp[0].EMPRESA);
	d3.select("div#pais").html(objEmp[0].PAIS);

	for(var i in objAdj) {
	 var licitantes = licRondas.filter(function(d) {
	  var cond1 = objAdj[i].ID_LICITANTE_ADJ == d.ID_LICITANTE_ADJ;
	  var cond2 = objAdj[i].ID_LICITANTE_ADJ == d.ID_LICITANTE_OFERTA;
	  return cond1 && cond2;
	 })[0].LICITANTE;

	 d3.select("table#adjudicaciones>tbody")
	  .append("tr").attr("class","datosMod")
	  .style("font-weight","lighter")
	  .html(function(d) {
	   var n = objAdj[i].ADJUDICADOS;
	   var mod = objAdj[i].MODALIDAD;
	   var inv = Number(objAdj[i].INV_TOTAL).toFixed(1);
	   var ar = Number(objAdj[i].AREA).toFixed(1);
	   
	   var str = "<th class='old'>"+n+"</th>" +
		     "<th class='old'>"+mod+"</th>" +
		     "<th class='old' id='licitantes' tag="+ i +"></th>"+
		     "<th class='old'>"+inv+"</th>"+
		     "<th class='old'>"+ar+"</th>";
	   return str;
	   });

	   var cell = d3.select("th#licitantes[tag='"+i+"']");
	   if(licitantes.length > 1) {
	    cell.append("ul")//.style("list-style","none")
	      .selectAll("li")
		.data(licitantes).enter()
	      .append("li").html(function(d,i) { return (i+1) + ") " + d; })
		.style("font-size","8.5px");
	   } else {
	     cell.html("-")
	   };
	};

	var total = objAdj.map(function(d) { return d.ADJUDICADOS; })

	if(total.length == 0)  {
	  total = 0;
	} else {
	  total = total.reduce(function sum(a,b) { return +a + +b; });
	  
	};

	total = "<span style=font-size:60px;font-weight:600;>" + total + "</span>"
	  + "<span style=font-size:12px><br>en total</span>"
	d3.select(".totalBloques").html(total);
	var filtroPmts = pmts.filter(function(p) { return d.id == p.id; });
	//console.log(filtroPmts)//[0].pmt)
}

function calculoSumas(licRondas,ofertas,adj,RONDA_LIC,procesos,data,tabla) {
  var FILTRO1;
  var FILTRO2;
  var FILTRO3;
  var FILTRO4;
  var FILTRO5;

  var bloques1 = _.uniq(ofertas,"ID_BLOQUE");
  var bloques2 = _.uniq(licRondas,"ID_BLOQUE");
  var empresasPreLic = _.uniq(procesos,"EMPRESA");

  var lics = licRondas.filter(function(d) {
    return d.ID_LICITANTE_OFERTA != "";
  });

  if(!RONDA_LIC) {
    FILTRO1 = bloques1;
    FILTRO2 = bloques2;
    FILTRO3 = lics;
    FILTRO4 = empresasPreLic;
    FILTRO5 = tabla;
  } else {
    if(typeof(RONDA_LIC) != 'object') {
      FILTRO1 = bloques1.filter(function(d) {
       return d.RONDA == RONDA_LIC;
      });
      FILTRO2 = bloques2.filter(function(d) {
       return d.RONDA == RONDA_LIC;
      });
      FILTRO3 = lics.filter(function(d) {
       return d.RONDA == RONDA_LIC;
      });
      FILTRO4 = procesos.filter(function(d) {
       return d.RONDA == RONDA_LIC;
      });
      FILTRO5 = procesos.filter(function(d) {
       return d.RONDA == RONDA_LIC;
      });
    } else {
      if(!RONDA_LIC.length) {
// SI ES VERDAD QUE LA DISTANCIA DEL OBJETO NO EXISTE (ES UN DICCIONARIO)
        FILTRO1 = bloques1.filter(function(d) {
          return d.RONDA == RONDA_LIC.ronda && d.LICITACION == RONDA_LIC.lic;
        });
        FILTRO2 = bloques2.filter(function(d) {
          return d.RONDA == RONDA_LIC.ronda && d.LICITACION == RONDA_LIC.lic;
        });
        FILTRO3 = lics.filter(function(d) {
          return d.RONDA == RONDA_LIC.ronda && d.LICITACION == RONDA_LIC.lic;
        });
        FILTRO4 = procesos.filter(function(d) {
          return d.RONDA == RONDA_LIC.ronda && d.LICITACION == RONDA_LIC.lic;
        });
        FILTRO5 = procesos.filter(function(d) {
          return d.RONDA == RONDA_LIC.ronda && d.LICITACION == RONDA_LIC.lic;
        });
      } else {
// SI ES VERDAD QUE LA DISTANCIA DEL OBJETO SÍ EXISTE (ES UN ARRAY)
	FILTRO1 = []; FILTRO2 = []; FILTRO3 = []; FILTRO4 = [], FILTRO5 = [];
	for(var j in RONDA_LIC) {
          var temp1 = bloques1.filter(function(d) {
          return d.RONDA == RONDA_LIC[j].ronda
		&& d.LICITACION == RONDA_LIC[j].lic;
          });
          var temp2 = bloques2.filter(function(d) {
          return d.RONDA == RONDA_LIC[j].ronda
		&& d.LICITACION == RONDA_LIC[j].lic;
          });
          var temp3 = lics.filter(function(d) {
          return d.RONDA == RONDA_LIC[j].ronda
		&& d.LICITACION == RONDA_LIC[j].lic;
          });
          var temp4 = procesos.filter(function(d) {
          return d.RONDA == RONDA_LIC[j].ronda
		&& d.LICITACION == RONDA_LIC[j].lic;
          });
          var temp5 = tabla.filter(function(d) {
          return d.RONDA == RONDA_LIC[j].ronda
		&& d.LICITACION == RONDA_LIC[j].lic;
          });

	  FILTRO1 = FILTRO1.concat(temp1);
	  FILTRO2 = FILTRO2.concat(temp2);
	  FILTRO3 = FILTRO3.concat(temp3);
	  FILTRO4 = FILTRO4.concat(temp4);
	  FILTRO5 = FILTRO5.concat(temp5);
	};
      };
    };
  };

  var empresas = [];
  FILTRO3.forEach(function(d) {
    var ss = data.filter(function(e) {
	return e.ID_LICITANTE == d.ID_LICITANTE_OFERTA;
    }).map(function(d) { return d.ID_LICITANTE;});
    empresas = empresas.concat(d.LICITANTE);
  });

  empresas = empresas.reduce(function(a,b) {
    if( a.indexOf(b) < 0) { a.push(b); };
    return a;
  },[]);

  var inv_pmt = FILTRO1.map(function(d) { return d.PMT_TOTAL; }).reduce(SUM);
  var area = FILTRO1.map(function(d) { return d.AREA; }).reduce(SUM);
  var bloquesAdjudicados = FILTRO2.filter(function(d) {
    return d.ID_LICITANTE_ADJ != "";
  });
  var EmpS = _.uniq(FILTRO4,"EMPRESA");

  var empresas_interesadas = EmpS.length;

  var empresas_precalif = EmpS.filter(function(d) {
    return d.PRECALIF == 1;
  }).length;

  var dataroom = EmpS.filter(function(d) {
    return d.DATAROOM == 1;
  }).length;


  var ofertasValidas = _.groupBy(FILTRO5,"ID_BLOQUE");
  var cuentaOfertas = [];
  for(var k in ofertasValidas) {
    cuentaOfertas.push(ofertasValidas[k].length);
  };
  ofertasValidas = d3.mean(cuentaOfertas).toFixed(1);

  pre = [
   { 'key':'Empresas interesadas', 'val':empresas_interesadas },
   { 'key':'Empresas precalificadas', 'val':empresas_precalif },
   { 'key':'Bloques ofertados', 'val':FILTRO2.length },
   { 'key':'Empresas adquirieron datos','val':dataroom }
// { key:'Inversión comprometida',val:(inv_pmt / 1000).toFixed(0) + "K" },
// { key:'Área (km\u00B2)',val:+area.toFixed(1) }
  ];

  after = [
   { 'key':'Inversión comprometida','val':(inv_pmt/1000).toFixed(0) + "K" },
   { 'key':'Bloques adjudicados', 'val':bloquesAdjudicados.length },
   { 'key':'Área adjudicada (km\u00B2)', 'val':+area.toFixed(1) },
   { 'key':'Empresas que participaron', 'val':empresas.length },
   { 'key':'Promedio de ofertas por bloque', 'val':ofertasValidas }
  ];

  return { 'pre': pre, 'after':after };
};

function OFERTAS(RenderTablas) {
var tablaString =
'<div id="Tabla">' +
 '<div id="tHeadContainer">'+
  '<table id=tHead>'+

'<tr id="new">'+
 '<th>Ronda/Licitación</th>'+
 '<th>Bloque</th>'+
 '<th>Hidrocarburo esperado</th>' +
 '<th>Licitante</th>'+
 '<th>Variable de adjudicación 1</th>'+
 '<th>Variable de adjudicación 2</th>'+
 '<th>VPO</th><th>Bono</th>'+
'</tr>'+
  '</table>' +
 '</div>' + 

'<div id="tBodyContainer">' +
 '<table id="tBody">' +

 '</table>'+
'</div>' +
'</div>';

  d3.select("#Tabla").remove();
  d3.select("#graficos").html("");
  var hT = +d3.select("#titulo").style("height").split("px")[0];
  d3.select("#graficos").style("height",function() {
    var newHeight = window.innerHeight - hT - cintilla;
    return newHeight + "px";
  });
  d3.select("#graficos").html(tablaString);
};
