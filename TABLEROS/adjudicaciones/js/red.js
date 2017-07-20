//var graphConteinerRect = d3.select("g#red>rect");
var graphW = window.innerWidth/2//graphConteinerRect.attr("width"),
    graphH = window.innerHeight;//graphConteinerRect.attr("height");

var NN,LL;

function RED(width,height) {
var graphConteiner = d3.select("g#red");
//var graphWidth = window.innerWidth/2//graphConteinerRect.attr("width"),
//    graphHeight = window.innerHeight;//graphConteinerRect.attr("height");
var graphWidth = width, graphHeight = height;

d3.csv("./data.csv", function(data) {
  var lics = Procesar.unicos(data,"lic");
//  var emps = Procesar.unicos(data,"emp");
  var sets = Procesar.transformar(data,lics);
//  var links = Procesar.edges(sets,emps);
/*
  for(var i in emps) {
   emps[i] = { 'id':emps[i] };
  };
*/
  var nodes = sets.filter(function(d) { return d.emps.length > 1; })
    .map(function(d) { return d.emps; });

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


  var datos = {'nodes':arr,'links':links};

  var force = d3.layout.force()
	.charge(-50)
	.distance(10)
	.linkDistance(30)
	.gravity(0.08)
	.size([graphWidth,graphHeight]);

  force
    .nodes(datos.nodes)
    .links(datos.links)
    .start();

  var links = graphConteiner.append("g").attr("class","NODOS")
      .selectAll("line.link")
	.data(force.links())
	.enter().append("line")
	.attr("class","link");

  var nodes = graphConteiner.append("g").attr("class","LIGAS")
      .selectAll("circle.node")
	.data(force.nodes())
	.enter().append("circle")
	.attr("class","node")
	.attr("r",8)
	.call(force.drag)
////////////
.on("click", function(d) {
    var thisNode = d.id; console.log(thisNode)
    var connected = datos.links.filter(function(e) {
        return e.source === thisNode || e.target === thisNode
    });

    nodes.attr("opacity", function(d) {
        return (connected.map(function(d) { return  d.source }).indexOf(d.id) > -1 || connected.map(d => d.target).indexOf(d.id) > -1) ? 1 : 0.1
    });

    links.attr("opacity", function(d) {
        return (d.source.id == thisNode || d.target.id == thisNode) ? 1 : 0.1
    });
})
//////////////////
  force.on("tick", function(e) {
    ky = e.alpha;
    datos.nodes.forEach(function(d) {
      //d.x -= (d.x - width) * 8 * ky;
      d.y -= (d.y*d.weight*0.005) * ky;
    });
    links.attr("x1", function(d) { return d.source.x; })
	 .attr("y1", function(d) { return d.source.y; })
	 .attr("x2", function(d) { return d.target.x; })
	 .attr("y2", function(d) { return d.target.y; })
	 .attr("stroke","black");

    nodes.attr("cx", function(d) { return d.x; })
	 .attr("cy", function(d) { return d.y; });
  });

NN=force.nodes(); LL=force.links();


function test() {
 var nodos;
 nodos = LL.filter(function(d) {
   return d.source.id == 150 || d.target.id == 150;
 })

  
 console.log(nodos);
}

test()

});
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
  var set = data.filter(function(d) { return d.lic == unicos[i]; });
  var l = set.map(function(d) { return d.lic; })[0];
  var e = set.map(function(d) { return d.emp; });
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


