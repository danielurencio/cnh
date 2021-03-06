var pozos_comprometidos;

var graphW = window.innerWidth/2;
    graphH = window.innerHeight;

var minColor = "rgb(247,195,32)";
var maxColor = "rgb(255,0,61)";

var NN,LL,maxAdj;

function RED(width,height) {
  var graphConteiner = d3.select("g#red");
  var graphWidth = width, graphHeight = height;

//======FUNCIONES PARA TRANSFORMAR TABLAS NUEVAS A ESTRUCTURAS ANTIGUAS=========|
  function to_data(x) {

    var resultado = _.uniq(x, function(item) {
      return [item.ID_LICITANTE, item.ID_EMPRESA,item.EMPRESA].sort().join(',');
    }).map(function(d) {
	  var obj = {};
	  obj['ID_LICITANTE'] = d.ID_LICITANTE;
	  obj['ID_EMPRESA'] = d.ID_EMPRESA;
	  obj['EMPRESA'] = d.EMPRESA;
	  obj['PAIS'] = d.PAIS;

	  return obj;
	});

    var id_licitante = _.uniq(x,'ID_LICITANTE')
	.map(function(d) { return d.ID_LICITANTE; });

    return resultado;
  };


  function to_adj(x) {
    var rr = x.filter(function(d) {
	return d.ID_LICITANTE == d.ID_LICITANTE_ADJ;
    })

    var lics = _.uniq(rr,'ID_EMPRESA')
	.map(function(d) { return d.ID_EMPRESA; });

    var resultados = [];

    lics.forEach(function(l) {
      var lic = rr.filter(function(d) { return d.ID_EMPRESA == l });

      var area = lic
	.map(function(d) { return +d.AREA; })
	.reduce(function sum(a,b) { return +a + +b; });

      var inv = lic
	.map(function(d) { return +d.INV_USD; })
	.reduce(function(a,b) { return +a + +b; });

      var adjs = lic.length;
      var empresa = lic[0].EMPRESA;
      var id_emp = lic[0].ID_EMPRESA;
      var id_lic = lic[0].ID_LICITANTE;
      var id_lic_adj = lic[0].ID_LICITANTE_ADJ;
      var modalidad = "";
      var pais = lic[0].PAIS;

      var obj = {
	'ADJUDICADOS':String(adjs),
	'AREA':String(area),
	'EMPRESA':empresa,
	'ID_EMPRESA':id_emp,
	'ID_LICITANTE':id_lic,
	'ID_LICITANTE_ADJ':id_lic_adj,
	'INV_TOTAL':String(inv),
	'MODALIDAD':modalidad,
	'PAIS':pais
      };
      resultados.push(obj);
    });

    return resultados;
  };

  function to_licRondas(x) {

    var rr = x.map(function(d) {
      var obj = {};
      obj['ID_BLOQUE'] = d.ID_BLOQUE;
      obj['ID_LICITANTE_ADJ'] = d.ID_LICITANTE_ADJ;
      obj['ID_LICITANTE_OFERTA'] = d.ID_LICITANTE;
      obj['LICITACION'] = d.LICITACION;
      obj['LICITANTE'] = "";
      obj['RONDA'] = d.RONDA;

      return obj;
    });

    rr = _.uniq(rr,function(v) {
	var ARR = [
	  v.ID_BLOQUE, v.ID_LICITANTE_ADJ, v.ID_LICITANTE_OFERTA,
	  v.ID_LICITACION, v.LICITANTE, v.RONDA
	];
	return ARR.join();
    });

    rr.forEach(function(d) {
	var emps = x.filter(function(e) {
	  return e.ID_LICITANTE == d.ID_LICITANTE_OFERTA;
	}).map(function(E) { return E.LICITANTE; });

        emps = _.uniq(emps).reduce(function(a,b) { return a + ";" + b; });
        d.LICITANTE = emps;
    });

    return rr;
  };


  function to_OFERTAS_(x) {
      pozos_comprometidos = Object.keys(x[0]).filter(function(d) { return d == 'POZOS_COMPROMETIDOS'; }).length ? true : false;
      var rr = x.filter(function(d) { return d.VALIDEZ != 'NO PRESENTA' });
      rr = rr.filter(function(d) { return d.VALIDEZ != 'SIN GARANTIA' });
      rr = rr.map(function(d) {
      var obj = {};
      obj['AREA'] = d.AREA;
      obj['BONO'] = d.BONO;
      obj['ID_BLOQUE'] = d.ID_BLOQUE;
      obj['ID_EMPRESA'] = d.ID_EMPRESA;
      obj['ID_LICITANTE_ADJ'] = d.ID_LICITANTE_ADJ;
      obj['ID_LICITANTE_OFERTA'] = d.ID_LICITANTE;
      obj['LICITACION'] = d.LICITACION;
      obj['PMT_TOTAL'] = d.INV_USD;
      obj['RONDA'] = d.RONDA;
      obj['VAR_ADJ1'] = d.VAR_ADJ1;
      obj['VAR_ADJ2'] = d.VAR_ADJ2;
      obj['VPO'] = d.VPO;
      obj['VALIDEZ'] = d.VALIDEZ;
      if(pozos_comprometidos) obj['POZOS_COMPROMETIDOS'] = d.POZOS_COMPROMETIDOS;

      return obj;
    });

    return rr;
  };


  function to_tabla(x) {

    var rr = x.map(function(d) {
      var obj = {};
      obj['BONO'] = d.BONO;
      obj['ID_BLOQUE'] = d.ID_BLOQUE;
      obj['ID_LICITANTE_ADJ'] = d.ID_LICITANTE_ADJ;
      obj['ID_LICITANTE_OFERTA'] = d.ID_LICITANTE;
      obj['LICITACION'] = d.LICITACION;
      obj['RONDA'] = d.RONDA;
      obj['VAR_ADJ1'] = d.VAR_ADJ1;
      obj['VAR_ADJ2'] = d.VAR_ADJ2;
      obj['VPO'] = d.VPO;
      obj['EMPRESA'] = d.EMPRESA;
      obj['VALIDEZ'] = d.VALIDEZ;
      obj['CONTRATO'] = d.CONTRATO;
      obj['AREA'] = d.AREA;

      return obj;
    });

    return rr;

  };
//==============================================================================|
  queue()
//	.defer(d3.csv,'https://portal.cnih.cnh.gob.mx/api/licitaciones_data.py')
//	.defer(d3.csv,'BLOQUES_OFERTAS.csv')
	.defer(d3.csv,url_servicio(_ambiente_))
    .await(getDATA);

  function getDATA(err,bloques_ofertas) {

  data = to_data(bloques_ofertas);
  adj = to_adj(bloques_ofertas);
  licRondas = to_licRondas(bloques_ofertas);
  OFERTAS_ = to_OFERTAS_(bloques_ofertas);
  tabla = to_tabla(bloques_ofertas);
  var procesos = [];
//  procesos = PROCESOS_

/*-------------------NUEVO FILTRO------------------------------------------*/
    var ron_lic = licRondas.map(function(d) {
      var result;
      result = "R" + d.RONDA + "." + d.LICITACION;
      return result;
    }); 

    ron_lic = _.uniq(ron_lic);

//    ron_lic.splice(ron_lic.indexOf("R."),1)

    for(var i in ron_lic) {
     var split_ = ron_lic[i].split(".")
     var ronda = split_[0].split("R")[1];
     var lic = split_[1];
     if( ronda == 'PEMEX') {
       ron_lic[i] = "Asociación " + ronda + " - Licitación " + lic;
     } else {
       ron_lic[i] = "Ronda " + ronda + " - Licitación " + lic;
     }
    };

   ron_lic.sort();

  d3.select("#cintilla0>tag").style("color","black")

  d3.select("#opciones").html("<span id='ch'>Seleccione una o varias licitaciones.</span>")

    var opciones = d3.select("#opciones").append("div")
	  .style("margin-top","0px")
	  .style("display","none")
	  .style("background-color","white")
	  .style("opacity","0.95")
	  .style("position","relative")
	  .style("width","calc(100% + 1px)")
	  .style("z-index",10000)
	  .style("border","1px solid lightGray")
	  .style("border-top","none")
	  .append("ul")
	  .style("width","100%");

    opciones.selectAll("li")
	   .data(ron_lic).enter()
	    .append("li")
	      .style("font-family","Open Sans")
	      .style("width","100%")
//	      .style("cursor","default")
	      .attr("id","option_")
		.html(function(d) {
		 var str=d+"<input style='float:right;' type='checkbox'></input>";
		 return str;
		});

    $("div#opciones>div>ul").prepend("<li style='background:rgba(0,0,0,0.9);'><span style='color:white;font-weight:800;' id='_TODOS_'>SELECCIONAR TODO</span><input type='checkbox' class='_todos_'; style='float:right;'></input></li>")


   d3.selectAll("#option_")
	.on("click",function() {
	  d3.select("#opciones>div").style("display","none")
	})

   d3.select("#opciones")
	.on("click",function() {
	  d3.select("#opciones>div").style("display","block");
	});

    $("body *>*:not(#opciones)")
	.on("click",function() {
	  d3.select("#opciones>div")
	   .style("display","none")
	});



    d3.select("div[class='chosen-container chosen-container-multi']")
     .attr({
	"color":"black",
	"border-color":"orange",
	"id":"borde"
      })

    d3.select("ul.chosen-choices")
     .attr("id","borde")
     .style({
      "color":"black",
      "background":"rgba(215,215,215,0.45)",
      "border-color":"orange",
      "border-style":"solid",
      "border-width":"0.5"
     })

    d3.select("ul.chosen-results")
	.style("background-color","rgba(215,215,215,0.45)")

    d3.selectAll("#borde").style("border-color","orange")

    d3.select("input.chosen-search-input.default").style("width","300px")

    var svgCintilla = d3.select("svg#cintilla")
    var widthCintilla = d3.select("div#cintilla0")
	.style("width").split("px")[0];


/*-------------------NUEVO FILTRO------------------------------------------*/


     var ofertas = OFERTAS_.filter(function(d) {
	return d.ID_LICITANTE_ADJ == d.ID_LICITANTE_OFERTA;
     });

     /*PROCESAR LICITANTES POR RONDA*/
     licRondas = licRondas.filter(function(d) {
	return d.RONDA && d.LICITACION;
     });
     licRondas.forEach(function(d) {
       if(d) d.LICITANTE = d.LICITANTE.split(";")
     });
     /*-----------------------------*/
     /*-----------------------------*/

    /*¿CUÁL ES EL MÁXIMO VALOR ADJUDICADO?*/
    /*... de esto depende el radio de los nodos*/
    var emps = Procesar.unicos(adj,"ID_EMPRESA");
    var adjs = [];
    for(var i in adj) {
      var adjs_temp = adj.filter(function(d) {
	return +d.ID_EMPRESA == +emps[i];
      }).map(function(e) { return +e.ADJUDICADOS; });
      function sum(a,b) { return a + b; };
      var valor = adjs_temp.length > 0 ? adjs_temp.reduce(sum) : 0;;
      adjs.push(valor);
    };
    maxAdj = d3.max(adjs);

    var colorScale = d3.scale.linear()
        .domain([0,maxAdj])
        .range([minColor,maxColor])//['rgb(233,241,255)',"rgb(5,63,66)"]);

    /*¿CUÁL ES EL VALOR MÁXIMO DE PMT*/
    /*... de esto depende ahora el NUEVO radio de los nodos*/
    ofertas.forEach(function(d) {
      var col = ['PMT_TOTAL','VAR_ADJ1','VAR_ADJ2','VPO','AREA']
      for(var i in col)
      d[col[i]] = +d[col[i]];
    });
    var lic_conBloq = ofertas.map(function(d) { return d.ID_EMPRESA; })
      .reduce(function(a,b) {
	if(a.indexOf(b) < 0) { a.push(b); };
        return a;
      },[]);
    var pmts = [];
    lic_conBloq.forEach(function(d) {
     var match = ofertas
	.filter(function(e) { return d == e.ID_EMPRESA; })
	.map(function(s) { return s.PMT_TOTAL; });
      var sumaPMT,filtro;

      filtro = match.length > 0 ? match : 0; 
      sumaPMT = typeof(filtro) == 'object' ? filtro.reduce(SUM) : filtro;
      pmts.push({ 'id':d, 'pmt':sumaPMT }) 
    });


    /*------------------------------------*/
    var lics = Procesar.unicos(data,"ID_LICITANTE")//"lic");
    var sets = Procesar.transformar(data,lics);


    var nodes = sets.filter(function(d) { return d.emps.length > 0; })
      .map(function(d) { return d.emps; });

/*-------ANALIZAR----------------------------*/
    var arr = [];
    for(var i in nodes) {
      for(var j in nodes[i]) {
        arr.push(+nodes[i][j]);
      }
    }

    nodes = arr;
    arr = nodes.sort(function(a,b) { return a - b; })
    arr = arr.reduce(function(a,b) {
     if(a.indexOf(b) < 0) { a.push(b); }
     return a;
    },[]);

//    arr = arr.filter(function(d) { return d != 0; });
    var links = Procesar.edges(sets,arr);

    for(var i in arr) {
      arr[i] = { 'id':arr[i] };
    }
/*-------ANALIZAR----------------------------*/

//    arr = arr.filter(function(d) { return d.id != 0; });

    var datos = {'nodes':arr,'links':links};

    var force = d3.layout.force()
	.charge(-55)
	.distance(20)
	.linkDistance(50)
	.gravity(0.075)
	.size([graphWidth,graphHeight]);

    force
      .nodes(datos.nodes)
      .links(datos.links)
      .start();

    var links = graphConteiner.append("g").attr("class","NODOS")
      .selectAll("line.link")
	.data(force.links())
	.enter().append("line")
	.attr("class","link")
	.attr("opacity",0.4)


    var nodes = graphConteiner.append("g").attr("class","LIGAS")
      .selectAll("circle.node")
	.data(force.nodes())
	.enter().append("circle")
	.attr("class","node")
	.attr("tag",function(d) { return d.id; })
	.attr("r",function(d) {
	  var nAdj = /*adj*/pmts.filter(function(a) {
	    return a.id == d.id;
	  })
	  .map(function(d) { return d.pmt });

	  function sum(a,b) { return a + b; };

	  var radiuScale = d3.scale.linear()
	      .domain(d3.extent(pmts,function(d) { return d.pmt; }))
	      .range([5,35]);
	  var RADIOS = d.id == 0 ? 0 : radiuScale(nAdj)
	  
	  return RADIOS;
	})
	.attr("opacity",mainOpacity)
	.attr("noAdj",function(d) {
	  var nAdj = adj.filter(function(a) {
	    return a.ID_EMPRESA == d.id;
	  })
	  .map(function(d) { return +d.ADJUDICADOS; });

	  function sum(a,b) { return a + b; };

	  nAdj = nAdj.length > 0 ? nAdj.reduce(sum) : 0;

	  var TAG = nAdj > 0 ? null : "si";
	  return TAG;
	})
	.attr("stroke",function(d) {
	  var TAG = d3.select(this).attr('noAdj');
	  var COLOR = TAG == 'si' ? "black" : null;
	  return COLOR//'rgb(5,63,66)';
	})
	.attr("fill", function(d) {
	  var nAdj = adj.filter(function(a) {
	    return a.ID_EMPRESA == d.id;
	  })
	  .map(function(d) { return +d.ADJUDICADOS; });

	  function sum(a,b) { return a + b; };

	  nAdj = nAdj.length > 0 ? nAdj.reduce(sum) : 0;

	  var COLOR = nAdj > 0 ? colorScale(nAdj) : "transparent";
	  d3.select(this)
	    .attr("color",COLOR)
	  return COLOR;
	})
	.call(force.drag)
      .on("mouseover", function(d) {
	d3.select(this).attr("opacity",0.9);
	var obj = data.filter(function(E) {
	  return +E.ID_EMPRESA  == d.id
	})[0];

	var style = {
	  'x':width-20,
	  'y':25,
	  'font-size':16,
	  'font-family':'Open Sans',
	  'id':'nombreEmpresa',
	  'font-weight':800,
	  'text-anchor':'end',
	  'fill':'rgb(8,109,115)',
	};

	d3.select("g#red").append("text")
	  .attr(style).text(obj.EMPRESA);
       })

      .on("mouseout", function(d) {
	if(!d3.select(this).attr("id")) { 
	  d3.select(this).attr("opacity",mainOpacity);
	}
	d3.select("g#red").selectAll("text#nombreEmpresa").remove();
       })
       .on("click", function(d) {
//-------INTERACCIÓN IZQUIERDA-----------------------------------------------|

	  d3.selectAll("#selected")
	    .attr("id",null)
	    .attr("stroke",function(d) {
	      var TAG = d3.select(this).attr('noAdj');
	      var COLOR = TAG ? "black" : null;
	      return COLOR;
	    })
	    .attr("stroke-width",1)
	    .attr("opacity",mainOpacity);

	  var thisNode = d.id;
	  var arr = [];
	  var NN = force.links().filter(function(d) { 
	    return d.source.id == thisNode || d.target.id == thisNode; 
	  });
	  NN.forEach(function(d) {
	    arr.push(d.source.id);
	    arr.push(d.target.id);
	  });
	  arr = arr.reduce(function(a,b) {
	    if(a.indexOf(b) < 0) { a.push(b); };
	    return a;
	  },[]);

	  for(var i in arr) {
	    d3.select("[tag='"+ arr[i] + "']")
	      .attr("stroke","blue")
	      .attr("stroke-width",2.5)
	      .attr("id","selected")
//	      .attr("opacity",1);
	  };

	  links.style("stroke-width", function(d) {
	    var cond = d.source.id == thisNode || d.target.id == thisNode;
	    return cond ? "2" : "1";
          });

          links.style("stroke", function(d) {
            var cond = d.source.id == thisNode || d.target.id == thisNode;
            return cond ? "blue" : "black";
          });

	d3.select(this)
	 .attr("id","selected")
	 .attr("stroke",actual)
	 .attr("opacity",0.8)
	 .attr("stroke-width",3)
//---------------------------------------------------------------------------|
//------INTERACCIÓN DERECHA--------------------------------------------------|
      plantillaEmpresa(d,adj,data,licRondas,pmts,tabla,procesos,ofertas,OFERTAS_);
      GraficosEmpresa(d.id,data,tabla,OFERTAS_,ofertas)
//---------------------------------------------------------------------------|
	});

    force.on("tick", function(e) {
      ky = e.alpha;
      datos.nodes.forEach(function(d) {
	/* GRAVEDAD ARTIFICIAL */
        d.y -= (d.y*d.weight*0.015) * ky;
	/* GRAVEDAD ARTIFICIAL */
      });
      links.attr("x1", function(d) { return d.source.x; })
	 .attr("y1", function(d) { return d.source.y; })
	 .attr("x2", function(d) { return d.target.x; })
	 .attr("y2", function(d) { return d.target.y; })
	 .attr("stroke","black");

      nodes.attr("cx", function(d) { return d.x; })
	 .attr("cy", function(d) { return d.y; });
    });

  listaEmpresas(adj,data,licRondas,pmts,force,links,tabla,procesos,ofertas,OFERTAS_);


  var arr = licRondas.map(function(d) {
    return d.RONDA + "-" + d.LICITACION;
  });

  arr = _.uniq(arr);

  arr = arr.map(function(d) {
    var ronda = d.split("-")[0];
    var lic = d.split("-")[1];
    return { 'ronda':ronda, 'lic':lic };
  });

  leyendaRED();
//  Filtros(licRondas,data,adj,pmts,ofertas,tabla,procesos);
  NuevoFiltro(licRondas,data,adj,pmts,ofertas,tabla,procesos);
  resumen(data,adj,licRondas,pmts,ofertas,arr,tabla,procesos)
  
/*  d3.select("div#tutorial")
    .on("click",function() {
      d3.select(this).remove();
    });
*/
//---------------------------------------------------------------------------
// PRESERVE ASPECT RATIO LADO IZQUIERDO
//-------------------------------------------------------------------------

var svg_canvas = d3.select("div#red")
var red_WIDTH = +svg_canvas.style("width").split("px")[0];
var red_HEIGHT = svg_canvas.style("height").split("px")[0];

d3.select("svg#canvas")
  .attr("viewBox","-20 -20 " + (red_WIDTH) + " " + red_HEIGHT)
  .attr("preserveAspectRatio","xMinYMid meet")
//  .style("padding-top","20px")

  };


}

RED(graphW,graphH);

//*********************************************************************|
//---------------------------------------------------------------------|
//	     FUNCIONES PARA PREPROCESAR LOS NODOS Y LIGAS.	       |
//---------------------------------------------------------------------|
//*********************************************************************|
var Procesar = {}

Procesar.unicos = function (arr,key) {
 var uniq = arr.map(function(d) {  return +d[key]; }).reduce(function(a,b) {
   if(a.indexOf(b) < 0) { a.push(b) }
   return a;
 },[]).sort(function(a,b) { return a - b; });

 return uniq;
};


Procesar.transformar = function (data,unicos) {
 var arr = [];
 for(var i in unicos) {
  var set = data.filter(function(d) { return d.ID_LICITANTE == unicos[i]; });
  var l = set.map(function(d) { return d.ID_LICITANTE; })[0];
  var e = set.map(function(d) { return d.ID_EMPRESA; });
  var doc = { lic: l, emps: e };
  arr.push(doc);
 }

 return arr;
};

Procesar.edges = function(transformacion,emps) {
 var links = [];
 for(var j in transformacion) {
  if(transformacion[j]["emps"].length > 1) {
   var b = transformacion[j]["emps"];
   for(var i in b) {
    var counter = i;
    while(counter < b.length - 1) {
      counter++;
      var source = emps.indexOf(+b[i]), target = emps.indexOf(+b[counter]);
      var doc = { 'source': source, 'target':target };
      links.push(doc)
    }
   }
  }
 }
 return links;
}

function SUM(a,b) { return a + b; };

function leyendaRED() {
  var conteiner = d3.select("g#red").append("g").attr("id","leyenda_principal");
  var gradient = conteiner
	.append("defs")
	.append("linearGradient")
	.attr("id","gradient");

  gradient.append("stop")
	.attr("offset","0")
	.attr("stop-opacity",mainOpacity + 0.05)
	.attr("stop-color",minColor);

  gradient.append("stop")
	.attr("offset","1")
	.attr("stop-opacity",mainOpacity + 0.05)
	.attr("stop-color",maxColor);

    conteiner.append("rect")
    .attr({
      "id":"leyenda",
      "height":15,
      "width":100,
      "x":function(d) {
	var extraOffset = 40;
	var offset = +d3.select("#filtroEmpresas")
	  .style("width").split("px")[0] + extraOffset;
	return offset;
      },
      "y":function(d) {
	var offset = +d3.select("#filtroEmpresas")
	  .style("height").split("px")[0] - 75;
	var Height = +d3.select(this).attr("height");
	return +offset - Height;
      },
      "fill":"url(#gradient)",
      "rx":5,
      "ry":5
    });

    conteiner.append("rect")
    .attr({
     'id':'cero',
     'fill':'transparent',
     'stroke':'black',
     'stroke-width':0.5 + "px",
//     'r':10,
     'height':15,
     'width':15,
     'x': function() {
      var x = d3.select("rect#leyenda").attr("x");
      var offset = d3.select(this).attr("width");
      return +x - +offset - 3;
     },
     'y':function() {
	var y = d3.select("rect#leyenda").attr("y")
      return y
     }
    });

    var rectLeyenda = d3.select("rect#leyenda");

    conteiner.append("line")
    .attr({
     "x1": function() {
	var x = d3.select("rect#cero").attr("x");
	return x;
     },
     "y1": function() {
	var offset = rectLeyenda.attr("height");
	var y = rectLeyenda.attr("y");
	return +y + +offset + 5;
     },
     "x2": function() {
	var offset = rectLeyenda.attr("width");
	var x = +rectLeyenda.attr("x");
	return +offset + x;
     },
     "y2": function() {
	var offset = rectLeyenda.attr("height");
	var y = rectLeyenda.attr("y");
	return +y + +offset + 5;
     },
     "stroke":"black",
     "id":"separador"
    })
    .style("stroke-width",0.25);

    var rExpl = 'Las líneas representan asociaciones entre empresas.'//'El tamaño de los círculos representa la inversión comprometida.';
//&odot;&horbar;&odot;
    var textoGradiente = [rExpl,'0','1',String(maxAdj),'No. de contratos:'];

    conteiner.selectAll("text")
      .data(textoGradiente).enter()
      .append("text")
	.attr("font-weight",400)
	.attr("font-size",10)
	.attr("text-anchor",function(d) {
	  var pos;
	  if(d =='0') pos = "middle"
	  return pos;
	})
	.attr("x",function(d) {
	  if(d == rExpl) {
	    var x = d3.select("rect#cero").attr("x");
	    return x;
	  } else if(d == '0') {
	    var x = d3.select("rect#cero").attr("x");
	    var offset = d3.select("rect#cero").attr("width")/2;
	    return +x + +offset;
	  } else if(d == '1') {
	    return +rectLeyenda.attr("x") + 3;
	  } else if(d == String(maxAdj)) {
	    var offset = d3.select(this).node().getBBox();
	    return +rectLeyenda.attr("width") + +rectLeyenda.attr("x") - 15;
	  } else {
	    return d3.select('rect#cero').attr("x");
	  }
        })
	.attr("y",function(d) {
	  if(d == rExpl) {
	    var y = d3.select("line#separador").attr("y1");
	    var extraOffset = 13;
	    return +y + extraOffset;
	  } else if(d == '0') {
	    return +rectLeyenda.attr("height") + +rectLeyenda.attr("y") - 3;
	  } else if(d == '1') {
	    return +rectLeyenda.attr("height") + +rectLeyenda.attr("y") - 3;
	  } else if(d == String(maxAdj)) {
	    return +rectLeyenda.attr("height") + +rectLeyenda.attr("y") - 3;
	  } else {
	    d3.select(this).attr("id","noDeContratos");
	    return +rectLeyenda.attr("y") - 4;
	  }
        }).text(function(d) { return d; });

	var rr = 7;
        var radios = [rr*4,rr*3,rr*2,rr*1];
        var radioGrande = radios[0];
	conteiner.append("g")
	 .selectAll("circle")
	.data(radios).enter()
	.append("circle")
	 .attr({
	  "fill":"transparent",
	  "stroke":"gray",
	  "stroke-width":"1",
	  "stroke-dasharray":"4,2",
	  "r": function(d) {
	    if( d == radioGrande ) d3.select(this).attr("id","radioGrande");
	    return d;
	  },
	  "cx": function(d) {
	   var ref = d3.select("text#noDeContratos");
	   var x = +ref.attr("x").split("px")[0];
	   return x + radioGrande;
	  },
	  "cy": function(d) {
	    var ref = d3.select("text#noDeContratos")
	    var h = ref.node().getBBox().height;
	    var y = +ref.attr("y").split('px')[0];
	    return y - d - h - 5;
	  }
	 })

	 var grandeAttrs = d3.select("circle#radioGrande");
	 var textoRadios = [
	  'Círculos:',
	  'empresas',
	  'Tamaño:',
	  'inversión'
	 ];
	 conteiner.append("g").append("text")
	  .selectAll("tspan")
	  .data(textoRadios).enter()
	  .append("tspan")
	 .attr({
           'id':function(d) {
	      if( d == textoRadios[0] ) return d.split(':')[0];
	   },
	   'font-size':10,
	   'font-weight':function(d) {
	     var f_w = 300;
	     if( d == textoRadios[0] || d == textoRadios[2] ) f_w = 600;
	     return f_w;
	   },
	   'text-anchor': function(d) {
	     var t_a = 'middle';
	     if(d == textoRadios[2] || d == textoRadios[3]) {
		t_a = 'start';
	     };
	     return t_a;
	   },
/*	   'alignment-baseline': function(d) {
	     var al;
	     if(d == textoRadios[0] || d == textoRadios[2]) { 
		al = 'text-after-edge';
	     };
	     if(d == textoRadios[1] || d == textoRadios[3]) {
		al = 'hanging';
	     };
	     return al;
	   },
*/
	   'x': function(d) {
	     var x = +grandeAttrs.attr("cx");
	     if(d == textoRadios[2] || d == textoRadios[3]) {
		x += radioGrande + 3;
	     };
	     return x;
	   },
	   'y': function(d,i) {
	     var y = +grandeAttrs.attr("cy");
	     var offset = 0;
	     if( i == 3 || i == 1 ) offset = 9;

	     if(d == textoRadios[0] || d == textoRadios[1]) { 
		y = y - radioGrande - 12;
	     }
	     return y + offset;

	   } 
	  }).text(function(d) {
	     return d
	  });

  let filtroEMpresas = d3.select("div#filtroEmpresas")
  d3.select("svg#canvas").append("g")
    .attr("id","tituloRed_")
    .selectAll("text")
    .data(['Red de asociaciones','entre empresas licitantes']).enter()
    .append("text")
   .attr({
     'text-anchor':'end',
     'opacity':0.8,
     'font-size':14,
     'font-family':'Open Sans',
     'font-weight':800,
     'alignment-baseline':'text-after-edge',
     "x": function() {
//	var ww = +filtroEMpresas.style("width").split("px")[0]
	let anchor_ = d3.select("g#red>rect").attr("width").split("px")[0]
        return anchor_ -  25//ww + 10
      },
     "y": function(d,i) {
	let anchor_ = d3.select("g#red>rect").attr("height").split("px")[0]
	return (anchor_-0) +(i*17);
      }
    }).text(function(d) { return d; });

  var tituloRed__ = d3.select("g#tituloRed_");
  var titREDheight = tituloRed__.node().getBBox().height;

  tituloRed__.attr("transform","translate(0," + -2*titREDheight + ")");
/*
  let filtroEMpresas = d3.select("div#filtroEmpresas")

  var signosMas = ['&uarr;','&oplus;','&oplus;','&oplus;','&oplus;'];
  conteiner.append("g")
   .attr("id","plus")
  .selectAll("text")
   .data(signosMas).enter()
  .append("text")
   .attr({
    "opacity":0.3,
    "text-anchor":"middle",
    "font-size":function(d,i) {
      return Math.log(((signosMas.length)-(i)))*22;
    },
    "alignment-baseline":"hanging",
    "font-weight":300,
    "x":function(d,i) {
     var offset = +filtroEMpresas.style("width").split("px")[0];
     return offset + 35;
    },
    "y":function(d,i) {
     return (i*30) + 5;
    }
   }).html(function(d) { return d; });

  var signosMenos = ['&ominus;','&ominus;','&ominus;','&ominus;','&darr;'];
  conteiner.append("g")
   .attr("id","minus")
  .selectAll("text")
   .data(signosMenos).enter()
  .append("text")
   .attr({
    "opacity":0.3,
    "text-anchor":"middle",
    "font-size":function(d,i) {
      return Math.log((i+1))*22;
    },
    "alignment-baseline":"hanging",
    "font-weight":300,
    "x":function(d,i) {
     var offset = +filtroEMpresas.style("width").split("px")[0];
     return offset + 35;
    },
    "y":function(d,i) {
     return (i*20) + 0;
    },
   }).html(function(d) { return d; });

   d3.select("g#minus").attr("transform",function(d) {
    var offset = d3.select("#Círculos").node().getBBox().y;
    var hh = d3.select(this).node().getBBox().height;
    return "translate(0," + (offset-hh-10) + ")";
   });

  var signosTextos = ['Empresas más asociadas'];
  conteiner.append("g")
   .attr("class","signosTextos")
  .selectAll("text")
   .data(signosTextos).enter()
.append("text")
   .attr({
    //"opacity":1,
    "text-anchor":"end",
    "font-size":10,
    "alignment-baseline":"text-after-edge",
    "font-weight":400,
    "x":function(d,i) {
      let attrs = d3.select("g#plus").node().getBBox();
      let x = attrs.x;
      return x - 10; 
    },
    "y":function(d,i) {
      let plus = d3.select("g#plus").node().getBBox();
      let minus = d3.select("g#minus").node().getBBox();
      var hh;
      var y;
      if( i == 0 ) {
        y = 0;
	hh = plus.height / 2;
      } else {
	hh = minus.height / 2;
	y = +d3.select("g#minus").attr("transform")
		.split(",")[1].split(")")[0];
      };
      return hh + y;
    },
    'transform':'rotate(-90)'
   }).html(function(d) { return d; });
*/
}
