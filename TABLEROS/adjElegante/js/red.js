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
    .defer(d3.csv,'csv/ofertas.csv')
    .await(getDATA);

  function getDATA(err,data,adj,licRondas,ofertas) {
     /*PROCESAR LICITANTES POR RONDA*/
     licRondas.forEach(function(d) {
       d.LICITANTE = d.LICITANTE.split(";")
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
      var col = ['PMT_TOTAL','VAR_ADJ1','VAR_ADJ2','VPO']
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

    var links = Procesar.edges(sets,arr);

    for(var i in arr) {
      arr[i] = { 'id':arr[i] };
    }
/*-------ANALIZAR----------------------------*/

    var datos = {'nodes':arr,'links':links};

    var force = d3.layout.force()
	.charge(-55)
	.distance(20)
	.linkDistance(40)
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
//	.attr("stroke-dasharray","1 1");


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
/*	  var colorScale = d3.scale.linear()
	      .domain([0,maxAdj])
	      .range(["gold","red"]);*/

	  var COLOR = nAdj > 0 ? colorScale(nAdj) : "transparent";
	  d3.select(this)
	    .attr("color",COLOR)
//	    .attr("opacity",0);
	  return COLOR;
/*
	  var cont = data.filter(function(a) { return +a.ID_EMPRESA == d.id; })
		.map(function(d) { return d.CONTINENTE; })[0];

	  var pantones = [
		'rgb(223,63,50)', // AMÉRICA
		'rgb(140,195,0)', // OCEANÍA
		'rgb(0,88,94)', // EUROPA
		'black',//'rgb(228,88,5)',  // ÁFRICA
		'rgb(82,133,196)'   // ASIA
	  ];
	  var color = d3.scale.ordinal()
	    .domain(continentes)
	    .range(pantones);

	  return color(cont); */
	})
	.call(force.drag)
      .on("mouseover", function(d) {
	d3.select(this).attr("opacity",0.9);
	var obj = data.filter(function(E) {
	  return +E.ID_EMPRESA  == d.id
	})[0];

	var style = {
	  'x':width,
	  'y':graphH - 10,
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
	plantillaEmpresa(d,adj,data,licRondas,pmts);
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

  listaEmpresas(adj,data,licRondas,pmts,force,links);

  leyendaRED();
  Filtros(licRondas,data);

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

function plantillaEmpresa(d,adj,data,licRondas,pmts) {

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
	var Height = d3.select(this).attr("height");
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

    var rExpl = 'El tamaño de los círculos representa la inversión comprometida.';
    var textoGradiente = [rExpl,'0','1',String(maxAdj),'No. de contratos:'];

    conteiner.selectAll("text")
      .data(textoGradiente).enter()
      .append("text")
	.attr("font-weight",300)
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
	    return +rectLeyenda.attr("y") - 4;
	  }
        }).text(function(d) { return d; });

}
