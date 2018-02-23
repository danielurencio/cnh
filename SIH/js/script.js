var ambiente = 'producciónn';
var HOSTNAME = ambiente == 'producción' ? '' : 'http://172.16.24.57';
var asyncAJAX = false;
var data_BUSCAR;
var cambio_ = false;
var current_TXT;
var siFiltro = false;
var TEMAS;
var NOTAS;
var noOfRows;
var ScrollHeader;
var SS_ = true;
var _parametros_;
var params_especiales = null;
var caso_especial = false;
var init_year;
var _azul_ = "rgb(13,180,190)";
var threshold = 500000;
var noHayTabla = false;
var FILE_NAME;


$(document).ready(function() {

  var worker = new Worker('js/worker.js');

		    worker.onmessage = function(e) {
		      var _data = JSON.parse(e.data)
		      filtrarSeries(null,_data);
		    };

  $("#datepicker_start").datepicker({inline:true, dateFormat:'yy-mm-dd'});
  $("#datepicker_end").datepicker({inline:true, dateFormat:'yy-mm-dd'});


  $(document).keypress(
    function(event){
     if (event.which == '13') {
        event.preventDefault();
      }
  });

  $(document).keyup(function(event) {
    if(event.which === 32) {
  	event.preventDefault();
    }
  });

    document.body.style.zoom = 1.0;
    ScrollHeader = $('div.scroll_header')[0].getBoundingClientRect().bottom;
    ///////////////prevenir zoom//////////////////////////////////////////////////
    function zoomShortcut(e) {
        if (e.ctrlKey) { //[ctrl] está presionado?
            event.preventDefault(); // prevenir zoom
            if (e.deltaY < 0) { // scrolling up?
                return false; // hacer nada
            }
            if (e.deltaY > 0) { //scrolling down?
                return false;
            }
        }
    };

    document.body.addEventListener("wheel", zoomShortcut); //add the event

/*---Deshabilitar temporalmente el botón de Consultar para no repetir AJAX---*/
		  $("div.d>div").append("<div style='width:90px; height:33px; background-color:rgba(0,0,0,0);position:relative;bottom:5px;border-radius:3px;'id='divDefense'></div>");

		  $("div#tema_options").append("<div style='width:" + $('div#tema_options').css('width') + ";height:22px;background-color:transparent;position:relative;bottom:22px;' id='optionsDefense'></div>")
/*---Deshabilitar temporalmente el botón de Consultar para no repetir AJAX---*/

    ///////////////prevenir zoom//////////////////////////////////////////////////

    //////////////Quitar filtro de búsqueda //////////////////////////
    $("div#quitarFiltro").on("click", function() {
        var tablaVisible = $("div.overflow").filter(function() {
            return $(this).css("display") == "block";
        });

        var inx = tablaVisible.index();
        var subtitulo_ = tablaVisible[0].parentNode.children[inx - 1];
        subtitulo_.click();
        //   $(this).css("display","none");
        //   subtitulo_.click();
    });
    //////////////Quitar filtro de búsqueda //////////////////////////


    function filtrarSeries(data, data_buscar) {

        var str_;

        function regexCheck(patt) {
            return patt.test(str_);
        };

        var color = _azul_;
        var color_ = _azul_;

//        var data_ = JSON.parse(JSON.stringify(data));
        var parser = new DOMParser();
        var arr = [];

        if(data_buscar) {
	  cosas(data_buscar);
        } else {
	  data_BUSCAR = true;
	  if(asyncAJAX) { asyncAJAX.abort(); }
	  asyncAJAX = $.ajax({
	    url:HOSTNAME + "/cubos_buscar.py",
            type:"post",
	    datatype:"json",
            data: parametros(),
	    success: function(data_buscar_) {
		data_buscar_ = JSON.parse(data_buscar_);
                cosas(data_buscar_);
		data_BUSCAR = false;
		asyncAJAX = false;
		if(document.querySelector("div#dropDown>div")) {
		  $("div#dropDown>div").remove();
		  d3.select("input#filtroSerie").dispatch("input");
		}
	    }			      
	  });


        }
//       cosas();
       function cosas(data_buscar_) {
/*
        for (var i in data_) {
            for (var j in data_[i]) {
                if (typeof(data_[i][j]) == 'object') {
                    let key = Object.keys(data_[i][j])[0];
                    data_[i][j][key] = data_[i][j][key].replace(/&....;/g, "");
                    var tabla = parser.parseFromString(data_[i][j][key], "text/html");
                    var rows = tabla.querySelectorAll("tr>td:first-child");
                    rows = Array.prototype.slice.call(rows);
                    rows = rows.map(function(d) {
                        return d.textContent;
                    });
                    rows.forEach(function(d) {
                        arr.push([data_[i][0], key, d].join(" > "));
                    });
                }
            }
        };
*/

	if(typeof(data_buscar) == 'string') var data_buscar_ = JSON.parse(data_buscar_);

        var data_buscar_ = data_buscar_.map(function(d) {
            return d.join(" > ");
        });

/*	
        var data_buscar_ = _.map(data_buscar_,function(d) {
	  var str = '';
	  for(var i in d) {
	    if( i < d.length - 1 ) {
		str += d[i] + " > ";
	    } else {
		str += d[i]
	    }
	  }

	  return str;//d.join(" > ");
        });
*/

        d3.select("input#filtroSerie").on("input", function(d) {

	  if(!data_BUSCAR) { // <-- Si no está corriendo 'cubos_buscar.py' ..
            var matches = [];
            var text = document.getElementById("filtroSerie").value
                .replace(/[(]/g, "\\(")
                .replace(/[)]/g, "\\)")
                .split(" ");

            if (text.length > 0) {
                var patts = []
                var patt = new RegExp(text, "i");

                text.forEach(function(d) {
                    var rx = new RegExp(d, "i");
                    patts.push(rx);
                });


                matches = data_buscar_ /*arr*/ .filter(function(d) {
                    str_ = d;
                    return patts.every(regexCheck);
                });

                matches = matches.map(function(d) {
                    return d.replace(/€/g, " <span id='aquo'>&rsaquo;</span> ");
                });


                matches = matches.map(function(d) {
                    var val = d;
                    var text_ = new RegExp(text.join("|"), "ig");
                    val = d.replace(text_, function(n) {
                        return "<span class='matching'>" + n + "</span>";
                    });

                    return val;
                });

                matches = matches.filter(function(d, i) {
                    return i < 50;
                });


                $("div#dropDown").css("display", "block");

                if (document.querySelector("div#dropDown>div")) {
                    d3.select("div#dropDown>div").remove();
                }

                if (matches.length > 0) {

                    var series = d3.select("div#dropDown")
                        .append("div")
                        .selectAll("li").data(matches).enter()
                        .append("div")
                        .html(function(d) {
                            var val = d;
                            return val;
                        });

                    series
                        .style("font-weight", "300")
                        .style("padding-left", "20px")
                        .style("cursor", "pointer")
                        .style("font-family", "Open Sans")
                        .on("mouseover", function() {
                            d3.select(this)
                                .style("color", "rgb(250,250,250)")
                                .style("font-weight", "400")
                                .style("background", color);

                            var matching_child = Array.prototype.slice.call(this.children);

                            matching_child = matching_child.filter(function(d) {
                                return d.getAttribute("class") == "matching";
                            });

                            $(matching_child)
                                .css("color", "white");
                        })
                        .on("mouseout", function() {
                            d3.select(this)
                                .style("color", "black")
                                .style("font-weight", "300")
                                .style("background", "");

                            var matching_child = Array.prototype.slice.call(this.children);

                            matching_child = matching_child.filter(function(d) {
                                return d.getAttribute("class") == "matching";
                            });

                            $(matching_child).css("color", "");

                        })
                        .on("click", function() {
                            var txt = this.textContent.split(" > ");
                            //console.log(caso_especial)
                            caso_especial ? siFiltro = true : siFiltro = false;
                            caso_especial ? current_TXT = txt : current_TXT = null;
                            irAserie(txt);
                            $("div#quitarFiltro").css("display", "block")
                        });

                } else if (matches.length == 0) {
                    d3.select("div#dropDown>div").remove();
                }

            } else {
                d3.selectAll("div#dropDown>div").remove();
                $("div#dropDown").css("display", "none");
            }

	    
          } else { // <--- Si el servicio 'cubos_buscar.py' está corriendo ..
	    if(!document.querySelector('div#dropDown>div')) {
                $("div#dropDown").css("display", "block");

                    var series = d3.select("div#dropDown")
                        .append("div")
                        .style("font-weight", "300")
			.style("height","100px")
                        .style("padding-left", "20px")
                        .style("font-family", "Open Sans")
			.style("text-align","center")
                        .html(function(d) {
                            var val = d;
                            return "<img id='loading' src='img/ss1.png' style='margin-top:20px;'></img>";
                        });
	    }

	  }

        });


        $("body *>*:not(div#dropDown)").on("click", function() {
            d3.selectAll("div#dropDown>div").remove();
            d3.selectAll("div#dropDown").style("display", "none");
            document.querySelector("input#filtroSerie").value = "";
        });

      };

    };


    function irAserie(txt, callback) {
        var titulo = txt[0];
        var titulo_label = $("tbody.labels[tag='" + titulo + "']");
        var titulo_hide = $("tbody.hide[tag='" + titulo + "']");


        if (titulo_hide.css("display") == "none") {
            titulo_label.click()
        }

        var subtitulo = txt[1];
        var subtitulo_label = $("tbody.hide[tag='" + titulo + "']>div.labels[tag='" +
            subtitulo + "']");
        var subtitulo_overflow = subtitulo_label.next();


        if (subtitulo_overflow.css("display") == "none") {
            /* Función anónima que (a) hace click en la tabla solicitada y, de manera
            'asíncrona', (b) obtiene la celda buscada para (c) alimentarla en una
            función que desplazará el viewport hasta encontrar la celda... */
            (function() {
                subtitulo_label.click(); // <-- (a)
                window.setTimeout(function() { /*------------------Async--*/
                    if (!siFiltro) {
                        var el_ = selected_TD(txt); // <-- (b)
                        if (el_) {
                            mostrar(el_[0]);
                        } else {
                            var sleep_ = setInterval(function() {
                                el_ = selected_TD(txt);
                                if (el_) {
                                    clearInterval(sleep_);
                                    mostrar(el_[0]);
                                }
                            }, 500);
                        }
                    } else {
                        //console.log("NO FILTRO");
                    }
                    $("#footer").css("display", "none");
                }, 10); /*-------------------Async--*/

            })();

        } else {
            var el_ = selected_TD(txt)[0]
            mostrar(el_);
        }

    };

    function mostrar(el) {
        SS_ = false;
        d3.selectAll("div.overflow tr").style("display", "none");
        $(document.querySelectorAll("div.overflow tr")[0]).css("display", "block");
        $(el.parentNode).css("display", "block");
        var pos = el.parentNode.parentNode.parentNode.parentNode.parentNode.offsetTop;
        //   window.scrollTo(0,pos-30)

        $(window).scrollTop(
            $(el).offset().top - 250
        );

    }

    ////////////////////////////////////////////////////////////////////////
    ///////// Búsqueda de celda específica a través del filtro...
    ////////////////////////////////////////////////////////////////////////
    function selected_TD(txt) {
        var titulo = txt[0];
        var subtitulo = txt[1];
        var subtitulo_label = $("tbody.hide[tag='" + titulo + "']>div.labels[tag='" +
            subtitulo + "']");
        var subtitulo_overflow = subtitulo_label.next();

        var tds = Array.prototype
            .slice.call(subtitulo_overflow[0]
                .querySelectorAll("tr>td:first-child"));

        var val;
        //    var tds = Array.prototype.slice
        //	.call(document.querySelectorAll("div.overflow td:first-child"));

        var prevTD = tds.filter(function(d) {
            return d.textContent.replace(/\s/g, "").toUpperCase() == txt[2].replace(/\s/g, "").toUpperCase();
        })[0];

        //    if(!tds.length) {

        //    } else {

        var c = tds.indexOf(prevTD) + 0;
        var tdFromList;
        var referenceTd = txt[3].replace(/\s/g, "").toUpperCase();
        var condTD;

        for (c; c < tds.length; c++) {
            tdFromList = tds[c].textContent.replace(/\s/g, "").toUpperCase();
            condTD = tdFromList == referenceTd;

            if (condTD) {
                break;
            }
        };

        val = [tds[c]];

        //    }
        return val;
    }


    /////////////////////////////////////////////////////////////////////////////
    //                          |                                              //
    // Todo ocurre aquí.------- V                                              //
    //                                                                         //
    /////////////////////////////////////////////////////////////////////////////

    $.ajax({
        url: HOSTNAME + "/cubos_temas.py",
        dataType: 'json',
        data: {
            'section': 'PRODUCCION'
        },
        success: function(temas) {
            TEMAS = JSON.parse(temas);

            d3.json("blueprints.json", function(response) {

response.A.esp.filtros.years[1] = new Date().getFullYear();//2018  // <----
                RenderWords(response, "esp", TEMAS);

		mapaDeSeries(TEMAS);

                $("button#consultar").on("click", function() {

//////////////////////////////////////////////////////////////////////////////////
/*Si el usuario quiere cambiar de tema, la lámina de espera se tiene que resetear*/
//////////////////////////////////////////////////////////////////////////////////
			d3.select("#loading").style("height","60px");

			d3.select("div.espere")
			.style("width","30%")
			.style("height","30%");


			d3.select("div.espere")
			.style("top","35%")
			.style("left","35%");


			d3.select("div.content")
			 .style("width","200px")
			 .style("margin","0 auto")
			 .style("padding-bottom","0%")
			 .style("font-size","15px");

			d3.select("div.content>p")
			 .style("color","black")

			d3.select("div.content>p")
			  .html("Consultando información")
			  .style("color","black")

			$("div#descargaBotonesSiNo").remove();
			$("div#divDefense").remove()
		        $("div#optionsDefense").remove()
//////////////////////////////////////////////////////////////////////////////////
/*Si el usuario quiere cambiar de tema, la lámina de espera se tiene que resetear*/
//////////////////////////////////////////////////////////////////////////////////
/*---Deshabilitar temporalmente el botón de Consultar para no repetir AJAX---*/
		  $("div.d>div").append("<div style='width:90px; height:33px; background-color:rgba(0,0,0,0);position:relative;bottom:5px;border-radius:3px;'id='divDefense'></div>");

		  $("div#tema_options").append("<div style='width:" + $('div#tema_options').css('width') + ";height:22px;background-color:transparent;position:relative;bottom:22px;' id='optionsDefense'></div>");
/*---Deshabilitar temporalmente el botón de Consultar para no repetir AJAX---*/
                    _parametros_ = parametros();

		    var fecha_VALIDA_1, fecha_VALIDA_2;

		    if(_parametros_["period"] != "daily") {
                      fecha_VALIDA_1 = +_parametros_['start_year'] <= +_parametros_['end_year']
                      fecha_VALIDA_2 = +_parametros_['start_year'] == +_parametros_['end_year'] &&
                        +_parametros_['end_month'] < +_parametros_['start_month'];
		    } else {
		      var d_cond_1 = +_parametros_["start_year"] < +_parametros_["end_year"];
		      var d_cond_2 = +_parametros_["start_year"] == +_parametros_["end_year"] &&
			  +_parametros_["end_month"] > +_parametros_["start_month"]
		      var d_cond_3 = +_parametros_["start_year"] == +_parametros_["end_year"] &&
			  +_parametros_["end_month"] == +_parametros_["start_month"] &&
			  +_parametros_["start_day"] <= +_parametros_["end_day"];

		      fecha_VALIDA_1 = d_cond_1 || d_cond_2 || d_cond_3;
		      console.log(d_cond_1,d_cond_2,d_cond_3); 
		    }


                    if (fecha_VALIDA_1 && !fecha_VALIDA_2) {
                        boton_consulta
			    .attr("class","consulta_normal")
                            .css("font-weight", "600");

                        $("div#espere").css("visibility", "visible");
                        /*    Está sección esconde el header ocurrente cuando uno cambia de tema  */
                        $("tr.scroll_aid_header").attr("visible", "no");
                        $("tr.scroll_aid_header>th").css("color", "white");
                        $("tr.scroll_aid_header>th:not(:first-child)")
                            .css("border", "1px solid white")
                        /*    Está sección esconde el header ocurrente cuando uno cambia de tema  */

                        var tag = $(this).find(":selected").attr("tag");
	if(cambio_) {
                        $("tbody#tabla").html("");
        }
                        var loading_text = "<div style='font-weight:800;position:absolute;top:50%;left:calc(50% - 75.7px);'class='wait'><span>Cargando información ...</span></div>";


                        var params = parametros();

/*------------------AJAX con botón de consultar-------------------------------*/    
	    if(cambio_) {
		      cambio_ = false;

/*-------------------------------Webworker para paralelizar AJAX-----------------------------------------------------*/

		      var worker_tools = { 'params':params,'url':HOSTNAME + '/cubos_buscar.py' };
		      worker.postMessage(worker_tools);

/*-------------------------------Webworker para paralelizar AJAX-----------------------------------------------------*/

                        
                        $.ajax({
                            url: HOSTNAME + "/cubos_cuadros.py",
                            type: "post",
                            datatype: "json",
                            data: params,
                            success: function(data) {

			      var ifEmpty = checkIfEmpty(data);
/*=================Chechar si las tablas están vacías========================*/
			      if(!ifEmpty) {
                                ajaxFunction(data, Cubos, filtrarSeries, params_especiales, null);

/*
				$.ajax({
				  url:HOSTNAME + "/cubos_buscar.py",
				  type:"post",
				  datatype:"json",
				  data:params,
				  success: function(data_buscar) {
				    data_buscar = JSON.parse(data_buscar);
				    var data_buscar;
                                    ajaxFunction(data, Cubos, filtrarSeries,     //|
						params_especiales, data_buscar); //| ¡"AjaxFunction" & "FiltrarSeries" van juntas!

//				    filtrarSeries(data,data_buscar);		 //|

				  }			      
				});
*/
			      } else {
				data_buscar = null;						       //|
				ajaxFunction(data,Cubos,filtrarSeries,params_especiales, data_buscar); //| ¡"AjaxFunction" & "FiltrarSeries" van juntas!
				filtrarSeries(data,data_buscar);				       //|
			      }
/*=================Chechar si las tablas están vacías========================*/

                            }
                        });

	    } else {

	     $("div#espere").css("visibility","hidden");
	     $("div#divDefense").remove();
	     $("div#optionsDefense").remove();
	     cambio_=false;
	    }
/*------------------AJAX con botón de consultar-------------------------------*/
                    } else if (!fecha_VALIDA_1) {
                        alert("Seleccione una fecha válida.");
    			$("div#divDefense").remove();
		        $("div#optionsDefense").remove();
                    } else if (fecha_VALIDA_2) {
                        alert("Seleccione una fecha válida.");
    			$("div#divDefense").remove();
		        $("div#optionsDefense").remove();
                    }

/*
		    if (_parametros_['period'] == 'daily' ) {
			var date_start = $('#datepicker_start').val();
			var date_end = $('#datepicker_start').val();

			if( !date_start || !date_end ) {
			  alert("Seleccione una fecha válida.");
    			  $("div#divDefense").remove();
		          $("div#optionsDefense").remove();

			}
		    }
*/
                });


// ======================= CAMBIO POR SECCIÓN ========================================
		$("select.filtros_").change(function() {

                      var sel_ = $("select.filtros_").find(":selected").attr("tag");
		      var temas_seccion = TEMAS.filter(function(d) {
			return d.seccion == sel_;
		      });

		      d3.select("select.filtros").html("");

		      d3.select("select.filtros").selectAll("option")
			.data(temas_seccion).enter()
			.append("option")
			.attr("tag",function(d) {
			    return d.json_arg;
			})
			.html(function(d) {
			    return d.tema;
			});

		    $("select.filtros").find(":selected").trigger("change");
		    
		    var tema_seleccionado = $("select.filtros").find(":selected").attr("tag");

		    var temaSeleccionado_ = temas_seccion.filter(function(d) { return d.json_arg == tema_seleccionado; })[0];
		    var periodicidad = JSON.parse(temaSeleccionado_.periodicidad);
/*
		    d3.select("select#periodicidad").html("")


		    var periodicidad_ = [];
		    for(var k in periodicidad) {
			var pair = [k,periodicidad[k]];
			periodicidad_.push(pair);
		    }

		    d3.select("select#periodicidad").selectAll("options")
			.data(periodicidad_).enter()
			.append("option")
			.attr("tag",function(d) { return d[1]; })
			.html(function(d) { return d[0]; });
*/

/*------ vv Habilitar modo de seleccionar periodicidad según lo que esté seleccionado vv ---------*/
		    periodForm(periodicidad);
/*------ ^^ Habilitar modo de seleccionar periodicidad según lo que esté seleccionado ^^ ---------*/
		});
// ===================================================================================

                $("select.filtros").change(function() {//<--CAMBIO DE TEMA..

/////////////////////////////////////////////////////////////////////////////
/*Si el usuario quiere cambiar de tema, la lámina de espera se tiene que resetear*/
/////////////////////////////////////////////////////////////////////////////
			d3.select("#loading").style("height","60px");

			d3.select("div.espere")
			.style("width","30%")
			.style("height","30%");


			d3.select("div.espere")
			.style("top","35%")
			.style("left","35%");


			d3.select("div.content")
			 .style("width","200px")
			 .style("margin","0 auto")
			 .style("padding-bottom","0%")
			 .style("font-size","15px");

			d3.select("div.content>p")
			 .style("color","black")

			d3.select("div.content>p")
			  .html("Consultando información")
			  .style("color","black")

			$("div#descargaBotonesSiNo").remove();
			$("div#divDefense").remove()
		        $("div#optionsDefense").remove()
//////////////////////////////////////////////////////////////////////////////////
/*Si el usuario quiere cambiar de tema, la lámina de espera se tiene que resetear*/
//////////////////////////////////////////////////////////////////////////////////

/*---Deshabilitar temporalmente el botón de Consultar para no repetir AJAX---*/
		   $("div.d>div").append("<div style='width:90px; height:33px; background-color:rgba(0,0,0,0);position:relative;bottom:5px;border-radius:3px;' id='divDefense'></div>")

		  $("div#tema_options").append("<div style='width:" + $('div#tema_options').css('width') + ";height:22px;background-color:transparent;position:relative;bottom:22px;' id='optionsDefense'></div>")
/*---Deshabilitar temporalmente el botón de Consultar para no repetir AJAX---*/

                    $("div#quitarFiltro").css("display", "none");
                    noHayTabla = false;
                    $("div#mainTitle").html("");
                    $("div#metodos").html("");
/*--------------------Resetear último rango de fecha válido-----------------*/
                    $("input[type=radio][value=monthly]").click()
                    var sel_ = $("select.filtros").find(":selected").attr("tag");

                    var filtroXcambio_ = TEMAS.filter(function(d) {
                        return d.json_arg == sel_;
                    })//[0].tema;



		    var _periodicidad = JSON.parse(filtroXcambio_[0].periodicidad);

		    d3.select("select#periodicidad").html("")

		    var periodicidad_ = [];
		    for(var k in _periodicidad) {
			var pair = [k,_periodicidad[k]];
			periodicidad_.push(pair);
		    }


		    d3.select("select#periodicidad").selectAll("options")
			.data(periodicidad_).enter()
			.append("option")
			.attr("tag",function(d) { return d[1]; })
			.html(function(d) { return d[0]; });


/*------ vv Habilitar modo de seleccionar periodicidad según lo que esté seleccionado vv ---------*/
		    periodForm(_periodicidad);
/*------ ^^ Habilitar modo de seleccionar periodicidad según lo que esté seleccionado ^^ ---------*/

		    var title = filtroXcambio_[0].tema;;

                    $("div#mainTitle").html(title);

                    var title = TEMAS.filter(function(d) {
                        return d.json_arg == sel_;
                    })[0].titulo.toUpperCase();

                    $("div#mainTitle").html(title);

                    var sizE = $("div#mainTitle")[0]
				.getBoundingClientRect().right / 2;

                    var LEFT = (window.innerWidth / 2) - (sizE / 2);
                    //      $("div#mainTitle").css("left",LEFT + "px");


                    var init_year = TEMAS.filter(function(d) {
                        return d.json_arg == sel_;
                    })[0].init_year;


                    var current_year = filtroXcambio_[0].end_year ? +filtroXcambio_[0].end_year : Number(new Date().getFullYear());
                    var year_set = [];

                    for (var i = init_year; i <= current_year; i++) {
                        year_set.push(i);
                    }

                    $("select#start_year").html("");
                    $("select#end_year").html("");



/*
		    var temaSeleccionado_ = temas_seccion.filter(function(d) { return d.json_arg == tema_seleccionado; })[0];
		    var periodicidad = JSON.parse(temaSeleccionado_.periodicidad);

		    d3.select("select#periodicidad").html("")
		    console.log(parametros())

		    var periodicidad_ = [];
		    for(var k in periodicidad) {
			var pair = [k,periodicidad[k]];
			periodicidad_.push(pair);
		    }

		    d3.select("select#periodicidad").selectAll("options")
			.data(periodicidad_).enter()
			.append("option")
			.attr("tag",function(d) { return d[1]; })
			.html(function(d) { return d[0]; });
*/

                    d3.select("select#start_year")
                        .selectAll("option").data(year_set).enter()
                        .append("option")
                        .html(function(d) {
                            return d;
                        });

                    d3.select("select#end_year")
                        .selectAll("option").data(year_set).enter()
                        .append("option")
                        .html(function(d) {
                            return d;
                        });


                    var start_year = document.getElementById("start_year")
			.children;
                    start_year = Array.prototype.slice.call(start_year)
		      .map(function(d) {
                        return d.textContent;
                    });

                    var start_month = document.getElementById("start_month")
			.children;
                    start_month = Array.prototype.slice.call(start_month)
		     .map(function(d) {
                        return d.textContent;
                    });

                    function addMonths(date, months) {
                        date.setMonth(date.getMonth() + months);
                        var month = String(date.getMonth() + 1);
                        if (month.length == 1) month = "0" + month;
                        var year = String(date.getFullYear());
                        return [month, year];
                    };

                    var dateBefore = addMonths(new Date(), -12);
                    var dateNow = addMonths(new Date(), -1);

                    var s_Year = start_year.indexOf(dateBefore[1]);
                    var e_Year = start_year.indexOf(dateNow[1]);
                    var s_Month = start_month.indexOf(dateBefore[0]);
                    var e_Month = start_month.indexOf(dateNow[0]);

                    document.getElementById("start_year").selectedIndex = s_Year;
                    document.getElementById("end_year").selectedIndex = e_Year;
                    document.getElementById("start_month").selectedIndex = s_Month;
                    document.getElementById("end_month").selectedIndex = e_Month;

                    /*--------------------Resetear último rango de fecha válido-----------------*/

                    _parametros_ = parametros();

                    boton_consulta
			.attr("class","consulta_normal")
                        .css("font-weight", "600");

                    $("div#espere").css("visibility", "visible");
                    /*    Está sección esconde el header ocurrente cuando uno cambia de tema  */
                    $("tr.scroll_aid_header").attr("visible", "no");
                    $("tr.scroll_aid_header>th").css("color", "white");
                    $("tr.scroll_aid_header>th:not(:first-child)")
                        .css("border", "1px solid white")
                    /*    Está sección esconde el header ocurrente cuando uno cambia de tema  */

                    var tag = $(this).find(":selected").attr("tag");
                    $("tbody#tabla").html("");
                    var loading_text = "<div style='font-weight:800;position:absolute;top:50%;left:calc(50% - 75.7px);'class='wait'><span>Cargando información ...</span></div>";

//////////////////////////////////////////////////////////////////////////////
/////////////////// AJAX - CONSULTA AL CAMBIAR DE TEMA - /////////////////////
//////////////////////////////////////////////////////////////////////////////
                    var params = parametros();

/*-------------------------------Webworker para paralelizar AJAX-----------------------------------------------------*/

		    var worker_tools = { 'params':params,'url':HOSTNAME + '/cubos_buscar.py' };
		    worker.postMessage(worker_tools);

/*-------------------------------Webworker para paralelizar AJAX-----------------------------------------------------*/


//if(!cambio_) {
                    $.ajax({
                        url: HOSTNAME + "/cubos_cuadros.py",
                        type: "post",
                        datatype: "json",
                        data: params,
                        success: function(data) {
			  var ifEmpty = checkIfEmpty(data);
/*=================Checar si las tablas están vacías========================*/
			  if(!ifEmpty) {
                            ajaxFunction(data, Cubos, filtrarSeries, null, null); //| ¡"AjaxFunction" & "FiltrarSeries"
                            leyendaNotas(TEMAS, params);

/*
                            $.ajax({
                                url: HOSTNAME + "/cubos_buscar.py",
                                type: "post",
                                datatype: "json",
                                data: params,
                                success: function(data_buscar) {
                            	    data_buscar = JSON.parse(data_buscar);
//				    console.log(data_buscar)
                                    ajaxFunction(data, Cubos, filtrarSeries, null, data_buscar); //| ¡"AjaxFunction" & "FiltrarSeries"
//				    filtrarSeries(data,data_buscar);				 //|      van juntas!
                                    leyendaNotas(TEMAS, params);

//				    cambio_ = false;
                                }
                            });
*/

			  } else {
			    data_buscar = null;
			    ajaxFunction(data,Cubos,filtrarSeries,null,data_buscar); //| ¡"AjaxFunction" & "FiltrarSeries"
//			    filtrarSeries(data,data_buscar);			     //|        van juntas!
			    leyendaNotas(TEMAS,params)
			  }
/*=================Checar si las tablas están vacías========================*/
                        }
                    });
///////////////////////////////////////////////////////////////////////////////
//////////////////// AJAX - CONSULTA AL CAMBIAR DE TEMA - /////////////////////
///////////////////////////////////////////////////////////////////////////////

                }); // <------- CAMBIO DE TEMA...

		var periodo_selector = 'input[type=radio][name=periodicidad]';
//		var periodo_selector = 'select#periodicidad';

                $(periodo_selector).change(function() {

/*------ vv Habilitar modo de seleccionar periodicidad según lo que esté seleccionado vv ---------*/
		    periodForm();
/*------ ^^ Habilitar modo de seleccionar periodicidad según lo que esté seleccionado ^^ ---------*/
                });


                var boton_consulta = $("button#consultar");
                var selectors_ = ["select#start_year", "select#end_year", "select#start_month", "select#end_month", "input[type=radio][name=periodicidad]"/*"select#periodicidad"*/, "#datepicker_start", "#datepicker_end"];


                for (var j in selectors_) {
                    $(selectors_[j]).change(function() {

                        cambio_ = false;
                        var newParams = parametros();

                        for (var k in newParams) {
                            if (newParams[k] != _parametros_[k]) {
                                cambio_ = true;
                                break;
                            }
                        }

                        if (cambio_) {
                            boton_consulta
				.attr("class","consulta_anim")

                                .css("background-color", "rgb(13,180,190)")
                                .css("border", "2px solid white")
                                .css("border", "none")
                                .css("color", "white")
                                .css("border-radius", "3px")
                                .css("font-weight", "800");

                        } else {
                            boton_consulta
				.attr("class","consulta_normal")

//                                .css("background-color", "rgb(221,221,221)")
//                                .css("border", "2px outset rgb(221,221,221)")
//                                .css("color", "black")
//                                .css("border-radius", "0px")
                                .css("font-weight", "600");


                        }

                        var selCond = selectors_[j] == "select#start_year" ||
                            selectors_[j] == "select#end_year";

                    });

                };

//////////////////////////////////////////////////////////////////////////////
//////////////////// AJAX - tabla default - //////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
                var params = parametros();
                _parametros_ = parametros();


/*-------------------------------Webworker para paralelizar AJAX-----------------------------------------------------*/

		      var worker_tools = { 'params':params,'url':HOSTNAME + '/cubos_buscar.py' };
		      worker.postMessage(worker_tools);

/*-------------------------------Webworker para paralelizar AJAX-----------------------------------------------------*/

                $.ajax({
                    url: HOSTNAME + "/cubos_cuadros.py",
                    type: "get",
                    datatype: "json",
                    data: params,
                    success: function(data) {
			var ifEmpty = checkIfEmpty(data);
                        ajaxFunction(data, Cubos, filtrarSeries, null, null); //| ¡"AjaxFunction" & "filtrarSeries"
                        leyendaNotas(TEMAS, params);
			cambio_ = false;
/*	
                        $.ajax({
                            url: HOSTNAME + "/cubos_buscar.py",
                            type: "get",
                            datatype: "json",
                            data: params,
                            success: function(data_buscar) {
		console.log("AQUÍ!!!")
                        	data_buscar = JSON.parse(data_buscar);
                                ajaxFunction(data, Cubos, filtrarSeries, null, data_buscar); //| ¡"AjaxFunction" & "filtrarSeries"
				//filtrarSeries(data,data_buscar);			     //|    van juntas!
                                leyendaNotas(TEMAS, params);
				cambio_ = false;
                            }

                        });
*/
                    }

                });



                var sel_ = $("select.filtros").find(":selected").attr("tag");

                var title = TEMAS.filter(function(d) {
                    return d.json_arg == sel_;
                })[0].titulo.toUpperCase();

                $("div#mainTitle").html(title);
                var sizE = $("div#mainTitle")[0].getBoundingClientRect().right / 2;
                var LEFT = (window.innerWidth / 2) - (sizE / 2);
                //      $("div#mainTitle").css("left",LEFT + "px");

                ///////////////////////////////////////////////////////////////////////////////
                //////////////////// AJAX - tabla default - ///////////////////////////////////
                ///////////////////////////////////////////////////////////////////////////////


                $("span.lang").on("click", function() {
                    RenderWords(response, this.id);
                });

                d3.selectAll("button#selection").on("click", function() {
                    var series = obtener_series();
                    //console.log("algo..");
                    //console.log(series);

                    if (series && series.length == 0) {
                        alert("Seleccione alguna serie.");
                    } else {
                        if (series) descargar_selection(series);
                    }

                });

            });

        }

    }); // <-- PRIMER AJAX!


    function descargar() {
        var csv = [];
        var tbodys = document.querySelectorAll("tbody[download='1']");
        var fecha = new Date();
        var Header = [
            "COMISION NACIONAL DE HIDROCARBUROS",
            "PRODUCCION",
            "Fecha de descarga: " + fecha.toLocaleString('es-MX').replace(", ", " - "),
            "\n",
        ];

        csv.push(Header.join("\n"));

        for (var b = 0; b < tbodys.length; b++) {
            var rows = tbodys[b].querySelectorAll("tr");

            if (b == 0) {
                var headers = rows[0].querySelectorAll("th");
                var row_set = []
                for (var h = 0; h < headers.length; h++) {
                    row_set.push(headers[h].innerText);
                }
                csv.push(row_set.join(","));
            };

            csv.push("");
            var parent_ = tbodys[b].parentNode.getAttribute("tag");
            var current_ = tbodys[b].getAttribute("tag");
            csv.push(parent_ + "  -  " + current_ + ":");

            for (var r = 1; r < rows.length; r++) {
                var row_set = [];
                var cols = rows[r].querySelectorAll("td");

                for (var c = 0; c < cols.length; c++) {
                    row_set.push(cols[c].innerText);
                }

                csv.push(row_set.join(","));
            }
            csv.push("");
        }

	//console.log(parent_,current_)

        csv = csv.join("\n");
        var csvFile = new Blob(["\ufeff", csv], {
            'type': 'text/csv'
        });

        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(csvFile,"info.csv");
        } else {
            var downloadLink = document.createElement("a");
            downloadLink.download = "info.csv";
            downloadLink.href = window.URL.createObjectURL(csvFile);
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            $("a[download]").remove();
        }
    };



    function Cubos(data, tag) {
        ///////////ESTO EVITA BUGS CON EL SCROLLER DEL HEADER/////////////////////////
        $('.scroll_aid_header').attr("visible", "no");
        $(".scroll_header").scrollLeft(0);
        $("#footer_").scrollLeft(0);
        $("button#principal").attr("todos", "no");
        data = formatoData(data);
        /////////////////////////////////////////////////////////////////////////////
        var color = "rgba(13,180,190,0.25)"//"rgba(82,191,144,0.25)"//getComputedStyle(document.body).getPropertyValue('--filasYcols');
        var temas_fondo = "white"
        //getComputedStyle(document.body).getPropertyValue('--temas-fondo');

        var plus = "&plus;",
            minus = "&ndash;";

        d3.select("tbody#tabla").selectAll("tbody")
            .data(data).enter()
            .append("tbody")
            .style("width", "100%")
            .attr("class", "labels").style("display", "table")
            .attr("tag", function(d) {
                return d[0];
            })
            .each(function(d) {
                $("<tbody class='hide' tag='" + d[0] + "'></tbody>").insertAfter(this);
            });

        d3.selectAll("tbody#tabla > tbody")
            .each(function(d, i) {
                var selection = d3.select(this);
                selection.style("width", "100%");
                var id = selection.attr("tag");
                if (selection.attr("class") == "labels") {
                    var str = "" +
                        "<tr style='width:100%'>" +
                        "<td style='width:100%'>" +
                        "<label style='cursor:pointer;width:100%'>&nbsp;<span class='s' id='uno' style='font-weight:400;'>" + plus + "&ensp;</span>" + selection.attr("tag") + "</label>" +
                        "</td>" +
                        "</tr>" +
                        "";
                    selection.html(str);
                } else {
                    selection.style("display", "none")
                    var tag = selection.attr("tag");
                    var seg = data.filter(function(d) {
                        return d[0] == tag;
                    })[0];
                    var tablas = seg.filter(function(d) {
                        return typeof(d) == "object";
                    });

                    for (var j in tablas) {
                        var str = "" +
                            "<thead style='width:100%'>" +
                            "<div style='width:100%'>&nbsp;&nbsp;<label style='cursor:pointer;'>&ensp;<span id='dos' class='s' style='font-weight:400;'>" + plus + "&ensp;</span>&ensp;&ensp;" + Object.keys(tablas[j])[0] + "</label></div>" +
                            "</thead>";

                        var contenido_tabla; // <-- Solo pegar en DOM la primera tabla! 
                        contenido_tabla = "" //j == 0 && i == 1 ? tablas[j][Object.keys(tablas[j])[0]] +
                        //	  "<br>" : "";
                        selection.append("div")
                            .attr("class", "labels")
                            .attr("tag", Object.keys(tablas[j])[0])
                            .attr("id", "id_" + j)
                            .html(str);

                        selection.append("div")
                            .attr("class", "overflow")
                            .attr("tag", tag)
                            .style("display", "none")
                            .attr("on", "0")
                            .style("overflow-x", "scroll")
                            .append("table").style("table-layout", "fixed")
                            .append("tbody")
                            .attr("class", "hide")
                            .style("width", "100%")
                            .attr("tag", Object.keys(tablas[j])[0])
                            .attr("download", "1")
                            .attr("id", "id_" + j)
                            .html(contenido_tabla);

                    }

                }

            });

        ///////////////////////////////////////////////////////////////////////////
        /////////////////vv EXPANDIR PARA ESCRIBIR EN DOM vv//////////////////////
        /////////////////////////////////////////////////////////////////////////

        /*Un IF-STATEMENT podría diferenciar entre niveles*/
        $(".labels").on("click", function(d) {
            /*------Mostrar lámina de "espere" sólo para caso especial-------*/
            var isOpen = $(this).next().css("display") == "block" ? true : false;

            if (this.getAttribute("especial") && !isOpen) {
                $("div#espere").css("visibility", "visible");
            }
            /*------Mostrar lámina de "espere" sólo para caso especial-------*/

            SS_ = true;
            //    $("div#quitarFiltro").css("display","none");

            var tag = d3.select(this).attr("tag");
            var span = d3.select($(this).find("span.s")[0]);
            var selection = d3.select("[tag='" + tag + "'].hide")
            var selection = d3.select($(this).next()[0])
            if (selection.style("display") == 'block'
		&& this.nodeName == "TBODY") {
                selection
                    .style("display", "none");
                span.html(plus + "&ensp;");
            } else if (selection.style("display") != "block"
			&& this.nodeName == "TBODY") {
                selection.style("display", "block");
                span.html(minus + "&ensp;");
            }

/*-- Esto checa si está abierta la tabla para que, al cerrarla, no se vuelva a hacer un POST --*/
            var performAjax = $(this).next().css("display");
            performAjax = performAjax == "none" ? true : false;
/*-------------------------------------------------------------------------*/

            if (this.nodeName == "DIV" && $(this).attr("especial") == "1") {

                $("div#quitarFiltro").css("display", "none");
                //	$("div#espere").css("visibility","visible");
                var title = this.parentNode.getAttribute("tag");
                var subtitle = this.getAttribute("tag");

                params_especiales = {
                    'title': title,
                    'subtitle': subtitle
                };

                var params = parametros();
                params["title"] = title;
                params["subtitle"] = subtitle;
                var algo_ = this;
/*--- Si no está abierta la tabla hacer POST para obtener la tabla que se va a mostrar ---*/
                if (performAjax) {
//                    console.log("dentro de if(performAjax)..");
                    noHayTabla = true;

/*---Deshabilitar temporalmente el botón de Consultar para no repetir AJAX---*/
		   $("div.d>div").append("<div style='width:90px; height:33px; background-color:rgba(0,0,0,0);position:relative;bottom:5px;border-radius:3px;' id='divDefense'></div>");

		   $("div#tema_options").append("<div style='width:" + $('div#tema_options').css('width') + ";height:22px;background-color:transparent;position:relative;bottom:22px;' id='optionsDefense'></div>");
/*---Deshabilitar temporalmente el botón de Consultar para no repetir AJAX---*/

                    $("button#consultar")
		        .attr("class","consulta_normal")
                        .css("font-weight", "600");

                    if (params.start_year == params.end_year &&
                        params.start_month > params.end_month) {
                        var eMon = document.getElementById("end_month")
						.selectedIndex;
                        document.getElementById("start_month")
				.selectedIndex = eMon;

                        params = parametros();
                        params.title = title;
                        params.subtitle = subtitle;
                        //console.log("fixed?");
                    }

                    $.ajax({
                        url: HOSTNAME + "/cubos_cuadros.py",
                        dataType: 'json',
                        data: params,
                        success: function(tabla_respuesta) {

                            if (siFiltro) {
                                //console.log("siFiltro", siFiltro);
                                tabla_respuesta = formatoData(tabla_respuesta);
                                TableLogistics(algo_, tabla_respuesta);
                                siFiltro = false;
                            } else {

                                var sizeStr = JSON
						.stringify([tabla_respuesta])
						.length;

                                if (sizeStr <= threshold) {
                                    tabla_respuesta = formatoData(tabla_respuesta);
                                    TableLogistics(algo_, tabla_respuesta);
                                } else {
				FILE_NAME = { 'title':title, 'subtitle':subtitle };
				mensajeExplicativo(title,subtitle,tabla_respuesta);
                                }

                            } // <-- no es verdad 'siFiltro'.. 

                        }
                    });
                    /*-- Si sí está abierta entonces NO hacer POST y gestionar la logística de las tablas normalmente -*/
                } else {
                    TableLogistics(algo_, data);
                }
                /*------------------------------------------------------------------------------------------*/
            }

            if (this.nodeName == "DIV" && $(this).attr("especial") != "1") {
/*---Deshabilitar temporalmente el botón de Consultar para no repetir AJAX---*/
	     if($(this).next().css("display") != 'block') {

		$("div.d>div")
		  .append("<div style='width:90px; height:33px; background-color:rgba(0,0,0,0);position:relative;bottom:5px;border-radius:3px;' id='divDefense'></div>");

		$("div#tema_options").append("<div style='width:" + $('div#tema_options').css('width') + ";height:22px;background-color:transparent;position:relative;bottom:22px;' id='optionsDefense'></div>");
	     }
/*--Deshabilitar temporalmente el botón de Consultar para no repetir AJAX---*/

                $("div#quitarFiltro").css("display", "none");

                var title = this.parentNode.getAttribute("tag");
                var subtitle = this.getAttribute("tag");

                var tabla_resp = data.filter(function(d) {
                    return d[0] == title;
                })[0].filter(function(d) {
                    return typeof(d) == "object" &&
                        Object.keys(d)[0] == subtitle
                })[0][subtitle];

                var sizeStr = tabla_resp.length * 2;

                if (sizeStr <= threshold) {
//		    $("div#espere").css("visibility","visible");
                    params_especiales = {
                        'title': title,
                        'subtitle': subtitle
                    };
                    TableLogistics(this, data);
                } else {
			$("div#espere").css("visibility","visible");
			FILE_NAME = { 'title':title, 'subtitle':subtitle};
			mensajeExplicativo(null,null,tabla_resp);
                }
            }

        });
///////////////////////////////////////////////////////////////////////////
/////////////////^^ EXPANDIR PARA ESCRIBIR EN DOM ^^//////////////////////
/////////////////////////////////////////////////////////////////////////
        function TableLogistics(sth, data) {
            $(".overflow").scrollLeft(0);
            $(".scroll_header").scrollLeft(0);

            var tbody_hide = $(sth).next()[0].querySelector(".hide");
            var this_overflow = d3.select($(sth).next()[0]);
            var span = d3.select($(sth).find("span.s")[0]);

            if (this_overflow.style("display") == "block") {
                this_overflow.style("display", "none");
                d3.select(tbody_hide).html("");
                span.html(plus + "&ensp;");
            } else {
                //// <--- !
                var algo = sth;

                function nuevaTabla(algo, callback) {

                    var parentTag = algo.parentNode.getAttribute("tag");
                    var Tag = algo.getAttribute("tag");

                    var tableData = data.filter(function(d) {
                        return d[0] == parentTag;
                    })[0].filter(function(d) {
                        return typeof(d) == "object" && d[Tag];
                    })

                    if (tableData[0]) {
                        tableData = tableData[0][Tag];

                        tableData = formatoData(tableData);

                        var parser = new DOMParser();
                        var docTable = parser
					.parseFromString(tableData,
								"text/html");
                        docTable = docTable.querySelector("table");
                        $(docTable).css("table-layout", "fixed");

                        d3.selectAll("div>label>span.s")
					.html(plus + "&ensp;");
                        span.html(minus + "&ensp;");
                        d3.selectAll("div.overflow").style("display", "none");
                        d3.selectAll("div.overflow>table>tbody").html("")

                        docTable = discriminateRows(docTable);
                        d3.select(tbody_hide.parentNode.parentNode)
                            .style("display", "block");

   //--------------FILTRO PARA CASO ESPECIAL-----------------------
                        if (caso_especial && current_TXT) {

                            var newParser = new DOMParser();
                            var _docTable = newParser
                                .parseFromString(docTable.outerHTML,
								"text/html")
                                .body.querySelector("table");

                            var tds = Array.prototype
                                .slice.call(_docTable
				.querySelectorAll("tr>td:first-child"));

                            var val;

                            var prevTD = tds.filter(function(d) {
                                return d.textContent.replace(/\s/g, "")
                                    .toUpperCase() == current_TXT[2]
							.replace(/\s/g, "")
		                                        .toUpperCase();
                            })[0];


                            var c = tds.indexOf(prevTD) + 0;
                            var tdFromList;
                            var referenceTd = current_TXT[3]
						.replace(/\s/g, "")
						.toUpperCase();
                            var condTD;

                            for (c; c < tds.length; c++) {
                                tdFromList = tds[c].textContent
				  .replace(/\s/g, "").toUpperCase();
                                condTD = tdFromList == referenceTd;

                                if (condTD) {
                                    break;
                                }
                            };

                            val = tds[c].parentNode;


                            $(_docTable.querySelectorAll("tbody")).html("");
                            $(_docTable.querySelectorAll("tbody"))
				.append(prevTD.parentNode);
                            $(_docTable.querySelector("#dist_").parentNode)
                                .css("display", "none");
                            $(_docTable.querySelectorAll("#dist"))
				.css("display", "none");
                            $(_docTable.querySelectorAll("tbody"))
				.append(val);


                            d3.select(tbody_hide)
                                .html(_docTable.innerHTML);//<--pega la tabla


                            current_TXT = null; // <-- IMPORTANTÍSIMO!
                        }
//--------------FILTRO PARA CASO ESPECIAL-----------------------
                        else {
                            d3.select(tbody_hide)
                                .html(docTable.innerHTML);//<--pega la tabla
                        }

                        $(window).scrollTop(
                            $(tbody_hide).offset().top - 250
                        );

                        icons();
                        // seleccionarCheckboxes();
                        //enableGraphs();
                        //corregirRenglones();
                        headerScroll();
                        colcol();
                        callback();

                        $("td#n").each(function() {
                            let color = $(this.parentNode.children[0])
                                .css("background-color");
                        });

                    } else {
                        //console.log("no hay tabla");

                        var params = parametros();
                        params["title"] = params_especiales.title;
                        params["subtitle"] = params_especiales.subtitle;
                        var algo_ = $("tbody.hide[tag='" + params.title
			    + "']>div.labels[tag='"
			    + params.subtitle + "']")[0];

                        $.ajax({
                            url: HOSTNAME + "/cubos_cuadros.py",
                            dataType: 'json',
                            data: params,
                            success: function(tabla_respuesta) {

                                var sizeStr = JSON
					.stringify([tabla_respuesta])
					.length;

                                if (sizeStr <= threshold) {
                              tabla_respuesta = formatoData(tabla_respuesta);
                                    TableLogistics(algo_, tabla_respuesta);
                                } else {
		FILE_NAME = { 'title':params.title, 'subtitle':params.subtitle };
		mensajeExplicativo(params.title,params.subtitle,tabla_respuesta);
                                }

                            }
                        });

                    }

		    $("div#divDefense").remove();
		    $("div#optionsDefense").remove();
                };

                function mensajeEspera() {
                    $("div#espere").css("visibility", "visible") // aquí
                    window.setTimeout(function() {
                        nuevaTabla(algo, function() {
                            $("div#espere").css("visibility", "hidden");

                            ///// FORZAR TAMAÑOS DE HEADER OCURRENTE CROSS-BROWSER ////////////////////////
                            var cellHide = $("div.overflow>table>tbody.hide>tr:nth-child(2)>td:nth-child(4)")
                            var cellHead = $(".scroll_aid_header>th:nth-child(n+2)");
                            //  console.log("Tamaño de celda en head:",cellHead.css("width"))

                            var CellOffsetWidth = cellHide[0].offsetWidth //.css("width"); 
                            var jqueryWidth = "75px"; //cellHide.css("width"); 

                            //  console.log("Tamaño de celda 'offset':",CellOffsetWidth);
                            //  console.log("Tamaño de celda 'jQuery':",jqueryWidth);

                            cellHead.css("max-width", jqueryWidth)
                            cellHead.css("width", jqueryWidth)
                            cellHead.css("min-width", jqueryWidth)


                            //  console.log("Tamaño después de cambio con jQuery:",cellHead.css("width"))

                            d3.selectAll(".scroll_aid_header>th:nth-child(n+2)")
                                .style("max-width", jqueryWidth)
                                .style("width", jqueryWidth)
                                .style("min-width", jqueryWidth)

                            //  console.log("Tamaño después de cambio con D3:",cellHead.css("width"))
                            var posHeader = document
                                .querySelector(".scroll_aid_header>th:nth-child(2)")
                                .getBoundingClientRect();

                            var posHide = cellHide[0].getBoundingClientRect();

                            $(".scroll_aid_header>th:first-child").css("padding", "0px");
                            $(".scroll_aid_header>th:first-child").css("min-width", "calc(360px + 55px)");
                            $("div.overflow tr>td").css("border-bottom", "0px solid white");
                            $("div.overflow tr>td").css("border-top", "1px solid lightGray");
                            //	  $("div.overflow tr>td:first-child").css("min-width","600px")

                            if (posHeader.left != posHide.left) {

                                d3.select(".scroll_aid_header>th:first-child")
                                    .style("min-width", posHeader.left + "px");
                            }


///// FORZAR TAMAÑOS DE HEADER OCURRENTE CROSS-BROWSER ////////////////////////

/*-----------------Quitar scroller horizontal si no se necesita--------------*/

                            var tabla_overflow_X = $("div.overflow")
			      .filter(function() {
                                return $(this).css("display") == "block";
                            });

                            var row_length_ = tabla_overflow_X[0]
                                .querySelector("tr:first-child")
                                .getBoundingClientRect().right;

                            if (row_length_ < window.innerWidth) {
                                tabla_overflow_X.css("overflow-x", "hidden")
                            } else {
                                tabla_overflow_X.css("overflow-x", "scroll")
                            }
/*-----------------Quitar scroller horizontal si no se necesita--------------*/
                            PrincipalCheckBox();

                            var checkIfDist_ = document
				.querySelectorAll("#dist_").length;
                            if (checkIfDist_ > 0) {
                                d3.selectAll("tr#dist").attr("id", null);
                            }

                            contratosPemexFIX(); // <-- Arregla "coloreados no controlados".
                            enableGraphs();
                        });
                    }, 10);
                }
                mensajeEspera();
            };

        }



        function colcol() {

            d3.selectAll(".hide td:first-child").on("mouseover", function() {
                $(this.parentNode.children)
			.css("background-color", "rgba(13,180,190,0.25)");
            });

            d3.selectAll(".hide td:first-child").on("mouseout", function() {
                $(this.parentNode.children).css("background-color", "white");
            });

            d3.selectAll(".hide td:not(:first-child)")
	     .on("mouseover", function() {

                var grand_parent = $(this).parent().parent().parent()
                    .parent().parent().attr("tag");
                var parent = $(this).parent().parent().attr("tag");
                var ix = $(this).index() + 1;
                var aid_cell = d3.select("tr.scroll_aid_header>th:nth-child("
						+ (ix - 2) + ")");
                if (aid_cell) {
                    if ($("tr.scroll_aid_header").attr("visible") == "yes") {
                        aid_cell.style("background", color);
                    }
                }

                // Colorear filas
                /*petición Mendoza*/
                $(this.parentNode.children).css("background", color);

                d3.selectAll("tbody[tag='" + grand_parent
			+ "']>div>table>tbody[tag='"
                        + parent + "'] th:nth-child(" + ix + ")")
                    .style("background", color);

            });


            d3.selectAll(".hide td:not(:first-child)")
	     .on("mouseout", function() {
                var color_cond = this.parentNode
		 .getAttribute("id") == "dist" ||
                    this.parentNode.children[0].getAttribute("id") == "dist_";

                var color_1 = color_cond ? temas_fondo : "transparent";


                var grand_parent = $(this).parent().parent().parent()
                    .parent().parent().attr("tag");
                var parent = $(this).parent().parent().attr("tag");
                var ix = $(this).index() + 1;
                var aid_cell = d3.select("tr.scroll_aid_header>th:nth-child("
					+ (ix - 2) + ")");

                if (aid_cell) {
                    if ($('tr.scroll_aid_header').attr("visible") == "yes") {
                        aid_cell.style("background", "white")
                    }
                }

                // Descolorear filas
                var color_tag = $(this.parentNode).attr("color_tag");
                var color_tag_ = color_tag ? color_tag : "transparent";
                $(this.parentNode.children).css("background", "");


                d3.selectAll("tbody[tag='" + grand_parent
		  + "']>div>table>tbody[tag='" + parent + "'] " +
                        "th:nth-child(" + ix + ")")
                    .style("background", "transparent");


                if (color_cond) {
                    $(this.parentNode.children[0]).css("background", color_1)
                    if (this.parentNode.children[0]
		       .getAttribute("id") == "dist_") {
                        $(this.parentNode.children)
                    }
                    if (this.parentNode.getAttribute("id") == "dist") {
                        $(this.parentNode.children)
				.css("background", color_1);
                    }

                } else {
                    $(this.parentNode.children[0])
			.css("background", "white"); 
                }

                var firstC = $(this.parentNode.children[0])
			.css("background-color");

                if ($(this.parentNode).attr("even") == 1) {
                    $(this.parentNode.children);
                }

            });


            var table_bottom = $(".overflow:visible")[0]
                .getBoundingClientRect().bottom;

            var tabla_overflow_X = $("div.overflow").filter(function() {
                return $(this).css("display") == "block";
            });

            var row_length_ = tabla_overflow_X[0]
                .querySelector("tr:first-child")
                .getBoundingClientRect().right;
/*----------Mostrar y ocultar footer conforme sea necesario-----------*/
            if (row_length_ > window.innerWidth) {
                tabla_overflow_X.css("overflow-x", "hidden")

                if (table_bottom > window.innerHeight) {
                    $("#footer").css("display", "block");
                } else {
                    $("#footer").css("display", "none");
                }
            }
/*----------Mostrar y ocultar footer conforme sea necesario-----------*/

/*-------------------REFINACIÓN DE DETALLES DE TABLAS-------------------*/
            $("div.overflow tr>td")
                .css("height", "20")
                .css("font-size", "13px");

            $("div.overflow tr>td:first-child")
                .css("font-size", "12px");

            $("div.overflow tbody>tr:first-child>td").css("display", "none");
            $("div.overflow").css("margin-top", "20px");
            $("div.overflow").css("margin-bottom", "20px");

            var tamanio_ = "calc(100% - 430px)"
            $("div.scroll_header").css("width", "calc(100% - 15px)");
            $("div.overflow").css("width", tamanio_);
            $("div#footer").css("width", "100%")

/*-------------------REFINACIÓN DE DETALLES DE TABLAS-------------------*/

        }
//////////////////////////////////////////////////////////////////////////////
/////////////////////vv HABILITAR ÍCONOS POR TABLA vv////////////////////////
////////////////////////////////////////////////////////////////////////////
        function icons() {
            var cubos = document
		.querySelectorAll("tbody.hide>div>table>tbody.hide");

            for (var c in cubos) {
                if (cubos[c].nodeName == "TBODY") {
                    var parent_tag = cubos[c]
			.parentNode
			.parentNode
			.parentNode
                        .getAttribute("tag");

                    var this_tag = cubos[c].getAttribute("tag");

                    var cubo_td = "tbody.hide[tag='" + parent_tag
			+ "']>div>table>"
                        + "tbody.hide[tag='" + this_tag
			+ "']>tr>td:first-child:not(#dist_)";

                    var cubo_th = "tbody.hide[tag='"
			+ parent_tag + "']>div>table>"
                        + "tbody.hide[tag='" + this_tag
			+ "']>tr>th:first-child";

                    var cubo_dist_ = "tbody.hide[tag='" + parent_tag
			+ "']>div>table>"
                        + "tbody.hide[tag='" + this_tag
			+ "']>tr>td:first-child#dist_";


                    $("<td id='p'><input style='display:none;' id='principal' type='checkbox'></input></td>")
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
            $("input#principal").on("click", function() {
               var child_boxes_str = "input[type='checkbox']:not(#principal)";
               $(child_boxes_str).prop("checked", $(this).prop("checked"));
            });
        };

        seleccionarCheckboxes();

    };


    function RenderWords(obj, lang, temas) {
        var titles = obj.A[lang].filtros.titles;
        var months = obj.A[lang].filtros.months;
        var years = obj.A[lang].filtros.years;
        var options = obj.A[lang].filtros.options;

	var secciones = _.uniq(temas,function(d) {
	  return d.seccion;
	}).map(function(d) { return d.seccion; });


	d3.select("select.filtros_").selectAll("option")
	    .data(secciones).enter()
	    .append("option")
	    .attr("tag", function(d) {
		return d;
	    })
	    .html(function(d) {
		return d;
	    });


        var sel_ = $("select.filtros_").find(":selected").attr("tag");

	var temasDeSeccion = temas.filter(function(d) { return d.seccion == sel_; });

        d3.select("select.filtros").selectAll("option")
            .data(temas.filter(function(d) { return d.seccion == sel_; })).enter()
            .append("option")
            .attr("tag", function(d) {
                return d['json_arg'];
            })
            .html(function(d) {
                return d.tema;
            });


        var tema_seleccionado = $("select.filtros").find(":selected").attr("tag");

        var temaSeleccionadoAttrs = temasDeSeccion.filter(function(d) { return d.json_arg == tema_seleccionado; })[0];
	// Que el año inicial no dependa del blueprints.json sino de la respuesta del AJAX:
	years[0] = temaSeleccionadoAttrs.init_year;

        // Colocar cada uno de los títulos en su respectivo lugar.
        for (var k in titles) {
            var selector = "#" + k + "_text";
            $(selector).text(titles[k]);
        }


	var periodicidad = JSON.parse(temaSeleccionadoAttrs.periodicidad);

	var periodicidad_ = []
	for(var k in periodicidad) {
	  var pair = [k,periodicidad[k]];
	  periodicidad_.push(pair);
	}

	d3.select("select#periodicidad").selectAll("option")
	  .data(periodicidad_).enter()
	  .append("option")
	  .attr("tag",function(d) { return d[1]; })
	  .html(function(d) { return d[0]; });
	  


/*------ vv Habilitar modo de seleccionar periodicidad según lo que esté seleccionado vv ---------*/
	periodForm(periodicidad);
/*------ ^^ Habilitar modo de seleccionar periodicidad según lo que esté seleccionado ^^ ---------*/


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
        for (var i = years[0]; i <= years[1]; i++) {
            years_.push(i);
        }
        years_ = years_.map(function(d) {
            return "<option>" + d + "</option>";
        });

	//console.log(years_)

        var id_dates = ["start", "end"];
        for (var i in id_dates) {
            $("select#" + id_dates[i] + "_month").text("");
            $("select#" + id_dates[i] + "_year").text("");
            $("select#" + id_dates[i] + "_month").append(months);
            $("select#" + id_dates[i] + "_year").append(years_);
        }

        var start_year = document.getElementById("start_year").children;
        start_year = Array.prototype.slice.call(start_year)
	 .map(function(d) {
            return d.textContent;
         });

        var start_month = document.getElementById("start_month").children;
        start_month = Array.prototype.slice.call(start_month)
	 .map(function(d) {
            return d.textContent;
        });


        function addMonths(date, months) {
            date.setMonth(date.getMonth() + months);
            var month = String(date.getMonth() + 1);
            if (month.length == 1) month = "0" + month;
            var year = String(date.getFullYear());
            return [month, year];
        };

        var dateBefore = addMonths(new Date(), -12);
        var dateNow = addMonths(new Date(), -1);

        //console.log(dateBefore,dateNow)

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
    var header = document
	.querySelector("tbody.hide>div>table>tbody.hide>tr")
        .querySelectorAll("th");

    var header_ = [];
    for (var i in header) {
        if (header[i].nodeName == "TH") header_.push(header[i].innerHTML);
    };

    header_ = header_.join(",").replace(/\s&nbsp;/g, "-");
    header_ = header_.replace(/^,/g, "");

    return header_;
};


function resizeHighchart(exp_size, activ) {
    var w_, l_;

    if (activ == 'off') {
        w_ = "calc(80% - " + exp_size + ")";
        l_ = "calc(10% + " + exp_size + ")";
    } else if (activ == 'on') {
        w_ = "80%";
        l_ = "10%";
    }

    var chart_container = "#grapher>div#chart";

    $(chart_container).css("width", w_);
    $(chart_container).css("left", l_);

    var chart = $(chart_container).highcharts();
    var new_width = $(chart_container).css("width").split("px")[0];
    var new_height = $(chart_container).css("height").split("px")[0];

    chart.setSize(+new_width, +new_height)
}

window.onresize = function() {
    var tag_boton = $("button.datos_grapher").attr("tag");
    var new_tag_boton = tag_boton == 'off' ? 'on' : 'off';

    try {
        resizeHighchart("200px", new_tag_boton);
    } catch (err) {
        console.log(err);
    }


/*-------Mostrar y ocultar el scroller-x bajo demanda---------------------*/
    try {
        var tabla_overflow_X = $("div.overflow")
	 .filter(function() {
            return $(this).css("display") == "block";
         });

        var row_length_ = tabla_overflow_X[0]
            .querySelector("tr:first-child")
            .getBoundingClientRect().right;

        if (row_length_ < window.innerWidth) {
            $("#footer").css("display", "none");
            tabla_overflow_X.css("overflow-x", "hidden");
        } else {
            tabla_overflow_X.css("overflow-x", "scroll");
            var lastRow = computeLastRow()[1]
            if (lastRow >= window.innerHeight) {
                $("#footer").css("display", "block");
            }
        }
    } catch (err) {
        console.log(err);
    }
/*-------Mostrar y ocultar el scroller-x bajo demanda---------------------*/
}

function descargarSerie() {
    var titulo = document.querySelector("select.filtros");
    titulo = titulo[titulo.selectedIndex].value;

    var subtitulo = document.querySelector('.chart_expandible')
				.getAttribute("tag");

    titulo = titulo.toUpperCase();
    titulo = titulo.replace(/Á/g, "A");
    titulo = titulo.replace(/É/g, "E");
    titulo = titulo.replace(/Í/g, "I");
    titulo = titulo.replace(/Ó/g, "O");
    titulo = titulo.replace(/Ú/g, "U");

    subtitulo = subtitulo.toUpperCase();
    subtitulo = subtitulo.replace(/Á/g, "A");
    subtitulo = subtitulo.replace(/É/g, "E");
    subtitulo = subtitulo.replace(/Í/g, "I");
    subtitulo = subtitulo.replace(/Ó/g, "O");
    subtitulo = subtitulo.replace(/Ú/g, "U");

    var sel_ = $("select.filtros").find(":selected").attr("tag");

    var NOTAS = TEMAS.filter(function(d) {
            return d.json_arg == sel_;
        })[0].metodologia
        .replace(/\<a href="([ a-z\/\:=?.]*)/, '$1')
        .replace(/"\starget="_blank">Portal de información técnica<\/a\>/, "")
        .replace(/\<br\>/g, "").toUpperCase()
        .replace(/,/g, ";");

    var fecha = new Date();
    var Header = [
        "COMISION NACIONAL DE HIDROCARBUROS",
        titulo,
	"SERIE: " + subtitulo,
        "FECHA DE DESCARGA: " + fecha.toLocaleString('es-MX')
					.replace(", ", " - "),
        "\n",
    ];

    Header = Header.join("\n")

    var csv = [];
    csv.push(Header);
    csv.push("FECHA,DATO")
    var filas = document.querySelectorAll("div#tabla_expandible>table>tr");

    for (var i in filas) {
        var rows = []
        if (filas[i].nodeName == "TR") {
            var cells = filas[i].querySelectorAll("td")
            for (var j in cells) {
                if (cells[j].nodeName == "TD") {
                    var row = cells[j].textContent.replace(/,/g,"");
                    rows.push(row);
                }
            }
            rows = rows.join(",");
            csv.push(rows);
        }
    }
    csv = csv.join("\n");
    csv = csv.replace(/NaN/g, "");
    csv = [csv, "\n\n", NOTAS].join("\n");

    csv = csv.replace(/Á/g, "A");
    csv = csv.replace(/É/g, "E");
    csv = csv.replace(/Í/g, "I");
    csv = csv.replace(/Ó/g, "O");
    csv = csv.replace(/Ú/g, "U");

    var csvFile = new Blob(["\ufeff", csv], {
        'type': 'text/csv'
    });


    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(csvFile, "info.csv");
    } else {
        var downloadLink = document.createElement("a");
        downloadLink.download = "serie.csv";
        downloadLink.href = window.URL.createObjectURL(csvFile);
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        $("download[a]").remove();
    }

};


function parametros() {
    var params = {};
    params['period'] = $('input[name=periodicidad]:checked').val();
//    params['period'] = $("select#periodicidad").find(":selected").attr("tag");

    if (params["period"] == "monthly") {
        params['start_month'] = $("select#start_month")
					.find(":selected").text();
        params['end_month'] = $("select#end_month").find(":selected").text();
        params['start_year'] = $("select#start_year").find(":selected").text();
        params['end_year'] = $("select#end_year").find(":selected").text();

    } else if(params["period"] == 'daily') {
	var date_start = $('#datepicker_start').val();
	var date_end = $('#datepicker_end').val();

	if(date_start) {
	  params['start_year'] = date_start.split("-")[0];
	  params['start_month'] = date_start.split("-")[1];
	  params['start_day'] = date_start.split("-")[2];
	} else {
	  params['start_year'] = null;
	  params['start_month'] = undefined;
	  params['start_day'] = undefined;
	}

	if(date_end) {
	  params['end_year'] = date_end.split("-")[0];
	  params['end_month'] = date_end.split("-")[1];
	  params['end_day'] = date_end.split("-")[2];
	} else {
	  params['start_year'] = undefined;
	  params['start_month'] = undefined;
	  params['start_day'] = undefined;
	}

    } else {
        params['start_month'] = '01';
        params['end_month'] = '12';
        params['start_year'] = $("select#start_year").find(":selected").text();
        params['end_year'] = $("select#end_year").find(":selected").text();
    }

    params['topic'] = $("select.filtros").find(":selected").attr("tag");

    params['title'] = '';
    params['subtitle'] = '';


    return params;
};


function ajaxFunction(data, Cubos, filtrarSeries, special_params,
							data_buscar) {
//$("div#espere").css("visibility","visible");
    var consulta;
    var key_ = Object.keys(data[0][1])[0];
    var tableString = data[0][1];
    data = formatoData(data);
    Cubos(data);
    //try {

    if (special_params) {
        if ($("tbody[tag='" + special_params.title + "']")[0]) {
            consulta = $("tbody[tag='" + special_params.title + "'].hide")[0]
                .querySelector("div[tag='" + special_params.subtitle + "']");
        } else {

            consulta = $($("tbody#tabla>tbody.hide")[0]
                .querySelectorAll("div.labels:nth-child(1)"));

        }

	try {
          var parTAG = consulta.parentNode.getAttribute("tag"); // ¿?
          $("tbody.labels[tag='" + parTAG + "']").click();
          consulta.click();

	} catch(err) {
	  console.log(err);
//	  alert("¡Error, avisar por favor! :(")
	}
    } else {
        consulta = $($("tbody#tabla>tbody.hide")[0]
            .querySelectorAll("div.labels:nth-child(1)"));
    }


    if (tableString[key_]) {
        caso_especial = false;

    } else {
	//console.log("caso especial");
        caso_especial = true;
        $("tbody.hide>div.labels").attr("especial", "1");

    }

    //filtrarSeries(data, data_buscar);
//    var consulta_display = $(consulta).css("display");

    if (!noHayTabla && !special_params) {
        $("div#espere").css("visibility", "hidden");
    }

    $("div#divDefense").remove();
    $("div#optionsDefense").remove();

};


function formatoData(data) {
    for (var i in data) {
        for (var j in data[i]) {
            if (typeof(data[i][j]) == "object") {
                let key = Object.keys(data[i][j]).filter(function(d) {
                    return d != 'visual';
                })[0];

                data[i][j][key] =
                    data[i][j][key]
                    .replace(/(\d)-(\d)/g, "$1 $2");

                data[i][j][key] =
                    data[i][j][key]
                    .replace(/#/g, "&ensp;&nbsp;");

                data[i][j][key] =
                    data[i][j][key]
                    .replace(/\<tr(\>\n.*)\(/g, '<tr id="dist"$1(')

                data[i][j][key] =
                    data[i][j][key]
                //	.replace(/\<td(\>.*(?!CNH-M1-EK-BALAM\/2017)(?![CNH]*[\-R0-9]*[\-0-9/0-90-9])(?![AR])[A-Z]{2,}(?![MMpcd]))/g,'<td id="dist_"$1')
                //	.replace(/\<td(\>.*(?![CNH]*[\-R0-9]*[\-0-9/0-90-9])(?![AR])[A-Z]{2,}(?![MMpcd])(?![2017]))/g,'<td id="dist_"$1')


                data[i][j][key] =
                    data[i][j][key]
                    .replace(/Categor¡a/g, '')

                data[i][j][key] =
                    data[i][j][key]
                //	.replace(/\<td(\>.*A-[0-9]{4,})/g,'<td id="dist_"$1')

            }
        }
    }
    return data;
};

function PrincipalCheckBox() {
    $("div.overflow").filter(function() {
            return $(this).css("display") == "block";
        })
        .prepend("<button id='selection' style='font-size:9px;height:18px;;position:absolute;left:259px;font-weight:600;font-family:Open Sans'>Descargar selección</button><input id='principal' type='checkbox' style='position:absolute;left:391px;'></input>");

    var first_th_ = $("div.overflow").filter(function() {
        return $(this).css("display") == "block";
    });

    $("input#principal").on("click", function() {
        var child_boxes_str = "input[type='checkbox']:not(#principal)";
        $(child_boxes_str).prop("checked", $(this).prop("checked"));
    });


    d3.selectAll("button#selection").on("click", function() {
        var series = obtener_series();
        if (series && series.length == 0) {
            alert("Seleccione alguna serie.");
        } else {
            if (series) descargar_selection(series);
        }

    });
};


function obtener_series() {
    var css_selection = "input[type='checkbox']:checked:not(#principal):not(.aid_check)";
    var checked = document.querySelectorAll(css_selection);

    if (checked.length > 500) {
        alert("Su consulta excede el límite de 500 series.");
    } else {
        var series = [];
        for (var i in checked) {
            if (checked[i].type == "checkbox") {

                var obj = {};
                var row = checked[i].parentNode.parentNode;
                var _ix_ = $(row).index();

                if (_ix_ > 1) {
                    var prevRow = $("div.overflow").filter(function() {
                            return $(this).css("display") == "block";
                        })[0]
			.querySelectorAll("tr:nth-child(" + _ix_ + ")")[0]
                        .querySelector("td.graph").innerHTML.length;

                    prevRow = prevRow > 0 ? 0 : 1;
                    obj['prevRow'] = prevRow;
                }

                var parent_ = row.parentNode;
                var grand_parent_ = parent_.parentNode.parentNode.parentNode;
                var parent_tag = parent_.getAttribute("tag");
                var grand_parent_tag = grand_parent_.getAttribute("tag");

                obj['familia'] = grand_parent_tag;
                obj['subfamilia'] = parent_tag;

                var row_set = [];
                var cells = row.querySelectorAll("td:not(#n)");
                var first_cell = cells[0].innerHTML;
                first_cell = first_cell.replace(/&[a-z;\s]*/g, "");
                first_cell = first_cell.replace(/^\s/g, "");

                if (row.getAttribute('id')) {
                    obj['tema'] = first_cell;
                    obj['subtema'] = '';
                } else {

                    obj['subtema'] = first_cell;
                    var ix = $(row).index();
                    var cond = false;

                    while (!cond) {
                        var s = "tbody[tag='" + grand_parent_tag
				+ "']>div>table>"
                                + "tbody[tag='" + parent_tag + "']"
                                + ">tr:nth-child(" + ix + ")";

                        var dist = $(s).attr('id');
                        var dist_ = $(s)[0].querySelector("td:first-child")
					   .getAttribute("id");

                        if (dist || dist_) {
                            var tema = $(s)[0]
				.querySelector("td:first-child").innerHTML;

                            tema = tema.replace(/&[a-z;\s]*/g, "");
                            tema = tema.replace(/^\s/g, "");
                            obj["tema"] = tema;
                            cond = true;
                        }

                        ix -= 1;
                    }

                };

                for (var j = 1; j < cells.length; j++) {
                    if (cells[j].nodeName == "TD") {
                        var cell_content = cells[j].innerHTML;
                        cell_content = +cell_content.replace(/,/g, "");
                        row_set.push(cell_content);
                    }
                };


                obj["serie"] = row_set;
                series.push(obj);
            }
        };
        return series;
    }

};


function descargar_selection(series) {
    //console.log(series);
    var chunk = [];

    var sel_ = $("select.filtros").find(":selected").attr("tag");

    var _titulo_ = TEMAS.filter(function(d) {
        return d.json_arg == sel_;
    })[0].titulo;


    var fecha = new Date();
    var Header = [
        "COMISION NACIONAL DE HIDROCARBUROS",
        _titulo_,
        "Fecha de descarga: " + fecha.toLocaleString('es-MX')
				     .replace(", ", " - "),
        "\n",
    ];


    var NOTAS = TEMAS.filter(function(d) {
            return d.json_arg == sel_;
        })[0].metodologia
        .replace(/\<a href="([ a-z\/\:=?.]*)/, '$1')
        .replace(/"\starget="_blank">Portal de información técnica<\/a\>/, "")
        .replace(/\<br\>/g, "").toUpperCase()
        .replace(/HTTPS:\/\/PORTAL.CNIH.CNH.GOB.MX\/IICNIH2\/\?LNG=ES_MX/,
            "https://portal.cnih.cnh.gob.mx/iicnih2/?lng=es_mx")
	.replace(/,/g,";");


    var fechatest_ = fecha.toLocaleString('es-MX').replace(", ", " - ");

    chunk.push(Header.join("\n"));
    chunk.push(",,");

    var familias = _.uniq(series.map(function(d) {
        return d.familia;
    }));

    familias.forEach(function(f) {
        var pieces = [];
        chunk.push(f);

        var familia = series.filter(function(d) {
            return d.familia == f;
        });
        var subfamilias = _.uniq(familia.map(function(d) {
            return d.subfamilia;
        }));

        subfamilias.forEach(function(sf) {
            chunk.push("  " + sf + "," + fechas_());

            var subfamilia = familia.filter(function(ff) {
                return ff.subfamilia == sf;
            });

            var tema = '';
var buffer = [];
var cached_sum = []

            subfamilia.forEach(function(ss) {
                var serie_ = ss.serie.join(",").replace(/NaN/g, "");

		var buff_zeros = serie_.split(",").map(function(d) { return 0; });
		var serie_nums = serie_.split(",").map(function(d) { return Number(d); });
		buffer.push(serie_nums);

		if(cached_sum.length == 0) {
		  cached_sum = buff_zeros;
		}

//		console.log(cached_sum)

                if (tema != ss.tema) {
                    tema = ss.tema;

		    var sum_tema = series.filter(function(d) { return d.tema == tema; })
			.map(function(d) { return d.serie; });

		    var arr_sum = [];
		    for(var i=0; i < sum_tema[0].length; i++) {
		      var holder = []
		      for(var j=0; j < sum_tema.length; j++) {
			holder.push(sum_tema[j][i]);
		      }
		      arr_sum.push(holder);
		    }

		    arr_sum = arr_sum.map(function(d) { return String(d3.sum(d)); }).join(",");
		//console.log(ss)
		    var serie__ = ss.subtema.length > 0 ? arr_sum : serie_;
//		    if(ss.subtema.length > 0) serie_ = arr_sum;
                    var _cont_ = ss['prevRow'] ? "    " + tema : "     "
					+ tema + "," + serie__;
                    chunk.push(_cont_);
                }
//console.log(tema)


                var subtema = ss.subtema;
                if (subtema != "") chunk.push("          " + subtema
						+ "," + serie_);
            });

        });

        chunk.push(",,");
        chunk.push(",,");

    });

    chunk = chunk.join("\n").toUpperCase();
    chunk = [chunk, "\n\n", NOTAS].join("\n");
    chunk = chunk.replace(/Á/g, "A");
    chunk = chunk.replace(/É/g, "E");
    chunk = chunk.replace(/Í/g, "I");
    chunk = chunk.replace(/Ó/g, "O");
    chunk = chunk.replace(/Ú/g, "U");

    var csvFile = new Blob(["\ufeff", chunk], {
        'type': 'text/csv'
    });

    var fam = _.uniq(series.map(function(d) { return d.familia; }))[0];
    var subfam = _.uniq(series.map(function(d) { return d.subfamilia; }))[0];
    var file_name = fam + " - " + subfam;

    file_name = file_name.replace(/Á/g,'A')
			 .replace(/É/g,'E')
			 .replace(/Í/g,'I')
			 .replace(/Ó/g,'O')
			 .replace(/Ú/g,'U');

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(csvFile, file_name + ".csv");
    } else {
        var downloadLink = document.createElement("a");
        downloadLink.download = file_name + ".csv";
        downloadLink.href = window.URL.createObjectURL(csvFile);
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        var s_a = document.getElementsByTagName("a");
        for (var i = 0; i < s_a.length; i++) {
            s_a[i].parentNode.removeChild(s_a[i]);
        }
    }

};


function contratosPemexFIX() {
    var t = $("div.overflow").filter(function() {
        return $(this).css("display") == "block";
    })[0];

    var dist_ = t.querySelectorAll("td#dist_")
    dist_ = Array.prototype.slice.call(dist_);

    var patt = /CNH-M1/;

    var validation = !dist_.map(function(d) {
            return patt.test(d.textContent);
        })
        .filter(function(d) {
            return true;
        })
        .every(function(d) {
            return d == false
        });

    if (validation) {
        d3.selectAll(dist_).attr("id", null);
        var ixs = dist_.map(function(d) {
            return $(d.parentNode).index() - 1;
        });
        var trs = Array.prototype.slice.call(t.querySelectorAll("tr"));

        var filtered = [];

        for (var j in ixs) {
            var tr_0 = trs.filter(function(d, i) {
                return i == ixs[j];
            })[0];
            var tr_1 = trs.filter(function(d, i) {
                return i == ixs[j] + 1;
            })[0];
            filtered.push(tr_0);
            $(tr_1.querySelector("td.graph"))
                .html('<img style="z-index:-1" src="img/graph.svg">')

            $(tr_1.querySelector("td.check"))
                .html('<input type="checkbox" style="margin:0px;">');
        }

        $(filtered).attr("id", "dist");
    }

};



function enableGraphs() {

    $("td.graph>img").on("click", function() {
        var row = this.parentNode.parentNode.querySelectorAll("td:not(#n)");
        var grandparent_tag = this.parentNode.parentNode.parentNode
            .parentNode.parentNode.parentNode
            .getAttribute('tag');
        var parent_tag = this.parentNode.parentNode.parentNode
            .getAttribute('tag');

        var fechas = fechas_().split(",");
        var values = []
        var obj = {};
        for (var i in row) {
            if (row[i].nodeName == "TD") {
                var val = row[i].innerHTML;
                if (i == 0) {
                    val = val.replace(/&[a-z;\s]*/g, "");
                    val = val.replace(/^\s/g, "");
                    obj["name"] = val;
                } else {
                    val = +val.replace(/,/g, "");
                    values.push([fechas[i - 1], val]);
                }
            }
        };

        obj["data"] = values;
        var info = {
            'serie': obj,
            'grandparent': grandparent_tag,
            'parent': parent_tag
        }


        var row_ = this.parentNode.parentNode;

        var cells = row_.querySelectorAll("td:not(#n)");

        var first_cell = cells[0].innerHTML.replace(/\s&....;/g, "");
        first_cell = first_cell.replace(/&[a-z;\s]*/g, "");
        first_cell = first_cell.replace(/^\s/g, "");
        //      first_cell = first_cell.replace(/ /g,"");

        if (row_.getAttribute('id')) {
            info['tema'] = first_cell;
            info['subtema'] = '';
        } else {

            info['subtema'] = first_cell;
            var ix = $(row_).index();
            var cond = false;

            while (!cond) {
                var s = "tbody[tag='" + grandparent_tag + "']>div>table>" +
                    "tbody[tag='" + parent_tag + "']" +
                    ">tr:nth-child(" + ix + ")";

                var dist = $(s).attr('id');
                //console.log(s, dist);
                var dist_ = $(s)[0].querySelector("td:first-child")
				   .getAttribute("id");

                if (dist || dist_) {
                    var tema = $(s)[0].querySelector("td:first-child")
				      .innerHTML;
                    tema = tema.replace(/&[a-z;\s]*/g, "");
                    tema = tema.replace(/^\s/g, "");
                    info["tema"] = tema;

                    if (dist_) {
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


function grapher(info) {
    var fake_tag = [info.grandparent, info.parent, info.tema, info.subtema];
    if (fake_tag[3] == "") {
        fake_tag = fake_tag.slice(0, 3);
    }
    fake_tag = fake_tag.join(" - ");

    var grapher_element =
        "<div id='grapher'>" +
        "<button class='datos_grapher' tag='off'>" +
        "Datos <span id='flecha'>></span>" +
        "</button>" +
        "<img class='close_chart' src='img/close.svg'></img>" +

        "<div class='chart_expandible' tag='" + fake_tag + "'>" +

        "<div id='header_expandible' style='position:absolute;top:35px;width:100%;'>" +
        "<table style='table-layout:fixed;'>" +
        "<tr style='font-weight:700;'>" +
        "<td style='width:90px;min-width:90px;display:inline-block;padding:0px;'>FECHA</td>" +
        "<td style='width:90px;min-width:90px;display:inline-block;padding:0px;'>DATO</td>" +
        "</tr>" +
        "</table>" +
        "</div>" +

        "<div id='tabla_expandible' style='width:100%;height:calc(100% - 110px);margin-top:60px;overflow-y:scroll;'>" +
        "<table style='table-layout:fixed;'></table>" +
        "</div>" +

        "<button style='margin-left:20px;margin-top:15px;width:calc(100% - 50px);' onclick='descargarSerie()'>Descargar</button>" +

        "</div>" +
        "<div id='chart'></div>" +
        "</div>";

    $('body').css("overflow", "hidden");
    $('body').prepend(grapher_element);

    $('.close_chart').on("click", function() {
        $("body").css("overflow", "auto");
        $("#grapher").remove();
    });

    info.serie.showInLegend = false;

    var color = "rgb(13,180,190)";
    info.serie.color = color;


    var sel_ = $("select.filtros").find(":selected").attr("tag");

    var NOTAS = TEMAS.filter(function(d) {
            return d.json_arg == sel_;
        })[0].metodologia
        .replace("Fuente:", "<b>Fuente:</b>")
        .replace("Notas:", "<br><b>Notas:</b>")
        .replace("Portal de información técnica",
            "<tspan>Portal de información técnica</tspan>");

//============= CREDITS FIX ======================

function creditsFix(NOTAS) {


  return 0;
}

var credFIX = creditsFix(NOTAS);
//============= CREDITS FIX ======================
var marginCred = document.querySelector('div#metodos>div').clientHeight;
var offsetCred = Math.floor(marginCred / 100);

NOTAS = NOTAS.replace(/<b>|<\/b>/g,"")
//console.log([NOTAS]);

    Highcharts.chart('chart', {
        lang: {
            'img': 'Descargar imagen'
        },
        exporting: {
            enabled: true,
            buttons: {
                contextButton: {
                    symbolX: 19,
                    symbolY: 18,
                    symbol: 'url(img/download.svg)',
                    _titleKey: 'img',
                    menuItems: [{
                            textKey: 'downloadPNG',
                            onclick: descargarPNG,
                            text: "PNG"
                        },
                        {
                            textKey: 'downloadCSV',
                            onclick: descargarSerie,
                            text: "CSV"
                        }
                    ]
                }
            }
        },
        chart: {
            style: {
                fontFamily: 'Open Sans'
            },
            inverted: false,
            marginBottom: marginCred
        },
        tooltip: {
            useHTML: true,
            backgroundColor: null,
            borderWidth: 0,
            style: {
                fontWeight: 800
            },
            formatter: function() {
                var t =
                    "<div style='text-align:center;'>"
		   + "<span style='font-size:11px;font-weight:800;color:"
		   + 'black' + ";'>" +
                    this.point.name +
                    "</span>" +
                    "<br>" +
                    "<span style='font-weight:300;font-size:18px;'>" +
                    this.y.toLocaleString("es-MX") +
                    "</span></div>";
                return t;
            }
        },
        credits: {
            text: NOTAS,
            position: {
                align: "left",
                x: 50,
                y: marginCred > 100 ? -70 * offsetCred : -50
            },
            style: {
                fontSize: '11px',
                fontWeight: 300,
                color: "black"
            },
            href: null
        },
        title: {
            text: info.subtema ? info.subtema : info.tema
        },
        subtitle: {
            text: info.grandparent + " - " + info.parent
        },
        xAxis: {
            labels: {
                enabled: true,
                formatter: function() {
                    return info.fechas[this.value];
                }
            }
        },
        yAxis: {
            gridLineWidth: 1,
            labels: {
                formatter: function() {
                    return this.value.toLocaleString('es-MX');
                },
            },
            title: {
                style: {
                    fontWeight: 700
                },
                text: info.tema
            }
        },
        plotOptions: {
            series: {
                label: {
                    connectorAllowed: false
                },
                marker: {
                    radius: 0,
                    states: {
                        hover: {
                            radius: 5
                        }
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
/*EDITAR NOTAS*/

   var fixMathChars = $('.highcharts-credits>tspan').filter(function() { return this.textContent.match(/&/g); });

//console.log($('.highcharts-credits>tspan'));

   fixMathChars.each(function() {
     $(this).html(this.textContent);
   });


   if(document.querySelector("tspan[onclick]")) {
     $(".highcharts-credits").css("cursor","auto");

     var liga_nombre = $("tspan[onclick]").html();
     var liga = $("tspan[onclick]").attr("onclick")
		.split("=")[1].replace(/"/g,"");

     $("tspan[onclick]").html("<a href='" + liga + "' target='_blank'>"
					  + liga_nombre + "</a>");
     $("tspan[onclick]").attr("onclick",null);

   }

    ////////////////////// AGREGAR TABLA PARA DESCARGA /////////////////////////
    var datos_tabla_ = info.serie.data.reverse();

    d3.select("div#tabla_expandible>table").selectAll("tr")
        .data(datos_tabla_).enter()
        .append("tr")
        .each(function(d) {
            var val_ = d.map(function(t) {
                var v = String(t);
                if (v == "NaN") v = "";
                return "<td style='vertical-align:middle;font-size:12px;height:22px;min-height:25px;width:90px;min-width:90px;padding:0px;display:table-cell;border-top:1px solid rgba(0,0,0,0.08);'>" + v + "</td>";
            }).join("");
            d3.select(this).html(val_);
        });

    $("#tabla_expandible td:nth-child(2)").each(function() {
      var content = this.textContent;
      $(this).html(Number(content).toLocaleString("es-MX"));
    });

    var tExp_w = $("div#tabla_expandible").css("width");
    $("div#header_expandible").css("width", tExp_w);

/////////////////////// AGREGAR TABLA PARA DESCARGA ////////////////////////

    d3.select("button.datos_grapher").on("click", function() {

        var tag_boton = $(this).attr("tag");
        var new_tag_boton = tag_boton == 'off' ? 'on' : 'off';
        var chart_container = "#grapher>div#chart";
        var exp_size = "200px";

        if (tag_boton == 'off') {

            resizeHighchart(exp_size, tag_boton);
            $("span#flecha").html("<")

            d3.select("#grapher>div.chart_expandible")
                .style("display", "block")
                .style("width", exp_size);

            $(chart_container)
                .css("width", "calc(80% - " + exp_size + ")");

            $(this).attr("tag", new_tag_boton);

        } else {

            $("span#flecha").html(">")

            d3.select("#grapher>div.chart_expandible")
                .style("display", "none")
                .style("width", "0px");

            $(chart_container)
                .css("width", "80%");

            resizeHighchart(exp_size, tag_boton);

            $(this).attr("tag", new_tag_boton);

        }

    });

};


// ---------CALCULAR TAMAÑO DE CELDAS PARA EL ENCABEZADO-SCROLLER ----
function headerScroll() {
    var first_th = $("tbody.hide")[0].querySelectorAll("th")[1];

    var first_th = $("div.overflow").filter(function() {
        return $(this).css("display") == "block";
    })[0].querySelectorAll("th")[1];

    if (first_th) {
        var cell_Width = first_th.offsetWidth - 1;
        //      var cell_Width = $(first_th).css("width").split("px")[0];
        //console.log(cell_Width);
        var scroll_id_header = fechas_().replace(/-/g, " ").split(",")
            .map(function(d) {
                return "<th style='width:" + cell_Width +
                    "px;min-width:" + cell_Width + "px;max-width:"
		   + cell_Width + "px'>" +
                    d + "</th>";
            });

        var scroll_id_header_ = ["<th style='min-width:413px;padding:1px;'></th>"]
            .concat(scroll_id_header).join("");
        $("tr.scroll_aid_header").html(scroll_id_header_)
        $("tr.scroll_aid_footer").html(scroll_id_header)

// ----------- CALCULAR TAMAÑO DE TBODY PARA EL SCROLLER_HEADER ----------
        var tbody_Width = document.querySelectorAll("table>.hide")[0]
            .offsetWidth;
        $(".scroll_header")
            .css("width", "calc( 100% - " + 65 + "px)");

// -------------------- MOVER DIVS SIMULTÁNEAMENTE ------------------
        $('div.overflow').on('scroll', function() {
            $('div.scroll_header').scrollLeft($(this).scrollLeft());
        });

        $('#footer_').on('scroll', function() {
            $('div.scroll_header').scrollLeft($(this).scrollLeft());
            $('div.overflow').scrollLeft($(this).scrollLeft());
        });

    } else {
//        console.log("else!");
    }
};

function leyendaNotas(TEMAS, params) {
    var metodos = TEMAS.filter(function(d) {
            return d.json_arg == params['topic'];
        })[0].metodologia
        .replace(/Fuente:/, "<b>Fuente:</b>")
        .replace(/Notas:/, "<br><b>Notas:</b>");

    var str =
        "<div style='width:90%;height:100%;padding-top:60px;padding-left:20px;'>" +
        metodos +
        "</div>";

    $("div#metodos").html(str);
};


function descargarPNG() {
    var SVG = document.querySelector("svg.highcharts-root")
    var svg_w = $(SVG).css("width");
    var svg_h = $(SVG).css("height");
    var rawSVG = new XMLSerializer().serializeToString(SVG);

    $("body").append("<canvas class='PNG_' id='canvas' width='"
			+ svg_w + "' height='" + svg_h + "'></canvas>");
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    $(".PNG_").css("display","none");

    if(canvas.msToBlob) {
      canvg(canvas,rawSVG)
      var blob = canvas.msToBlob();
      window.navigator.msSaveBlob(blob,"chart.png");
      $("PNG_").remove()
    } else {

	    var svg = new Blob([rawSVG], {
		    type: "image/svg+xml;charset=utf-8"
		}),
		domURL = self.URL || self.webkitURL || self,
		url = domURL.createObjectURL(svg),
		img = new Image;

	    img.onload = function() {
		ctx.drawImage(img, 0, 0);
		domURL.revokeObjectURL(url);
		//console.log(svg)
		triggerDownload(canvas.toDataURL(),svg);
	    };

    	    img.src = url;
	    $("PNG_").remove();
    }

    function triggerDownload(imgURI,svg) {

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
	  //console.log(svg)
          window.navigator.msSaveOrOpenBlob(svg, "a.png");
      } else {
          var a = document.createElement('a');
          a.setAttribute('download', 'chart.png');
          a.setAttribute('href', imgURI);
          a.setAttribute('target', '_blank');
	  document.body.appendChild(a);
	  //console.log(a)
          a.click();
          d3.selectAll(".PNG_").remove();
          a.remove();
      }
    };

};


function discriminateRows(table) {
    /* Esta función checa si la tabla tiene filas con todas sus celdas vacías salvo la primera. Si es así, es necesario cambiar ciertos atributos, como el 'id' de la fila, para que apliquen reglas de color.*/
    var trs_ = table.querySelectorAll("tr:not(#dist):not(:first-child)");

    trs_ = $(trs_).map(function() {
        var a = this.querySelectorAll("td:nth-child(n+2)");
        a = Array.prototype.slice.call(a);
        return a.map(function(d) {
            return d.textContent;
        }).every(function(d) {
            return d == "";
        });
    });

    trs_ = Array.prototype.slice.call(trs_).every(function(d) {
        return d == true;
    });

    if (trs_) {
        //Si la primera celda tienen id='dist_' no se colocarán íconos 'graph' y 'check'.
        d3.selectAll(table.querySelectorAll("tr:not(#dist)>td:first-child"))
            .attr("id", "dist_");
        d3.selectAll(table.querySelectorAll("tr#dist")).attr("id", null);
    }

    return table;
};



function worker(data) {
    var concatFILENAME = FILE_NAME.title + " - " + FILE_NAME.subtitle;
    var sel_ = $("select.filtros").find(":selected").attr("tag");

    var _titulo_ = TEMAS.filter(function(d) {
        return d.json_arg == sel_;
    })[0].titulo;


    var fecha = new Date();
    var Header = [
        "COMISION NACIONAL DE HIDROCARBUROS",
        _titulo_,
        "Fecha de descarga: " + fecha.toLocaleString('es-MX')
				     .replace(", ", " - "),
        "\n",
    ].join("\n");

    var NOTAS = TEMAS.filter(function(d) {
            return d.json_arg == sel_;
        })[0].metodologia
        .replace(/\<a href="([ a-z\/\:=?.]*)/, '$1')
        .replace(/"\starget="_blank">Portal de información técnica<\/a\>/, "")
        .replace(/\<br\>/g, "").toUpperCase()
        .replace(/,/g, ";");


    var parser = new DOMParser();
    var table = parser.parseFromString(data, "text/html");
    table = table.body.querySelector("table");
    var rows = Array.prototype.slice.call(table.querySelectorAll("tr"));

    var thead = Array.prototype.slice
        .call(rows.splice(0, 1)[0].querySelectorAll("th"))
        .map(function(d) {
            return d.textContent;
        }).join(",");

    var tbody = rows.map(function(d) {
        return Array.prototype.slice.call(d.querySelectorAll("td"));
    }).map(function(d) {
        return d.map(function(f) {
            return f.textContent;
        }).join(",");
    }).join("\n").replace(/#/g, " ");

    table = [Header, thead, tbody, "\n\n", NOTAS].join("\n");

    table = table.toUpperCase();
    table = table.replace(/Á/g, "A");
    table = table.replace(/É/g, "E");
    table = table.replace(/Í/g, "I");
    table = table.replace(/Ó/g, "O");
    table = table.replace(/Ú/g, "U")
        .replace(/HTTPS:\/\/PORTAL.CNIH.CNH.GOB.MX\/IICNIH2\/\?LNG=ES_MX/,
            "https://portal.cnih.cnh.gob.mx/iicnih2/?lng=es_mx");

    var csvFile = new Blob(["\ufeff", table], {
        'type': 'text/csv'
    });

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(csvFile, concatFILENAME + ".csv");
    } else {
        var downloadLink = document.createElement("a");
        downloadLink.download = concatFILENAME + ".csv";
        downloadLink.href = window.URL.createObjectURL(csvFile);
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        $("a[download]").remove();
    }

    $("div#espere").css("visibility", "hidden");
};


function mensajeExplicativo(title,subtitle,tabla_respuesta) {
  var hayBotonesYa = document
		.querySelector("#descargaBotonesSiNo") ? true : false;

  if(hayBotonesYa) {
    $("#descargaBotonesSiNo").remove();
  }

  d3.select("#loading").style("height","0px");

  d3.select("div.espere").transition()
   .duration(500)
   .style("width","0%")
   .style("height","0%");


  d3.select("div.espere").transition()
   .delay(500)
    .duration(500)
    .style("width","60%")
    .style("height","40%")
    .style("top","25%")
    .style("left","20%");


  d3.select("div.content")
   .transition()
   .delay(500)
   .duration(500)
   .style("width","calc(100% - 100px)")
   .style("padding-bottom","3%")

  d3.select("div.content>p")
   .transition()
   .duration(200)
   .style("color","transparent")

  d3.select("div.content>p")
   .html("<span style='font-weight:300'>El tamaño de su consulta es muy grande por lo que ésta no puede ser visualizada.</span><br><br>¿Desea descargar la información?")
  .transition()
  .delay(1000)
  .duration(500)
  .style("color","black")

  $("div.content")
    .append("<div style='opacity:0' id='descargaBotonesSiNo'><button class='si' id='descarga' style='background-color:rgb(13,180,190);'>&check; Sí&ensp;</button>&emsp;<button class='no' id='descarga' style='background-color:red;'>&cross; No&ensp;</button></div>")

  d3.select("div#descargaBotonesSiNo")
    .transition()
    .delay(1000)
    .duration(500)
    .style("opacity","1");

  var tabla_resp;

  if(title && subtitle) {
	 tabla_resp = tabla_respuesta
	.filter(function(d) {
	    return d[0] == title;
	})[0].filter(function(d) {
	    return typeof(d) == "object" &&
		Object.keys(d)[0] == subtitle
	})[0][subtitle];
  } else {
    tabla_resp = tabla_respuesta;
  }


  $("button.si").on("click", function() {
	worker(tabla_resp);
	$("div#espere").css("visibility","hidden");

	d3.select("#loading").style("height","60px");

	d3.select("div.espere")
	.style("width","30%")
	.style("height","30%");


	d3.select("div.espere")
	.style("top","35%")
	.style("left","35%");


	d3.select("div.content")
	 .style("width","200px")
	 .style("margin","0 auto")
	 .style("padding-bottom","0%")
	 .style("font-size","15px");

	d3.select("div.content>p")
	 .style("color","black");

	d3.select("div.content>p")
	  .html("Consultando información")
	  .style("color","black");

	d3.selectAll("div#descargaBotonesSiNo").remove();
	$("div#divDefense").remove()
	$("div#optionsDefense").remove();
  });


  $("button.no").on("click", function() {
	$("div#espere").css("visibility","hidden");


	d3.select("#loading").style("height","60px");

	d3.select("div.espere")
	.style("width","30%")
	.style("height","30%");


	d3.select("div.espere")
	.style("top","35%")
	.style("left","35%");


	d3.select("div.content")
	 .style("width","200px")
	 .style("margin","0 auto")
	 .style("padding-bottom","0%")
	 .style("font-size","15px");

	d3.select("div.content>p")
	 .style("color","black");

	d3.select("div.content>p")
	  .html("Consultando información")
	  .style("color","black");

	$("div#descargaBotonesSiNo").remove();
	$("div#divDefense").remove()
	$("div#optionsDefense").remove();
  });

};


function checkIfEmpty(data) {

  var cond = data.every(function(d) {
    return d.filter(function(d,i) { return i > 0; }).every(function(d) {
		return typeof(d) == "object" && d[Object.keys(d)[0]] == '' }) });

  return cond;
};


function periodForm(periodicidad) {

/*-----------------Activar y desactivar periodicidades según el caso----------------------------------*/
	if(periodicidad) {

		   var values = [];
		   for( var k in periodicidad) { values.push(periodicidad[k]) }
/*
		   var _existen = $('input[type=radio][name=periodicidad]').filter(function() {
//			return Object.values(periodicidad).includes(this.value)
			return values.includes(this.value);
		   });
*/

		   var _items = document.querySelectorAll('input[type=radio][name=periodicidad]');
		   _items = Array.prototype.slice.call(_items);

		   var _existen = _items.filter(function(d) {
			return values.some(function(e) { return e == d.value; });
		   });

		   _existen[0].checked = true;

		   _existen.forEach(function(d) {
			d.disabled = false;
			$("div#" + d.value).css("color","white");
		   });

/*
		   $('input[type=radio][name=periodicidad]').filter(function() {
//			return !Object.values(periodicidad).includes(this.value)
			return !values.includes(this.value);
		   }).each(function() {
			this.disabled = true;
			$("div#" + this.value).css("color","gray");
		   });
*/

		   var no_existen = _items.filter(function(d) {
			return !values.some(function(e) { return e == d.value; });
		   });

		   no_existen.forEach(function(d) {
			d.disabled = true;
			$("div#" + d.value).css("color","gray");
		   });
		   
	}

/*-----------------Activar y desactivar periodicidades según el caso----------------------------------*/
/*------ vv Habilitar modo de seleccionar periodicidad según lo que esté seleccionado vv ---------*/
        var HP = $("div#HP");
//	var _selected_period_ = $("select#periodicidad").find(":selected").attr("tag");
	var _selected_period_ = $('input[name=periodicidad]:checked').val();

	var dateForm = $("div#dateForm");

	if (_selected_period_ == 'annually') {
	  HP.css("z-index", "1");
	  dateForm.css("z-index","-2");
	  dateForm.css("opacity","0");
	} else if(_selected_period_ == 'monthly' ) {
	  HP.css("z-index", "-1");
	  dateForm.css("z-index","-2");
	  dateForm.css("opacity","0");
	} else {
	  dateForm.css("z-index","51");
	  dateForm.css("opacity","1");
	}
/*------ ^^ Habilitar modo de seleccionar periodicidad según lo que esté seleccionado ^^ ---------*/
}


function mapaDeSeries(TEMAS) {
  $("span#info_circle").hover(function(){
    $(this).css("color", "rgb(120,255,255)");
    }, function(){
    $(this).css("color", "rgb(13,180,190)");
  });

  $('span#info_circle').click(function() {
    $("#mapaSeries").css("visibility","visible");
  });

  $('.close_mapaSeries').on("click", function() {
    $("#mapaSeries").css("visibility","hidden");
  });

  var secciones = _.uniq(TEMAS.map(function(d) { return d.seccion; }));

  d3.select('#indice').append("div")
      .style('position','relative')
      .style('top','20%')
	.selectAll('li').data(secciones).enter()
	.append('li')
	.style('padding-bottom','0.2vw')
	.style('font-size','1vmax')
	.style('font-weight','600')
	.html(function(d) { return d; })
    .each(function(li) {
	var temas = TEMAS.filter(function(d) { return d.seccion == li; })
			  .map(function(d) { return d.tema; });

	d3.select(this).append("ul")
	 .selectAll('li').data(temas).enter()
	 .append('li')
	 .style('font-size','0.9vw')
	 .style('font-weight','300')
	 .html(function(d) {
	    return d;
	 });
    });
 
}

