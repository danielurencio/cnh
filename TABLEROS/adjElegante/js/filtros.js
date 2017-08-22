function Filtros(licRondas,data,adj,pmts,ofertas,tabla,procesos) {
  var conteiner = d3.select("svg#cintilla")
//	d3.select("g#red")
	.append("g").attr("id","FILTRO");

/////////////////////////////////////////////////////////////////////////////
/*--------ESPECIFICACIONES GENERALES PARA EL CUADRO DE FILTROS------------*/
///////////////////////////////////////////////////////////////////////////

  conteiner.append("rect")
   .attr({
    "id":"filtro",
    "width": 240,
    "height": 80,
    "x": function() {
      var x = d3.select("g>rect").attr("width");
      var offset = d3.select(this).attr("width");
      return +x - +offset - 5;
    },
    "y": function() {
      var y = d3.select("g>rect").attr("height");
      var offset = d3.select(this).attr("height");
      return 0//+y - +offset - 30;
    },
    "rx":5,
    "ry":5,
    "fill":"rgba(0,0,0,0.65)",//"transparent",
    "stroke":"black",
    "stroke-width":0.5
   });


  var titulos = ['Ronda','Licitación'];
  var xF = d3.select("#filtro").attr("x");
  var yF = d3.select("#filtro").attr("y");
  var widthF = d3.select("#filtro").attr("width");
  var heightF = d3.select("#filtro").attr("height");

  conteiner.selectAll("text")
   .data(titulos).enter()
   .append("text")
   .attr({
    "id":function(d) { return d; },
    "fill":"white",
    "font-weight":600,
    "text-anchor":"middle",
    "alignment-baseline":"text-before-edge",
    "font-size":10,
    "x": function(d) {
      if( d == "Total" ) {
	return +xF + (+widthF/6);
      } else if( d == "Ronda" ) {
	return +xF + (+widthF/6);
      } else {
	return +xF + (+widthF/2)*1;
      }
    },
    "y": function() {
	var y = d3.select("#filtro").attr("y");
	return +y + 2;
    }
   }).text(function(d) { return d; })
   .on("mouseover",function(d) {
     if(d == "Total") {
	d3.select(this)
	.attr("fill","orange")
	.style("cursor","pointer")
     }
   })
   .on("mouseout",function(d) {
      if( d == "Total" ) d3.select(this).attr("fill","white");
   })
   .on("click", function(d) {
      if( d == "Total" ) resumen(data,adj,licRondas,pmts,ofertas);
   });


  var cuadrosFiltros = {
   "width":9,
   "height":9,
   "fill":"transparent",
   "rx":2,
   "ry":2,
   "stroke":"white"
  };



//////////////////////////////////////////////////////////////////////////////
/*--------------  FILTRO PARA VER RONDAS  ---------------------------------*/
////////////////////////////////////////////////////////////////////////////

 var rondas = licRondas.map(function(d) { return d.RONDA; })
 	.reduce(function(a,b) {
	  if( a.indexOf(b) < 0 ) { a.push(b); };
	  return a;
	},[]).sort();


 var textOffsetR = d3.select("text#Ronda").node().getBBox();

 conteiner.append("g").selectAll("rect")
  .data(rondas).enter()
  .append("rect")
   .attr(cuadrosFiltros)
   .attr({
      "id":"on",
      "stroke":"white",
      "stroke-width":2,
      "fill":"orange",
      "class":"Ronda",
      "disable":null,
      "opacity":1,
      "tag":function(d) { return "R-" + d; },
      "x":function(d) {
	var offset = +d3.select(this).attr("width")/2;
	return textOffsetR.x - (offset*2);
      },
      "y":function(d,i) {
	var iter = +d3.select(this).attr("height") + 5;
	return 3 + textOffsetR.y + textOffsetR.height + (i*iter);
      }
   })
    .on("mouseover",function() {
      var sel = d3.select(this);
      if( !sel.attr("id") && !sel.attr("disable") ) {
        sel
	  .attr("stroke","orange")
	  .attr("stroke-width",2);
      };
    })
    .on("mouseout",function() {
      var sel = d3.select(this);
      if( !sel.attr("id") && !sel.attr("disable") ) {
	sel
	.attr("stroke","white")
	.attr("stroke-width",1);
      };
    })
    .on("click",function() {
      var sel = d3.select(this);
      var ronda = sel.attr("tag").split("-")[1];
      var lics = d3.selectAll("[ronda='" + ronda + "']");
      var licsRect = d3.selectAll("rect[ronda='" + ronda + "']");
      var licitaciones = d3.selectAll(".Licitacion");
      var licitacionesRect = d3.selectAll("rect.Licitacion");

      if( !sel.attr("id") && !sel.attr("disable") ) {
       sel.attr({
	  "id":"on",
	  "stroke":"white",
	  "stroke-width":2,
	  "fill":"orange"
	});
	lics.attr("disable",null);
	lics.attr("opacity",1);
	lics.attr("id","on");
	licsRect.attr("fill","rgba(255,165,0,0.5)");
	licsRect.attr("stroke-width",2);
      } else {
       sel.attr({
	  "id":null,
	  "stroke-width":1,
	  "fill":"transparent"
	});
	lics.attr("disable",1);
	lics.attr("opacity",0.4);
	lics.attr("opacity",0.4);
	lics.attr("disable",1);
	lics.attr("id",null);
	licsRect.attr("stroke-width",1);
	licsRect.attr("fill","transparent");
      }

      var activacion = d3.select(this).attr("id");
      filtrarPorRonda(activacion,ronda,licRondas,data,1);

    });


 conteiner.append("g").selectAll("text")
  .data(rondas).enter()
  .append("text")
   .attr({
      "class":"Ronda",
      "id":function(d) { return "R-" + d; },
      "fill":"white",
      "font-size":"9px",
      "font-weight":300,
      "alignment-baseline":"central",
      "x":function(d) {
	return textOffsetR.x + 5;
      },
      "y":function(d) {
	var sel = d3.select("rect[tag='R-" + d + "']");
	var y = +sel.attr("y");
	var offset = +sel.attr("width") / 2;
	return y + offset;
      }
   }).text(function(d) { return d; })
   .on("mouseover",function(d) {
	d3.select(this)
	.style("cursor","pointer")
	.attr("fill","orange");
    })
   .on("mouseout",function(d) {
	d3.select(this).attr("fill","white");
    })
   .on("click",function(d) {
      resumen(data,adj,licRondas,pmts,ofertas,d,tabla,procesos);
   });



//////////////////////////////////////////////////////////////////////////////
/*--------------  FILTRO PARA VER LICITACIONES  ---------------------------*/
////////////////////////////////////////////////////////////////////////////

 var textOffsetL = d3.select("text#Licitación").node().getBBox();

 for(var i in rondas) {
  var licitaciones = licRondas.filter(function(d) {
    return d.RONDA == rondas[i];
  }).map(function(d) { return d.LICITACION; })
  .reduce(function(a,b) {
    if( a.indexOf(b) < 0 ) { a.push(b); };
    return a;
  },[]).sort();

  conteiner.append("g").selectAll("rect")
   .data(licitaciones).enter()
   .append("rect")
   .attr(cuadrosFiltros)
   .attr({
      "class":"Licitacion",
      "tag":function(d) { return "R-" + rondas[i] + "-L-" + d; },
      "x":function(d,j) {
	var sel = d3.select(this);
	var offset = +sel.attr("width")/2;
	var iter = +sel.attr("width") + 5;
	return textOffsetL.x - offset + (j*iter);
      },
      "y":function(d,j) {
	var y = d3.select("rect[tag='R-" + rondas[i] + "']").attr("y");
	return y;
      }
   })


   conteiner.append("g").selectAll("text")
    .data(licitaciones).enter()
    .append("text")
     .attr({
        "class":"Licitacion",
	"ronda":rondas[i],
        "id":function(d) { return "L-" + d; },
        "fill":"rgba(255,255,255,0.7)",
        "font-size":"8px",
	"font-weight":300,
	"text-anchor":"middle",
        "alignment-baseline":"middle",
        "x":function(d) {
	  var sel = d3.select("rect[tag='R-" + rondas[i] + "-L-" + d + "']");
	  var x = +sel.attr("x");
	  var offset = +sel.attr("width") / 2;
	  return x + offset;
        },
        "y":function(d) {
	  var sel = d3.select("rect[tag='R-" + rondas[i] + "-L-" + d + "']");
	  var y = +sel.attr("y");
	  var offset = +sel.attr("width") / 2;
	  return y + offset;
        }
     })
     .text(function(d) {
	var texto;
	if( d == "ASOCIACIÓN") { texto = d[0] }
	else texto = d;
	return texto;
     });


  conteiner.append("g").selectAll("rect")
   .data(licitaciones).enter()
   .append("rect")
   .attr(cuadrosFiltros)
   .attr({
      "id":"on",
      "stroke":"white",
      "stroke-width":2,
      "fill":"rgba(255,165,0,0.5)",
      "disable":null,
      "opacity":1,
      "class":"Licitacion_N",
      "ronda":rondas[i],
      "tag":function(d) { return "R-" + rondas[i] + "-L-" + d; },
      "x":function(d,j) {
	var sel = d3.select(this);
	var offset = +sel.attr("width")/2;
	var iter = +sel.attr("width") + 5;
	return textOffsetL.x - offset + (j*iter);
      },
      "y":function(d,j) {
	var y = d3.select("rect[tag='R-" + rondas[i] + "']").attr("y");
	return y;
      }
   })
    .on("mouseover",function() {
      var sel = d3.select(this);
      if( !sel.attr("id") && !sel.attr("disable") ) {
        sel
	  .attr("stroke","orange")
	  .attr("stroke-width",2);
      };
    })
    .on("mouseout",function() {
      var sel = d3.select(this);
      if( !sel.attr("id") && !sel.attr("disable") ) {
	sel
	.attr("stroke","white")
	.attr("stroke-width",1);
      };
    })
    .on("click",function() {
      var sel = d3.select(this);
      var ronda = sel.attr("tag").split("-")[1];
      var licitacion = sel.attr("tag").split("-")[3];

      if( !sel.attr("id") && !sel.attr("disable") ) {
       sel.attr({
	  "id":"on",
	  "stroke":"white",
	  "stroke-width":1.5,
	  "fill":"rgba(255,165,0,0.5)"
	});

        var activacion = d3.select(this).attr("id");
        var RONDA = { 'ronda':ronda, 'licitacion':licitacion };
        filtrarPorRonda(activacion,RONDA,licRondas,data,RONDA,1);

      } else {
       sel.attr({
	  "id":null,
	  "stroke-width":1,
	  "fill":"transparent"
	});

        var activacion = d3.select(this).attr("id");
        var RONDA = { 'ronda':ronda, 'licitacion':licitacion };
        filtrarPorRonda(activacion,RONDA,licRondas,data,RONDA,1);

// HACER QUE CUANDO NINGUNA LICITACIÓN ESTÉ ACTIVA, LA RONDA SE DESACTIVE
	var licsSelec = d3.selectAll("rect#on.Licitacion[ronda='"+ ronda +"']");
	if(licsSelec[0].length == 0) {
	  d3.selectAll("rect.Licitacion[ronda='"+ ronda +"']")
	    .attr("disable","1")
	    .attr("opacity",0.4);
	  licsSelec
	   .attr("id",null)
	  d3.select("rect[tag='R-" + ronda + "']")
	    .attr("id",null)
	    .attr("fill","transparent")
	    .attr("stroke-width",1)
	};
	
      };

//      var activacion = d3.select(this).attr("id");
//      var RONDA = { 'ronda':ronda, 'licitacion':licitacion };
//      filtrarPorRonda(activacion,RONDA,licRondas,data);
    })
/*    .on("dblclick",function(d) {
	var sel = d3.select(this).attr("tag");
	var ronda = sel.split("-")[1];
	var lic = sel.split("-")[3];
	var RONDA_LIC = { 'ronda':ronda, 'lic':lic, };
	resumen(data,adj,licRondas,pmts,ofertas,RONDA_LIC)
    });
*/
 }

    conteiner.append("g")
     .attr("id","botonResumen")
     .append("rect")
     .attr("id","botonResumen")
     .attr("x", function() {
	var sel = d3.select("rect[tag='R-1-L-4']")
	var x = +sel.attr("x").split("px")[0];
	var offset = +sel.attr("width").split("px")[0];
	return x + offset*2;
     })
     .attr("width",function() {
	var offset = d3.select("rect[tag='R-1-L-4']").attr("width").split("px")[0];
	var x = +d3.select("rect#filtro").attr("x").split("px")[0];
	var thisX = +d3.select(this).attr("x").split("px")[0];
	var w = +d3.select("rect#filtro").attr("width").split("px")[0];
	return (thisX - x)/2 - (+offset*1);
     })
     .attr("height",20)

     .attr("y",function() {
	var offset = +d3.select(this).attr("height").split("px")[0]/2;
	var y = +d3.select("rect#filtro").attr("y").split("px")[0];
	var height = +d3.select("rect#filtro").attr("height").split("px")[0];
	return y + (height/2) - offset;
     })
     .attr("rx",5)
     .attr("ry",5)
     .attr("fill","transparent")
     .attr("stroke","white")

    conteiner.append("text")
      .attr("id","botonResumen")
      .attr("x",function() {
	var w = +d3.select("rect#botonResumen").attr("width").split("px")[0]/2;
	var x = +d3.select("rect#botonResumen").attr("x").split("px")[0];
	return x + w
      })
      .attr("y", function(d) {
	var h = +d3.select("rect#botonResumen").attr("height").split("px")[0]/2;
	var y = +d3.select("rect#botonResumen").attr("y").split("px")[0];
	return y + h;
      })
      .attr("fill","white")
      .attr("text-anchor","middle")
      .attr("alignment-baseline","middle")
      .attr("font-size",8.5)
      .text("Ver resumen")
      .on("mouseover",function() {
	d3.select("rect#botonResumen").attr("stroke","orange");
	d3.select(this).style("cursor","pointer")
	  .attr("fill","orange");
       })
      .on("mouseout",function() {
	d3.select("rect#botonResumen").attr("stroke","white");
	d3.select(this).attr("fill","white");
       })
       .on("click", function() {
	var arr = [];
	var cuadros = d3.selectAll("rect#on.Licitacion")[0];
	for(var i in cuadros) {
	  var tag = cuadros[i].getAttribute("tag");
	  if(tag) {
	    var r = tag.split("-")[1];
	    var l = tag.split("-")[3];
	    var obj = { 'ronda':r, 'lic':l };
	    arr.push(obj);
	  }
	}
	resumen(data,adj,licRondas,pmts,ofertas,arr,tabla,procesos)
       });



 d3.selectAll("rect.Licitacion").remove();
 d3.selectAll("rect.Licitacion_N").attr("class","Licitacion");

};
// <.. REFF!

function filtrarPorRonda(activacion,ronda,licRondas,data,lugar) {
  var rondasParaFiltro = [];
  var rondasActivas// = d3.selectAll("rect.Ronda#on")[0];
  var licitacionesActivas;
  var filtroFinal = [];
  var empresasFiltradas = [];
/*
  if(typeof(ronda) == "string") {
    rondasActivas = d3.selectAll("rect.Ronda#on")[0];
    for(var i in rondasActivas) {
      var r = rondasActivas[i].getAttribute("tag");
      if(r) {
        r = r.split("-")[1];
        //rondasParaFiltro.push(r);
      }
 
      var filtrado = licRondas.filter(function(d) { return d.RONDA == r; })
	.map(function(d) { return d.ID_LICITANTE_OFERTA; })
	.reduce(function(a,b) {
	  if( a.indexOf(b) < 0 ) { a.push(b); };
	  return a;
	},[]);

      filtroFinal = filtroFinal.concat(filtrado);
    };
  };
*/
  if(typeof(ronda) == "object" || typeof(ronda) == "string") {

   if(lugar) {
     licitacionesActivas = d3.selectAll("rect.Licitacion#on")[0];
     for(var i in licitacionesActivas) {
        var r;
        var l = licitacionesActivas[i].getAttribute("tag");
        if(l) {
          r = l.split("-")[1];
          l = l.split("-")[3];
        }

        var filtrado = licRondas.filter(function(d) {
	  return d.RONDA == r && d.LICITACION == l;
        })
	  .map(function(d) { return d.ID_LICITANTE_OFERTA; })
	  .reduce(function(a,b) {
	    if( a.indexOf(b) < 0 ) { a.push(b); };
	    return a;
	  },[]);

        filtroFinal = filtroFinal.concat(filtrado); 
     };

   } else {
/////////////////////// LUGAR NUEVO FILTRO///////////////////////////////////
     var spans = d3.selectAll("li.search-choice>span")[0];
     for(var i=0; i<spans.length; i++) {
       var span = spans[i].innerText;
       var r = span.split(".")[0].split("R")[1];
       var l = span.split(".")[1];

       var filtrado = licRondas.filter(function(d) {
	  return d.RONDA == r && d.LICITACION == l;
       })
       .map(function(d) { return d.ID_LICITANTE_OFERTA; })
       .reduce(function(a,b) {
	    if( a.indexOf(b) < 0 ) { a.push(b); };
	    return a;
       },[]);

        filtroFinal = filtroFinal.concat(filtrado); 

     };

   };
  };

  filtroFinal = filtroFinal.reduce(function(a,b) {
    if( a.indexOf(b) < 0 ) { a.push(b); };
    return a;
  },[]);

  for(var i in filtroFinal) {
   var arr = data
	.filter(function(d) { return d.ID_LICITANTE == filtroFinal[i]; });

   empresasFiltradas = empresasFiltradas.concat(arr);
  };

  empresasFiltradas = empresasFiltradas.reduce(function(a,b) {
    if( a.indexOf(b) < 0 ) { a.push(b); };
    return a;
  },[]).map(function(d) { return d.ID_EMPRESA; });


  if(typeof(ronda) == "string") {
    if(activacion == "on" ) {
      for(var i in empresasFiltradas) {
        var s = d3.select("circle[tag='" + empresasFiltradas[i] + "']");
//        s.attr("cambio",String(ronda));
        var cambioColor = s.attr("color");

        if( cambioColor != "transparent" ) {
          s.transition().duration(800).attr("fill",cambioColor);
        } else {
          s.transition().duration(800).attr("stroke","black");
        }
      };
     } else {
       var empresasFILTRADAS = empresasFiltradas.sort()
	.reduce(function(a,b) {
	  if( a.indexOf(b) < 0 ) { a.push(b); };
	  return a;
	},[]);

       d3.selectAll("circle.node").transition().duration(800)
	  .attr("fill",function(d) {
	    var color = d3.select(this).attr("color");
	    if(color != "transparent") return "gray";
	    if(color == "transparent") return "transparent"
	  })
	  .attr("stroke",function(d) {
	    var color = d3.select(this).attr("color");
	    if(color != "transparent") return null;
	    if(color == "transparent") return "lightGray";
	  })
//	  .attr("cambio",null);

      for(var i in empresasFILTRADAS) {
        var s = d3.select("circle[tag='" + empresasFILTRADAS[i] + "']");
//        s.attr("cambio",String(ronda));
        var cambioColor = s.attr("color");

        if( cambioColor != "transparent" ) {
          s.transition().duration(800).attr("fill",cambioColor);
        } else {
          s.transition().duration(800).attr("stroke","black");
        }
      };
     };
  } else {

    var filtroLicUniq = licRondas.filter(function(d) {
	return d.RONDA == ronda.ronda && d.LICITACION == ronda.licitacion;
    }).map(function(d) { return d.ID_LICITANTE_OFERTA; })
    .reduce(function(a,b) {
	if(a.indexOf(b) < 0) { a.push(b); };
        return a;
    },[]);

    var empresasFiltro = [];

    for(var i in filtroLicUniq) {
     var arrTemp = data
	  .filter(function(d) { return d.ID_LICITANTE == filtroLicUniq[i]; });

     empresasFiltro = empresasFiltro.concat(arrTemp);
    };

    empresasFiltro = empresasFiltro.map(function(d) {
	return d.ID_EMPRESA;
    })
    .reduce(function(a,b) {
	if( a.indexOf(b) < 0 ) { a.push(b) };
	return a;
    },[]).sort();

    if(activacion == "on") {

       var empresasFILTRADAS = empresasFiltradas.sort()
	.reduce(function(a,b) {
	  if( a.indexOf(b) < 0 ) { a.push(b); };
	  return a;
	},[]);


      for(var i in empresasFILTRADAS) {
	var q = String(empresasFILTRADAS[i]);
        var s = document.querySelectorAll('circle[tag="'+q+'"]')[0];
        s = d3.select(s);
//	s.attr("cambio",null);
	var color = s.attr("color");
	if(color!="transparent") { 
	  s.transition().duration(800).attr("fill",color);
	}
	if(color=="transparent") {
	  s.transition().duration(800).attr("stroke","black");
	}

      };

    } else {

       var empresasFILTRADAS = empresasFiltradas.sort()
	.reduce(function(a,b) {
	  if( a.indexOf(b) < 0 ) { a.push(b); };
	  return a;
	},[]);

/* // SERVICIO SOCIAL
console.log("\n",empresasFILTRADAS.length)
var coco =[]
       empresasFILTRADAS.sort().forEach(function(d) {
	var a = data.filter(function(e) { return e.ID_EMPRESA == d; })
	coco.push(a[0].EMPRESA);
       });
*/
       d3.selectAll("circle.node").transition().duration(800)
	  .attr("fill",function(d) {
	    var color = d3.select(this).attr("color");
	    if(color != "transparent") return "gray";
	    if(color == "transparent") return "transparent"
	  })
	  .attr("stroke",function(d) {
	    var color = d3.select(this).attr("color");
	    if(color != "transparent") return null;
	    if(color == "transparent") return "lightGray";
	  })

      for(var i in empresasFILTRADAS) {
	var q = String(empresasFILTRADAS[i]);
        var s = document.querySelectorAll('circle[tag="'+q+'"]')[0];
        s = d3.select(s);
//	s.attr("cambio",null);
	var color = s.attr("color");
	if(color!="transparent") { 
	  s.transition().duration(800).attr("fill",color);
	}
	if(color=="transparent") {
	  s.transition().duration(800).attr("stroke","black");
	}
      };

    };
  };

};

function NuevoFiltro(licRondas,data,adj,pmts,ofertas,tabla,procesos) {
  var nuevoFiltro = d3.select("[class='chosen-container chosen-container-multi']");
  var seleccionados = [];

  nuevoFiltro.on("click",function() {
    var chosen_drop = d3.selectAll(".chosen-drop>ul>li");
 
    chosen_drop.on("click",function() {
      let sel = d3.select(this)[0][0].innerText;

      if(seleccionados.indexOf(sel) < 0) seleccionados.push(sel);

      let seleccionados_ = seleccionados.map(function(d) {
	let s = d.split(".");
	var ronda = s[0].split("R")[1];
	var lic = s[1];

/*	let s = d.split(" - "); console.log(s)
        var ronda = s[0].split(" ")[1];
	var lic = s[1].split(" ")[1];
*/
	return  { 'ronda':ronda, 'lic':lic };

      });
/////////////////////////// AGREGAR //////////////////////////////////////////
      //console.log(seleccionados_)
      filtrarPorRonda('on',seleccionados_,licRondas,data);
      resumen(data,adj,licRondas,pmts,ofertas,seleccionados_,tabla,procesos);

      var spans = d3.selectAll("a.search-choice-close");

      spans.on("click", function() {
	var sel_ = d3.select(this)[0][0].parentNode.childNodes;
	var span;
	sel_.forEach(function(d) {
	  var patt = RegExp("^R");
	  var cond = patt.test(d.innerText);
	  if(cond) span = d.innerText;
	});
	seleccionados.splice(seleccionados.indexOf(span),1);
	let seleccionados_ = seleccionados.map(function(d) {
	  let s = d.split(".");
	  var ronda = s[0].split("R")[1];
	  var lic = s[1];
	  return  { 'ronda':ronda, 'lic':lic };
	});
/////////////////////////// QUITAR //////////////////////////////////////////
	filtrarPorRonda(undefined,seleccionados_,licRondas,data);
	resumen(data,adj,licRondas,pmts,ofertas,seleccionados_,tabla,procesos);

      });

    });

  });
};
