function listaEmpresas(adj,data,licRondas,pmts,force,links,tabla,procesos,ofertas,OFERTAS_) {
  var colorBarras = "rgb(13,180,190)";
  var lista = d3.select("#filtroEmpresas");

  lista.append("svg").attr("id","verLista")
    .style("width","inherit")
    .style("height","500px")
    .append("text")
      .attr({
	'x':-5,
	'y':15,
	'fill':"white",
	'font-size':18,
	'font-weight':400,
	'font-family':'Open Sans',
	'transform':'rotate(-90)',
	'text-anchor':'end',
	'alignment-baseline':'middle'
      }).text("Ver lista de empresas")
      .on('mouseover', function() {
	d3.select(this).style("cursor","pointer");
      });


  lista
    .on("click",mostrarLista);

  d3.select("div#tutorial")
    .on("click",mostrarLista);

function mostrarLista() {

     d3.select("div#tutorial")[0][0] ? d3.select("div#tutorial").remove() : null;
      
      d3.select("#filtroEmpresas>svg").remove();

      var empresas = /*adj*/data.map(function(d) { return d.EMPRESA; })
       .reduce(function(a,b) {
        if(a.indexOf(b) < 0) { a.push(b); }
        return a;
      },[]).sort();


      for(var i in empresas) {
       var match = /*adj*/data.filter(function(e) { return e.EMPRESA == empresas[i]; })[0];
       var doc = { 'EMPRESA':empresas[i], 'id':match.ID_EMPRESA }
       empresas[i] = doc;
      };

  empresas = empresas.filter(function(d) { return d.id != 0; });

  var emps_ = data.map(function(d) {
    var obj = {};
    obj["EMPRESA"] = d.EMPRESA;
    obj["id"] = d.ID_EMPRESA;
    return obj;
  });

  emps_ = _.uniq(emps_,function(item) {
    return [item.EMPRESA, item.id].sort().join(',');
  });


      if(!lista.attr("class")) {
        lista.attr("class","toggled")
        var t0 = d3.select("div#filtroEmpresas").transition().duration(300)
        t0.style("width","360px")
	  .each("end",function() {
	    lista.append("div")
	    .attr("id","listaConteiner")
	    .style("padding","5px")
	    .style("width","310px")
	     .append("input")
	      .attr("oninput","regex()")
	      .attr("type","text")
	      .attr("id","inputRegex")
	      .style("border-style","solid")
	      .style("border-width","0.5px")
	      .style("background-color","transparent")
	      .style("background",lupita + 'no-repeat 1px 1px')//'url(/images/estadistica/tablero-licitaciones/glass_.svg) no-repeat 1px 1px')
	      .style("padding-left","25px")
	      .style("color",colorBarras)
	      .style("width","inherit");

	    lista.append("ol")
	    .style("margin-top","0px")
	    .style("font-size","12px")
	    .style("padding-righ","25px")
	    .style("padding-top","0px")
	    .style("padding-left","30px")
	    .style("margin-bottom","50px")
	    .style("list-style","decimal")
	    .style("text-align","left")
	    .selectAll("li")
	      .data(empresas).enter()
	      .append("li")
	      .html(function(d) { return d.EMPRESA; })
	      .style("color",function(d) {
		var color = "rgba(255,255,255,0.4)";
		return color;
	       })
	      .style("cursor","pointer")
	      .attr("tag",function(d) { return d.id; })
	      .style("background-color",function(d) {	
		var nodoActivo = d3.selectAll("circle#selected");
		var color = null;
		if(nodoActivo[0][0]) {
		  for(var i in nodoActivo[0]) {
		    var currentTag = nodoActivo[0][i].getAttribute("tag");
		    var c1 = nodoActivo[0][i].getAttribute("stroke") == actual;
		    if(+currentTag == +d.id && c1) {
		      color = colorBarras;
		      d3.select(this).attr("class","on");
		      d3.select(this).style("color","white");
		    };
		  };
		};
		return color;
	      })
	      .on("mouseover",function(l) {
		var sel = d3.select(this)
		if(!sel.attr("class")) sel.style("color",colorBarras);
	      })
	      .on("mouseout",function(l) {
		var sel = d3.select(this)
		if(!sel.attr("class")) sel.style("color","rgba(255,255,255,0.4)");
	      })
	      .on("click",function(d) {

		d3.selectAll(".on")
		  .attr("class",null)
		  .style("background-color",null)
		  .style("color","rgba(255,255,255,0.4)");

	        d3.select(this)
		  .attr("class","on")
		  .style("color","white")
		  .style("background-color",colorBarras);
		selectNODES(d);
  plantillaEmpresa(d,adj,data,licRondas,pmts,tabla,procesos,ofertas,OFERTAS_);
  GraficosEmpresa(d.id,data,tabla,OFERTAS_,ofertas)
	      });
	  });

        lista.style("overflow","auto")
      }
    };

  d3.select("svg#canvas")
   .on("click",hideLista);

  d3.select("div#info")
    .on("click",hideLista);

  function hideLista(d) {
   var verLista = d3.select("svg#verLista")[0][0];

    d3.select("div#filtroEmpresas").style("overflow","hidden")

    lista.attr("class",null)
    lista.selectAll("ol").remove();
    lista.selectAll("input").remove();
    lista.selectAll("div#listaConteiner").remove();
    lista.transition().duration(300)
      .style("width","40px")

   if(!verLista) {
    lista.append("svg").attr("id","verLista")
    .style("width","inherit")
    .style("height","500px")
    .append("text")
      .attr({
	'x':-5,
	'y':15,
	'fill':"white",
	'font-size':18,
	'font-weight':400,
	'font-family':'Open Sans',
	'transform':'rotate(-90)',
	'text-anchor':'end',
	'alignment-baseline':'middle'
      }).text("Ver lista de empresas")
      .on('mouseover', function() {
	d3.select(this).style("cursor","pointer");
      });

   };

  };

  function selectNODES(d) {
          d3.selectAll("#selected")
            .attr("id",null)
            .attr("stroke",function(d) {
              var TAG = d3.select(this).attr('noAdj');
              var COLOR = TAG ? "black" : null;
              return COLOR;
            })
            .attr("stroke-width",null)
            .attr("opacity",mainOpacity);

          var thisNode = d.id;//d3.select("circle[tag='" + d.ID + ']");
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
            var sel_ = d3.select("circle[tag='"+ arr[i] + "']")
              .attr("stroke","blue")
              .attr("stroke-width",2.5)
              .attr("id","selected")
//              .attr("opacity",mainOpacity);

          };

          links.style("stroke-width", function(d) {
            var cond = d.source.id == thisNode || d.target.id == thisNode;
            return cond ? "2" : "1";
          });

          links.style("stroke", function(d) {
            var cond = d.source.id == thisNode || d.target.id == thisNode;
            return cond ? "blue" : "black";
          });


        d3.select("circle[tag='" + d.id + "']")
         .attr("id","selected")
         .attr("stroke",actual)
	 .attr("opacity",0.8)
         .attr("stroke-width",3);


//     plantillaEmpresa(d,adj,data,licRondas,pmts);
  };

};

function regex() {
  var input = document.getElementById("inputRegex").value;
  var patt = new RegExp(input,"i");

  var lis = d3.selectAll("div#filtroEmpresas>ol>li")[0];

  for( var i=0; i<lis.length; i++ ) {
    var sel = d3.select(lis[i]);
    var str = sel.text();
    if(patt.test(str)) {
      sel.style("font-size","12px");
    } else {
      sel.style("font-size","0px");
    };
  };
};

