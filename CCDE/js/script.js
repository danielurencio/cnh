var noOfRows;
var ScrollHeader;

$(document).ready(function() {
  document.body.style.zoom = 1.0; 
  ScrollHeader = $('div.scroll_header')[0].getBoundingClientRect().bottom;
///////////////prevenir zoom//////////////////////////////////////////////////
  function zoomShortcut(e){
    if(e.ctrlKey){             //[ctrl] está presionado?
      event.preventDefault(); // prevenir zoom
      if(e.deltaY<0){        // scrolling up?
        return false;	    // hacer nada
      }
      if(e.deltaY>0){        //scrolling down?
        return false;
      }
    }
  };

  document.body.addEventListener("wheel", zoomShortcut); //add the event

///////////////prevenir zoom//////////////////////////////////////////////////
  function filtrarSeries(data) {
    var str_;
    function regexCheck(patt) {
	return patt.test(str_);
    };

    var color = getComputedStyle(document.body)
	.getPropertyValue('--subtitulos');
    var color_ = getComputedStyle(document.body)
	.getPropertyValue('--temas-fondo');

    var data_ = JSON.parse(JSON.stringify(data));
    var parser = new DOMParser();
    var arr = [];
    
    for(var i in data_) {
      for(var j in data_[i]) {
	if(typeof(data_[i][j]) == 'object') {
	  let key = Object.keys(data_[i][j])[0];
	  data_[i][j][key] = data_[i][j][key].replace(/&....;/g,"");
	  var tabla = parser.parseFromString(data_[i][j][key],"text/html");
	  var rows = tabla.querySelectorAll("tr>td:first-child");
          rows = Array.prototype.slice.call(rows);
	  rows = rows.map(function(d) { return d.textContent; });
	  rows.forEach(function(d) {
	    arr.push([data_[i][0],key,d].join(" > "));
	  });
        }
      }
    };


    d3.select("input#filtroSerie").on("input",function(d) {
      var matches = [];
      var text = document.getElementById("filtroSerie").value.split(" ");

      if(text.length > 0) {
	var patts = []	
	var patt = new RegExp(text,"i");

	text.forEach(function(d) {
	  var rx = new RegExp(d,"i");
	  patts.push(rx);
	});

	matches = arr.filter(function(d) {
	  str_ = d;
	  return patts.every(regexCheck);
	});

	matches = matches.map(function(d) {
	  return d.replace(/€/g," <span id='aquo'>&rsaquo;</span> ");
	});


	matches = matches.map(function(d) {
	  var val = d;
	  var text_ = new RegExp(text.join("|"),"ig");
	  val = d.replace(text_,function(n) {
	    return "<span class='matching'>" + n + "</span>";
	  });
	  
	  return val;
	});


        $("div#dropDown").css("display","block");

	if(document.querySelector("div#dropDown>div")) {
	  d3.select("div#dropDown>div").remove();
	}

	if(matches.length > 0) {

	  var series = d3.select("div#dropDown")
	   .append("div")
	    .selectAll("li").data(matches).enter()
	   .append("div")
	   .html(function(d) {
		var val = d;
//		val = val.replace(/>/g," &rsaquo; ");
		return val;
	   });

	  series
	   .style("font-weight","300")
	   .style("padding-left","20px")
	   .style("cursor","pointer")
	   .style("font-family","Open Sans")
	   .on("mouseover",function() {
	     d3.select(this)
	      .style("color","rgb(250,250,250)")
	      .style("font-weight","400")
	      .style("background",color);

	     var matching_child = Array.prototype.slice.call(this.children);

	     matching_child = matching_child.filter(function(d) {
		return d.getAttribute("class") == "matching";
	     });

	     $(matching_child)
		.css("color","white");
	   })
	   .on("mouseout",function() {
	     d3.select(this)
	      .style("color","black")
	      .style("font-weight","300")
	      .style("background","");

	     var matching_child = Array.prototype.slice.call(this.children);

	     matching_child = matching_child.filter(function(d) {
		return d.getAttribute("class") == "matching";
	     });

	     $(matching_child).css("color","");

	   })
	   .on("click",function() {
	    var txt = this.textContent.split(" > ");
	    irAserie(txt);
	   });
	
	} else if(matches.length == 0){
	  d3.select("div#dropDown>div").remove();
	}

      } else {
	d3.selectAll("div#dropDown>div").remove();
        $("div#dropDown").css("display","none");
      }

    });

    $("body *>*:not(div#dropDown)").on("click",function() {
      d3.selectAll("div#dropDown>div").remove();
      d3.selectAll("div#dropDown").style("display","none");
      document.querySelector("input#filtroSerie").value = "";
    });
  };


  function irAserie(txt,callback) {
    var titulo = txt[0];
    var titulo_label = $("tbody.labels[tag='" + titulo + "']");
    var titulo_hide = $("tbody.hide[tag='" + titulo + "']");

    if(titulo_hide.css("display") == "none") {
      titulo_label.click()
    }

    var subtitulo = txt[1];
    var subtitulo_label = $("tbody.hide[tag='" + titulo + "']>div.labels[tag='"
	+ subtitulo + "']");
    var subtitulo_overflow = subtitulo_label.next()

    if(subtitulo_overflow.css("display") == "none") {
    /* Función anónima que (a) hace click en la tabla solicitada y, de manera
       'asíncrona', (b) obtiene la celda buscada para (c) alimentarla en una
       función que desplazará el viewport hasta encontrar la celda... */
      (function () {
       subtitulo_label.click(); 	    // <-- (a)

       window.setTimeout(function() { /*------------------Async--*/
	  var el_ = selected_TD(txt[2])[0]; // <-- (b)
	  asyncScrollingSearch(el_);	    // <-- (c)
       },10);			     /*-------------------Async--*/

      })();

    } else {
      var el_ = selected_TD(txt[2])[0] 
      asyncScrollingSearch(el_)
//      el_.scrollIntoView();
    }

  };

////////////////////////////////////////////////////////////////////////
///////// Búsqueda de celda específica a través del filtro...
////////////////////////////////////////////////////////////////////////
  function selected_TD(txt) {
    var tds = Array.prototype.slice
	.call(document.querySelectorAll("div.overflow td:first-child"));

    tds = tds.filter(function(d) {
      return d.textContent.replace(/\s/g,"") == txt.replace(/\s/g,"");
    });

    return tds 
  }

////////////////////////////////////////////////////////////////////////////
//////////// Al buscar una celda, esto 'escrolea' hasta encontrarla
/////////////////////////////////////////////////////////////////////////
  function asyncScrollingSearch(el) {
   var selection_ = document.querySelectorAll("td[selection]");
   if(selection_.length > 0) {
     $(selection_).css("border","none")
   }

   var elDisp = $(el.parentNode).css("display");
   $(el.parentNode.children).filter(function(i,d) {
	return i == 0 || i > 2;
    })
	.css("border-top","1px solid black")
	.css("border-bottom","1px solid black")
	.attr("selection","1");

   var filas = el.parentNode.parentNode.querySelectorAll('tr');
   var scroll_header_bottom = document.querySelector('div.scroll_header')
	.getBoundingClientRect().bottom;

   var viewP = window.innerHeight - scroll_header_bottom;
   var fittingCells = Math.ceil(viewP / 17);

   if(filas.length < fittingCells) {
    /*Si la fila en la que está la celda no está visible, scroll hasta
	encontrarla !! */
      if(elDisp == 'none') {
       console.log("tabla chica: ir a fila que no está dibujada");
	 var ss = setInterval(function() {
    	   window.scrollTo(0,document.body.scrollHeight);
	   elDisp = $(el.parentNode).css("display");

	   if(elDisp != "none") {
	    clearInterval(ss);
	   }
	 },50);

      } else {
	console.log("tabla chica: ir a fila que ya está dibujada",elDisp);
	var mult,elPosition;

	var ss_ = setInterval(function() {
	   elPosition = el.getBoundingClientRect().top;
	   mult = elPosition > 300 ? 1 : -1;
	   var f = Math.log(Math.abs(elPosition-160)) * 20
	   console.log(f);
    	   window.scrollBy(0,mult*f);
	   if( elPosition-20 < window.innerHeight && elPosition > 150) {
	    console.log(elPosition);
	    clearInterval(ss_);
	   }
	},50);

      }

   } else {
	console.log("TABLAS GRANDES");
	var elLoc = $(filas).map(function(i,d) {
	  var val = this.children[0].textContent.replace(/\s*/g,"");
          val = val == el.textContent.replace(/\s*/g,"") ? i : null;
	  return val;
	})[0];

        var arriba = $(filas).filter(function(i,d) {
	  return i < elLoc - 60;
	});

        var block = $(filas).filter(function(i,d) {
	  return i > elLoc - 60 && i < elLoc + fittingCells*1.5;
	});

	window.scrollTo(0,document.body.scrollHeight);

	var elPosition = el.getBoundingClientRect().top;
	console.log(elPosition,elLoc);

	/*Si la fila está muy abajo hay q darle un empujón al scroll*/
	if(elLoc*17 > window.innerHeight - 150) {
	  console.log("esto sólo debe de imprimirse cuando es hacia abajo!");
	  window.scrollTo(0,document.body.scrollHeight);
	}

	arriba.css("display","none");
	arriba.attr("tag","arriba");
	block.css("display","block");
	block.css("tag",null);

	var mult;

	var ss_ = setInterval(function() {
	   elPosition = el.getBoundingClientRect().top;
	   mult = elPosition > 300 ? 1 : -1;
	   var f = Math.log(Math.abs(elPosition-160)) * 20
	   console.log(f);
    	   window.scrollBy(0,mult*f);
	   if( elPosition-20 < window.innerHeight && elPosition > 150) {
	    console.log(elPosition);
	    clearInterval(ss_);
	   }
	},50);

/*
	var ss_ = setInterval(function() {
	   elPosition = el.getBoundingClientRect().top;
	   mult = elPosition > 0 ? 1 : -1;

    	   window.scrollBy(0,mult*20);

	   if( elPosition < window.innerHeight && elPosition > 300 ) {
	    clearInterval(ss_);
	   }
	},100);
*/	
   }

  }
/////////////////////////////////////////////////////////////////////////////

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

    $("button.filtros").attr("id","off");
    $(this).attr("id","on");

    var tag = $(this).attr("tag");
    $("tbody#tabla").html("");
    var loading_text = "<div style='font-weight:800;position:absolute;top:50%;left:calc(50% - 75.7px);'class='wait'><span>Cargando información ...</span></div>"
//    $("body").prepend(loading_text);


    $.get(tag + ".json", function(data) {
       Cubos(data,tag);
       $("tbody#tabla>tbody.labels").click();
       $($("tbody#tabla>tbody.hide")[0].querySelectorAll("div.labels:nth-child(1)")).click();
       if(tag == "campos") d3.selectAll("#dist").attr("id",null); // <-- ¿?
//       $("div.wait").remove();
       $("body").css("cursor","default");
       filtrarSeries(data);
    });

    
  });

     $.get("cuencas.json", function(data) {
        data = formatoData(data);
	Cubos(data);
        $("tbody#tabla>tbody.labels").click();
        $($("tbody#tabla>tbody.hide")[0].querySelectorAll("div.labels:nth-child(1)")).click();
	filtrarSeries(data);
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

  if(checked.length > 500) {
    alert("Su consulta excede el límite de 500 series.");
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


function Cubos(data,tag) {
///////////ESTO EVITA BUGS CON EL SCROLLER DEL HEADER/////////////////////////
       $('.scroll_aid_header').attr("visible","no");
       $(".scroll_header").scrollLeft(0);
       $("#footer_").scrollLeft(0);
       $("button#principal").attr("todos","no");
       data = formatoData(data);
///////////////////////////////////////////////////////////////////////////7
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
	"<label style='cursor:pointer;width:100%'>&ensp;<span class='s' id='uno' style='font-weight:400;'>" + plus + "&ensp;</span>" + selection.attr("tag") + "</label>" +
	"</td>" + 
	"</tr>" + 
	"";
	selection.html(str);
    } else {
	selection.style("display","none")
	var tag = selection.attr("tag");
	var seg = data.filter(function(d) { return d[0] == tag; })[0];
	var tablas = seg.filter(function(d) { return typeof(d) == "object"; });

      for(var j in tablas) {
	var str = "" +
	"<thead style='width:100%'>" +
	"<div style='width:100%'>&nbsp;&nbsp;<label style='cursor:pointer;'>&ensp;<span id='dos' class='s' style='font-weight:400;'>" + plus + "&ensp;</span>&ensp;&ensp;" + Object.keys(tablas[j])[0] + "</label></div>" +
	"</thead>";

	var contenido_tabla; // <-- Solo pegar en DOM la primera tabla! 
        contenido_tabla = ""//j == 0 && i == 1 ? tablas[j][Object.keys(tablas[j])[0]] +
//	  "<br>" : "";
	selection.append("div")
	  .attr("class","labels")
	  .attr("tag",Object.keys(tablas[j])[0])
	  .attr("id","id_"+j)
	  .html(str);

	selection.append("div")
	.attr("class","overflow")
	.attr("tag",tag)
	.style("display","none")
	.attr("on","0")
	.style("overflow-x","scroll")
	 .append("table")
	 .append("tbody")
	  .attr("class","hide")
	  .style("width","100%")
	  .attr("tag",Object.keys(tablas[j])[0])
	  .attr("download","1")
	  .attr("id","id_"+j)
	  .html(contenido_tabla);

      }

    }

  });

///////////////////////////////////////////////////////////////////////////
/////////////////vv EXPANDIR PARA ESCRIBIR EN DOM vv//////////////////////
/////////////////////////////////////////////////////////////////////////
  
  /*Un IF-STATEMENT podría diferenciar entre niveles*/
  $(".labels").on("click",function(d) {

    var tag = d3.select(this).attr("tag");
    var span = d3.select($(this).find("span.s")[0]);
    var selection = d3.select("[tag='" + tag + "'].hide")
    var selection = d3.select($(this).next()[0])
    if(selection.style("display") == 'block' && this.nodeName == "TBODY") {
	selection
	.style("display","none");
	span.html(plus + "&ensp;");
    }
 else if( selection.style("display") != "block" && this.nodeName == "TBODY" ) {
	selection.style("display","block");
	span.html(minus + "&ensp;");
    }

    if(this.nodeName == "DIV") {
          $(".overflow").scrollLeft(0);
          $(".scroll_header").scrollLeft(0);

	  var tbody_hide = $(this).next()[0].querySelector(".hide");
	  var this_overflow = d3.select($(this).next()[0]);
	  var span = d3.select($(this).find("span.s")[0]);
	  if(this_overflow.style("display") == "block") {
	    this_overflow.style("display","none");
	    d3.select(tbody_hide).html("");
	    span.html(plus + "&ensp;");
	  } else {
	    //// <--- !
	    var algo = this;

	    function nuevaTabla(algo,callback) {
	      var parentTag = algo.parentNode.getAttribute("tag");
	      var Tag = algo.getAttribute("tag");

	      var tableData = data.filter(function(d) {
	        return d[0] == parentTag;
	      })[0].filter(function(d) {
	        return typeof(d) == "object" && d[Tag];
	      })[0][Tag];

	      tableData = formatoData(tableData);

	      var parser = new DOMParser();
	      var docTable = parser.parseFromString(tableData,"text/html");
	      docTable = docTable.querySelector("table");


	      d3.selectAll("div>label>span.s").html(plus + "&ensp;");
	      span.html(minus + "&ensp;");
	      d3.selectAll("div.overflow").style("display","none");
	      d3.selectAll("div.overflow>table>tbody").html("")

	      var viewStart = algo.getBoundingClientRect().bottom;
	      var viewEnd = window.innerHeight;
	      noOfRows = Math.ceil((viewEnd-viewStart)/17)*1.5;

	      var arr = docTable.querySelectorAll("tr");

		for(var i=0; i<arr.length; i++) {
		  if(i>noOfRows) {
		    arr[i]//.remove()
		.style.display = "none";
		    $(arr[i]).attr("tag","ocult");
		  }
		}


	      d3.select(tbody_hide.parentNode.parentNode)
	       .style("display","block");
	      d3.select(tbody_hide).html(docTable.innerHTML)

	      icons();
	   // seleccionarCheckboxes();
	      enableGraphs();
	      corregirRenglones();
	      headerScroll();
	      colcol();
	      callback();
            };

	    function mensajeEspera() {
	      $("div#espere").css("visibility","visible")
	      window.setTimeout(function() {
	        nuevaTabla(algo,function() {
	          $("div#espere").css("visibility","hidden")
	        });
	      },10);
	    }
	    mensajeEspera();
	 };
    }

  });
///////////////////////////////////////////////////////////////////////////
/////////////////^^ EXPANDIR PARA ESCRIBIR EN DOM ^^//////////////////////
/////////////////////////////////////////////////////////////////////////

 function colcol() {

  d3.selectAll(".hide td:not(:first-child)").on("mouseover",function() {

     var grand_parent = $(this).parent().parent().parent()
	.parent().parent().attr("tag");
     var parent = $(this).parent().parent().attr("tag");
     var ix = $(this).index() + 1;
     var aid_cell = d3.select("tr.scroll_aid_header>th:nth-child("+ (ix-2) +")")
     if(aid_cell) {
       if($("tr.scroll_aid_header").attr("visible") == "yes") {
         aid_cell.style("background",color);
       }
     }

// Colorear columnas
//     d3.selectAll("tbody[tag='" + grand_parent + "']>div>table>tbody[tag='" +
//	parent+"'] td:nth-child("+ ix +")").style("background",color);

// Colorear filas
     $(this.parentNode.children).css("background",color);

     d3.selectAll("tbody[tag='" + grand_parent + "']>div>table>tbody[tag='" +
	parent+"'] th:nth-child("+ ix +")").style("background",color);

     //$(this.parentNode.children[0]).css("background",color)

  });


  d3.selectAll(".hide td:not(:first-child)").on("mouseout",function() {
     var color_cond = this.parentNode.getAttribute("id") == "dist" ||
	this.parentNode.children[0].getAttribute("id") == "dist_";
     var color_1 = color_cond ? temas_fondo : "transparent";


     var grand_parent = $(this).parent().parent().parent()
	.parent().parent().attr("tag");
     var parent = $(this).parent().parent().attr("tag");
     var ix = $(this).index() + 1;
     var aid_cell = d3.select("tr.scroll_aid_header>th:nth-child("+ (ix-2) +")")

     if(aid_cell) {
       if($('tr.scroll_aid_header').attr("visible") == "yes") {
         aid_cell.style("background","white")
       }
     }

// Descolorear filas
     var color_tag = $(this.parentNode).attr("color_tag");
     var color_tag_ = color_tag ? color_tag : "transparent";
     $(this.parentNode.children).css("background","");

// Desolorear columnas
//     d3.selectAll("tbody[tag='" + grand_parent + "']>div>table>tbody[tag='"+parent+"'] "+
//	"td:nth-child("+ ix +")")
//	.style("background","transparent");

     d3.selectAll("tbody[tag='" + grand_parent + "']>div>table>tbody[tag='"+parent+"'] "+
	"th:nth-child("+ ix +")")
	.style("background","transparent");


     if(color_cond) {	
       $(this.parentNode.children[0]).css("background",color_1)
     } else {
       $(this.parentNode.children[0]).css("background",color_tag_)
     }


  });

  if(tag) {
    if(tag == "campos") d3.selectAll("#dist").attr("id",null); // <-- ¿?
  }


  var table_bottom = $(".overflow:visible")[0]
        .getBoundingClientRect().bottom;

  if(table_bottom > window.innerHeight) {
    $("#footer").css("display","block");
  } else {
    $("#footer").css("display","none");
  }



      var evenRows = document.querySelectorAll("div.overflow tr:nth-child(even)");
      evenRows = $(evenRows);

      evenRows.each(function() {
	let color = $(this).css("background-color");
	$(this).attr("color_tag",color);
	$(this.children[0]).css("background",color)
      });

  $("div.overflow tr>td").css("height","15");
  $("div.overflow tbody>tr:first-child>td").css("display","none");
}
//////////////////////////////////////////////////////////////////////////////
/////////////////////vv HABILITAR ÍCONOS POR TABLA vv////////////////////////
////////////////////////////////////////////////////////////////////////////
    function icons() {
      var cubos = document.querySelectorAll("tbody.hide>div>table>tbody.hide");

      for(var c in cubos) {
        if(cubos[c].nodeName == "TBODY") {
	  var parent_tag = cubos[c].parentNode.parentNode.parentNode
	    .getAttribute("tag");

	  var this_tag = cubos[c].getAttribute("tag");

	  var cubo_td = "tbody.hide[tag='"+ parent_tag +"']>div>table>"+
	    "tbody.hide[tag='"+ this_tag +"']>tr>td:first-child:not(#dist_)";
	  var cubo_th = "tbody.hide[tag='"+ parent_tag +"']>div>table>"+
	    "tbody.hide[tag='"+ this_tag +"']>tr>th:first-child";

	  $("<td id='p'><input id='principal' style='display:none;' type='checkbox'></input></td>")
	    .insertAfter(cubo_th);
	  $("<td id='p'></td>")
	    .insertAfter(cubo_th);

	  $("<td id='n' class='check'><input type='checkbox'></input></td>")
	    .insertAfter(cubo_td);
	  $("<td id='n' class='graph''><img style='z-index:-1' src='img/graph.svg'></img></td>")
	    .insertAfter(cubo_td);
        };
      }
   };
//////////////////////////////////////////////////////////////////////////////
////////////////////^^ HABILITAR ÍCONOS POR TABLA^^//////////////////////////
////////////////////////////////////////////////////////////////////////////

    function seleccionarCheckboxes() {
      $("button#principal").on("click",function() {
        //var grandparent_tbody = this.parentNode.parentNode.parentNode
	  //.parentNode.parentNode
	  //.getAttribute("tag");

        //var parent_tbody = this.parentNode.parentNode.parentNode
	  //.getAttribute("tag");

       // var child_boxes_str = "tbody[tag='"+ grandparent_tbody +
	//"']>div>table>tbody[tag='"+ parent_tbody +"']>tr>td>input";
	var child_boxes_str = "input[type='checkbox']:not(#principal)";
//        $(child_boxes_str).prop("checked",$(this).prop("checked"));
	d3.selectAll(child_boxes_str).attr("checked","checked");
      });
    };

    seleccionarCheckboxes();

    function enableGraphs() {
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
    };

    function corregirRenglones() {
      d3.selectAll("td#dist_").each(function() {
        d3.select(this.parentNode).style("background",temas_fondo);
      });
    };


// ---------CALCULAR TAMAÑO DE CELDAS PARA EL ENCABEZADO-SCROLLER ----
  function headerScroll() {
    var first_th = $("tbody.hide")[0].querySelectorAll("th")[1];
    if(first_th) {
      var cell_Width = first_th.offsetWidth - 1;

      var scroll_id_header = fechas_().replace(/-/g," ").split(",")
	.map(function(d) { return "<th style='width:"+cell_Width+
	"px;min-width:"+cell_Width+"px;padding:0px'>" + d + "</th>"; });

      var scroll_id_header_ = ["<th style='min-width:333px'></th>"]
	.concat(scroll_id_header).join("");
      $("tr.scroll_aid_header").html(scroll_id_header_)

      $("tr.scroll_aid_footer").html(scroll_id_header)

// ----------- CALCULAR TAMAÑO DE TBODY PARA EL SCROLLER_HEADER ----------
      var tbody_Width = document.querySelectorAll("table>.hide")[0]
	.offsetWidth;
      $(".scroll_header").css("width","calc( 100% - "+ 65 +"px)");

// -------------------- MOVER DIVS SIMULTÁNEAMENTE ------------------
      $('div.overflow').on('scroll', function () {
        $('div.scroll_header').scrollLeft($(this).scrollLeft());
      });

      $('#footer_').on('scroll', function () {
        $('div.scroll_header').scrollLeft($(this).scrollLeft());
        $('div.overflow').scrollLeft($(this).scrollLeft());
      });

    }
  };

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


