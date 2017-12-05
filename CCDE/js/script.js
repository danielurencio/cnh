var noOfRows;
var ScrollHeader;
var SS_ = true;
var _parametros_;
var params_especiales = null;
var caso_especial = false;

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

//////////////Quitar filtro de búsqueda //////////////////////////
 $("div#quitarFiltro").on("click",function() {
   var tablaVisible = $("div.overflow").filter(function() {
     return $(this).css("display") == "block";
   });

   var inx = tablaVisible.index();
   var subtitulo_ = tablaVisible[0].parentNode.children[inx-1];
   subtitulo_.click();
//   $(this).css("display","none");
   subtitulo_.click();
 });
//////////////Quitar filtro de búsqueda //////////////////////////


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

	matches = matches.filter(function(d,i) {
	  return i <50;
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
	    $("div#quitarFiltro").css("display","block")
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
//	  asyncScrollingSearch(el_);	    // <-- (c)
	  mostrar(el_);
	  $("#footer").css("display","none");
       },10);			     /*-------------------Async--*/

      })();

    } else {
      var el_ = selected_TD(txt[2])[0] 
//      asyncScrollingSearch(el_)
	mostrar(el_);
    }

  };

  function mostrar(el) {
    SS_ = false;
    d3.selectAll("div.overflow tr").style("display","none");
    $(document.querySelectorAll("div.overflow tr")[0]).css("display","block");
    $(el.parentNode).css("display","block");
    var pos = el.parentNode.parentNode.parentNode.parentNode.parentNode.offsetTop;
//    window.scrollTo(0,pos-30)

    $(window).scrollTop(
      $(el).offset().top - 180
    );

  }

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
/*
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
	  var val = this.children[0].textContent.replace(/\s/g,"");
          val = val == el.textContent.replace(/\s/g,"") ? i : null;
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
	var elDisp = $(el.parentNode).css("display");
	console.log(elPosition,elLoc);

	if(elLoc*17 > window.innerHeight - 150) {
	  console.log("esto sólo debe de imprimirse cuando es hacia abajo!");
	  window.scrollTo(0,document.body.scrollHeight);
	}

	arriba.css("display","none");
	arriba.attr("tag","arriba");
	block.css("display","block");
	block.css("tag",null);

	var mult, firstVisible;

	var ss_ = setInterval(function() {

	   firstVisible = $("div.overflow tr").map(function(i,d) {
    	    var a = this.getBoundingClientRect().bottom > 150;
            var val = a ? i : null; return val;
           })[0];


	   elPosition = el.getBoundingClientRect().top;
	   elBottom = el.getBoundingClientRect().bottom;
	   elDisp = $(el.parentNode).css("display");

	   if(elPosition > 300) {
		mult = 1;
	   } else if(elPosition < 300 && elPosition != 0 && elBottom != 0 ) {
		mult = -1;
	   } else if(elPosition == 0 && elBottom == 0 && elLoc > firstVisible) {
		mult = 1;
	   } else if(elPosition == 0 && elBottom == 0 && elLoc < firstVisible) {
		mult = -1;
	   }

	   var f = Math.log(Math.abs(elPosition-160)) * 30
    	   window.scrollBy(0,mult*f);

	   if( elPosition < window.innerHeight-20 && elPosition > 150) {
	    clearInterval(ss_);
	   }

	},50);

   }

  }
*/

/////////////////////////////////////////////////////////////////////////////
//                          |                                              //
// Todo ocurre aquí.------- V                                              //
//                                                                         //
/////////////////////////////////////////////////////////////////////////////

$.ajax({
   url:"http://172.16.24.57/cubos_temas.py",
   dataType:'json',
   data:{'section':'PRODUCCION'},
   success:function(temas) {
  
    var TEMAS = JSON.parse(temas);
    //var temas_nombres = TEMAS.map(function(d) { return d.tema; });
console.log(TEMAS);
 $.get("blueprints.json",function(response) {
  RenderWords(response,"esp",TEMAS);

  $("button#consultar").on("click",function() {
      _parametros_ = parametros();

  var fecha_VALIDA = +_parametros_['start_year'] < +_parametros_['end_year'];
      
if(fecha_VALIDA) {
  console.log(_parametros_);
      boton_consulta
	.css("background-color","rgb(221,221,221)")
        .css("border","2px outset rgb(221,221,221)")
	.css("color","black")
	.css("border-radius","0px")
	.css("font-weight","600");

      $("div#espere").css("visibility","visible");
/*    Está sección esconde el header ocurrente cuando uno cambia de tema  */
      $("tr.scroll_aid_header").attr("visible","no");
      $("tr.scroll_aid_header>th").css("color","white");
      $("tr.scroll_aid_header>th:not(:first-child)")
        .css("border","1px solid white")
/*    Está sección esconde el header ocurrente cuando uno cambia de tema  */

    var tag = $(this).find(":selected").attr("tag");
    $("tbody#tabla").html("");
    var loading_text = "<div style='font-weight:800;position:absolute;top:50%;left:calc(50% - 75.7px);'class='wait'><span>Cargando información ...</span></div>";

     
     var params = parametros();

/*------------------AJAX con botón de consultar-------------------------------*/
     $.ajax({
        url: "http://172.16.24.57/cubos_produccion.py",
        type: "post",
        datatype:"json",
        data: params,
        success: function(data){
          ajaxFunction(data,Cubos,filtrarSeries,params_especiales);
        }

     });
/*------------------AJAX con botón de consultar-------------------------------*/
} else {
  alert("Seleccione una fecha válida.");
}
  });

  $("select.filtros").change(function() { // <--- CAMBIO DE TEMA..
      _parametros_ = parametros();

      boton_consulta
	.css("background-color","rgb(221,221,221)")
        .css("border","2px outset rgb(221,221,221)")
	.css("color","black")
	.css("border-radius","0px")
	.css("font-weight","600");

      $("div#espere").css("visibility","visible");
/*    Está sección esconde el header ocurrente cuando uno cambia de tema  */
      $("tr.scroll_aid_header").attr("visible","no");
      $("tr.scroll_aid_header>th").css("color","white");
      $("tr.scroll_aid_header>th:not(:first-child)")
        .css("border","1px solid white")
/*    Está sección esconde el header ocurrente cuando uno cambia de tema  */

    var tag = $(this).find(":selected").attr("tag");
    $("tbody#tabla").html("");
    var loading_text = "<div style='font-weight:800;position:absolute;top:50%;left:calc(50% - 75.7px);'class='wait'><span>Cargando información ...</span></div>";

///////////////////////////////////////////////////////////////////////////////
//////////////////// AJAX - CONSULTA AL CAMBIAR DE TEMA - /////////////////////
///////////////////////////////////////////////////////////////////////////////

 var params = parametros();

 $.ajax({
   url: "http://172.16.24.57/cubos_produccion.py",
   type: "post",
   datatype:"json",
   data: params,
   success: function(data){
     ajaxFunction(data,Cubos,filtrarSeries);
   }

  });

/*
$.get(tag + ".json", function(data) {
  Cubos(data,tag);
  $("tbody#tabla>tbody.labels").click();
  $($("tbody#tabla>tbody.hide")[0]
   .querySelectorAll("div.labels:nth-child(1)")).click();

  if(tag == "campos") d3.selectAll("#dist").attr("id",null); // <-- ¿?

  $("body").css("cursor","default");

  filtrarSeries(data);
});
*/
///////////////////////////////////////////////////////////////////////////////
//////////////////// AJAX - CONSULTA AL CAMBIAR DE TEMA - /////////////////////
///////////////////////////////////////////////////////////////////////////////

});  // <------- CAMBIO DE TEMA...

$('input[type=radio][name=periodicidad]').change(function() {
  var HP = $("div#HP");
  var _month = $("._month");
  if(this.value == 'annually') {
    HP.css("z-index","1");
//    _month.css("opacity","0.18");
  } else {
    HP.css("z-index","-1");
//    _month.css("opacity","1");
  }
  var newParams = parametros();

});


var boton_consulta = $("button#consultar");
var selectors_ = ["select#start_year","select#end_year","select#start_month","select#end_month","input[type=radio][name=periodicidad]"];

for(var j in selectors_) {
  $(selectors_[j]).change(function() {

    if(true) {
      let anio_inicio = $("select#start_year").val();
      let anio_final  = $("select#end_year").val();

      if(anio_final - anio_inicio > 10) {
	$("input[type=radio][value=annually]")[0].checked = true
	$("div#HP").css('z-index',"1")

	$(".i_fechas>div")
	  .filter(function(d) {
	    return this.textContent == "Mensual"
	  }).css("opacity",0.2);

	$("input[type=radio][value=monthly]")
	  .css("opacity",0.2);

      } else {
	$(".i_fechas>div")
	  .filter(function(d) {
	    return this.textContent == "Mensual"
	  }).css("opacity",1);

	$("input[type=radio][value=monthly]")
	  .css("opacity",1);

      }

    }


    var cambio_ = false;
    var newParams = parametros();

    for(var k in newParams) {
      if(newParams[k] != _parametros_[k]) {
	cambio_= true;
	break;
      }
    }

    if(cambio_) {
      boton_consulta
	.css("background-color","rgb(13,180,190)")
	.css("border","none")
	.css("color","white")
	.css("border-radius","3px")
	.css("font-weight","800");
    } else {
      boton_consulta
	.css("background-color","rgb(221,221,221)")
        .css("border","2px outset rgb(221,221,221)")
	.css("color","black")
	.css("border-radius","0px")
	.css("font-weight","600");

    }

    var selCond = selectors_[j] == "select#start_year" ||
		  selectors_[j] == "select#end_year";

  });

}

///////////////////////////////////////////////////////////////////////////////
//////////////////// AJAX - tabla default - ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/*
$.get("cuencas.json", function(data) {
  console.log(data);
  data = formatoData(data);
  Cubos(data);
  $("tbody#tabla>tbody.labels").click();
  $($("tbody#tabla>tbody.hide")[0]
    .querySelectorAll("div.labels:nth-child(1)")).click();
  filtrarSeries(data);
});
*/

 var params = parametros();
 _parametros_ = parametros();

 $.ajax({
   url: "http://172.16.24.57/cubos_produccion.py",
   type: "post",
   datatype:"json",
   data: params,
   success: function(data){
     ajaxFunction(data,Cubos,filtrarSeries);
   }

  });


///////////////////////////////////////////////////////////////////////////////
//////////////////// AJAX - tabla default - ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


   $("span.lang").on("click", function() {
     RenderWords(response,this.id);
   });

//     $("button#boton").on("click",descargar);

   $("button#selection").on("click",function() {
     var series = obtener_series();

     if(series && series.length == 0) {
       alert("Seleccione alguna serie.");
     } else { if(series) descargar_selection(series); }

   });


  });
 }
}); // <-- PRIMER AJAX!



function grapher(info) {
var fake_tag = [ info.grandparent, info.parent, info.tema, info.subtema ];
if(fake_tag[3] == "") { fake_tag = fake_tag.slice(0,3); }
fake_tag = fake_tag.join(" - ");

var grapher_element = 
"<div id='grapher'>" +
"<button class='datos_grapher' tag='off'>"+
"Datos <span id='flecha'>></span>"+
"</button>" +
"<img class='close_chart' src='img/close.svg'></img>" +

"<div class='chart_expandible' tag='"+ fake_tag +"'>"+

"<div id='header_expandible' style='position:absolute;top:35px;width:100%;'>"+
"<table style='table-layout:fixed;'>"+
"<tr style='font-weight:700;'>"+
  "<td style='width:90px;min-width:90px;display:inline-block;padding:0px;'>FECHA</td>"+
  "<td style='width:90px;min-width:90px;display:inline-block;padding:0px;'>DATO</td>"+
"</tr>"+
"</table>" +
"</div>" +

"<div id='tabla_expandible' style='width:100%;height:calc(100% - 110px);margin-top:60px;overflow-y:scroll;'>" +
"<table style='table-layout:fixed;'></table>" +
"</div>" +

"<button style='margin-left:20px;margin-top:15px;width:calc(100% - 50px);' onclick='descargarSerie()'>Descargar</button>" +

"</div>" +
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
  },
  {
   textKey:'downloadCSV',
   onclick:descargarSerie,
   text:"CSV"
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
"</span>" +
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

////////////////////// AGREGAR TABLA PARA DESCARGA ////////////////////////////
var datos_tabla_ = info.serie.data.reverse();

d3.select("div#tabla_expandible>table").selectAll("tr")
.data(datos_tabla_).enter()
.append("tr")
 .each(function(d) {
  var val_ = d.map(function(t) {
    var v = String(t);
    if(v == "NaN") v = "";
    return "<td style='height:22px;min-height:42px;width:90px;min-width:90px;padding:0px;display:inline-block;border-top:1px solid rgba(0,0,0,0.08);'>" + v + "</td>";
  }).join("");
  d3.select(this).html(val_);
});

var tExp_w= $("div#tabla_expandible").css("width");
$("div#header_expandible").css("width",tExp_w);
/////////////////////// AGREGAR TABLA PARA DESCARGA /////////////////////////

d3.select("button.datos_grapher").on("click",function() {
//    var datos_tabla_ = info.serie.data.reverse();

var tag_boton = $(this).attr("tag");
var new_tag_boton = tag_boton == 'off' ? 'on' : 'off';
var chart_container = "#grapher>div#chart";
var exp_size = "200px";

if(tag_boton == 'off') {

resizeHighchart(exp_size,tag_boton);
$("span#flecha").html("<")

d3.select("#grapher>div.chart_expandible")
.style("display","block")
.style("width",exp_size);

$(chart_container)
//	.css("display","block")
.css("width","calc(80% - " + exp_size + ")");

/*
d3.select("div#tabla_expandible>table").selectAll("tr")
.data(datos_tabla_).enter()
.append("tr")
 .each(function(d) {
  var val_ = d.map(function(t) {
    return "<td style='height:22px;min-height:22px;width:90px;min-width:90px;padding:0px;display:inline-block;border-top:1px solid rgba(0,0,0,0.08);'>" + t + "</td>";
  }).join("");
  d3.select(this).html(val_);
});

var tExp_w= $("div#tabla_expandible").css("width");
$("div#header_expandible").css("width",tExp_w);
*/
$(this).attr("tag",new_tag_boton);

} else {
//      d3.select("div#tabla_expandible>table").html("");

$("span#flecha").html(">")

d3.select("#grapher>div.chart_expandible")
.style("display","none")
.style("width","0px");

$(chart_container)
.css("width","80%");

resizeHighchart(exp_size,tag_boton);

$(this).attr("tag",new_tag_boton);

}

});

};


function descargar_selection(series) {
var chunk = [];

var fecha = new Date();
var Header = [
"PRODUCCION",
"COMISION NACIONAL DE HIDROCARBUROS",
"Fecha de descarga: " + fecha.toLocaleString('es-MX').replace(", "," - "),
"\n",
];

var fechatest_ = fecha.toLocaleString('es-MX').replace(", "," - ")

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

var csvFile = new Blob(["\ufeff",chunk], { 'type':'text/csv' });

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
    "Fecha de descarga: " + fecha.toLocaleString('es-MX').replace(", "," - "),
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
  var csvFile = new Blob(["\ufeff",csv], { 'type':'text/csv' });

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



function Cubos(data,tag) {
///////////ESTO EVITA BUGS CON EL SCROLLER DEL HEADER/////////////////////////
  $('.scroll_aid_header').attr("visible","no");
  $(".scroll_header").scrollLeft(0);
  $("#footer_").scrollLeft(0);
  $("button#principal").attr("todos","no");
  data = formatoData(data);
/////////////////////////////////////////////////////////////////////////////
  var color = getComputedStyle(document.body).getPropertyValue('--filasYcols');
  var temas_fondo = "white"
	//getComputedStyle(document.body).getPropertyValue('--temas-fondo');

  var plus = "&plus;", minus = "&ndash;";

  d3.select("tbody#tabla").selectAll("tbody")
    .data(data).enter()
   .append("tbody")
    .style("width","100%")
    .attr("class","labels").style("display","table")
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
	  "<label style='cursor:pointer;width:100%'>&nbsp;<span class='s' id='uno' style='font-weight:400;'>" + plus + "&ensp;</span>" + selection.attr("tag") + "</label>" +
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
	  .append("table").style("table-layout","fixed")
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
    SS_= true;
    $("div#quitarFiltro").css("display","none");

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

    if(this.nodeName == "DIV" && $(this).attr("especial") == "1") {
//	$("div#espere").css("visibility","visible");

	var title = this.parentNode.getAttribute("tag");
	var subtitle = this.getAttribute("tag");

	params_especiales = { 'title':title,'subtitle':subtitle };

	var params = parametros();
	params["title"] = title;
	params["subtitle"] = subtitle;
	var algo_ = this;

	$.ajax({
	   url:"http://172.16.24.57/cubos_produccion.py",
	   dataType:'json',
	   data:params,
	   success:function(tabla_respuesta) {
		tabla_respuesta = formatoData(tabla_respuesta);
		TableLogistics(algo_,tabla_respuesta);
	   } 
	});

    }

    if(this.nodeName == "DIV" && $(this).attr("especial") != "1") {
	var title = this.parentNode.getAttribute("tag");
	var subtitle = this.getAttribute("tag");

	params_especiales = { 'title':title,'subtitle':subtitle };
	TableLogistics(this,data);
    }

});
///////////////////////////////////////////////////////////////////////////
/////////////////^^ EXPANDIR PARA ESCRIBIR EN DOM ^^//////////////////////
/////////////////////////////////////////////////////////////////////////
function TableLogistics(sth,data) {
      $(".overflow").scrollLeft(0);
      $(".scroll_header").scrollLeft(0);

      var tbody_hide = $(sth).next()[0].querySelector(".hide");
      var this_overflow = d3.select($(sth).next()[0]);
      var span = d3.select($(sth).find("span.s")[0]);
      if(this_overflow.style("display") == "block") {
        this_overflow.style("display","none");
        d3.select(tbody_hide).html("");
        span.html(plus + "&ensp;");
      } else {
    //// <--- !
      var algo = sth;

      function nuevaTabla(algo,callback) {

        var parentTag = algo.parentNode.getAttribute("tag");
        var Tag = algo.getAttribute("tag");

        var tableData = data.filter(function(d) {
	  return d[0] == parentTag;
        })[0].filter(function(d) {
	  		return typeof(d) == "object" && d[Tag];
        })

if(tableData[0]) {
        tableData = tableData[0][Tag];

        tableData = formatoData(tableData);

        var parser = new DOMParser();
        var docTable = parser.parseFromString(tableData,"text/html");
        docTable = docTable.querySelector("table");
        $(docTable).css("table-layout","fixed");


        d3.selectAll("div>label>span.s").html(plus + "&ensp;");
        span.html(minus + "&ensp;");
        d3.selectAll("div.overflow").style("display","none");
        d3.selectAll("div.overflow>table>tbody").html("")

        var viewStart = algo.getBoundingClientRect().bottom;
        var viewEnd = window.innerHeight;
        noOfRows = Math.ceil((viewEnd-viewStart)/17)*1.5;

        var arr = docTable.querySelectorAll("tr");

	for(var i=0; i<arr.length; i++) {
/*petición Mendoza*/
/*Colores para filas pares, títulos subtítulos y así...*/

/*
	  if(arr[i].children[0].getAttribute("id") == "dist_") {
	    $(arr[i].children)
		.css("background","rgba(73,171,129,0.25)")
	  }

	  if(i % 2 == 0 && i != 0) {
	    if(arr[i].children[0].getAttribute("id") != "dist_") {
		$(arr[i]).attr("even",1)
		$(arr[i]).attr("color_tag","rgba(73,171,129,0.1)");
		$(arr[i].children)
		  .css("background","rgba(73,171,129,0.1)");
	    }

	    if(arr[i].children[0].getAttribute("id") == "dist_") {
		$(arr[i].children)
		  .css("background","rgba(73,171,129,0.25)");
	    }

	    if(arr[i].getAttribute("id") == "dist"
		&& !docTable.querySelectorAll("td#dist_").length
	    ) {
		$(arr[i].children)
		.css("background","rgba(73,171,129,0.25)");
	      }

	  }

	  if(i % 2 != 0 && i != 0) {
	    if(arr[i].children[0].getAttribute("id") == "dist_") {
		$(arr[i].children)
		  .css("background","rgba(73,171,129,0.25)");
	    }

	    if(arr[i].getAttribute("id") == "dist" 
		&& !docTable.querySelectorAll("t#dist_").length
	    ) {
		$(arr[i].children)
		.css("background","rgba(73,171,129,0.25)");
	      }

	  }
*/
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

        $("td#n").each(function() {
	  let color = $(this.parentNode.children[0])
	    .css("background-color");
/*petición Mendoza*/
//	  $(this).css("background",color);
        });

  } else { console.log("no hay tabla"); }
    };

    function mensajeEspera() {
      $("div#espere").css("visibility","visible")
      window.setTimeout(function() {
	nuevaTabla(algo,function() {
	  $("div#espere").css("visibility","hidden");
	// Quitar espacio blanco de 1ra,2da y 3ra celda.
	  $("tbody.hide>tr:nth-child(2)>td:first-child")
		.css("height","16px");

	  $("tbody.hide>tr:nth-child(2)>td:nth-child(2)")
		.css("height","16px");

	  $("tbody.hide>tr:nth-child(2)>td:nth-child(3)")
		.css("height","16px");


///// FORZAR TAMAÑOS DE HEADER OCURRENTE CROSS-BROWSER ////////////////////////
	  var cellHide = $("div.overflow>table>tbody.hide>tr:nth-child(2)>td:nth-child(4)")
	  var cellHead = $(".scroll_aid_header>th:nth-child(n+2)");
//  console.log("Tamaño de celda en head:",cellHead.css("width"))

	  var CellOffsetWidth = cellHide[0].offsetWidth//.css("width"); 
	  var jqueryWidth = "75px";//cellHide.css("width"); 

//  console.log("Tamaño de celda 'offset':",CellOffsetWidth);
//  console.log("Tamaño de celda 'jQuery':",jqueryWidth);

	  cellHead.css("max-width",jqueryWidth) 
	  cellHead.css("width",jqueryWidth) 
	  cellHead.css("min-width",jqueryWidth) 


//  console.log("Tamaño después de cambio con jQuery:",cellHead.css("width"))

	  d3.selectAll(".scroll_aid_header>th:nth-child(n+2)")
	    .style("max-width",jqueryWidth)
	    .style("width",jqueryWidth)
	    .style("min-width",jqueryWidth)

//  console.log("Tamaño después de cambio con D3:",cellHead.css("width"))
	  var posHeader = document
		.querySelector(".scroll_aid_header>th:nth-child(2)")
		.getBoundingClientRect();

	  var posHide = cellHide[0].getBoundingClientRect();

	  $(".scroll_aid_header>th:first-child").css("padding","1px");
	  $(".scroll_aid_header>th:first-child").css("min-width","413px");
	  $("div.overflow tr>td").css("border-bottom","0px solid white");
	  $("div.overflow tr>td").css("border-top","1px solid lightGray");
//	  $("div.overflow tr>td:first-child").css("min-width","600px")

	  if(posHeader.left != posHide.left) {
	    console.log(posHide);
	    console.log(posHeader);

	    d3.select(".scroll_aid_header>th:first-child")
	      .style("min-width",posHeader.left+"px");    
	  }


///// FORZAR TAMAÑOS DE HEADER OCURRENTE CROSS-BROWSER ////////////////////////

/*-----------------Quitar scroller horizontal si no se necesita--------------*/
          
	 var tabla_overflow_X = $("div.overflow").filter(function() {
	    return $(this).css("display") == "block";
	 });

	 var row_length_ = tabla_overflow_X[0]
	  .querySelector("tr:first-child")
	  .getBoundingClientRect().right;

         if(row_length_ < window.innerWidth) {
	   tabla_overflow_X.css("overflow-x","hidden")
	 } else {
	   tabla_overflow_X.css("overflow-x","scroll")
	 }
/*-----------------Quitar scroller horizontal si no se necesita--------------*/

	});
      },10);
    }
    mensajeEspera();
 };

}



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
/*petición Mendoza*/
  $(this.parentNode.children).css("background",color);

  d3.selectAll("tbody[tag='" + grand_parent + "']>div>table>tbody[tag='" +
    parent+"'] th:nth-child("+ ix +")")
	/*petición Mendoza*/
	.style("background",color);

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
      if(this.parentNode.children[0].getAttribute("id") == "dist_") {
        $(this.parentNode.children)
/*petición Mendoza*/
	//.css("background",color_1);
      }
      if(this.parentNode.getAttribute("id") == "dist") {
        $(this.parentNode.children).css("background",color_1);
      }

    } else {
      $(this.parentNode.children[0]).css("background",color_tag_)
    }

    var firstC = $(this.parentNode.children[0]).css("background-color");

    if($(this.parentNode).attr("even") == 1) {
      $(this.parentNode.children)
//        .css("background-color",firstC);

    }

  });

  if(tag) {
//    if(tag == "campos") d3.selectAll("#dist").attr("id",null); // <-- ¿?
  }

  var table_bottom = $(".overflow:visible")[0]
    .getBoundingClientRect().bottom;

  var tabla_overflow_X = $("div.overflow").filter(function() {
     return $(this).css("display") == "block";
  });

  var row_length_ = tabla_overflow_X[0]
     .querySelector("tr:first-child")
     .getBoundingClientRect().right;

  if(row_length_ > window.innerWidth) {
    tabla_overflow_X.css("overflow-x","hidden")

    if(table_bottom > window.innerHeight) {
      $("#footer").css("display","block");
    } else {
      $("#footer").css("display","none");
    }
  }


  var evenRows = document.querySelectorAll("div.overflow tr:nth-child(even)");
  evenRows = $(evenRows);

  evenRows.each(function() {
    let color = $(this).css("background-color");
    if(this.children[0].getAttribute("id") == "dist_") {
      $(this).attr("color_tag", "rgba(73,171,129,0.25)");
      $(this.children[0])
	/*petición Mendoza*/
	//.css("background","rgba(73,171,129,0.25)");
    } else {
      if($(this).attr("id") != "dist") {
        $(this).attr("color_tag",color);
        $(this.children[0]).css("background",color)
      } else {
        $(this).attr("color_tag", "rgba(73,171,129,0.25)");
        $(this.children[0])
	/*Petición Mendoza*/
	//.css("background","rgba(73,171,129,0.25)");
      }

    }

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
    "tbody.hide[tag='"+ this_tag +"']>tr>td:first-child"//:not(#dist_)";
  var cubo_th = "tbody.hide[tag='"+ parent_tag +"']>div>table>"+
    "tbody.hide[tag='"+ this_tag +"']>tr>th:first-child";
  var cubo_dist_ = "tbody.hide[tag='"+ parent_tag +"']>div>table>"+
    "tbody.hide[tag='"+ this_tag +"']>tr>td:first-child#dist_";
  

  $("<td id='p'><input id='principal' style='display:none;' type='checkbox'></input></td>")
    .insertAfter(cubo_th);
  $("<td id='p'></td>")
    .insertAfter(cubo_th);

  $("<td id='n' class='check'><input type='checkbox' style='margin:0px;'></input></td>")
    .insertAfter(cubo_td);
  $("<td id='n' class='graph'><img style='z-index:-1' src='img/graph.svg'></img></td>")
    .insertAfter(cubo_td);

  $("<td id='n' class='check'></td>")
    .insertAfter(cubo_dist_);
  $("<td id='n' class='graph'></td>")
    .insertAfter(cubo_dist_);

};
}
};
//////////////////////////////////////////////////////////////////////////////
////////////////////^^ HABILITAR ÍCONOS POR TABLA^^//////////////////////////
////////////////////////////////////////////////////////////////////////////

function seleccionarCheckboxes() {
$("input#principal").on("click",function() {
//var grandparent_tbody = this.parentNode.parentNode.parentNode
  //.parentNode.parentNode
  //.getAttribute("tag");

//var parent_tbody = this.parentNode.parentNode.parentNode
  //.getAttribute("tag");

// var child_boxes_str = "tbody[tag='"+ grandparent_tbody +
//"']>div>table>tbody[tag='"+ parent_tbody +"']>tr>td>input";
var child_boxes_str = "input[type='checkbox']:not(#principal)";
$(child_boxes_str).prop("checked",$(this).prop("checked"));
//	d3.selectAll(child_boxes_str).attr("checked","checked");
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

var first_cell = cells[0].innerHTML.replace(/\s&....;/g,"");
first_cell = first_cell.replace(/&[a-z;\s]*/g,"");
first_cell = first_cell.replace(/^\s/g,"");
//      first_cell = first_cell.replace(/ /g,"");

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
//        $(this).css("background",temas_fondo);
});
};


// ---------CALCULAR TAMAÑO DE CELDAS PARA EL ENCABEZADO-SCROLLER ----
function headerScroll() {
var first_th = $("tbody.hide")[0].querySelectorAll("th")[1];
if(first_th) {
var cell_Width = first_th.offsetWidth - 1;	
//      var cell_Width = $(first_th).css("width").split("px")[0];
//console.log(cell_Width);
var scroll_id_header = fechas_().replace(/-/g," ").split(",")
.map(function(d) { return "<th style='width:"+ cell_Width +
"px;min-width:"+ cell_Width +"px;max-width:"+cell_Width+"px'>" + d + "</th>"; });

var scroll_id_header_ = ["<th style='min-width:413px;padding:1px;'></th>"]
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


function RenderWords(obj,lang,temas) {
var titles = obj.A[lang].filtros.titles;
var months = obj.A[lang].filtros.months;
var years = obj.A[lang].filtros.years;
var options = obj.A[lang].filtros.options;

d3.select("select.filtros").selectAll("option")
.data(temas).enter()
.append("option")
.attr("tag",function(d) { return d['json_arg']; })
.html(function(d) { return d.tema; });

// Colocar cada uno de los títulos en su respectivo lugar.
for( var k in titles ) {
var selector = "#" + k + "_text";
$(selector).text(titles[k]);
}

// Colocar los nombres de reporte en el apartado de "Temas".
var temas = options.map(function(d) {
return "<option>" + d.tema + "</option>";
}).join("");

//  $("div#tema_options select").text("");
//  $("div#tema_options select").append(temas);

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

var start_year = document.getElementById("start_year").children;
start_year = Array.prototype.slice.call(start_year).map(function(d) {
  return d.textContent;
});

var start_month = document.getElementById("start_month").children;
start_month = Array.prototype.slice.call(start_month).map(function(d) {
  return d.textContent;
});


function addMonths(date, months) {
  date.setMonth(date.getMonth() + months);
  var month = String(date.getMonth() + 1);
  if( month.length == 1 ) month = "0" + month;
  var year = String(date.getFullYear());
  return [month,year];
};

var dateBefore = addMonths(new Date(),-11);
var dateNow = addMonths(new Date(),0);

var s_Year = start_year.indexOf(dateBefore[1]);
var e_Year = start_year.indexOf(dateNow[1]);
var s_Month = start_month.indexOf(dateBefore[0]);
var e_Month = start_month.indexOf(dateNow[0]);

document.getElementById("start_year").selectedIndex = s_Year;
document.getElementById("end_year").selectedIndex = e_Year;
document.getElementById("start_month").selectedIndex = s_Month;
document.getElementById("end_month").selectedIndex = e_Month;


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

function resizeHighchart(exp_size,activ) {
  var w_, l_;
//    var activ = $("button.datos_grapher").attr("tag")

  if(activ == 'off') {
    w_ = "calc(80% - " + exp_size + ")";
    l_ = "calc(10% + " + exp_size + ")";
  } else if(activ == 'on') {
    w_ = "80%";
    l_ = "10%";
  }

  var chart_container = "#grapher>div#chart";

  $(chart_container).css("width",w_);
  $(chart_container).css("left",l_);

  var chart = $(chart_container).highcharts();
  var new_width = $(chart_container).css("width").split("px")[0];
  var new_height = $(chart_container).css("height").split("px")[0];

    chart.setSize(+new_width,+new_height)
}

window.onresize = function() {
  var tag_boton = $("button.datos_grapher").attr("tag");
  var new_tag_boton = tag_boton == 'off' ? 'on' : 'off';

  try {
    resizeHighchart("200px",new_tag_boton);
  } catch(err) {
    console.log(err);
  }


/*-------Mostrar y ocultar el scroller-x bajo demanda------------------------*/
  try {
	 var tabla_overflow_X = $("div.overflow").filter(function() {
	    return $(this).css("display") == "block";
	 });

	 var row_length_ = tabla_overflow_X[0]
	  .querySelector("tr:first-child")
	  .getBoundingClientRect().right;

         if(row_length_ < window.innerWidth) {
	   $("#footer").css("display","none");
	   tabla_overflow_X.css("overflow-x","hidden");
	 } else {
	     tabla_overflow_X.css("overflow-x","scroll");
	     var lastRow = computeLastRow()[1]
	     if(lastRow >= window.innerHeight) {
	       $("#footer").css("display","block");
	     }
	 }
  } catch(err) {
     console.log(err);
  }
/*-------Mostrar y ocultar el scroller-x bajo demanda------------------------*/
}

function descargarSerie() {
  var titulo = document.querySelector('.chart_expandible').getAttribute("tag");

  titulo = titulo.toUpperCase();
  titulo = titulo.replace(/Á/g,"A");
  titulo = titulo.replace(/É/g,"E");
  titulo = titulo.replace(/Í/g,"I");
  titulo = titulo.replace(/Ó/g,"O");
  titulo = titulo.replace(/Ú/g,"U");

  var fecha = new Date();
  var Header = [
   titulo,
   "COMISION NACIONAL DE HIDROCARBUROS",
   "Fecha de descarga: " + fecha.toLocaleString('es-MX').replace(", "," - "),
   "\n",
  ];

  Header = Header.join("\n")

  var csv = [];
  csv.push(Header);
  csv.push("FECHA,DATO")
  var filas = document.querySelectorAll("div#tabla_expandible>table>tr");

  for(var i in filas) {
    var rows = []
    if(filas[i].nodeName == "TR") {
      var cells = filas[i].querySelectorAll("td")
      for(var j in cells) {
	if(cells[j].nodeName == "TD") {
	  var row = cells[j].textContent;
	  rows.push(row);
	}
      }
      rows = rows.join(",")
      csv.push(rows);
    }
  }
  csv = csv.join("\n");
  csv = csv.replace(/NaN/g,"");

  var csvFile = new Blob(["\ufeff",csv], { 'type':'text/csv' });

  if(window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(csvFile,"info.csv");
  } else {
    var downloadLink = document.createElement("a");
    downloadLink.download = "serie.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    var s_a = document.getElementsByTagName("a");
    for(var i=0; i<s_a.length; i++) {
      s_a[i].parentNode.removeChild(s_a[i]);
    }
  }

}

function parametros() {
  var params = {};
  params['period'] = $('input[name=periodicidad]:checked').val();

  if(params["period"] == "monthly") {
    params['start_month'] = $("select#start_month").find(":selected").text();
    params['end_month'] = $("select#end_month").find(":selected").text();
  } else {
    params['start_month'] = '01';
    params['end_month'] = '12';
  }

  params['topic'] = $("select.filtros").find(":selected").attr("tag");
  params['start_year'] = $("select#start_year").find(":selected").text();
  params['end_year'] = $("select#end_year").find(":selected").text();

  params['title'] = '';
  params['subtitle'] = '';
  return params;
};

function ajaxFunction(data,Cubos,filtrarSeries,special_params) {
  var consulta;
     var key_ = Object.keys(data[0][1])[0];
     var tableString = data[0][1];
     data = formatoData(data);
     Cubos(data);
console.log(caso_especial);
//try {

  if(special_params) {
    if($("tbody[tag='"+special_params.title+"']")[0]) {
      consulta = $("tbody[tag='" + special_params.title + "'].hide")[0]
	.querySelector("div[tag='" + special_params.subtitle + "']");
    } else {

    consulta = $($("tbody#tabla>tbody.hide")[0]
         .querySelectorAll("div.labels:nth-child(1)"));
    }

  } else {
    consulta = $($("tbody#tabla>tbody.hide")[0]
         .querySelectorAll("div.labels:nth-child(1)"));
  }

     $("tbody#tabla>tbody.labels").click();

     if(tableString[key_]) {
       caso_especial = false;

       consulta.click();
     } else {
	caso_especial = true;
	console.log("caso especial");
	$("tbody.hide>div.labels").attr("especial","1");
	console.log("Hacer clic en el primero durante el caso especial",caso_especial);

          $(window).scrollTop(
            $(consulta).offset().top - 180
          );
	  consulta.click();
     }
     filtrarSeries(data);
     $("div#espere").css("visibility","hidden");
  
};

function formatoData(data) {
 for(var i in data) {
  for(var j in data[i]) {
    if(typeof(data[i][j]) == "object") {
      data[i][j][Object.keys(data[i][j])[0]] =
        data[i][j][Object.keys(data[i][j])[0]]
	.replace(/(\d)-(\d)/g,"$1 $2")

      data[i][j][Object.keys(data[i][j])[0]] =
        data[i][j][Object.keys(data[i][j])[0]]
	.replace(/#/g,"&ensp;&nbsp;")

      data[i][j][Object.keys(data[i][j])[0]] =
        data[i][j][Object.keys(data[i][j])[0]]
	.replace(/\<tr(\>\n.*)\(/g,'<tr id="dist"$1(')

      data[i][j][Object.keys(data[i][j])[0]] =
        data[i][j][Object.keys(data[i][j])[0]]
//	.replace(/\<td(\>.*(?![AR])[A-Z]{2,}(?![MMpcd]))/g,'<td id="dist_"$1')

      data[i][j][Object.keys(data[i][j])[0]] =
        data[i][j][Object.keys(data[i][j])[0]]
	.replace(/Categor¡a/g,'')

    }
  }
 }
 return data;
};

