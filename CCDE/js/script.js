$(document).ready(function() {

  // Todo ocurre aquí.
//  $.ajax({
//   url:"blueprints.json",
//   dataType:'json',
//   success:function(response) {
$.get("blueprints.json",function(response) {

  $("button.filtros").click(function() {
    $("button.filtros").attr("id","off")
    $(this).attr("id","on")

    var tag = $(this).attr("tag")
    $("tbody#tabla").html("")

    $.get(tag + ".json", function(data) {
       data = formatoData(data);
       Cubos(data);
       $("tbody#tabla>tbody.labels:nth-child(n+2)").click()
       if(tag == "campos") d3.selectAll("#dist").attr("id",null);
    })
    
  });

     $.get("cuencas.json", function(data) {
        data = formatoData(data);
	Cubos(data);
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
	data[i][j][Object.keys(data[i][j])[0]].replace(/(\d)-(\d)/g,"$1 $2")

       data[i][j][Object.keys(data[i][j])[0]] =
	data[i][j][Object.keys(data[i][j])[0]].replace(/-/g,"&ensp;&nbsp;")

       data[i][j][Object.keys(data[i][j])[0]] =
	data[i][j][Object.keys(data[i][j])[0]].replace(/\<tr(\>\n.*)\(/g,'<tr id="dist"$1(')

       data[i][j][Object.keys(data[i][j])[0]] =
	data[i][j][Object.keys(data[i][j])[0]].replace(/\<td(\>.*(?![AR])[A-Z]{2,}(?![MMpcd]))/g,'<td id="dist_"$1')

       data[i][j][Object.keys(data[i][j])[0]] =
	data[i][j][Object.keys(data[i][j])[0]].replace(/Categor¡a/g,'')

     }
   }
 }
 return data;
};


function Cubos(data) {
  var color = getComputedStyle(document.body).getPropertyValue('--filasYcols');
  var plus = "&plus;", minus = "&ndash;";

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
	"<label style='cursor:pointer;width:100%'><span class='s' id='uno' style='font-weight:400;'>" + minus + "&ensp;</span>" + selection.attr("tag") + "</label>" +
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
	"<div style='width:100%'><label style='cursor:pointer;'>&ensp;<span id='dos' class='s' style='font-weight:400;'>" + minus + "&ensp;</span>&ensp;&ensp;" + Object.keys(tablas[j])[0] + "</label></div>" +
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
	  .html(tablas[j][Object.keys(tablas[j])[0]] + "<br>")

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
	span.html(plus + "&ensp;")
    } else {
	selection.style("display","table-row-group")
	span.html(minus + "&ensp;")
    }	
  });

  d3.selectAll(".hide td:not(:first-child)").on("mouseover",function() {
     var grand_parent = $(this).parent().parent().parent().attr("tag");
     var parent = $(this).parent().parent().attr("tag");
     var ix = $(this).index() + 1
     d3.selectAll("tbody[tag='" + grand_parent + "']>tbody[tag='"+parent+"'] td:nth-child("+ ix +")")
	.style("background",color)
//	.style("color","red");
     d3.selectAll("tbody[tag='" + grand_parent + "']>tbody[tag='"+parent+"'] th:nth-child("+ ix +")")
	.style("background",color);

  });


  d3.selectAll(".hide td:not(:first-child)").on("mouseout",function() {
     var grand_parent = $(this).parent().parent().parent().attr("tag");
     var parent = $(this).parent().parent().attr("tag");
     var ix = $(this).index() + 1
     d3.selectAll("tbody[tag='" + grand_parent + "']>tbody[tag='"+parent+"'] td:nth-child("+ ix +")")
	.style("background","transparent")
     d3.selectAll("tbody[tag='" + grand_parent + "']>tbody[tag='"+parent+"'] th:nth-child("+ ix +")")
	.style("background","transparent");

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

};


	});
