var graphW = window.innerWidth/2//graphConteinerRect.attr("width"),
    graphH = window.innerHeight;//graphConteinerRect.attr("height");

var NN,LL;

function RED(width,height) {
  var graphConteiner = d3.select("g#red");
  var graphWidth = width, graphHeight = height;

  queue()
    .defer(d3.csv,'data.csv')
    .defer(d3.csv,'adj.csv')
    .defer(d3.csv,'linkWidth.csv')
    .await(getDATA);

  function getDATA(err,data,adj,licRondas) {
     /*PROCESAR LICITANTES POR RONDA*/
     licRondas.forEach(function(d) {
       d.LICITANTE = d.LICITANTE.split(";")
     }); console.log(licRondas);
     /*-----------------------------*/

     /*¿CUÁLES SON LOS CONTINENTES?*/
     /*... de esto depende el color de los nodos*/
    var continentes = data.map(function(d) { return d.CONTINENTE; })
     .reduce(function(a,b) { 
      if(a.indexOf(b) < 0 ) { a.push(b); }
      return a;
    },[]);
    console.log(continentes);
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
    var maxAdj = d3.max(adjs);
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


    var mainOpacity = 0.6;
    var nodes = graphConteiner.append("g").attr("class","LIGAS")
      .selectAll("circle.node")
	.data(force.nodes())
	.enter().append("circle")
	.attr("class","node")
	.attr("tag",function(d) { return d.id; })
	.attr("r",function(d) {
	  var nAdj = adj.filter(function(a) { return +a.ID_EMPRESA == d.id; })
		.map(function(d) { return +d.ADJUDICADOS; });

	  function sum(a,b) { return a + b; };

	  nAdj = nAdj.length > 0 ? nAdj.reduce(sum) : 0;
	  var radiuScale = d3.scale.linear()
	      .domain([0,maxAdj])
	      .range([5,16]);
	  return radiuScale(nAdj)
	})
	.attr("opacity",mainOpacity)
//	.attr("stroke","black")
	.attr("fill", function(d) {
	  var cont = data.filter(function(a) { return +a.ID_EMPRESA == d.id; })
		.map(function(d) { return d.CONTINENTE; })[0];
//	  console.log(cont);

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

	  return color(cont); 
	})
	.call(force.drag)
      .on("mouseover", function(d) {
	d3.select(this).attr("opacity",0.9);
	var obj = data.filter(function(E) {
	  return +E.ID_EMPRESA  == d.id
	})[0];

	var style = {
	  'x':10,
	  'y':graphH - 10,
	  'font-size':12,
	  'font-family':'Open Sans'
	};

	d3.select("g#red").append("text")
	  .attr(style).text(obj.EMPRESA);

       })
      .on("mouseout", function(d) {
	if(!d3.select(this).attr("id")) d3.select(this).attr("opacity",mainOpacity);
	d3.select("g#red").selectAll("text").remove();
       })
       .on("click", function(d) {
	  d3.selectAll("#selected")
	    .attr("id",null)
	    .attr("stroke",null)
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
	      .attr("stroke","orange")
	      .attr("stroke-width",2)
	      .attr("id","selected")
	      .attr("opacity",1);
	  };

	  links.style("stroke", function(d) {
	    var cond = d.source.id == thisNode || d.target.id == thisNode;
	    return cond ? "orange" : "black";
          });

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

///
var toggle =0 ;
function connectedNodes(d) {
var thisNode = d.id; console.log(thisNode)
    var connected = datos.links.filter(function(e) {
        return e.source === thisNode || e.target === thisNode
    });

    nodes.attr("opacity", function(d) {
        return (connected.map(function(d) {
	  return  d.source }).indexOf(d.id) > -1 || connected.map(d => d.target).indexOf(d.id) > -1) ? 1 : 0.1
    });

    links.attr("opacity", function(d) {
        return (d.source.id == thisNode || d.target.id == thisNode) ? 1 : 0.1
    });
};
