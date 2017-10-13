$(document).ready(function() {

  // Todo ocurre aquí.
//  $.ajax({
//   url:"blueprints.json",
//   dataType:'json',
//   success:function(response) {
$.get("blueprints.json",function(response) {
     $.get("prueba2.json", function(data) {
        data = formatoData(data);
	Tabla(data);
        $("tbody#tabla>tbody.labels:nth-child(n+2)").click()

     })

     RenderWords(response,"esp");
     $("span.lang").on("click", function() {
	RenderWords(response,this.id);
     });

     $("button#boton").on("click",descargar);
})
//   }

//  });



function descargar() {
  var csv = [];
  var tbodys = document.querySelectorAll("tbody[download='1']");
  var fecha = new Date();
/*  var anio = fecha.getFullYear(), mes = fecha.getMonth(), dia = fecha.getDay()
  console.log(anio,fecha.getMonth(),dia);
  if( String(mes).length == 1 ) mes = "0" + mes;
  if( String(dia).length == 1 ) dia = "0" + dia;
  fecha = anio + "/" + mes + "/" + dia;
  console.log(fecha);
*/
  var Header = [
   "PRODUCCION",
   "COMISION NACIONAL DE HIDROCARBUROS",
   "Fecha de descarga: " + fecha.toLocaleString().replace(", "," - "),//fecha,
   "\n",
  ];

  csv.push(Header.join("\n"));

  for(var b=0; b<tbodys.length; b++) {
    var rows = tbodys[b].querySelectorAll("tr");

    if( b == 0 ) {
      var headers = rows[0].querySelectorAll("th");
      var row_set = []
      for(var h = 0; h < headers.length; h++) {
	row_set.push(headers[h].innerText);
      }
      csv.push(row_set.join(","));
    };

    csv.push("");
    var parent_ = tbodys[b].parentNode.getAttribute("tag");
    var current_ = tbodys[b].getAttribute("tag");
    csv.push(parent_ + "  -  " + current_ + ":");

    for(var r=1; r<rows.length; r++) {
      var row_set = [];
      var cols = rows[r].querySelectorAll("td");

      for(var c = 0; c < cols.length; c++) {
	row_set.push(cols[c].innerText);
      }

      csv.push(row_set.join(","));
    }
    csv.push("");
  }

  csv = csv.join("\n");
  var csvFile = new Blob([csv], { 'type':'text/csv' });

  if(window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(csvFile,filename + ".csv");
  } else {
    var downloadLink = document.createElement("a");
    downloadLink.download = "info.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    var s_a = document.getElementsByTagName("a");
    for(var i=0; i<s_a.length; i++) {
      s_a[i].parentNode.removeChild(s_a[i]);
    }
  }
};


function formatoData(data) {
 for(var i in data) {
   for(var j in data[i]) {
     if(typeof(data[i][j]) == "object") {
       data[i][j][Object.keys(data[i][j])[0]] =
	data[i][j][Object.keys(data[i][j])[0]].replace(/(\d)-(\d)/g,"$1/$2")

       data[i][j][Object.keys(data[i][j])[0]] =
	data[i][j][Object.keys(data[i][j])[0]].replace(/-/g,"&nbsp;")

       data[i][j][Object.keys(data[i][j])[0]] =
	data[i][j][Object.keys(data[i][j])[0]].replace(/\<tr(\>\n.*)\(/g,'<tr id="dist"$1(')

       data[i][j][Object.keys(data[i][j])[0]] =
	data[i][j][Object.keys(data[i][j])[0]].replace(/¡/g,'í')

     }
   }
 }
 return data;
};


function Tabla(data) {

  d3.select("tbody#tabla").selectAll("tbody")
   .data(data).enter()
  .append("tbody")
   .style("width","100%")
   .attr("class","labels")
   .attr("tag",function(d) { return d[0]; })
   .each(function(d) {
     $("<tbody class='hide' tag='"+ d[0] +"'></tbody>").insertAfter(this);
   });

  d3.selectAll("tbody#tabla > tbody")
  .each(function(d,i) {
    var selection = d3.select(this);
    selection.style("width","100%");
    var id = selection.attr("tag");
    if(selection.attr("class") == "labels") {
	var str = "" +
	"<tr style='width:100%'>" +
	"<td style='width:100%'>" +
	"<label style='cursor:pointer;width:100%'><span class='s' style='font-size:18px;font-weight:400;'>( - )&ensp;</span>" + selection.attr("tag") + "</label>" +
	"</td>" + 
	"</tr>" + 
	"";
	selection.html(str)
    } else {
	var tag = selection.attr("tag");
	var seg = data.filter(function(d) { return d[0] == tag; })[0];
	var tablas = seg.filter(function(d) { return typeof(d) == "object"; });

      for(var j in tablas) {
	var str = "" +
	"<thead style='width:100%'>" +
	"<div style='width:100%'><label style='cursor:pointer;'>&ensp;<span class='s' style='font-weight:400;'>( - )&ensp;</span>&ensp;&ensp;" + Object.keys(tablas[j])[0] + "</label></div>" +
	"</thead>";
	selection.append("div")
	  .attr("class","labels")
	  .attr("tag",Object.keys(tablas[j])[0])
	  .attr("id","id_"+j)
	  .html(str);
	selection.append("tbody")
	  .attr("class","hide")
	  .style("width","100%")
	  .attr("tag",Object.keys(tablas[j])[0])
	  .attr("download","1")
	  .attr("id","id_"+j)
	  .html(tablas[j][Object.keys(tablas[j])[0]])

      }
    }

  })

  d3.selectAll(".labels").on("click",function() {
    var tag = d3.select(this).attr("tag");
    var span = d3.select($(this).find("span.s")[0]);
    var selection = d3.select("[tag='" + tag + "'].hide")
    var selection = d3.select($(this).next()[0])
    if(selection.style("display") == 'table-row-group') {
	selection
	.style("display","none")
	span.html("( + )&ensp;")
    } else {
	selection.style("display","table-row-group")
	span.html("( - )&ensp;")
    }	
  });

};


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

/*
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
*/

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
//  data.keys = 3;
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
//   .style("background","rgb(13,180,190)")
   .style("font-weight",700)
   .style("color","white")
   .attr("id",function(d) { return d; })
   .each(function(d) {
     var t = document.createElement("div");
     $("<tbody class='hide' tag='"+ d +"'></tbody>").insertAfter(this);
   });

  d3.selectAll("tbody#tabla > tbody")
  .each(function(d,i) {
    var selection = d3.select(this);
    var id = selection.attr("id");
    if(selection.attr("class") == "labels") {
	var str = "" +
	"<tr>" +
	"<td colspan='22'>" +
	"<label>" + selection.attr("id") + "</label>" +
//	"<input type='checkbox' data-toggle='toggle' style='display=none'></input>" +
	"</td>" + 
	"</tr>" + 
	"";
	selection.html(str)
    } else {

    }

  })

//-------------------AGREGAR SUBNIVELES -----------------------------
  for(var j=2; j<=data.keys; j++) {
    var temas = segmentos_child.filter(function(d) {
      return d.nivel == j;
    });

    for(var t in temas) {
      var selection = d3.select("[tag='" + temas[t].parent + "'].hide");
/*
      selection.selectAll("div")
       .data(temas[t].labels).enter()
	.append("div")
	.attr("id","id_" + j)
	.attr("tag",function(d) { return d; })
	.each(function(d) {
	  console.log(d)
	});
*/
	
	for(var l in temas[t].labels) {
	  selection.append("tbody")
	  .attr("tag",temas[t].labels[l])
	  .attr("class","label")
	   .append("tr").append("td").style("colspan","22")
	   .html("<label>"+ temas[t].labels[l] +"</label>") ;
	  selection.append("tbody")
	  .attr("tag",temas[t].labels[l])
	  .attr("class","hide")
	  .attr("id","id_"+j);

	}

	  selection = d3.select("div[tag='" + temas[t].parent+ "']");
    } 

  };
//---------------------------------------------------------------------

  d3.selectAll("#id_"+data.keys)
    .each(function(d) {
      var selection = d3.select(this).append("tr");
      var tag = selection.attr("tag");                        // <-- *
      var parentTag = d3.select(this.parentNode).attr("tag"); // <-- *
//      *: Sustituir por recursivo.

      var ss = d3.select("[tag='"+ parentTag +"'].hide>[tag='"+ tag +"'].hide")
      var obj = data.data[parentTag][tag];
ss.append("svg")
//      selection.append("tr")



    });

 
};


	});
