var widLic_ = '300px';

function resumen(data,adj,licRondas,pmts,ofertas,RONDA_LIC,tabla,procesos) {
  if(d3.select("div#temporal")[0][0]) d3.select("div#temporal").remove()
// HABRÁ QUE FILTRAR POR RONDA Y LICITACIÓN PARA REUTILIZAR ESTA FUNCIÓN.
  var TABLA;
  var FILTRO;
  var colorBarras = "rgb(8,109,115)"//"rgba(255,15,0,0.65)"
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
        texto.resumen = "Seleccione una o más rondas para ver resumen."//"RONDA " + RONDA_LIC.ronda + " - LICITACIÓN "+ RONDA_LIC.lic;
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

 var contenidoSumas = SUMAS.pre.filter(function(d) { return !d.ignorar; });

 var nums = sumas.append("g").selectAll("text")
  .data(contenidoSumas).enter()
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
     var objLength = Object.keys(contenidoSumas).length;
     return (width / objLength*i) + (width/objLength/2);
   })
   .attr("y",function() {
     var height = +d3.select("svg#sumas").style("height").split("px")[0];
     return height / 2;
   }).text(function(d) { return d.val; });

 var tits__ = contenidoSumas.map(function(d) { return d.key; });
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
      d3.select("#espacioParaBoton").remove()

      d3.select("#graficos").html(contenido);

      var hT = +d3.select("#titulo").style("height").split("px")[0];
      var alturaGraficas = (window.innerHeight - cintilla - hT) *.5;

      d3.select("#mitades").style("height",alturaGraficas + "px");
      d3.select("#barras").style("height",alturaGraficas + "px");
	var bOf = SUMAS.pre.filter(function(d) {
	  return d.key == "Bloques ofertados";
	})[0].val;

	var bAdj = +SUMAS.pre.filter(function(d) {
	  return d.key == "Área adjudicada";
	})[0].val;

	var bNoAdj = +SUMAS.pre.filter(function(d) {
	  return d.key == "Área no adjudicada";
	})[0].val;

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

        var lic_ADJ = SUMAS.pre.filter(function(d) {
	  return d['key'] == 'Licencia adjudicados'
	})[0];

        var com_ADJ = SUMAS.pre.filter(function(d) {
	  return d['key'] == 'Producción compartida adjudicados'
	})[0];

        var lic_noADJ = SUMAS.pre.filter(function(d) {
	  return d['key'] == 'Licencia no adjudicados'
	})[0];

        var com_noADJ = SUMAS.pre.filter(function(d) {
	  return d['key'] == 'Producción compartida no adjudicados'
	})[0];



	var serieEmpresas = [
	  ['Producción compartida no adjudicados',com_noADJ.val.length],
	  [lic_noADJ.key,lic_noADJ.val.length],
	  ['Producción compartida adjudicados',com_ADJ.val.length],
          [lic_ADJ.key,lic_ADJ.val.length]
	];

	Highcharts.setOptions({
	  colors: ['rgba(0,0,0,0.2)','rgba(0,0,0,0.35)','rgba(8,109,115,0.7)','rgba(8,109,115,1)']
	});

	var empresas_precalif = Highcharts.chart({ 
	    exporting: {
		enabled:true,
		type:'image/jpeg',
		filename:'contratos',
		buttons: {
		  contextButton: {
		    menuItems: [
			{
			  'text':'Exportar gráfica (JPEG)',
			  'onclick': function() {
			     this.exportChart();
			  }
			}
		    ]
		  }
		}
	    },
	    credits: { enabled:false },
            chart: {
                renderTo: 'mitad1',
                type: 'pie'
            },
           title: {
                text: "CONTRATOS",
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
	    legend: {
		width:200,
//		itemWidth:250,
		itemStyle: {
		  fontSize:'11px'
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
		    distance:2,
		    style: {
		      'font-family':'Open Sans, sans-serif',
		      'font-size':7,
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
    return d.key == 'Inversión'
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
//	var T = String(d.val).split("K");
//	if(T.length == 1) T = Number(T[0]).toLocaleString('es-MX');
//        if(T.length ==2) T = Number(T[0]).toLocaleString('es-MX') + "K";
//	return T;
	return Number(d.val).toLocaleString('es-MX');
   });

  figuras.transition().duration(1000).attr("opacity",1);

  medio.append("g").selectAll("text")
   .data(valores).enter()
   .append("text")
   .attr("tag",function(d) { return d.key; })
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

  var MM_ = d3.select('text[tag="Inversión"]')
	.node()

  d3.select(MM_.parentNode).append("text")
  .attr("text-anchor","middle")
  .attr('alignment-baseline','text-before-edge')
  .attr('font-weight',600)
  .attr('font-size',12)
  .attr('fill',colorBarras)
  .attr("x",function() {
    var x = +d3.select('#mitad2').style("width").split("px")[0];
    return x/2;
  })
  .attr("y",MM_.getBBox().y + MM_.getBBox().height + 4)
  .text("(millones de dólares)");

//////////////////////////////////////////////////////////////////////////
	Highcharts.setOptions({
	  colors: [colorBarras,'rgba(0,0,0,0.35)']
	});


	var barras = Highcharts.chart('barras', {
	    exporting: {
		enabled:true,
		type:'image/jpeg',
		filename:'países',
		buttons: {
		  contextButton: {
		    menuItems: [
			{
			  'text':'Exportar gráfica (JPEG)',
			  'onclick': function() {
			     this.exportChart();
			  }
			}
		    ]
		  }
		}
	    },
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
		    text: '<b>Empresas por país</b>',
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
	    exporting: {
		enabled:true,
		type:'image/jpeg',
		filename:'superficie',
		buttons: {
		  contextButton: {
		    menuItems: [
			{
			  'text':'Exportar gráfica (JPEG)',
			  'onclick': function() {
			     this.exportChart();
			  }
			}
		    ]
		  }
		}
	    },
	    credits: { enabled:false },
            chart: {
                renderTo: 'mitad3',
                type: 'pie'
            },
           title: {
                text: "SUPERFICIE",
		style: {
		  'font-family':'Open Sans, sans-serif',
		  'font-weight':600,
		  'font-size':16
		}
            },
	   subtitle: { text: "(miles de km\u00B2)" },
           tooltip: {
                formatter: function() {
                    return '<b>'+ this.point.name +'</b>: '+ this.y.toLocaleString('es-MX');
                }
            },
            series: [{
                name: 'Bloques',
                data: [["Adjudicada",bAdj],["No adjudicada",bNoAdj]],
                size: '90%',
                innerSize: '65%',
                showInLegend:true,
                dataLabels: {
                    enabled: true,
		    distance:2,
		    style: {
		      'font-family':'Open Sans, sans-serif',
		      'class':"ll",
		      'font-weight':'light',
		      'font-size':8,
		      'color':"black",
		      'stroke-width':"0px"
		    },
		    formatter: function() {
		      return this.y.toLocaleString('es-MX');
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
  TABLA = TABLA.filter(function(d) { return d.VAR_ADJ1 != ""; })
  function RenderTabla(widLic) {
	 d3.select("table#tBody")
	  .selectAll("tr").data(TABLA).enter()
	  .append("tr")
	.attr("class","datosMod")
	.attr("id","new")
	  .style("font-weight","lighter")
	  .html(function(d,i) {
	   let bono = Number((d.BONO / 1000).toFixed(1)).toLocaleString('es-MX');
	   var ronda = d.RONDA;
	   var licitacion = d.LICITACION;
	   let ron_lic = ronda + "-" + licitacion;
	   ron_lic = licitacion == 'ASOCIACIÓN' ? 'TRIÓN' : ron_lic;

	   var bloque = d.ID_BLOQUE;

	   if(bloque.split("-").length > 2) {
	     bloque = bloque
		.split("-").slice(1,bloque.split("-").length)
		.reduce(function(a,b) { return a + "-" + b; });
	   } else {
	     bloque = bloque.split("-")[1];
	   };

	   bloque = bloque == 'TRION' ? 'TRIÓN' : bloque;

	   var licitantes = d.ID_LICITANTE_OFERTA;

	   var nombresLics = licRondas.filter(function(l) {
	      return l.ID_LICITANTE_OFERTA == licitantes;
	   })[0].LICITANTE
	   .map(function(e) {
	      var e_ = e.split(",")[0];
	      return "- " + e_;
	   })
	   .reduce(function(a,b) {
	      return a + "<br>" + b;
	   });

	   var VPO = Number(d.VPO).toFixed(1);

	  if(VPO == 0) VPO = "-"
	   
	   var str = "<th>"+ ron_lic +"</th>" +

		     "<th>" + bloque + "</th>" +
//		     "<th>"+ d.HIDRO_PRINCIPAL +"</th>"+
  "<th id='licitantes' style='width:"+widLic+"; font-size:12px; padding-left:20px'>"+ nombresLics +"</th>"+
//	"<th style='width:" + widLic + "'>"+ nombresLics +"</th>"+
		     "<th>"+ d.VAR_ADJ1.toLocaleString('es-MX') +"</th>" +
		     "<th>"+ d.VAR_ADJ2.toLocaleString('es-MX') +"</th>" +
		     "<th>"+ VPO.toLocaleString('es-MX') +"</th>" +
		     "<th>"+ bono.toLocaleString('es-MX') +"</th>";
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
	.attr("fill","rgb(8,109,115)")
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
	var widLic = widLic_;
	OFERTAS(widLic);
	RenderTabla(widLic);
      };

      if(d == "Gráficos") {
	GRAFICOS();
      };

    });

////////////////////////////////////////////////////////////////////////////---------------- PESTAÑAS ---------------------------------------------------
/////////////////////////////////////////////////////////////////////////////////


};


function plantillaEmpresa(d,adj,data,licRondas,pmts,tabla,procesos,ofertas,OFERTAS_) {
  var id_empresa = d.id;
  if(d3.select("div#temporal")[0][0]) d3.select("div#temporal").remove();

  function filtroEmp(E) { return +E.ID_EMPRESA == +d.id; };
  var objAdj = adj.filter(filtroEmp);
  var objEmp = data.filter(filtroEmp);

  var contenido =
    '<div id="mitades" style="">'+
     '<div id="mitad1" style="float:left;clear:left;width:80%;background-color:rgba(0,0,0,0.1); display:table; margin:0 auto;"></div>' +
   //  '<div id="mitad2" style="float:left;width:70%; background-color:rgba(0,0,0,0.15)">'+
//        '<svg style="width:100%;height:inherit;"></svg>'+
     '</div>' +
    '</div>' +
    '<div id="gantt" style="padding:0px;width:100%;background-color:transparent"></div>';

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

//---------- DIMENSIONES DE APARTADOS PARA GRÁFICAS ----------------------//
  var titulo = d3.select("#temporal>#titulo")
  var titHeight = +titulo.style("height").split("px")[0];
  var titPad = +titulo.style("padding-top").split("px")[0];
  var titT = titHeight //+ titPad;
  var espacioDisp = window.innerHeight - titT - cintilla;
  d3.select("div#mitades").style("height",(espacioDisp/2) + "px");
  d3.selectAll("div#mitades>div").style("height","100%");
  d3.select("div#gantt").style("height",(espacioDisp/2) + "px");

//---------- DIMENSIONES DE APARTADOS PARA GRÁFICAS ----------------------//

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
////////////////////////// INVERSIÓN COMPROMETIDA ///////////////////////

  var inv_pmt = ofertas.filter(function(e) {
    return +d.id == +e.ID_EMPRESA;
  }).filter(function(d) { return d.PMT_TOTAL; });

  if(inv_pmt.length != 0) {
    inv_pmt = inv_pmt.map(function(d) { return d.PMT_TOTAL; })
    .reduce(SUM);
  } else {
    inv_pmt = 0;
  };
////////////////////////////////////////////////////////////////////////

  var area;
  if(objAdj.length != 0) {
    area = objAdj.map(function(d) { return +d.AREA; }).reduce(SUM)
    .toFixed(1);
  } else {
    area = 0;
  };


  var filtroLic = data.filter(function(e) {
    return +e.ID_EMPRESA == +id_empresa;
  }).map(function(d) { return d.ID_LICITANTE; });

  var licsEmpresa = tabla.filter(function(e) {
    return this.indexOf(e.ID_LICITANTE_OFERTA) >= 0;
  },filtroLic);


  var SUMAS = [
    { 'key':'Bloques adjudicados', 'val':total },
    { 'key':'Área adjudicada (km\u00B2)','val':area },
    { 'key':'Inversión (dólares)', 'val':inv_pmt },
//    { 'key':'No. de ofertas', 'val':licsEmpresa.length }
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
      if( d3.select(this).attr("class") == "Inversión_(dólares)" ) {
	t = Number((d.val/1).toFixed(1)).toLocaleString('es-MX');
	t = "$ " + t;
      } else {
	t = Number(d.val).toLocaleString('es-MX');
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
      var colorBarras = "rgb(8,109,115)";
      d3.selectAll("rect.boton").attr("fill","rgba(0,0,0,0.65)");
      d3.selectAll("rect.boton").attr("tag",null);
      d3.selectAll("rect.boton").attr("stroke-width","0px");
      var id = d.split(" ").reduce(function sum(a,b) { return a + "_" + b; });

      d3.select("#" + id)
	.attr("fill",colorBarras)
	.attr("stroke-width","0.5px");



      var TABLA = OFERTAS_.filter(function(e) {
	return +id_empresa == e.ID_EMPRESA
      });

      TABLA = _.sortBy(TABLA,function(obj) { return obj.ID_BLOQUE; });

      if(d == "Ofertas") {
	var widLic = widLic_;
	OFERTAS(widLic);
	RenderTablaEmpresa(TABLA,widLic);
      };

      if(d == "Gráficos") {
	GraficosEmpresa(id_empresa,data,tabla,OFERTAS_,ofertas)
      };

    });

    d3.select("#Gráficos")
	.attr("fill","rgb(8,109,115)")
	.attr("stroke-width","0.5px");

///////////////////////////////////////////////////////////////////////////
/////////////////////// TABLA-EMPRESA ////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

  function RenderTablaEmpresa(TABLA,widLic) {
	 d3.select("table#tBody")
	  .selectAll("tr").data(TABLA).enter()
	  .append("tr")
	.attr("class","datosMod")
	.attr("id","new")
	  .style("font-weight",function(d) {
	    var cond = d.ID_LICITANTE_OFERTA == d.ID_LICITANTE_ADJ;
	    var weight = cond ? 600 : 300;
	    return weight;
	  })
	  .html(function(d,i) {
	    let bono = Number((d.BONO / 1000).toFixed(1)).toLocaleString('es-MX');
	    var ronda = d.RONDA;
	    var licitacion = d.LICITACION;
	    let ron_lic = ronda + "-" + licitacion;
	    ron_lic = licitacion == 'ASOCIACIÓN' ? 'TRIÓN' : ron_lic;
	    var bloque = d.ID_BLOQUE;

	     if(bloque.split("-").length > 2) {
	       bloque = bloque
		  .split("-").slice(1,bloque.split("-").length)
		  .reduce(function(a,b) { return a + "-" + b; });
	     } else {
	       bloque = bloque.split("-")[1];
	     };

	    bloque = bloque == 'TRION' ? 'TRIÓN' : bloque;
	    var licitantes = d.ID_LICITANTE_OFERTA;

	    var nombresLics = licRondas.filter(function(l) {
	      return l.ID_LICITANTE_OFERTA == licitantes;
	    })[0].LICITANTE
	    .map(function(e) {
	      var e_ = e.split(",")[0];
	      return "- " + e_;
	    })
	    .reduce(function(a,b) {
	      return a + "<br>" + b;
	    });


	    var VPO = Number(d.VPO).toFixed(1);
/*
	    var HIDRO_PRINCIPAL = tabla.filter(function(o) {
	      return o.ID_BLOQUE == bloque;
	    })[0].HIDRO_PRINCIPAL;
*/
	    if(VPO == 0) VPO = "-"
	   
	    var str = "<th>"+ ron_lic +"</th>" +
		     "<th>" + bloque + "</th>" +
//		     "<th>"+ HIDRO_PRINCIPAL +"</th>"+
  "<th id='licitantes' style='width:"+widLic+"; font-size:12px; padding-left:20px'>"+ nombresLics +"</th>"+
		     "<th>"+ d.VAR_ADJ1.toLocaleString('es-MX') +"</th>" +
		     "<th>"+ d.VAR_ADJ2.toLocaleString('es-MX') +"</th>" +
		     "<th>"+ VPO.toLocaleString('es-MX') +"</th>" +
		     "<th>"+ bono.toLocaleString('es-MX') +"</th>";
	    return str;
	    });


/*
	   var cell = d3.select("th#licitantes");
	   if(nombresLics.length > 0) {
	    cell.append("ul")//.style("list-style","none")
	      .selectAll("li")
		.data(licitantes).enter()
	      .append("li").html(function(d,i) { return (i+1) + ") " + d; })
		.style("font-size","8.5px");
	   } else {
	     cell.html("-")
	   };
*/
  };


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
  procesos = []
  var FILTRO1;
  var FILTRO2;
  var FILTRO3;
  var FILTRO4;
//  var FILTRO5;
  var FILTRO6;

  var bloques1 = _.uniq(ofertas,"ID_BLOQUE");
  var bloques2 = _.uniq(licRondas,"ID_BLOQUE");
  var empresasPreLic = _.uniq(procesos,"EMPRESA");

  var lics = licRondas.filter(function(d) {
    return d.ID_LICITANTE_OFERTA != "";
  });

//console.log(ofertas)

  if(!RONDA_LIC) {
    FILTRO1 = bloques1;
    FILTRO2 = bloques2;
    FILTRO3 = lics;
    FILTRO4 = empresasPreLic;
//    FILTRO5 = tabla;
    FILTRO6 = tabla;
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
//      FILTRO5 = procesos.filter(function(d) {
//       return d.RONDA == RONDA_LIC;
//      });
      FILTRO6 = tabla.filter(function(d) {
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
//        FILTRO5 = procesos.filter(function(d) {
//          return d.RONDA == RONDA_LIC.ronda && d.LICITACION == RONDA_LIC.lic;
//        });
        FILTRO6 = tabla.filter(function(d) {
          return d.RONDA == RONDA_LIC.ronda && d.LICITACION == RONDA_LIC.lic;
        });

      } else {
// SI ES VERDAD QUE LA DISTANCIA DEL OBJETO SÍ EXISTE (ES UN ARRAY)
FILTRO1 = []; FILTRO2 = []; FILTRO3 = []; FILTRO4 = []; FILTRO5 = []; FILTRO6 = [];
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
//          var temp5 = tabla.filter(function(d) {
//          return d.RONDA == RONDA_LIC[j].ronda
//		&& d.LICITACION == RONDA_LIC[j].lic;
//          });
          var temp6 = tabla.filter(function(d) {
          return d.RONDA == RONDA_LIC[j].ronda
		&& d.LICITACION == RONDA_LIC[j].lic;
          });

	  FILTRO1 = FILTRO1.concat(temp1);
	  FILTRO2 = FILTRO2.concat(temp2);
	  FILTRO3 = FILTRO3.concat(temp3);
	  FILTRO4 = FILTRO4.concat(temp4);
//	  FILTRO5 = FILTRO5.concat(temp5);
	  FILTRO6 = FILTRO6.concat(temp6);
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

  var contratos = FILTRO6.map(function(d) {
    var obj = {};
    obj['ID_BLOQUE'] = d.ID_BLOQUE;
    obj['CONTRATO'] = d.CONTRATO;
    obj['ID_LICITANTE_ADJ'] = d.ID_LICITANTE_ADJ;
    return obj;
  });

  contratos = _.uniq(contratos,'ID_BLOQUE');

  var contratosAdj = contratos.filter(function(d) {
    return d.ID_LICITANTE_ADJ;
  });

  var contratosNoAdj = contratos.filter(function(d) {
    return !d.ID_LICITANTE_ADJ;
  });

  var lic_Adj = contratosAdj.filter(function(d) {
    return d.CONTRATO == 'Licencia';
  });

  var lic_NoAdj = contratosNoAdj.filter(function(d) {
    return d.CONTRATO == 'Licencia';
  });

  var com_Adj = contratosAdj.filter(function(d) {
    return d.CONTRATO == 'Producción compartida';
  });

  var com_NoAdj = contratosNoAdj.filter(function(d) {
    return d.CONTRATO == 'Producción compartida';
  });

  var bloqs_ = _.uniq(FILTRO6,'ID_BLOQUE');

  var areaAdj = bloqs_.filter(function(d) {
    return d.ID_LICITANTE_ADJ != "";
  })
  .map(function(d) { return d.AREA; })
  .reduce(function(a,b) { return +a + +b; });

  var areaNoAdj = bloqs_.filter(function(d) {
    return d.ID_LICITANTE_ADJ == "";
  });

  if( areaNoAdj.length != 0 ) {
   areaNoAdj = areaNoAdj
    .map(function(d) { return d.AREA; })
    .reduce(function(a,b) { return +a + +b; });
  } else {
   areaNoAdj = 0;
  };

  var inv_pmt = FILTRO1.map(function(d) { return d.PMT_TOTAL; }).reduce(SUM);
  var area = FILTRO1.map(function(d) { return d.AREA; }).reduce(SUM);
  var bloquesAdjudicados = FILTRO2.filter(function(d) {
    return d.ID_LICITANTE_ADJ != "";
  });

  var empresas_adj = FILTRO6.filter(function(d) {
    return d.ID_LICITANTE_OFERTA == d.ID_LICITANTE_ADJ;
  }).map(function(e) { return e.EMPRESA; });

  var empresas_adj_uniq = _.uniq(empresas_adj).length;

  var EmpS_ = FILTRO6.map(function(d) { return d.EMPRESA; });
  var empresas_participantes = _.uniq(EmpS_).length;
  var EmpS = _.uniq(FILTRO4,"EMPRESA");

  var empresas_interesadas = EmpS.length;

  var empresas_precalif = EmpS.filter(function(d) {
    return d.PRECALIF == 1;
  }).length;

  var dataroom = EmpS.filter(function(d) {
    return d.DATAROOM == 1;
  }).length;


  var ofertasValidas = _.groupBy(FILTRO6,"ID_BLOQUE");

  var cuentaOfertas = [];
  for(var k in ofertasValidas) {
    var val = ofertasValidas[k].filter(function(d) {
      return d.VALIDEZ == 'VALIDA';
    });
    cuentaOfertas.push(val.length);
  };
  ofertasValidas = d3.mean(cuentaOfertas).toFixed(1);


  pre = [
   { 'key':'Empresas participantes', 'val':empresas_participantes },
   { 'key':'Empresas que adjudicaron', 'val':empresas_adj_uniq },
   { 'key':'Empresas interesadas', 'val':empresas_interesadas, 'ignorar':true },
   { 'key':'Empresas precalificadas', 'val':empresas_precalif, 'ignorar':true },
   { 'key':'Licencia adjudicados', 'val':lic_Adj, 'ignorar':true },
   { 'key':'Licencia no adjudicados', 'val':lic_NoAdj, 'ignorar':true},
   { 'key':'Producción compartida adjudicados', 'val':com_Adj, 'ignorar':true },
   { 'key':'Producción compartida no adjudicados','val':com_NoAdj,'ignorar':true},
   { 'key':'Bloques ofertados', 'val': FILTRO2.length },
   { 'key':'Bloques adjudicados','val': bloquesAdjudicados.length},//FILTRO1.length }
   {'key':'Área adjudicada','val':(areaAdj/1000).toFixed(1),'ignorar':true },
   {'key':'Área no adjudicada','val':(areaNoAdj/1000).toFixed(1), 'ignorar':true }
  ];

  after = [
   { 'key':'Inversión','val':(inv_pmt/1000000).toFixed(0) },
   { 'key':'Bloques adjudicados', 'val':bloquesAdjudicados.length },
   { 'key':'Área adjudicada (km\u00B2)', 'val':+area.toFixed(1) },
   { 'key':'Empresas que participaron', 'val':empresas.length },
   { 'key':'Promedio de ofertas por bloque', 'val':ofertasValidas }
  ];

  return { 'pre': pre, 'after':after };
};

  function descargar_CSV() {
    var csv = ["RONDA-LICITACION,BLOQUE,LICITANTE,VARIABLE DE ADJUDICACION 1,VARIABLE DE ADJUDICACION 2,VPO,BONO (MILES DE DOLARES)"];
    var rows = document.querySelectorAll("table tr.datosMod");

    for(var i = 0; i < rows.length; i++) {
      var row = [], cols = rows[i].querySelectorAll("th");
      var celda;

      for(var j = 0; j < cols.length; j++) {
	if(cols[j].id) {
	  celda = cols[j].innerHTML.replace("\n","/").replace(/amp;/g,"");
	  celda = celda.replace(/- /g,"");
	  celda = celda.replace(/<br>/g," / ")
	  celda = celda.replace(/Á/g,"A")
	  celda = celda.replace(/É/g,"E")
	  celda = celda.replace(/Í/g,"I")
	  celda = celda.replace(/Ó/g,"O")
	  celda = celda.replace(/Ú/g,"U")

	} else {
          celda = cols[j].innerText.replace(/-/g,".");
	  celda = celda.replace(/,/g,"");
	  celda = celda.replace(/Á/g,"A")
	  celda = celda.replace(/É/g,"E")
	  celda = celda.replace(/Í/g,"I")
	  celda = celda.replace(/Ó/g,"O")
	  celda = celda.replace(/Ú/g,"U")
	}
	row.push(celda);
      }

      csv.push(row.join(","));
    }
    csv = csv.join("\n");

//console.log(csv)

    var csvFile;
    var downloadLink;

    csvFile = new Blob([csv], {type:"text/csv"});
    downloadLink = document.createElement("a");
    downloadLink.download = "tabla.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "non";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
  };


function OFERTAS(widLic) {

  var boton_ = '<button onclick="descargar_CSV();" id="descargarCSV" style="color:black;border:2px;border-radius:2px;font-family:Open Sans;font-weight:300;text-shadow:0 1px 1px rgba(0,0,0,0.2);">Descargar</button>';

d3.select("#espacioParaBoton").remove()

d3.select("div#titulo").append("div")
  .attr("id","espacioParaBoton")
  .style("padding",0)
  .style("margin",0)
  .style("text-align","left")
//  .style("height","30px")
  .html(boton_)

var i_a = "a) La variable de adjudicación 1 se refiere al porcentaje que corresponde a la participación del Estado en caso de contratos de producción compartida, o a la regalía adicional en caso de contratos de licencia.<br><br>"

var i_b = "b) De la R1.1 a la R1.3 la variable de adjudicación 2 representa un porcentaje de incremento en la inversión del programa mínimo de trabajo, para las rondas posteriores esta variable se refiere al factor de inversión adicional."

var leyenda = '';
var tablaString =
'<div id="Tabla">' +
 '<div id="tHeadContainer">'+
  '<table id=tHead>'+

'<tr id="new">'+
 '<th>Ronda - Licitación</th>'+
 '<th>Bloque</th>'+
// '<th>Hidrocarburo esperado</th>' +
 '<th style="width:'+widLic+';">Licitante</th>'+
 '<th class="info" id="a">Variable de adjud. 1<sup style=color:red;cursor:pointer;>a</sup></th>'+
 '<th class="info" id="b">Variable de adjud. 2<sup style=color:red;cursor:pointer;>b</sup></th>'+
 '<th>VPO</th><th>Bono (miles de dólares)</th>'+
'</tr>'+
  '</table>' +
//  '<button onclick="descargar_CSV();" id="descargarCSV" style="position:absolute;color:black;border:2px;border-radius:2px;font-family:Open Sans;font-weight:300;text-shadow:0 1px 1px rgba(0,0,0,0.2);margin-top:2px;">Descargar</button>' +
 '</div>' + 
"<div class='notas' style='background-color:white;height:0px;color:transparent;line-height:14px;font-size:12px;font-weight:300;padding-bottom:0px;padding-left:20px;padding-right:20px;text-align:justify'>"+leyenda+"</div>" +
'<div id="tBodyContainer">' +
 '<table id="tBody">' +

 '</table>'+
'</div>' +
'</div>';

  d3.select("#Tabla").remove();
  d3.select("#graficos").html("");
  var hT = +d3.select("#titulo").style("height").split("px")[0];
  d3.select("#graficos").style("height",function() {
	    var newHeight = window.innerHeight - hT - cintilla - 50; /*altura de tabla*/
    return newHeight + "px";
  });
  d3.select("#graficos").html(tablaString);

  d3.selectAll(".info")
   .on("mouseover",function() {
     d3.select(".notas")
	.style("padding-top","30px")
	.style("margin-bottom","20px")
	.style("color","black")
	.style("height","40px");
   })
   .on("mouseout",function() {
     var sel_id = d3.select(this).attr("id")

     d3.select(".notas")
	.style("margin-bottom","0px")
	.style("color","transparent")
	.style("height","0px");

     d3.select("div.notas").html(function(d) {
	var text;
	text = sel_id == "a" ? i_a : i_b;
	return text
     })

   })

};

function GraficosEmpresa(id_empresa,data,tabla,OFERTAS_,ofertas) {
  d3.select("#espacioParaBoton").remove()

  var empNom = data.filter(function(d) {
	return d.ID_EMPRESA == id_empresa;
  })[0].EMPRESA;
/*------------------------- DATOS PARA STACKED ----------------------------*/
      var filtroLic = data.filter(function(e) {
	  return +e.ID_EMPRESA == +id_empresa;
      }).map(function(d) { return d.ID_LICITANTE; });


      var licsTOdas_ = tabla.filter(function(e) {
	return this.indexOf(e.ID_LICITANTE_OFERTA) < 0;
      },filtroLic);


      var licsEMpresa_ = tabla.filter(function(e) {
	return this.indexOf(e.ID_LICITANTE_OFERTA) >= 0;
      },filtroLic);

      licsEMpresa_ = OFERTAS_.filter(function(d) { return d.ID_EMPRESA == id_empresa })

//      licsEMpresa_ = licsEMpresa_.filter(function(d) {
//	return d.EMPRESA == empNom;
//      });

      var ganadas = licsEMpresa_.filter(function(d) {
	return d.ID_LICITANTE_OFERTA == d.ID_LICITANTE_ADJ
      });

//      ganadas = ganadas.filter(function(d) { return d.EMPRESA == empNom; })

      var noGanadas = licsEMpresa_.filter(function(d) {
	return d.ID_LICITANTE_OFERTA != d.ID_LICITANTE_ADJ
      });
//      noGanadas = noGanadas.filter(function(d) { return d.EMPRESA == empNom; });

      function AgruparOfertasPorLic(arr) {
	var newArr = [];
        for(var i in arr) {
	  newArr.push(arr[i])
	  newArr[i]["ronLic"] = "R" + newArr[i].RONDA + "." + newArr[i].LICITACION;
        };
	return _.countBy(newArr,'ronLic');
      };

      licsTodas = AgruparOfertasPorLic(licsTOdas_);
      licsEmpresa = AgruparOfertasPorLic(licsEMpresa_);
      ganadas = AgruparOfertasPorLic(ganadas);
      noGanadas = AgruparOfertasPorLic(noGanadas);

      var test0 = Object.keys(licsTodas).filter(function(e) {
	return this.indexOf(e) >= 0;
      },Object.keys(licsEmpresa)).sort();

      var dataForStacked = [];
      for(var k in test0) {
	var key = String(test0[k]);
	var obj = {
          'ron-lic':key,
	  'resto':licsTodas[key],
	  'empresa':licsEmpresa[key],
	  'ganadas':ganadas[key] ? ganadas[key] : 0,
	  'noGanadas':noGanadas[key] ? noGanadas[key] : 0
	};
        dataForStacked.push(obj);
      };

/*------------------------- DATOS PARA STACKED ----------------------------*/


/*------------------------- DATOS PARA TREEMAP ----------------------------*/
      var invComRon = ofertas.filter(function(e) {
        return id_empresa == +e.ID_EMPRESA;
      }).map(function(d) {
	var obj = {};
	obj["pmt"] = d.PMT_TOTAL;
        obj["bloque"] = d.ID_BLOQUE;
	obj["ron_lic"] = "R" + d.RONDA + "." + d.LICITACION;
	return obj;
      });

      var rondas_ = ofertas.map(function(d) {
	return "R" + d.RONDA + "." + d.LICITACION;
      });

      rondas_ = _.uniq(rondas_);

      invComRon = _.groupBy(invComRon,"ron_lic");
      rondas_r = d3.extent(rondas_.map(function(d,i) { return i; }))


      var colorS = d3.scale.linear()
	.domain(rondas_r)
	.range(["rgb(0,120,170)","rgb(5,63,66)"])
	.interpolate(d3.interpolateRgb)

      var dataForTree = [];
      for(var k in invComRon) {
	var obj_ = {};
	var ix;

	rondas_.forEach(function(d,i) {
	  if( d == k ) ix = i;
	});

	obj_["color"] = colorS(ix);
        obj_["id"] = "p_" + ix;
	obj_["name"] = k;
	dataForTree.push(obj_);

	invComRon[k].forEach(function(d) {
	  var obj = {};
	  obj["parent"] = "p_" + ix;
	  obj["value"] = d.pmt;
	  obj["name"] = d.bloque;

	  dataForTree.push(obj);

	});
      };

      function dataTreeMap(arr) {
	var colorAceite = 'rgba(255,15,0,0.65)';
	var colorGas = 'rgba(255,75,0,0.65)';
	var colorAmbos = 'rgba(255,205,0,0.65)';
        var GAS = new RegExp("GAS");
        var ACEITE = new RegExp("ACEITE");
	var conds = [];
	var data = [];

        for(var i in arr) {
          var cond1 = GAS.test(arr[i]);
	  var cond2 = ACEITE.test(arr[i]);
//	  var cond3 = cond1 && cond2;

	  var obj = {
	    'gas':cond1,
	    'aceite':cond2,
//	    'ambos':cond3,
	    'val':arr[i]
	  };

	  conds.push(obj);	
        };

	var aceite = conds.filter(function(d) {
	  return d.aceite //&& !d.ambos;
	}).map(function(d) { return d.val });

	var gas = conds.filter(function(d) {
	  return d.gas //&& !d.ambos;
	}).map(function(d) { return d.val; });

	var ambos = conds.filter(function(d) {
	  return d.ambos;
	}).map(function(d) { return d.val; });

	if(aceite.length > 0) {
	  var id = "aceite";
	  var name = "Aceite";
	  var color = colorAceite;
	  var Parent = { 'id':id, 'name':name, 'color':color };
	  data.push(Parent);

	  var aceites = _.countBy(aceite);

	  for(var k in aceites) {
	    data.push({ 'name':k, 'parent':id, 'value':aceites[k] });
	  };

	};
	if(gas.length > 0) {
	  var id = "gas";
	  var name = "Gas";
	  var color = colorGas;
	  var Parent = { 'id':id, 'name':name, 'color':color };
	  data.push(Parent);

	  var gases = _.countBy(gas);

	  for(var k in gases) {
	    data.push({ 'name':k, 'parent':id, 'value':gases[k] });
	  };

	};
/*	if(ambos.length > 0) {
	  var id = "ambos";
	  var name = "Aceite y gas";
	  var color = colorAmbos;
	  var Parent = { 'id':id, 'name':name, 'color':color };
	  data.push(Parent);

	  var amboss = _.countBy(ambos);

	  for(var k in amboss) {
	    data.push({ 'name':k, 'parent':id, 'value':amboss[k] });
	  };

	};
*/
	return data;	
      };


      var hidro_p = licsEMpresa_.map(function(d) {
	return d.HIDRO_PRINCIPAL;
      });
//      hidro_p = _.countBy(hidro_p);

      var data_TREE = dataTreeMap(hidro_p);
/*      var hidros = [];

      for(var k in hidro_p) {
        hidros.push([k,hidro_p[k]]);
      };*/
//console.log(data_TREE)
/*------------------------- DATOS PARA DONUT ----------------------------*/


  var contenido =
    '<div id="mitades" style="width:80%">'+
     '<div id="mitad1" style="background-color:rgba(0,0,0,0.1);"></div>' +
//     '<div id="mitad2" style="float:left;width:0%; background-color:rgba(0,0,0,0.15)">'+
//        '<svg style="width:100%;height:inherit;"></svg>'+
     '</div>' +
    '</div>' +
    '<div id="gantt" style="padding:0px;width:80%;background-color:rgba(0,0,0,0.2);"></div>';


  d3.select("div#graficos").html(contenido)
//---------- DIMENSIONES DE APARTADOS PARA GRÁFICAS ----------------------//
  var titulo = d3.select("#temporal>#titulo")
  var titHeight = +titulo.style("height").split("px")[0];
  var titPad = +titulo.style("padding-top").split("px")[0];
  var titT = titHeight //+ titPad;
  var espacioDisp = window.innerHeight - titT - cintilla;
  d3.select("div#mitades").style("height",(espacioDisp/2) + "px");
  d3.selectAll("div#mitades>div").style("height","100%");
  d3.select("div#gantt").style("height",(espacioDisp/2) + "px");

//---------- DIMENSIONES DE APARTADOS PARA GRÁFICAS ----------------------//

//---------------------------- GANTT CHART -------------------------------//
/*
  var gantt = Highcharts.chart('gantt',{
	    credits: { enabled:false },
	    exporting: { enabled: false },
	    chart: {
	        type: 'columnrange',
	        inverted: true
	    },
	    
	    title: {
	        text: ''
	    },
	    
		subtitle: {
	        text: ''
	    },
	
	    xAxis: {
	        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun' ]
	    },
	    
	    yAxis: {
	        title: {
	            text: ''
	        }
	    },
	
	    tooltip: {
	        valueSuffix: '°C'
	    },
	    
	    plotOptions: {
	        columnrange: {
	        	dataLabels: {
	        		enabled: true,
	        		formatter: function () {
	        	//		return this.y + '°C';
	        		}
	        	}
	        }
	    },
	    
	    legend: {
	        enabled: true
	    },
	
	    series: [{
	        name: 'Temperatures3',
	        data: [
                [0, 0, 5.6]
			]
	    },{
	        name: 'Temperatures',
	        data: [
                		[1, 6.7, 9.4],
				[2, 6.7, 8.5],
				[3, 6.5, 9.4],
				[3, 6.4, 19.9],
			]
	    },{
	        name: 'Temperatures2',
	        data: [
				[1, 9.4, 10.3],
				[3, 8.5, 11.9],
				[4, 9.4, 12.3],
				[3, 19.9,23.3],
			]
	    }]
	
	});
*/
//---------------------------- GANTT CHART -------------------------------//


//------------------------- STACKED-BARS -------------------------------//
  var maxPosible = dataForStacked.map(function(d) {
    return d.resto + d.empresa;
  });


  var licsEmpresa = tabla.filter(function(e) {
    return this.indexOf(e.ID_LICITANTE_OFERTA) >= 0;
  },filtroLic);

licsEmpresa = OFERTAS_.filter(function(d) { return d.ID_EMPRESA == id_empresa })

  maxPosible = d3.max(maxPosible);

  var stacked_bars = Highcharts.chart('mitad1', {
    credits: { enabled:false },
    exporting: {
	enabled:true,
	type:'image/jpeg',
	filename:'gráfico-ofertas',
	buttons: {
	 contextButton: {
          menuItems: [
	   {
	    'text':'Exportar gráfica (JPEG)',
	    'onclick': function() {
		this.exportChart();
	    }
	   }
	  ]
	 }
	}
    },

    chart: {
        type: 'column',
    },
    title: {
        text: '<b>Ofertas presentadas: ' + licsEmpresa.length + '</b>',
	style: {
	 'fontFamily':'Open Sans, sans-serif',
	 'font-weight':300,
	 'fontSize':16
	}
    },
    subtitle: {
        text: 'No. de ofertas por licitación',
	style: {
	 'fontFamily':'Open Sans, sans-serif',
	 'font-weight':300
	}
    },
    xAxis: {
        categories: dataForStacked.map(function(d) { return d['ron-lic']; })
    },
    yAxis: {
      labels: {
	style: {
	 'fontFamily':'Open Sans, sans-serif',
	 'font-weight':300
	}
      },
      min: 0,
//      max: maxPosible,
      tickInterval:2,
      title: {
        text: '',
        style: { fontFamily:'Open Sans, sans-serif' }
      }
    },
    legend: {
        reversed:false
    },
    plotOptions: {
        series: {
            stacking: 'normal'
        }
    },
    series: [
      {
        name: 'Ofertas ganadas',//data.filter(function(d) { return d.ID_EMPRESA == id_empresa; })[0].EMPRESA,//'Empresa',
        data: dataForStacked.map(function(d) { return d.ganadas; })
      },
      {
        name: 'Ofertas no ganadas',//'Resto',
        data: dataForStacked.map(function(d) { return d.noGanadas; })
      }
    ]
  });
//  d3.selectAll("#mitad1 path.highcharts-grid-line").remove()
//-----------------------------------------------------------------------//

//------------------------- DONA -------------------------------//
  var treemap = Highcharts.chart('gantt', {
    tooltip: {
      formatter: function() {
        return '<b>'+ this.point.name +'</b>: '+ this.point.value.toLocaleString("es-MX");
      }
    },
    credits: { enabled:false },
    exporting: {
	enabled:false,
	type:'image/jpeg',
	filename:'inversion-ronda-bloque',
	buttons: {
	 contextButton: {
          menuItems: [
	   {
	    'text':'Exportar gráfica (JPEG)',
	    'onclick': function() {
		this.exportChart();
	    }
	   }
	  ]
	 }
	}
    },
    series: [{
        livelIsConstant:false,
	allowDrillToNode:true,
        type: "treemap",
        layoutAlgorithm: 'sliceAndDice',
        alternateStartingDirection: true,
        levels: [{
            level: 1,
            layoutAlgorithm: 'sliceAndDice',
            dataLabels: {
//		color:"black",
                enabled: true,
                align: 'left',
                verticalAlign: 'top',
		width:10,
                style: {
		    fontFamily:'Open Sans, sans-serif',
                    fontSize: '15px',
                    fontWeight: '300',
		    width:10
                }
            }
        },
	{
            level: 2,
        //    layoutAlgorithm: 'sliceAndDice',
            dataLabels: {
		color:'black',
                enabled: false,
        //        align: 'left',
         //       verticalAlign: 'top',
                style: {
                    fontSize: '7px',
                    fontWeight: '300'
                }
            }
        }
	],
        data:dataForTree    }],
    title: {
        text: '<b>Inversión por Ronda-bloque</b>',
	style: {
	  fontSize:16,
	  fontFamily:'Open Sans, sans-serif',
	  fontWeight:300
	}
    },
    subtitle: {
	text:"(dólares)"
    }
  });

};
