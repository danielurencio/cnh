function resumen(data,adj,licRondas,pmts,ofertas,RONDA_LIC) {
  if(d3.select("div#temporal")[0][0]) d3.select("div#temporal").remove()
// HABRÁ QUE FILTRAR POR RONDA Y LICITACIÓN PARA REUTILIZAR ESTA FUNCIÓN.
  var FILTRO;
  var colorBarras = "rgba(255,15,0,0.65)"
  var texto = {
    'resumen':'TOTAL DE LAS RONDAS'
  };


  if(!RONDA_LIC) {
    FILTRO = licRondas;
  } else {
    if( typeof(RONDA_LIC) != 'object' ) {
      FILTRO = licRondas.filter(function(d) { return d.RONDA == RONDA_LIC; });
      texto.resumen = "RONDA " + RONDA_LIC;
      colorBarras = "rgba(255,45,0,0.65)";
    } else {
      FILTRO = licRondas.filter(function(d) {
	return d.RONDA == RONDA_LIC.ronda && d.LICITACION == RONDA_LIC.lic;
      });
      texto.resumen = "RONDA " + RONDA_LIC.ronda + " - LICITACIÓN "
	+ RONDA_LIC.lic;
      colorBarras = "rgba(255,75,0,0.65)";
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
'<svg id="sumas" style="width:100%;height:80px;background-color:rgba(0,0,0,0.02)"></svg>'
+'</div>' +  
'</div>' +
'<div id="titulo" style="height:15%; padding-top:0px;">'+
   'PAÍSES' +
  '<div id="barras" style="padding:0px;width:100%; height:300px"></div>'+
'</div>'
/*+'<div id="titulo" class="ModalidadEmpresa" style="height:15%; padding-top:18px;">'+
  'Bloques adjudicados' +

'<table id="adjudicaciones"> <tbody><tr id="titulos"> <th>No. de bloques</th> <th>Modalidad</th> <th>Licitantes</th> <th>Inversión total<br><span>(millones de dólares)</span></th> <th>Área<br><span>(km<sup>2</sup>)</span></th> </tr> </tbody></table>'+
*/
//'<div class="totalBloques" style="padding: 0px;"></div>';

       d3.select("#info").append("div")
	.attr("id","temporal")
	.html(plantilla);

//------CÁLCULO DE SUMAS--------------//
  calculoSumas(licRondas,ofertas,adj,RONDA_LIC);
//-----------------------------------//

 var sumas = d3.select("svg#sumas"); 
 var nums = [1,2,3,4,5];

 sumas.selectAll("text")
  .data(nums).enter()
  .append("text")
   .style("font-weight",600)
   .attr("id",function(d) {
     return d;
   })
   .attr("alignment-baseline","alphabetic")
   .attr("text-anchor","middle")
   .attr("x",function(d,i) {
     var width = d3.select("svg#sumas").style("width").split("px")[0];
     return (width / 5)*i + (width/10);
   })
   .attr("y",function() {
     var height = +d3.select("svg#sumas").style("height").split("px")[0];
     return height / 2;
   }).text(function(d) { return d; });

	Highcharts.chart('barras', {
	    chart: {
		type: 'column'
	    },
	    title: {
		text:''
	    },
	    credits: { enabled:false },
	    xAxis: {
		type: 'category',
		labels: {
		    rotation: -45,
		    style: {
			fontSize: '11px',
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
};

function plantillaEmpresa(d,adj,data,licRondas,pmts) {
	var plantilla = '<div id="titulo" class="NombreEmpresa" style="height: 15%; padding-top: 18px;">Nombre de la empresa   <div id="nombre" class="NombreEmpresa"></div>  </div>  <div id="titulo" class="PaisEmpresa" style="height: 15%; padding-top: 18px;">País   <div id="pais" class="PaisEmpresa"></div>  </div>  <div id="titulo" class="ModalidadEmpresa" style="height: 15%; padding-top: 18px;">Bloques adjudicados  <table id="adjudicaciones">   <tbody><tr id="titulos">    <th>No. de bloques</th>    <th>Modalidad</th>    <th>Licitantes</th>    <th>Inversión total<br><span>(millones de dólares)</span></th>    <th>Área<br><span>(km<sup>2</sup>)</span></th>   </tr>  </tbody></table>   <div class="totalBloques" style="padding: 0px;">  </div>';

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
	   
	   var str = "<th>"+n+"</th>" +
		     "<th>"+mod+"</th>" +
		     "<th id='licitantes' tag="+ i +"></th>"+
		     "<th>"+inv+"</th>"+
		     "<th>"+ar+"</th>";
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
  var FILTRO_ofertas;
  var FILTRO_bloquesO;
  var FILTRO_bloquesA;
  var FILTRO_area;
  var FILTRO_empresas;
  var ofertas = ofertas.map(function(d) { 
    var obj = {
      'PMT_TOTAL':d.PMT_TOTAL,
      'ID_BLOQUE':d.ID_BLOQUE,
      'RONDA':d.RONDA,
      'LICITACION':d.LICITACION
    };
    return obj;
  });

  if(!RONDA_LIC) {
    FILTRO_ofertas = ofertas
  } else {
    if(typeof(RONDA_LIC) != 'object') {
      FILTRO_ofertas = ofertas.filter(function(d) {
       return d.RONDA == RONDA_LIC;
      });
    } else {
      FILTRO_ofertas = ofertas.filter(function(d) {
        return d.RONDA == RONDA_LIC.ronda && d.LICITACION == RONDA_LIC.lic;
      });
    };
  };

  var inv_pmt = FILTRO_ofertas.map(function(d) { return d.PMT_TOTAL; })
	.reduce(SUM);

  sumas.inv_pmt = inv_pmt;
  console.log(adj);
//  return sumas;
};
