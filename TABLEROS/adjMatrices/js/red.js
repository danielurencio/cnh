var graphW = window.innerWidth/2//graphConteinerRect.attr("width"),
    graphH = window.innerHeight;//graphConteinerRect.attr("height");

var NN,LL,maxAdj;

function RED(width,height) {
  var graphConteiner = d3.select("g#red");
  var graphWidth = width, graphHeight = height;

  queue()
    .defer(d3.csv,'csv/data.csv')
    .defer(d3.csv,'csv/adj.csv')
    .defer(d3.csv,'csv/linkWidth1.csv')
    .defer(d3.csv,'csv/ofertas2.csv')
    .defer(d3.csv,'csv/tabla.csv')
    .defer(d3.csv,'csv/procesos.csv')
    .await(getDATA);

  function getDATA(err,data,adj,licRondas,OFERTAS_,tabla,procesos) {

/*-------------------NUEVO FILTRO------------------------------------------*/
    var ron_lic = licRondas.map(function(d) {
      var result;
      result = "R" + d.RONDA + "." + d.LICITACION;
      return result;
    }); 

    ron_lic = _.uniq(ron_lic);
    ron_lic.splice(ron_lic.indexOf("R."),1)

    for(var i in ron_lic) {
     var split_ = ron_lic[i].split(".")
     var ronda = split_[0].split("R")[1];
     var lic = split_[1];
     ron_lic[i] = "Ronda " + ronda + " - Licitación " + lic;
    };

    d3.select("#opciones>select").selectAll("option")
     .data(ron_lic).enter()
     .append("option")
     .attr("id",function(d) { return d; })
    .html(function(d) { return d; }) 

    $(".chosen-select-no-results")
     .chosen({ 'no_results_text': "Resultado no encontrado..." })

    d3.select("div[class='chosen-container chosen-container-multi']")
     .attr({
	"border-color":"orange",
	"id":"borde"
      })

    d3.select("ul.chosen-choices")
     .attr("id","borde")
     .style({
      "color":"black",
      "background":"black",
      "border-color":"orange",
      "border-style":"solid",
      "border-width":"0.5"
     })

    d3.selectAll("#borde").style("border-color","orange")

    d3.select("input.chosen-search-input.default").style("width","300px")

    var svgCintilla = d3.select("svg#cintilla")
    var widthCintilla = d3.select("div#cintilla0")
	.style("width").split("px")[0];

    svgCintilla
	.append("text")
	.attr("x", widthCintilla-15)
	.attr("y",16)
	.attr("fill","rgba(255,255,255,0.7)")
	.attr("alignment-baseline","middle")
	.attr("text-anchor","end")
	.attr("font-weight",800)
	.text("Filtro:") 

/*-------------------NUEVO FILTRO------------------------------------------*/


     var ofertas = OFERTAS_.filter(function(d) {
	return d.ID_LICITANTE_ADJ == d.ID_LICITANTE_OFERTA;
     });

     procesos.forEach(function(d) {
	d.DATAROOM = +d.DATAROOM;
	d.PRECALIF = +d.PRECALIF;
     });

     /*PROCESAR LICITANTES POR RONDA*/
     licRondas = licRondas.filter(function(d) {
	return d.RONDA && d.LICITACION;
     });
     licRondas.forEach(function(d) {
       if(d) d.LICITANTE = d.LICITANTE.split(";")
     });
     /*-----------------------------*/

     /*¿CUÁLES SON LOS CONTINENTES?*/
     /*... de esto depende el color de los nodos*/
    var continentes = data.map(function(d) { return d.CONTINENTE; })
     .reduce(function(a,b) { 
      if(a.indexOf(b) < 0 ) { a.push(b); }
      return a;
    },[]);

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
        .range(["gold","red"]);

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

//////////////////////////////////////////////////////////////////////////////
//EJECUCIÓN DE PRIMER PLANTILLA: RESUMEN DE RONDAS///////////////////////////
   // resumen(data,adj,licRondas,pmts,ofertas,null,tabla,procesos)
///////////////////////////////////////////////////////////////////////////

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
console.log(arr)

    var links = Procesar.edges(sets,arr);

    for(var i in arr) {
      arr[i] = { 'id':arr[i] };
    }
/*-------ANALIZAR----------------------------*/

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
	  .map(function(d) { return d.pmt});//+d.ADJUDICADOS; });

	  function sum(a,b) { return a + b; };

	 // nAdj = nAdj.length > 0 ? nAdj.reduce(sum) : 0;
	  var radiuScale = d3.scale.linear()
	      .domain(d3.extent(pmts,function(d) { return d.pmt; }))
	      .range([5,35]);
	  return radiuScale(nAdj)
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
	  return COLOR;
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
	  'x':width,
	  'y':graphH - 40,
	  'font-size':12,
	  'font-family':'Open Sans',
	  'id':'nombreEmpresa',
	  'font-weight':300,
	  'text-anchor':'end'
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
	    .attr("stroke-width",null)
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
	      .attr("stroke",peers)
	      .attr("stroke-width",2.5)
	      .attr("id","selected")
//	      .attr("opacity",1);
	  };

	  links.style("stroke", function(d) {
	    var cond = d.source.id == thisNode || d.target.id == thisNode;
	    return cond ? "tomato" : "black";
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
  //Filtros(licRondas,data,adj,pmts,ofertas,tabla,procesos);
  NuevoFiltro(licRondas,data,adj,pmts,ofertas,tabla,procesos);
  resumen(data,adj,licRondas,pmts,ofertas,arr,tabla,procesos)
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
  var conteiner = d3.select("g#red").append("g");
  var gradient = conteiner
	.append("defs")
	.append("linearGradient")
	.attr("id","gradient");

  gradient.append("stop")
	.attr("offset","0")
	.attr("stop-opacity",mainOpacity + 0.05)
	.attr("stop-color","gold");

  gradient.append("stop")
	.attr("offset","1")
	.attr("stop-opacity",mainOpacity + 0.05)
	.attr("stop-color","red");

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
	  .style("height").split("px")[0] - 45;
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

    var rExpl = ' &xcirc;&mdash;&mdash;&xcirc; Las líneas representan asociaciones entre empresas.'//'El tamaño de los círculos representa la inversión comprometida.';
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
        }).html(function(d) { return d; });

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
	 conteiner.append("g")
	  .selectAll("text")
	  .data(textoRadios).enter()
	  .append("text")
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
	   'alignment-baseline': function(d) {
	     var al;
	     if(d == textoRadios[0] || d == textoRadios[2]) { 
		al = 'text-after-edge';
	     };
	     if(d == textoRadios[1] || d == textoRadios[3]) {
		al = 'hanging';
	     };
	     return al;
	   },
	   'x': function(d) {
	     var x = +grandeAttrs.attr("cx");
	     if(d == textoRadios[2] || d == textoRadios[3]) {
		x += radioGrande + 3;
	     };
	     return x;
	   },
	   'y': function(d) {
	     var y = +grandeAttrs.attr("cy");
	     if(d == textoRadios[0] || d == textoRadios[1]) { 
		y = y - radioGrande - 12;
	     }
	     return y;

	   } 
	  }).html(function(d) {
	     return d
	  });
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
