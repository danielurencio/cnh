$(document).ready(function() {

  // Todo ocurre aquí.
  $.ajax({
   url:"blueprints.json",
   dataType:'json',
   success:function(response) {

     $.get("data.json", function(data) {
	RenderTabla(data,segmentos,colapsables);
     })

     RenderWords(response,"esp");
     $("span.lang").on("click", function() {
	RenderWords(response,this.id);
     });
   }

  });


  // Agregar tabla.
/*  $("div#tabla").load("produccion_cuencas.html",function() {

  });*/

function RenderWords(obj,lang) {
  var titles = obj.A[lang].filtros.titles;
  var months = obj.A[lang].filtros.months;
  var years = obj.A[lang].filtros.years;
  var options = obj.A[lang].filtros.options;

  // Colocar cada uno de los títulos en su respectivo lugar.
  for( var k in titles ) {
    var selector = "#" + k + "_text";
    $(selector).text(titles[k]);
  }

  // Colocar los nombres de reporte en el apartado de "Temas".
  var temas = options.map(function(d) {
	return "<option>" + d.tema + "</option>";
  }).join("");

  $("div#tema_options select").text("");
  $("div#tema_options select").append(temas);

  // Colocar los meses y los años.
  months = months.map(function(d) {
    return "<option>" + d + "</option>";
  }).join("");

  var years_ = [];
  for(var i=years[0]; i<=years[1]; i++) {
    years_.push(i);
  }
  years_ = years_.map(function(d) {
    return "<option>" + d + "</option>";
  });

  var id_dates = ["start","end"];
  for( var i in id_dates ) {
    $("select#" + id_dates[i] + "_month").text("");
    $("select#" + id_dates[i] + "_year").text("");
    $("select#" + id_dates[i] + "_month").append(months);
    $("select#" + id_dates[i] + "_year").append(years_);
  }

  // Obtener los niveles de desagregación del tema o reporte seleccionado,
  // y colocarlos en el apartado de "Nivel".
  var niveles = options.filter(function(d) {
    return d.tema == $("select#tema_options").val()
  })[0].nivel
  .map(function(d) { return "<option>" + d + "</option>"; }).join("");

  $("div#nivel_options select").text("");
  $("div#nivel_options select").append(niveles);

  // En cuanto se elija otro tema o reporte, actualizar los niveles de
  // desagregación que corresponden a ese reporte.
  $("select#tema_options").on("change",function() {
    var text = $(this).val();
    let niveles = options.filter(function(d) {
      return d.tema == text
    })[0].nivel
    .map(function(d) { return "<option>" + d + "</option>"; }).join("");

    $("select#nivel_options").text("")
    $("div#nivel_options select").append(niveles);
  });

};


/* PARÁMETROS:
   "obj": El objeto 'data' del JSON que se recibe del back-end.
   "counter": Un 'integer' que se utiliza para llevar la cuenta de los niveles
	    anidados del JSON. El valor de este parámetro siempre será '0'.
   "limit": La profundidad a la que se desea extraer la información del JSON.
   "arr": Es un 'array' sobre el cual se escribira la información obtenida.
   "parent_": Es 'string' que detalla a qué nivel pertenece cada objeto.

   * El propósito de esta función es transformar el 'input' para que se generen
     segementos expandibles en los cubos de información. Esta función especifíca
     hasta que nivel serán expandibles/colapsables los segmentos de los cubos.

     Esta función no se utiliza por sí misma. Para simplificar el código, su
     ejecución se da dentro de la función llamada 'segmentos'.
*/

function colapsables(obj,counter,limit,arr,parent_) {
  for (var k in obj) {
    if (typeof obj[k] == "object" && obj[k] !== null && counter < limit) {
      if(Object.keys(obj).indexOf(k) === 0 && !obj[k].length) {
        counter+=1; 
        arr.push({
          "nivel":counter,
          "labels":Object.keys(obj),
          "parent":parent_
        })
      }
      parent_ = k;
      colapsables(obj[k],counter,limit,arr,parent_);
    }
  }
};

/* PARÁMETROS:
   "data": El JSON que se recibe del back-end.
   "f1": La función 'colapsables' la cual se ejecuta dentro del cuerpo de esta
   misma función.

   * El único objetivo de esta función es facilitar la lectura del código ya que
     la función 'colapsables', misma que se ejecuta dentro de esta función,
     es una función recursiva y con muchos parámetros, aspectos que hacen que su
     código sea más complejo.
*/

function segmentos(data,f1) {
  var arr = [];
  f1(data.data,0,data.keys,arr,'root');
  return arr;
};


function unicosXnivel(arr,n) {
  var a = arr.map(function(d) { return d[n]; });
  return _.uniq(a);
};

function filtroXnivel(arr,key,n) {
  var a = arr.filter(function(d) { return d[n] == key });
  return a;
};

function recurr(arr,f1,f2) {
  var obj = {};
  var n0 = f1(arr.index,0); // <-- nombres de cuencas
  for(var i in n0) {
//    console.log("CUENCA: ",n0[i])
    obj[n0[i]] = {}
    var a0 = f2(arr.index,n0[i],0) // <-- datos de cada cuenca
    var n1 = f1(a0,1) // <-- nombres de temas por cuenca (producción, pozos)
    for(var j in n1) {
      if(n1[j] == '') n1[j] = "none"
      obj[n0[i]][n1[j]] = {}
//      console.log("TEMA: ",n1[j]);
      var a1 = f2(a0,n1[j],1) // <- datos de temas por cuenca
      var n2 = f1(a1,2) // <-- nombres de subtemas por cuenca
      for(var c in n2) {
	obj[n0[i]][n1[j]][n2[c]] = {}
//	console.log("SUBTEMA: ",n2[c])
	var a2 = f2(a1,n2[c],2)
	var n3 = f1(a2,3)
	for(var k in n3) {
	  obj[n0[i]][n1[j]][n2[c]][n3[k]] = {}
//	  console.log("HIDROCARBURO: ",n3[k]);
	  var a3 = f2(a2,n3[k],3);
	  var n4 = f1(a3,4);
	  for(var n in n4) {
	    var a4 = f2(a3,n4[n],4)
	    var aa = a4.reduce(function(a,b) { return a + b; }); //console.log(aa)
	    obj[n0[i]][n1[j]][n2[c]][n3[k]][n4[n]] = (function() {
		var indexes = arr.index.map(function(d) {
		 var result = d.reduce(function(a,b) { return a + b; })
		 return result
		});
	  	var ix = arr.index.indexOf(aa)
		return arr.data[ix]
	    })()
//	    console.log("LUGAR: ",n4[n]);
	  }
	}
      } 
    }
  console.log("\n")
  }
  return obj;
}

function RenderTabla(data,f1,f2) {
  data.keys = 3;
  var segmentos_ = f1(data,f2);

  var segmentos_root = segmentos_.filter(function(d) {
    return d.parent == 'root';
  })[0].labels;

  var segmentos_child = segmentos_.filter(function(d) {
    return d.parent != 'root';
  });


// Agregar segmentos de primer nivel.
  d3.select("tbody#tabla").selectAll("tbody")
   .data(segmentos_root).enter()
  .append("tbody")
   .attr("class","labels")
   .style("background","rgb(13,180,190)")
   .style("font-weight",700)
   .style("color","white")
   .attr("id",function(d) { return d; })
   .each(function(d) {
     var t = document.createElement("div");
     $("<tbody class='hide' id='"+ d +"'></tbody>").insertAfter(this);
   });

  d3.selectAll("tbody#tabla > tbody")
  .each(function(d,i) {
    var selection = d3.select(this);
    var id = selection.attr("id");
    if(selection.attr("class") == "labels") {
	var str = "" +
	"<tr>" +
	"<td colspan='21'>" +
	"<label>" + selection.attr("id") + "</label>" +
//	"<input type='checkbox' data-toggle='toggle' style='display=none'></input>" +
	"</td>" + 
	"</tr>" + 
	"";
	selection.html(str)
    } else {

    }

  })

  for(var j=2; j<=data.keys; j++) {
    var temas = segmentos_child.filter(function(d) {
      return d.nivel == j //&& d.parent == selection.attr("id");
    });

    for(var t in temas) {
      console.log(temas[t]);
      var selection = d3.select("#" + temas[t].parent + ".hide")
	selection.selectAll("div")
       .data(temas[t].labels).enter()
	.append("div")
	.attr("tag",function(d) { return d; });

//	var selection = d3.select("[tag='"+  +"']") // <-- aquí me quedé

    } 

//        var selection = 
  };


  d3.selectAll("tbody.labels").on("click",function() {
    d3.selectAll("tbody.hide").style("display","none")
  });
  
};


	});
