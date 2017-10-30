$(document).ready(function() {

  // Todo ocurre aquí.
//  $.ajax({
//   url:"blueprints.json",
//   dataType:'json',
//   success:function(response) {
$.get("blueprints.json",function(response) {

  $("button.filtros").click(function() {
    $(".scroll_aid_header th").css("color","white");
    $(".scroll_aid_header th").css("border-color","white")

    $("body").css("cursor","progress");

    $("button.filtros").attr("id","off")
    $(this).attr("id","on")

    var tag = $(this).attr("tag")
    $("tbody#tabla").html("")
    var loading_text = "<div style='font-weight:800;position:absolute;top:50%;left:calc(50% - 75.7px);'class='wait'><span>Cargando información ...</span></div>"
    $("body").prepend(loading_text);


    $.get(tag + ".json", function(data) {
       data = formatoData(data);
       Cubos(data);
       $("tbody#tabla>tbody.labels:nth-child(n+2)").click()
       if(tag == "campos") d3.selectAll("#dist").attr("id",null); // <-- ¿?
       $("div.wait").remove();
       $("body").css("cursor","default")
    });
    
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

     $("button#selection").on("click",function() {
       var series = obtener_series();

       if(series && series.length == 0) {
	 alert("Seleccione alguna serie.");
       } else { if(series) descargar_selection(series); }

     });


});
//   }

//  });


function grapher(info) {
  var grapher_element = 
"<div id='grapher'>" +
  "<img class='close_chart' src='img/close.svg'></img>" +
  "<div id='chart'></div>" + 
"</div>";

  $('body').css("overflow","hidden");  
  $('body').prepend(grapher_element);

  $('.close_chart').on("click",function() {
    $("body").css("overflow","auto");
    $("#grapher").remove();
  });

  info.serie.showInLegend = false;

  var color = getComputedStyle(document.body).getPropertyValue('--subtitulos');
  info.serie.color = color;

  Highcharts.chart('chart', {
    lang: { 'img':'Descargar imagen' },
    exporting: {
      enabled:true,
      buttons: {
	contextButton: {
	  symbolX:19,
	  symbolY:18,
	  symbol:'url(img/download.svg)',
	  _titleKey:'img',
	  menuItems:[{
	   textKey:'downloadPNG',
	   onclick:function() { this.exportChart() },
	   text:"PNG"
	  }]
	}
      }
    },
    chart: {
      style: {
	fontFamily:'Open Sans'
      }
    },
    tooltip: {
      useHTML:true,
      backgroundColor:null,
      borderWidth:0,
      style: { fontWeight:800 },
      formatter: function() {
	var t =
	"<div style='text-align:center;'>" +
	 "<span style='font-size:11px;font-weight:800;color:"+ 'black' +";'>" +
	  this.point.name + 
	":</span>" +
	  "<br>" +
	"<span style='font-weight:300;font-size:18px;'>"
	 + this.y.toLocaleString("es-MX") +
	"</span></div>";
	return t;//this.point.name + ": " + this.y;
      }
    },
    credits: { enabled:false },
    title: {
        text: info.parent
    },
    subtitle: {
        text: info.grandparent
    },
    xAxis: {
      labels: {
	enabled:true,
	formatter: function() { return info.fechas[this.value]; }
      }
    },
    yAxis: {
	gridLineWidth:0,
	labels: {
	  formatter:function() { return this.value.toLocaleString('es-MX'); },
	},
        title: {
	    style: { fontWeight:700 },
            text: info.tema
        }
    },
    plotOptions: {
        series: {
            label: {
                connectorAllowed: false
            },
//            pointStart: 2010,
	    marker: {
	      radius: 0,
	      states: {
		hover: {radius:5}
	      }
	    }
        }
    },
    series: [info.serie],
    responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    }

  });

};


function descargar_selection(series) {
  var chunk = [];

  var fecha = new Date();
  var Header = [
   "PRODUCCION",
   "COMISION NACIONAL DE HIDROCARBUROS",
   "Fecha de descarga: " + fecha.toLocaleString().replace(", "," - "),
   "\n",
  ];

  chunk.push(Header.join("\n"));
  chunk.push(",,");

  chunk.push(",,,," + fechas_())
  var familias = _.uniq( series.map(function(d) { return d.familia; }) );

  familias.forEach(function(f) {
    var pieces = [];
    chunk.push(f)
    var familia = series.filter(function(d) { return d.familia == f; });
    var subfamilias = _.uniq( familia.map(function(d) { return d.subfamilia; }) );
    
    subfamilias.forEach(function(sf) {
      chunk.push("," + sf);
      var subfamilia = familia.filter(function(ff) {
	return ff.subfamilia == sf;
      });
     
      var tema = ''; 
      subfamilia.forEach(function(ss) {
	var serie_ = ss.serie.join(",").replace(/NaN/g,"");
	if( tema != ss.tema ) {
	  tema = ss.tema;
	  chunk.push(",," + tema + ",," + serie_);
	}
	var subtema = ss.subtema;
	if( subtema != "" ) chunk.push(",,," + subtema + "," + serie_);
//	chunk.push(",,,," + serie_);
      });

    });
    chunk.push(",,");
    chunk.push(",,");

  });

  chunk = chunk.join("\n").toUpperCase();
  chunk = chunk.replace(/Á/g,"A");
  chunk = chunk.replace(/É/g,"E");
  chunk = chunk.replace(/Í/g,"I");
  chunk = chunk.replace(/Ó/g,"O");
  chunk = chunk.replace(/Ú/g,"U");

  var csvFile = new Blob([chunk], { 'type':'text/csv' });

  if(window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(csvFile,"info.csv");
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

function obtener_series() {
  var css_selection = "input[type='checkbox']:checked:not(#principal)";
  var checked = document.querySelectorAll(css_selection);

  if(checked.length > 50) {
    alert("Su consulta excede el límite de 50 series.");
  } else {
   var series = [];
   for(var i in checked) {
    if(checked[i].type == "checkbox") {

      var row = checked[i].parentNode.parentNode;
      var parent_ = row.parentNode;
      var grand_parent_ = parent_.parentNode.parentNode.parentNode;
      var parent_tag = parent_.getAttribute("tag");
      var grand_parent_tag = grand_parent_.getAttribute("tag");

      var obj = {};
      obj['familia'] = grand_parent_tag;
      obj['subfamilia'] = parent_tag;

      var row_set = [];
      var cells = row.querySelectorAll("td:not(#n)");
      var first_cell = cells[0].innerHTML;
      first_cell = first_cell.replace(/&[a-z;\s]*/g,"");
      first_cell = first_cell.replace(/^\s/g,"");

      if(row.getAttribute('id')) {
	obj['tema'] = first_cell;
	obj['subtema'] = '';
      } else {

	obj['subtema'] = first_cell;
	var ix = $(row).index();
	var cond = false;

	while(!cond) {
	  var s = "tbody[tag='" + grand_parent_tag + "']>div>table>" +
	   "tbody[tag='" + parent_tag + "']" +
	   ">tr:nth-child(" + ix + ")";

	  var dist = $(s).attr('id');
	  var dist_ = $(s)[0].querySelector("td:first-child").getAttribute("id");

	  if( dist || dist_ ) {
	    var tema = $(s)[0].querySelector("td:first-child").innerHTML;
	    tema = tema.replace(/&[a-z;\s]*/g,"");
	    tema = tema.replace(/^\s/g,"");
	    obj["tema"] = tema;
	    cond = true;
	  }
	  ix -= 1;
        }

      };

      for(var j=1; j<cells.length; j++) {
	if(cells[j].nodeName == "TD") {
	  var cell_content = cells[j].innerHTML;
	  cell_content = +cell_content.replace(/,/g,"");
	  row_set.push(cell_content);
	}
      };

      obj["serie"] = row_set;
      series.push(obj);
    }
  };

  return series;
 }

}

function descargar() {
  var csv = [];
  var tbodys = document.querySelectorAll("tbody[download='1']");
  var fecha = new Date();
  var Header = [
   "PRODUCCION",
   "COMISION NACIONAL DE HIDROCARBUROS",
   "Fecha de descarga: " + fecha.toLocaleString().replace(", "," - "),
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
  var temas_fondo = getComputedStyle(document.body)
	.getPropertyValue('--temas-fondo');

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
	"<label style='cursor:pointer;width:100%'>&ensp;<span class='s' id='uno' style='font-weight:400;'>" + minus + "&ensp;</span>" + selection.attr("tag") + "</label>" +
	"</td>" + 
	"</tr>" + 
	"";
	selection.html(str);
    } else {
	var tag = selection.attr("tag");
	var seg = data.filter(function(d) { return d[0] == tag; })[0];
	var tablas = seg.filter(function(d) { return typeof(d) == "object"; });

      for(var j in tablas) {
	var str = "" +
	"<thead style='width:100%'>" +
	"<div style='width:100%'>&nbsp;&nbsp;<label style='cursor:pointer;'>&ensp;<span id='dos' class='s' style='font-weight:400;'>" + minus + "&ensp;</span>&ensp;&ensp;" + Object.keys(tablas[j])[0] + "</label></div>" +
	"</thead>";
	selection.append("div")
	  .attr("class","labels")
	  .attr("tag",Object.keys(tablas[j])[0])
	  .attr("id","id_"+j)
	  .html(str);

	selection.append("div")
	.attr("class","overflow")
	.attr("tag",tag)
	.style("display","block")
	.style("overflow-x","scroll")
	 .append("table")
	 .append("tbody")
	  .attr("class","hide")
	  .style("width","100%")
	  .attr("tag",Object.keys(tablas[j])[0])
	  .attr("download","1")
	  .attr("id","id_"+j)
	  .html(tablas[j][Object.keys(tablas[j])[0]] + "<br>");

      }
    }

  });


  d3.selectAll(".labels").on("click",function() {
    var tag = d3.select(this).attr("tag");
    var span = d3.select($(this).find("span.s")[0]);
    var selection = d3.select("[tag='" + tag + "'].hide")
    var selection = d3.select($(this).next()[0])
    if(selection.style("display") == 'block') {
	selection
	.style("display","none")
	span.html(plus + "&ensp;")
    } else {
	selection.style("display","block")
	span.html(minus + "&ensp;")
    }	
  });

  d3.selectAll(".hide td:not(:first-child)").on("mouseover",function() {
     var grand_parent = $(this).parent().parent().parent()
	.parent().parent().attr("tag");
     var parent = $(this).parent().parent().attr("tag");
     var ix = $(this).index() + 1;

     d3.selectAll("tbody[tag='" + grand_parent + "']>div>table>tbody[tag='" +
	parent+"'] td:nth-child("+ ix +")").style("background",color);
     d3.selectAll("tbody[tag='" + grand_parent + "']>div>table>tbody[tag='" +
	parent+"'] th:nth-child("+ ix +")").style("background",color);

     $(this.parentNode.children[0]).css("background",color)
  });


  d3.selectAll(".hide td:not(:first-child)").on("mouseout",function() {
     var grand_parent = $(this).parent().parent().parent()
	.parent().parent().attr("tag");
     var parent = $(this).parent().parent().attr("tag");
     var ix = $(this).index() + 1;

     d3.selectAll("tbody[tag='" + grand_parent + "']>div>table>tbody[tag='"+parent+"'] "+
	"td:nth-child("+ ix +")")
	.style("background","transparent");

     d3.selectAll("tbody[tag='" + grand_parent + "']>div>table>tbody[tag='"+parent+"'] "+
	"th:nth-child("+ ix +")")
	.style("background","transparent");

     var color_cond = this.parentNode.getAttribute("id") == "dist" ||
	this.parentNode.children[0].getAttribute("id") == "dist_";
     var color_1 = color_cond ? temas_fondo : "transparent";
	
     $(this.parentNode.children[0]).css("background",color_1)

  });

    var cubos = document.querySelectorAll("tbody.hide>div>table>tbody.hide");

    for(var c in cubos) {
      if(cubos[c].nodeName == "TBODY") {
	var parent_tag = cubos[c].parentNode.parentNode.parentNode.getAttribute("tag");
	var this_tag = cubos[c].getAttribute("tag");

	var cubo_td = "tbody.hide[tag='"+ parent_tag +"']>div>table>"+
	  "tbody.hide[tag='"+ this_tag +"']>tr>td:first-child:not(#dist_)";
	var cubo_th = "tbody.hide[tag='"+ parent_tag +"']>div>table>"+
	  "tbody.hide[tag='"+ this_tag +"']>tr>th:first-child";

	$("<td id='p'><input id='principal' type='checkbox'></input></td>")
	  .insertAfter(cubo_th);
	$("<td id='p'></td>")
	  .insertAfter(cubo_th);

	$("<td id='n' class='check'><input type='checkbox'></input></td>")
	  .insertAfter(cubo_td);
	$("<td id='n' class='graph''><img style='z-index:-1' src='img/graph.svg'></img></td>")
	  .insertAfter(cubo_td);

      };
    }

    $("input#principal").on("click",function() {
      var grandparent_tbody = this.parentNode.parentNode.parentNode
	.parentNode.parentNode
	.getAttribute("tag");

      var parent_tbody = this.parentNode.parentNode.parentNode
	.getAttribute("tag");

      var child_boxes_str = "tbody[tag='"+ grandparent_tbody +"']>div>table>tbody[tag='"+ 
	parent_tbody +"']>tr>td>input";

      $(child_boxes_str).prop("checked",$(this).prop("checked"));
	
    });



     $("td.graph>img").on("click",function() {
	var row = this.parentNode.parentNode.querySelectorAll("td:not(#n)");
	var grandparent_tag = this.parentNode.parentNode.parentNode
	 .parentNode.parentNode.parentNode
	  .getAttribute('tag');
	var parent_tag = this.parentNode.parentNode.parentNode
	  .getAttribute('tag');

	var fechas = fechas_().split(",");
	var values = []
	var obj = {};
	for(var i in row) {
	  if(row[i].nodeName == "TD") {
	    var val = row[i].innerHTML;
	    if( i == 0) {
		val = val.replace(/&[a-z;\s]*/g,"");
		val = val.replace(/^\s/g,"");
		obj["name"] = val;
	    } else {
		val = +val.replace(/,/g,"");
		values.push([fechas[i-1],val]);
	    }
	  }
	};

	obj["data"] = values;
	var info = {
	  'serie':obj,
	  'grandparent':grandparent_tag,
	  'parent':parent_tag
	}


	var row_ = this.parentNode.parentNode;

      var cells = row_.querySelectorAll("td:not(#n)");
      var first_cell = cells[0].innerHTML;
      first_cell = first_cell.replace(/&[a-z;\s]*/g,"");
      first_cell = first_cell.replace(/^\s/g,"");

      if(row_.getAttribute('id')) {
	info['tema'] = first_cell;
	info['subtema'] = '';
      } else {

	info['subtema'] = first_cell;
	var ix = $(row_).index();
	var cond = false;

	while(!cond) {
	  var s = "tbody[tag='" + grandparent_tag + "']>div>table>" +
	   "tbody[tag='" + parent_tag + "']" +
	   ">tr:nth-child(" + ix + ")";

	  var dist = $(s).attr('id');
	  var dist_ = $(s)[0].querySelector("td:first-child").getAttribute("id");

	  if( dist || dist_ ) {
	    var tema = $(s)[0].querySelector("td:first-child").innerHTML;
	    tema = tema.replace(/&[a-z;\s]*/g,"");
	    tema = tema.replace(/^\s/g,"");
	    info["tema"] = tema;
	    if(dist_) {
	     info["subtema"] = tema;
	     info["tema"] = first_cell;
	     info.serie.name = tema;
	    }
	    cond = true;
	  }
	  ix -= 1;
        }
       }
	info.fechas = fechas_().split(",");
	grapher(info);
     });

    d3.selectAll("td#dist_").each(function() {
      d3.select(this.parentNode).style("background",temas_fondo);
    });


// ---------CALCULAR TAMAÑO DE CELDAS PARA EL ENCABEZADO-SCROLLER ----
  var cell_Width = $("tbody.hide")[0].querySelectorAll("th")[1].offsetWidth-1;

  var scroll_id_header = fechas_().replace(/-/g," ").split(",")
	.map(function(d) { return "<th style='width:"+cell_Width+"px;min-width:"+cell_Width+"px;padding:0px'>" + d + "</th>"; });

  scroll_id_header = ["<th style='min-width:333px'></th>"].concat(scroll_id_header).join("");
  $("tr.scroll_aid_header").html(scroll_id_header)

// ----------- CALCULAR TAMAÑO DE TBODY PARA EL SCROLLER_HEADER ----------
  var tbody_Width = document.querySelectorAll("table>.hide")[0].offsetWidth;
  $(".scroll_header").css("width","calc( 100% - "+ 65 +"px)");

// -------------------- MOVER DIVS SIMULTÁNEAMENTE ------------------
  $('div.overflow').on('scroll', function () {
    $('div.scroll_header').scrollLeft($(this).scrollLeft());
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


function fechas_() {
  var header = document.querySelector("tbody.hide>div>table>tbody.hide>tr")
	.querySelectorAll("th");

  var header_ = [];
  for(var i in header) {
    if(header[i].nodeName == "TH") header_.push(header[i].innerHTML);
  };

  header_ = header_.join(",").replace(/\s&nbsp;/g,"-");
  header_ = header_.replace(/^,/g,"");

  return header_;
};
