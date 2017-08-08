function resumen(data,adj,licRondas,pmts,ofertas,RONDA_LIC,tabla) {
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
	  TABLA = TABLA.concat(tempTabla); console.log(TABLA);
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

          var plantilla = 
'<div id="titulo" style="height:15%; padding-top:18px; font-size:28px;">'+
   texto.resumen +
'<div class="totalBloques" style="padding: 0px;">'+
'<svg id="sumas" style="width:100%;height:80px;background-color:transparent"></svg>'
+'</div>' +  
'</div>' +
//'<div id="titulo" style="height:15%; padding-top:0px; font-weight:600">'+
//   'PAÍSES' +
  '<div id="barras" style="padding:0px;width:100%; height:300px"></div>'+
'</div>' +


'<div id="scrollTableContainer">' +
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
'</div>'

//'<div class="totalBloques" style="padding: 0px;"></div>';

       d3.select("#info").append("div")
	.attr("id","temporal")
	.html(plantilla);

//------CÁLCULO DE SUMAS--------------//
  var SUMAS = calculoSumas(licRondas,ofertas,adj,RONDA_LIC);
//-----------------------------------//

 var sumas = d3.select("svg#sumas"); 
 var nums = [1,2,3,4,5];

 var nums = sumas.append("g").selectAll("text")
  .data(SUMAS).enter()
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
     return (width / SUMAS.length)*i + (width/SUMAS.length/2);
   })
   .attr("y",function() {
     var height = +d3.select("svg#sumas").style("height").split("px")[0];
     return height / 2;
   }).text(function(d) { return d[1]; });


 var tits = sumas.append("g").selectAll("text")
  .data(SUMAS).enter()
  .append("text")
   .style("font-weight",600)
   .style("font-size",10)
   .attr("opacity",1)
//   .attr("id",function(d,i) {
//     return "suma_" + String(i);
//   })
//   .attr("fill","rgba(0,0,0,0.5)")
   .attr("alignment-baseline","text-before-edge")
   .attr("text-anchor","middle")
   .attr("x",function(d,i) {
     var width = d3.select("svg#sumas").style("width").split("px")[0];
     return (width / 5)*i + (width/10);
   })
   .attr("y",function(d,i) {
     var sel = d3.select("#suma_" + String(i)).node().getBBox();
     var y = sel.y;
     var height = sel.height; 
     return y + height + 8;
   }).text(function(d) { return d[0]; });

  var t0 = nums.transition().duration(750).attr("opacity",1)
//  tits.transition().delay(300).duration(750).attr("opacity",1)

	Highcharts.chart('barras', {
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
		  color: colorBarras,//"rgba(255,15,0,0.65)",
//		  pointWidth:15
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
		    format: '{point.y:.1f}', // one decimal
		    y: 10, // 10 pixels down from the top
		    style: {
			fontSize: '13px',
			fontFamily: 'Open Sans'
		    }
		}
	    }]
	});

	d3.selectAll('.highcharts-grid-line').remove();

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

};


function plantillaEmpresa(d,adj,data,licRondas,pmts) {
  if(d3.select("div#temporal")[0][0]) d3.select("div#temporal").remove()
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

function calculoSumas(licRondas,ofertas,adj,RONDA_LIC) {
  var sumas = {};
  var FILTRO1;
  var FILTRO2;
  var FILTRO3;

  var bloques1 = _.uniq(ofertas,"ID_BLOQUE");
  var bloques2 = _.uniq(licRondas,"ID_BLOQUE");
  var lics = _.uniq(licRondas,"ID_LICITANTE_OFERTA")
	.filter(function(d) { return d.ID_LICITANTE_OFERTA; });


  if(!RONDA_LIC) {
    FILTRO1 = bloques1;
    FILTRO2 = bloques2;
    FILTRO3 = lics;
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
      } else {
// SI ES VERDAD QUE LA DISTANCIA DEL OBJETO SÍ EXISTE (ES UN ARRAY)
	FILTRO1 = []; FILTRO2 = []; FILTRO3 = [];
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

	  FILTRO1 = FILTRO1.concat(temp1);
	  FILTRO2 = FILTRO2.concat(temp2);
	  FILTRO3 = FILTRO3.concat(temp3);
	};
      }

    };
  };

  var empresas = [];
  FILTRO3.forEach(function(d) {
    empresas = empresas.concat(d.LICITANTE);
  });

  empresas = empresas.reduce(function(a,b) {
    if( a.indexOf(b) < 0) { a.push(b); };
    return a;
  },[]);  
//console.log(empresas.sort());

  var inv_pmt = FILTRO1.map(function(d) { return d.PMT_TOTAL; }).reduce(SUM);
  var area = FILTRO1.map(function(d) { return d.AREA; }).reduce(SUM);
  var bloquesAdjudicados = FILTRO2.filter(function(d) {
    return d.ID_LICITANTE_ADJ != "";
  });

  sumas['Empresas'] = empresas.length;
  sumas['Bloques ofertados'] = FILTRO2.length;
  sumas['Bloques adjudicados'] = bloquesAdjudicados.length;
  sumas['Inversión comprometida'] = (inv_pmt / 1000).toFixed(0) + "K";
  sumas['Área (km\u00B2)'] = +area.toFixed(1);

  var SUMAS = [];
  for(var k in sumas) {
    SUMAS.push([k,sumas[k]])
  };

  return SUMAS;
};
