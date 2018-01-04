var _ambiente_ = "local";
var widLic_ = '300px';

function img_from(file,ambiente) {
  var img_download_ = {
    'produccion': 'url(/images/estadistica/tablero-licitaciones/'+ file +'.svg)',
    'local': 'url(/img/'+ file +'.svg)'
  };
  return img_download_[ambiente];
};

function flags_dir(ambiente) {
  var dir = {
    'produccion':'images/estadistica/tablero-licitaciones/FLAGS/',
    'local':'img/flags/FLAGS/'
  };
  return dir[ambiente];
};

var _img_download_ = img_from("download",_ambiente_);
var _flags_dir_ = flags_dir(_ambiente_);
var lupita = img_from("glass_",_ambiente_);


  var pais_dict = {
   'ALEMANIA':'Germany',
   'ARGENTINA':'Argentina',
   'AUSTRALIA':'Australia',
   'BRASIL':'Brazil',
   'CANADÁ':'Canada',
   'CHILE':'Chile',
   'CHINA':'China',
   'COLOMBIA':'Colombia',
   'DINAMARCA':'Denmark',
   'EGIPTO':'Egypt',
   'ESPAÑA':'Spain',
   'ESTADOS UNIDOS':'United-States',
   'FRANCIA':'France',
   'HOLANDA':'Netherlands',
   'INDIA':'India',
   'ITALIA':'Italy',
   'JAPÓN':'Japan',
   'LUXEMBURGO':'Luxembourg',
   'MALASIA':'Malaysia',
   'MÉXICO':'Mexico',
   'NORUEGA':'Norway',
   'PANAMÁ':'Panama',
   'PORTUGAL':'Portugal',
   'REINO UNIDO':'United-Kingdom',
   'RUSIA':'Russia',
   'TAILANDIA':'Thailand',
   'URUGUAY':'Uruguay'
  };




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
    if(k != "") paisesData.push([k, paises[k]]);
  }

  paisesData.sort(function(a, b) {
    return b[1] - a[1];
  });

  var maxPaises = d3.max(paisesData,function(d) { return d[1]; });


     var contenido =
      '<div id="mitades" style="height:50%">'+
       '<div id="mitad1" style="float:left;clear:left;width:33%;height:100%"></div>' +
       '<div id="mitad2" style="float:left;width:33%;height:100%">'+

       '</div>' +
       '<div id="mitad3" style="float:left;width:33%;height:100%"></div>' +
      '</div>' +

//      '<div id="leyendaInv" style="width:inherit;height:20px;text-align:center;font-weight:400;font-size:9px;color:rgb(8,109,115);">*La inversión corresponde a los programas de inversión aprobados y, en caso de no contar con éste, a la inversión comprometida.</div>' +
      '<div id="barras" style="padding:0px;width:100%; height:50%"></div>';

          var plantilla = 
'<div id="titulo" style="height:15%; font-size:28px;">'+
  '<div style="padding:0px;height:15%">' + texto.resumen + '</div>' +
  '<div class="totalBloques" style="padding: 0px;height:75%;z-index:10000;">'+
    '<div id="sumas" style="padding-top:10px;width:100%;height:80px;background-color:transparent"></div>' +
    '<svg id="pestañas" style="width:100%;height:30px;z-index:500;"></svg>'
 +'</div>' +  
'</div>' +
'<div id="graficos" style="padding-top:30px;height:85%;z-index:1">' + 
  contenido + 
 '</div>' +
'</div>';

  d3.select("#info").append("div")
    .attr("id","temporal")
    .style("height","100%")
    .html(plantilla);


//------CÁLCULO DE SUMAS--------------//
var SUMAS = calculoSumas(licRondas,ofertas,adj,RONDA_LIC,procesos,data,tabla);
//-----------------------------------//

 var sumas = d3.select("div#sumas");

 var contenidoSumas = SUMAS.pre.filter(function(d) { return !d.ignorar; });

 var num = sumas.selectAll("div")
  .data(contenidoSumas).enter()
  .append("div")
  .style("clear",function(d,i) {
    var cl;
    if( i == 0 ) {
      cl = "left";
    } else {
      cl = null;
    };
    return cl;
  })
  .style("float","left")
  .style("text-align","center")
  .style("padding-top","10px")
  .style("font-weight","300")
  .style("width","25%")
  .html(function(d) {
    var txt = "<div style='color:rgba(0,0,0,0.5)'>" + d.val + "</div>"
    + "<div style='font-size:11px; font-weight:600'>"+ d.key +"</div>";
    return txt;
  });
//////////////////////////////////////////////////////////////////////////////
///////////////---- GRÁFICO PAÍSES ---- /////////////////////////////////////
////////////////////////////////////////////////////////////////////////////


  function GRAFICOS() {
      d3.select("#espacioParaBoton").remove()

      d3.select("#graficos").html(contenido);

      var hT = +d3.select("#titulo").style("height").split("px")[0];
      var alturaGraficas = (window.innerHeight - cintilla - hT) *.5;

//      d3.select("#mitades").style("height",alturaGraficas + "px");
//      d3.select("#barras").style("height",alturaGraficas + "px");
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
	    lang: { Descargar:'Descargar' },
	    exporting: {
		enabled:true,
		type:'image/jpeg',
		filename:'contratos',
		buttons: {
		  contextButton: { enabled:false },
		  myButton: {
		    symbol: _img_download_,//,'url(/images/estadisticas/tablero-licitaciones/download.svg)',
		    symbolX:19,
		    symbolY:18,
		    _titleKey:'Descargar',
		    menuItems: [
			{
			  'text':'Exportar datos (CSV)',
			  'onclick': function() {
			     csvGraf(this.getCSV(),"contratos",{rondas:RONDA_LIC});
			  }
			}
		    ]
		  }
		}
	    },
	    credits: { enabled:false },
            chart: {
                renderTo: 'mitad1',
                type: 'pie',
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
                size: '72%',
                innerSize: '65%',
                showInLegend:true,
                dataLabels: {
                    enabled: true,
		    distance:0,
		    style: {
		      'font-family':'Open Sans, sans-serif',
		      'fontSize':"10px",
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
  var medio = d3.select("#mitad2");

  medio.selectAll("div")
  

  var inv = SUMAS.after.filter(function(d) {
    return d.key == 'Inversión'
  })[0];

  var ofertasXbloque = SUMAS.after.filter(function(d) {
    return d.key == 'Promedio de ofertas por bloque';
  })[0];

  var area = SUMAS.after.filter(function(d) {
    return d.key == 'Área adjudicada (km\u00B2)';
  })[0];

  var valores = [area,inv,'',ofertasXbloque]

  medio.selectAll("div")
   .data(valores).enter()
   .append("div")
   .style("display","table")
   .style("width","100%")
   .style("height","25%")
   .attr("id",function(d,i) { return "D_" + i; })
   .html(function(d,i) {
      var txt = 
            '<div style="display: table-cell; vertical-align: middle;">'+
	      '<div style="text-align:center;" id="B_'+ i +'"></div>'+
	    '</div>'
      return txt;
   })


  d3.select("div#B_0")
  .html(function(d) {
   var txt = "<div style='font-size:20px;font-weight:800;'>"+
		Number(valores[0].val).toLocaleString("es-MX")+
	     "</div>"+
	     "<div style='font-size:11px;font-weight:400;'>"+ valores[0].key +"</div>"

   return txt;
  });


  d3.select("div#B_1")
  .html(function(d) {
   var txt = "<div style='font-size:30px;font-weight:800;color:"+colorBarras+"'>$"+
		Number(valores[1].val).toLocaleString("es-MX")+
	     "</div>"+
	     "<div style='font-size:12px;font-weight:700;color:"+colorBarras+"'>"+ valores[1].key +"*</div>"

   return txt;
  });

  d3.select("div#D_2")
   .style("display",null)

  d3.select("div#D_2>div")
   .style("display",null)

  d3.select("div#B_2")
  .html(function(d) {
   var txt = "<div style='font-size:10px;font-weight:600;color:"+colorBarras+"'>"+
		"(millones de dólares)"+
	     "</div>"+
	     "<div style='line-height:9.5px;font-size:9px;color:"+colorBarras+";'>"+ '* La inversión corresponde a los programas de inversión aprobados y, en caso de no contar con éste, a la inversión comprometida.' +"</div>"

   return txt;
  })

  d3.select("div#D_3")
   .style("display",null)

  d3.select("div#D_3>div")
   .style("display",null)


  d3.select("div#B_3")
  .html(function(d) {
   var txt = "<div style='font-size:20px;font-weight:800;'>"+
		Number(valores[3].val).toLocaleString("es-MX")+
	     "</div>"+
	     "<div style='font-size:11px;font-weight:400;'>"+ valores[3].key +"</div>"

   return txt;
  });

//////////////////////////////////////////////////////////////////////////
	Highcharts.setOptions({
	  colors: [colorBarras,'rgba(0,0,0,0.35)']
	});


	var barras = Highcharts.chart('barras', {
	    lang: { Descargar: "Descargar" },
	    exporting: {
		enabled:true,
		type:'image/jpeg',
		filename:'países',
		buttons: {
		  myButton: {
		    _titleKey:"Descargar",
		    symbol: _img_download_,//'url(/images/estadisticas/tablero-licitaciones/download.svg)',
		    symbolX:19,
		    symbolY:18,
		    menuItems: [
			{
			  'text':'Exportar datos (CSV)',
			  'onclick': function() {
			     csvGraf(this.getCSV(),'paises',{rondas:RONDA_LIC});
			  }
			}
		    ]

		  },
		  contextButton: {
		    enabled:false,
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
		  enabled:false,
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
		enabled:true,
		style: { color:"white",stroke:null },
		backgroundColor:colorBarras,
		borderColor:"transparent",
		pointFormat: '<b>{point.y:.0f}</b>'
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
		    rotation: 0,
		    color: 'black',
		    align: 'center',
//		    format: '{point.y:.1f}',
//		    y: -10,
//		    inside:false,
		    style: {
			fontSize: '13px',
			fontFamily: 'Open Sans',
//			stroke:'black',
//			strokeWidth:"1px"
		    }
		}
	    }]
	});

      d3.selectAll('.highcharts-grid-line').remove();

      var ing_ =SUMAS.pre
	.filter(function(d) { return d.key == 'Ingresos' })[0].val

	var bloques = Highcharts.chart({
	    xAxis: { categories:[''] },
	    yAxis: {
	      labels:{ enabled:false },
	      title: {
		text:'<b>Porcentaje</b>',
		style:{ fontFamily: 'Open Sans'},
	      }
	    },
	    lang: { 'Descargar':'Descargar' },
	    exporting: {
		enabled:true,
//		type:'image/jpeg',
//		filename:'ingresos',
		buttons: {
		  contextButton: {
		    symbol: _img_download_,//'url(/images/estadisticas/tablero-licitaciones/download.svg)',
		    symbolX:19,
		    symbolY:18,
		    _titleKey:"Descargar",
		    menuItems: [
			{
			  'text':'Exportar datos (CSV)',
			  'onclick': function() {
			     var csv_ = this.getCSV();
			     var noOfertas_VALIDAS = TABLA.filter(function(d) { return d.VALIDEZ == "VALIDA" }).length;
			     csv_ = csv_.split('\n');

			     for(var i in csv_) {
				if(i == 0) {
				  csv_[i] += ",NUMERO DE OFERTAS VALIDAS"
				} else {
				  csv_[i] += "," + noOfertas_VALIDAS;
				}

			     }
			     csv_ = csv_.join('\n');

			     console.log(csv_);
			     csvGraf(csv_,'ofertas_resumen',{rondas:RONDA_LIC});
			  }
			}
		    ]
		  }
		}
	    },
	    credits: { enabled:false },
            chart: {
                renderTo: 'mitad3',
                type: 'column'
            },
           title: {
                text: "OFERTAS",
		style: {
		  'font-family':'Open Sans, sans-serif',
		  'font-weight':600,
		  'font-size':16
		}
            },
	   subtitle: { text:'Promedio de ofertas ganadoras' },
//	   subtitle: { text: "(miles de km\u00B2)" },
           tooltip: {
                formatter: function() {
                    return '<b>'+ this.y.toFixed(2).toLocaleString('es-MX');
                }
            },
            series: [
		{
		 name:'Participación del Estado',
		 data:[ing_['Producción compartida']],
		 dataLabels: {
		   enabled:true,
		   formatter:function() { return this.y.toLocaleString('es-MX'); }
		 }
		},
		{
		 name:'Regalía adicional',
		 data:[ing_['Licencia']],
		 dataLabels: {
		  enabled:true,
		  formatter:function() { return this.y.toLocaleString('es-MX'); }
		 }
		}
/*                name: 'Bloques',
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
*/
            ]
        });

	d3.selectAll("tspan.highcharts-text-outline").remove()


  }; GRAFICOS();
/////////////////////////////////////////////////////////////////////////////////
///////////////---- GRÁFICO PAÍSES ---- ////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////////////////////////////
//------------------ TABLA ------------------------------------------------------
/////////////////////////////////////////////////////////////////////////////////
   TABLA = TABLA.filter(function(d) { return d.VALIDEZ != 'NO PRESENTA' });
   TABLA = TABLA.filter(function(d) { return d.VALIDEZ != 'SIN GARANTIA' });
//  TABLA = TABLA.filter(function(d) { return d.VAR_ADJ1 != ""; });

  TABLA = _.uniq(TABLA,function(v) {
    var ARR = [ v.BONO, v.ID_BLOQUE, v.ID_LICITANTE_ADJ, v.ID_LICITANTE_OFERTA, v.LICITACION, v.RONDA, v.VAR_ADJ1, v.VAR_ADJ2, v.VPO, v.VALIDEZ, v.CONTRATO, v.AREA,v.ronLic ]
    return ARR.join();
  })

  TABLA = _.sortBy(TABLA,"ID_BLOQUE")

  function RenderTabla(widLic) {
	 d3.select("table#tBody")
	  .selectAll("tr").data(TABLA).enter()
	  .append("tr")
	.attr("class","datosMod")
	.attr("id","new")
	.attr("tag",function(d) {
	  var ganadora;
	  if(d.ID_LICITANTE_OFERTA == d.ID_LICITANTE_ADJ) { 
	    ganadora = "ganadora";
	  }
	  return ganadora;
	})
	  .style("color",function(d) {
	    var color = "black";
	    if(d.VALIDEZ == "DESECHADA") {
		color = "gray";
	    } else if(d.ID_LICITANTE_OFERTA == d.ID_LICITANTE_ADJ && d.ID_LICITANTE_ADJ != 0) {
		color = colorBarras;
	    } else { color = "black" };

	    return color;
	  })
	  .style("font-weight",function(d) {
	    var weight;
	    if(d.ID_LICITANTE_OFERTA == d.ID_LICITANTE_ADJ && d.ID_LICITANTE_ADJ != 0) {
		weight = 700;
	    } else {
		weight = 300
	    };
	    return weight;
	  })
	  .style("display",function(d) {
	    var dis;
	    if(d.ID_LICITANTE_ADJ == 0) {
		dis = "none"
	    } else {
	        dis = "auto"
	    }
	     return dis;
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

	  if(VPO == 0) VPO = "-"
	  
	   var str = "<th>" + ron_lic.replace(/[/]/g," ") +"</th>" +

		     "<th>" + bloque.replace(/[/]/g," ") + "</th>" +
//		     "<th>"+ d.HIDRO_PRINCIPAL +"</th>"+
  "<th id='licitantes' style='width:"+widLic+"; font-size:12px; padding-left:20px'>"+ nombresLics +"</th>"+
//	"<th style='width:" + widLic + "'>"+ nombresLics +"</th>"+
		     "<th>"+ d.VAR_ADJ1.toLocaleString('es-MX') +"</th>" +
		     "<th>"+ d.VAR_ADJ2.toLocaleString('es-MX') +"</th>" +
		     "<th>"+ VPO.toLocaleString('es-MX') +"</th>" +
		     "<th TAG="+ d.BONO +">"+ bono.toLocaleString('es-MX') +"</th>";
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
    '<div id="mitades" style="height:50%">'+
     '<div id="mitad1" style="height:100%;float:left;clear:left;width:80%;background-color:rgba(0,0,0,0.1); display:table; margin:0 auto;"></div>' +
   //  '<div id="mitad2" style="float:left;width:70%; background-color:rgba(0,0,0,0.15)">'+
//        '<svg style="width:100%;height:inherit;"></svg>'+
     '</div>' +
    '</div>' +
    '<div id="gantt" style="height:100%;padding:0px;width:100%;background-color:transparent"></div>';

  var plantilla = 
  '<div id="titulo" style="height:15%; font-size:20px;padding-top:10px;">'+
	'<div style="padding:0px;height:15%;"><img style="position:relative;top:8px;" src="' + _flags_dir_ + pais_dict[objEmp[0].PAIS] +'.png"></img>&ensp;' + objEmp[0].EMPRESA.split(",")[0] + '</div>' +
   '<div class="totalBloques" style="padding:0px;height:75%;">'+
    '<div id="sumas" style="padding-top:10px;width:100%;height:80px;"></div>' +
'   <svg id="pestañas" style="width:100%;height:30px;z-index:5000;"></svg>' +
   '</div>' +
  '</div>' +
  '<div id="graficos" style="padding-top:30px;height:85%;z-index:1">' + contenido + '</div>' +
 '</div>';

  d3.select("#info").append("div")
    .attr("id","temporal")
    .style("height","100%")
    .html(plantilla);

//---------- DIMENSIONES DE APARTADOS PARA GRÁFICAS ----------------------//
  var titulo = d3.select("#temporal>#titulo")
  var titHeight = +titulo.style("height").split("px")[0];
  var titPad = +titulo.style("padding-top").split("px")[0];
  var titT = titHeight //+ titPad;
  var espacioDisp = window.innerHeight - titT - cintilla;
//  d3.select("div#mitades").style("height",(espacioDisp/2) + "px");
//  d3.selectAll("div#mitades>div").style("height","100%");
//  d3.select("div#gantt").style("height",(espacioDisp/2) + "px");

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

 var sumas = d3.select("div#sumas");


 var num = sumas.selectAll("div")
  .data(SUMAS).enter()
  .append("div")
  .style("clear",function(d,i) {
    var cl;
    if( i == 0 ) {
      cl = "left";
    } else {
      cl = null;
    };
    return cl;
  })
  .style("float","left")
  .style("text-align","center")
  .style("padding-top","10px")
  .style("font-weight","300")
  .style("width","33%")
  .html(function(d,i) {
    var valor = d.val.toLocaleString('es-MX');
    if( i == 2 ) valor = "$" + Number(d.val.toFixed(1)).toLocaleString('es-MX')
    var txt = "<div style='color:rgba(0,0,0,0.5)'>" + valor + "</div>"
    + "<div style='font-size:11px; font-weight:600'>"+ d.key +"</div>";
    return txt;
  });

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
	var id = d.split(" ").reduce(function sum(a,b) {
	  return a + "_" + b;
	});
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

      TABLA = _.sortBy(TABLA,"ID_BLOQUE");

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
	.attr("tag",function(d) {
	  var ganadora;
	  if(d.ID_LICITANTE_OFERTA == d.ID_LICITANTE_ADJ) {
	    ganadora = "ganadora";
	  }
	  return ganadora;
	})
	  .style("color",function(d) {
	    var color;
	    if(d.VALIDEZ == 'DESECHADA') {
		color = "gray";
	    } else if(d.ID_LICITANTE_OFERTA == d.ID_LICITANTE_ADJ) {
		color = "rgb(8,109,115)";
	    } else {
		color = "black";
	    }
	    return color;
	  })
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
	   
	    var str = "<th>"+ ron_lic.replace(/[/]/g," ") +"</th>" +
		     "<th>" + bloque.replace(/[/]/g," ") + "</th>" +
//		     "<th>"+ HIDRO_PRINCIPAL +"</th>"+
  "<th id='licitantes' style='width:"+widLic+"; font-size:12px; padding-left:20px'>"+ nombresLics +"</th>"+
		     "<th>"+ d.VAR_ADJ1.toLocaleString('es-MX') +"</th>" +
		     "<th>"+ d.VAR_ADJ2.toLocaleString('es-MX') +"</th>" +
		     "<th>"+ VPO.toLocaleString('es-MX') +"</th>" +
		     "<th TAG="+d.BONO+">"+ bono.toLocaleString('es-MX') +"</th>";
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
	    .style("height","100%")
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

  var noDesiertas = FILTRO6.filter(function(d) {
	return d.ID_LICITANTE_ADJ != 0;
  })

//  FILTRO6 = JSON.parse(JSON.stringify(noDesiertas, null, ' '));
  
  var ing = FILTRO6
	.map(function(d) {
	   return {
	    VAR_ADJ1: d.VAR_ADJ1,
	    VALIDEZ: d.VALIDEZ,
	    CONTRATO: d.CONTRATO,
	    ID_LICITANTE_OFERTA: d.ID_LICITANTE_OFERTA,
	    ID_LICITANTE_ADJ: d.ID_LICITANTE_ADJ,
	    ID_BLOQUE:d.ID_BLOQUE
	   }
	})
	.filter(function(d) {
	  return d.ID_LICITANTE_OFERTA == d.ID_LICITANTE_ADJ;
	});

  ing = _.groupBy(_.uniq(ing,"ID_BLOQUE"),"CONTRATO")

  for(var k in ing ) {
    ing[k] = +d3.mean(ing[k].map(function(d) {
	  return +d.VAR_ADJ1;;
    })).toFixed(2);
  };

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
  var areaAdj;

  if(bloqs_.length > 0) {
    areaAdj = bloqs_.filter(function(d) {
      return d.ID_LICITANTE_ADJ != "";
    })
    .map(function(d) { return d.AREA; })
    .reduce(function(a,b) { return +a + +b; });
  } else {
    areaAdj = 0
  }

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

  bloquesAdjudicados = bloquesAdjudicados.filter(function(d) {
    return d.ID_LICITANTE_ADJ != 0;
  });

  var empresas_adj = FILTRO6.filter(function(d) {
    return d.ID_LICITANTE_OFERTA == d.ID_LICITANTE_ADJ;
  }).map(function(e) { return e.EMPRESA; });

  
  var filtrarEmpresasAdj = empresas_adj.filter(function(d) { return d != 0; });
  filtrarEmpresasAdj = _.uniq(filtrarEmpresasAdj).length
  var empresas_adj_uniq = filtrarEmpresasAdj//_.uniq(empresas_adj).length;

  var EmpS_ = FILTRO6.map(function(d) { return d.EMPRESA; });
  EmpS_ = EmpS_.filter(function(d) { return d != 0; })
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
    }).map(function(d) { return d.ID_LICITANTE_OFERTA; });
    val = _.uniq(val);
    cuentaOfertas.push(val.length);
  };


  if(cuentaOfertas.length > 0) { 
    ofertasValidas = d3.mean(cuentaOfertas).toFixed(1);
  } else {
    ofertasValidas = 0;
  }

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
   {'key':'Área no adjudicada','val':(areaNoAdj/1000).toFixed(1), 'ignorar':true },
   { 'key':'Ingresos','val':ing, 'ignorar':true }
  ];

  after = [
   { 'key':'Inversión','val':(inv_pmt/1000000).toFixed(0) },
   { 'key':'Bloques adjudicados', 'val':bloquesAdjudicados.length },
   { 'key':'Área adjudicada (km\u00B2)', 'val':+area.toFixed(1) },
   { 'key':'Empresas que participaron', 'val':empresas.length },
   { 'key':'Promedio de ofertas por bloque', 'val':ofertasValidas }
  ];

// Fix para licitaciones desiertas.
//  if(after.filter(function(d) { return d.key == "Inversión"; })[0].val == 0) {
//    pre[0].val = 0
//    pre[1].val = 0

//  }

// Fix para licitaciones desiertas.
  return { 'pre': pre, 'after':after };
};

  function descargar_CSV() {
    var csv = ["RONDA-LICITACION,BLOQUE,LICITANTE,VARIABLE DE ADJUDICACION 1,VARIABLE DE ADJUDICACION 2,VPO,BONO (DOLARES),OFERTA GANADORA,OFERTA VALIDA"];
    var rows = document.querySelectorAll("table tr.datosMod");
    var ronda_ = [];

    for(var i = 0; i < rows.length; i++) {
      var row = [], cols = rows[i].querySelectorAll("th");
      var celda;

      for(var j = 0; j < cols.length; j++) {
	if( d3.select(cols[j]).attr("tag") ) {
	//  cols[j].innerText = +d3.select(cols[j]).attr("tag");
	//  console.log(cols[j]);
	};

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
          celda = cols[j].innerText
	  celda = celda.replace(/,/g,"");
	  celda = celda.replace(/Á/g,"A")
	  celda = celda.replace(/É/g,"E")
	  celda = celda.replace(/Í/g,"I")
	  celda = celda.replace(/Ó/g,"O")
	  celda = celda.replace(/Ú/g,"U")
          if(j == 0) { celda/*cols[j].innerText*/ = celda.replace(/-/g,".") }
          if(j == 6) { celda = +d3.select(cols[j]).attr("tag") }
  
	}
	row.push(celda);
	if(j == 0) { ronda_.push(celda); };
      };

      if(rows[i].style.display != "none") {
// ---- ¿Es la oferta ganadora? -----
        if( rows[i].getAttribute("tag") == "ganadora" ) {
	  console.log(rows[i].style.display); 
	  row.push("SI");
        } else { 
	  row.push("NO");
        }

// ---- ¿Es la oferta válida? --
        if( $(rows[i]).css('color') == 'rgb(128, 128, 128)' ) {
	  row.push("NO")
        } else {
	  row.push("SI")
        }

      }

      csv.push(row.join(","));
    }
    ronda_ = _.uniq(ronda_).sort().join(";").replace(/-/g,".");
    csv = csv.join("\n");

    var csvFile;
    var downloadLink;
    var objCSV = { rondas:ronda_ };
    var emp_nom = document.getElementById("titulo").innerText.split("\n")[0];
    if(emp_nom != "RESUMEN") objCSV["empresa"] = emp_nom;

    csvGraf(csv,"tabla",objCSV)
  };


function OFERTAS(widLic) {

  var boton_ = '<button onclick="descargar_CSV();" id="descargarCSV" style="text-align:right;color:black;border:2px;border-radius:2px;font-family:Open Sans;font-weight:300;text-shadow:0 1px 1px rgba(0,0,0,0.2);">Descargar</button>';

d3.select("#espacioParaBoton").remove()

d3.select("div#titulo").append("div")
  .attr("id","espacioParaBoton")
  .style("padding-top",0)
  .style("margin",0)
  .style("text-align","right")
//  .style("height","30px")
  .html(boton_)

var i_a = "a) La variable de adjudicación 1 se refiere al porcentaje que corresponde a la participación del Estado en caso de contratos de producción compartida, o a la regalía adicional en caso de contratos de licencia.<br>"

var i_b = "b) De la R1.1 a la R1.3 la variable de adjudicación 2 representa un porcentaje de incremento en la inversión del programa mínimo de trabajo, para las rondas posteriores esta variable se refiere al factor de inversión adicional."
var leyenda = '';
var tablaString =
'<div id="Tabla" style="height:100%">' +
 '<div id="tHeadContainer" style="height:10%">'+
  '<table id=tHead style="height:100%">'+

'<tr id="new" style="height:100%">'+
 '<th>Ronda - Licitación</th>'+
 '<th>Bloque</th>'+
// '<th>Hidrocarburo esperado</th>' +
 '<th style="width:'+widLic+';">Licitante</th>'+
 '<th class="info" id="a">Variable de adjud. 1<sup>a</sup></th>'+
 '<th class="info" id="b">Variable de adjud. 2<sup>b</sup></th>'+
 '<th>VPO</th><th>Bono (miles de dólares)</th>'+
'</tr>'+
  '</table>' +
 '</div>' + 
"<div class='notas' style='background-color:white;height:8%;color:black;line-height:14px;font-size:10px;font-weight:300;padding-bottom:0px;padding-left:20px;padding-right:20px;text-align:justify;margin_bottom:20px'>"+i_a+i_b+"</div>" +
'<div id="tBodyContainer" style="height:58%">' +
 '<table id="tBody">' +

 '</table>'+
'</div>' +
'<div style="width:100%;padding-left:20px;line-height:11px;border-top:solid 0.25px gray"><span style="font-weight:700;color:rgb(8,109,115)">* Las ofertas en negritas y en este color fueron ganadoras.</span><br><span style="color:white;background-color:gray">* Las ofertas en gris fueron desechadas por no superar el límite establecido por la Secretaría de Hacienda y Crédito Público.</span></div>' +
'</div>';

  d3.select("#Tabla").remove();
  d3.select("#graficos").html("");
  var hT = +d3.select("#titulo").style("height").split("px")[0];
  d3.select("#graficos").style("height","85%")//,function() {
//	    var newHeight = window.innerHeight - hT - cintilla - 145; /*altura de tabla*/
//    return newHeight + "px";
//  });
  d3.select("#graficos").html(tablaString);

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


      var ganadas = licsEMpresa_.filter(function(d) {
	return d.ID_LICITANTE_OFERTA == d.ID_LICITANTE_ADJ
      });


      var noGanadas = licsEMpresa_.filter(function(d) {
	return d.ID_LICITANTE_OFERTA != d.ID_LICITANTE_ADJ
      });

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



/*------------------------- DATOS PARA DONUT ----------------------------*/


  var contenido =
    '<div id="mitades" style="width:80%;height:50%">'+
     '<div id="mitad1" style="background-color:transparent;height:100%;"></div>' +
//     '<div id="mitad2" style="float:left;width:0%; background-color:rgba(0,0,0,0.15)">'+
//        '<svg style="width:100%;height:inherit;"></svg>'+
     '</div>' +
    '</div>' +
    '<div id="gantt" style="padding:0px;width:80%;background-color:transparent;height:50%;"></div>';


  d3.select("div#graficos").html(contenido)
//---------- DIMENSIONES DE APARTADOS PARA GRÁFICAS ----------------------//
  var titulo = d3.select("#temporal>#titulo")
  var titHeight = +titulo.style("height").split("px")[0];
  var titPad = +titulo.style("padding-top").split("px")[0];
  var titT = titHeight //+ titPad;
  var espacioDisp = window.innerHeight - titT - cintilla;
//  d3.select("div#mitades").style("height",(espacioDisp/2) + "px");
//  d3.selectAll("div#mitades>div").style("height","100%");
//  d3.select("div#gantt").style("height",(espacioDisp/2) + "px");



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
    lang: { Descargar:"Descargar" },
    exporting: {
	enabled:true,
	type:'image/jpeg',
	filename:'gráfico-ofertas',
	buttons: {
	 contextButton: {
	  symbol: _img_download_,
	  _titleKey:"Descargar",
	  symbolX:19,
	  symbolY:18,
          menuItems: [
	   {
	    'text':'Exportar datos (CSV)',
	    'onclick': function() {
		csvGraf(this.getCSV(),"ofertas",{empresa:empNom})
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
        return '<b>'+ this.point.name +'</b>: $'+ this.point.value.toLocaleString("es-MX");
      }
    },
    credits: { enabled:false },
    lang: { Descargar:'Descargar' },
    exporting: {
	enabled:true,
//	type:'image/jpeg',
//	filename:'inversion-ronda-bloque',
	buttons: {
	 contextButton: {
	  symbol: _img_download_,
	  symbolX:19,
	  symbolY:18,
          _titleKey:'Descargar',
          menuItems: [
	   {
	    'text':'Exportar datos (CSV)',
	    'onclick': function() {
	      var ex_ = dataForTree.filter(function(d) { return d.value; })
		.map(function(d) { return String(d.name) +","+String(d.value); });

	      ex_ = ["BLOQUE,INVERSION"].concat(ex_).join("\n");
	      csvGraf(ex_,"inversion",{empresa:empNom});
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
	text:"Para conocer la inversión en dólares por licitación o bloque interactúe con esta gráfica."
    },
    	style:{ 'fontSize':5,'fontWeight':800 }
  });

};


function csvGraf(csv,filename,obj) {
      var CSV;
      var titulo;
      var category;
      var rondas_;

      if( filename == "ofertas" ) {
	titulo = "OFERTAS PRESENTADAS";
	category = "RONDAS";
      }
      if( filename == "inversion" ) {
	titulo = "INVERSION POR BLOQUE EN MILLONES DE DOLARES";
      }
      if( filename == "contratos" ) {
	titulo = "NUMERO DE CONTRATOS POR TIPO";
	category = "TIPO DE CONTRATO";
      }
      if( filename == "ofertas_resumen" ) {
	titulo = "PARTICIPACIÓN DEL ESTADO O REGALÍA ADICIONAL (PORCENTAJE PROMEDIO DE OFERTAS GANADORAS)";
//	csv = csv.replace("Bloques","MILES DE KM2")
	category = "OFERTAS";
      }
      if( filename == "paises" ) {
	titulo = "PAISES PARTICIPANTES";
	category = "PAIS";
      }
      if( filename == "tabla" ) {
	titulo = "OFERTAS";
	
      }

     var fecha = new Date();
     var anio = fecha.getFullYear(), mes = fecha.getMonth(), dia = fecha.getDay()
     if( String(mes).length == 1 ) mes = "0" + mes;
     if( String(dia).length == 1 ) dia = "0" + dia;
     fecha = anio + "/" + mes + "/" + dia;
      

      var header = [titulo,"COMISION NACIONAL DE HIDROCARBUROS","Fecha de descarga: " + fecha ]

      if(obj.empresa) {
	header.push("Empresa: " + obj.empresa)
        CSV = header.join("\n") + "\n\n\n" + csv
      } 

      if(obj.rondas && typeof(obj.rondas) != "string") {
        rondas_ = obj.rondas.map(function(d) {
	  let val = String(d.ronda) + "." + String(d.lic);
	  return val;
	}).sort().join(";");

	header.push("RONDAS: " + rondas_)
	CSV = header.join("\n") + "\n\n\n" + csv;
      }

var notas = "a) La variable de adjudicación 1 se refiere al porcentaje que corresponde a la participación del Estado en caso de contratos de producción compartida o a la regalía adicional en caso de contratos de licencia. b) De la R1.1 a la R1.3 la variable de adjudicación 2 representa un porcentaje de incremento en la inversión del programa mínimo de trabajo; para las rondas posteriores esta variable se refiere al factor de inversión adicional."


      if(obj.rondas && typeof(obj.rondas) == "string") {
	header.push("RONDAS: " + obj.rondas);
        header.push("NOTAS: " + notas);
	CSV = header.join("\n") + "\n\n\n" + csv;
      }

	CSV = CSV.toUpperCase()
	CSV = CSV.replace(/Á/g,"A");
	CSV = CSV.replace(/É/g,"E");
	CSV = CSV.replace(/Í/g,"I");
	CSV = CSV.replace(/Ó/g,"O");
	CSV = CSV.replace(/Ú/g,"U");
	CSV = CSV.replace("CATEGORY",category)
	

      var csvFile = new Blob([CSV], {type:"text/csv"});

      if(window.navigator && window.navigator.msSaveOrOpenBlob) {
	window.navigator.msSaveOrOpenBlob(csvFile,filename + ".csv");
      } else {
      var downloadLink = document.createElement("a");
//      downloadLink.style = "display:none";
//      downloadLink.href = URL.createObjectURL(csvFile);
        downloadLink.download = filename + ".csv";
        downloadLink.href = window.URL.createObjectURL(csvFile);
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        var s_a = document.getElementsByTagName("a");
        for(var i=0; i<s_a.length; i++) {
	  s_a[i].parentNode.removeChild(s_a[i]);
        }
      }
//      d3.selectAll("a").remove();
}
