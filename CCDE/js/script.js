$(document).ready(function() {

  // Todo ocurre aquí.
  $.ajax({
   url:"blueprints.json",
   dataType:'json',
   success:function(response) {

   $.get("produccion_cuencas.json",function(data) {
     var rr = data.index.map(function(d) {
	var a = d[0].replace(/2\) |1\) |3\) |4\) /g,"");
	a = a.replace(
	/^Plataforma Burro-Picachos/g,
	"Burgos, Plataforma Burro-Picachos y Sabinas"
	);
	return a;
     });

     for(var i in data.index) {
      data.index[i][0] = rr[i]
     }

     console.log(data);

     var data1 = recurr(data,unicosXnivel,filtroXnivel);

     RenderTabla(data1);

   });


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

function RenderTabla(data) {
// Agregar tbodys
  d3.select("tbody#tabla").selectAll("tbody")
   .data(Object.keys(data)).enter()
  .append("tbody")
   .attr("class","labels")
   .style("background","rgb(13,180,190)")
   .style("font-weight",700)
   .style("color","white")
   .attr("tag",function(d) { return d; })
   .each(function() {
     var t = document.createElement("div");
     $("<tbody class='hide'></tbody>").insertAfter(this);
   });

  d3.selectAll("tbody#tabla > tbody")
  .each(function(d,i) {
    var selection = d3.select(this);
    if(selection.attr("class") == "labels") {
	var str = "" +
	"<tr>" +
	"<td colspan='21'>" +
	"<label>"+ selection.attr("tag") + "</label>" +
	"<input type='checkbox' data-toggle='toggle' style='display=none'></input>" +
	"</td>" + 
	"</tr>" + 
	"";
	selection.html(str)
    } else {
	var str = "" +
	"<tr>" +
	"<td>a</td><td>b</td><td>c</td><td>f</td><td>g</td>" +
	"<td></td><td></td><td></td><td></td><td></td>" +

	"</tr>"
	selection.html(str); 
    }

  })

  d3.selectAll("tbody.labels").on("click",function() {
    d3.select("tbody.hide").style("display","none")
  });
  
};


	});
