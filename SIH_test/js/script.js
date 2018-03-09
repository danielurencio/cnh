	var ambiente = 'producción';
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
	//var current_TXT_noEspecial = false;
	var esperaMapaSeries = false;
	var thisNode; 


	$(document).ready(function() {
	/////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////  --- SETUP ---- ///////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////

	  var web_worker = new Worker('js/worker.js');

	  web_worker.addEventListener('message',function(e) {
	    filtrarSeries(null,JSON.parse(e.data));
	  },false);

	  SETUP();

	/////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////  --- SETUP ---- ///////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////


	    /////////////////////////////////////////////////////////////////////////////
	    //                          |                                              //
	    // Todo ocurre aquí.------- V                                              //
	    //                                                                         //
	    /////////////////////////////////////////////////////////////////////////////

	    $.ajax({
		url: HOSTNAME + "/cubos_temas_des.py",
		dataType: 'json',
		data: {
		    'section': 'PRODUCCION'
		},
		success: function(temas) {
		    TEMAS = JSON.parse(temas);

		    d3.json("blueprints.json", function(response) {

			response.A.esp.filtros.years[1] = new Date().getFullYear();// <-- El año actual para los filtros.
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
		  $("div.d>div").append("<div style='width:90px; height:33px; background-color:rgba(0,0,0,0);" + 
					"position:relative;bottom:5px;border-radius:3px;'id='divDefense'></div>");

		  $("div#tema_options").append("<div style='width:" + $('div#tema_options').css('width') +
			";height:22px;background-color:transparent;position:relative;bottom:22px;' id='optionsDefense'></div>");
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
                        var loading_text = "<div style='font-weight:800;position:absolute;top:50%;left:calc(50% - 75.7px);" +
						"'class='wait'><span>Cargando información ...</span></div>";


                        var params = parametros();

/*------------------AJAX con botón de consultar-------------------------------*/    
	    if(cambio_) {
                      $("tbody#tabla").html("");
		      cambio_ = false;
//		      $("#quitarFiltro").click();
/*-------------------------------Webworker para paralelizar AJAX-----------------------------------------------------*/

		      var worker_tools = { 'params':params,'url':HOSTNAME + '/cubos_buscar.py' };
		      web_worker.postMessage(worker_tools);

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

			      } else {
				ajaxFunction(data,Cubos,filtrarSeries,params_especiales, null); //|
				filtrarSeries(data,data_buscar);				       //| <-- Habilitar buscador.

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

                });


// ======================= CAMBIO POR SECCIÓN ========================================
		$("select.filtros_").change(function() {
		      $("input#filtroSerie").prop("disabled",false);
                      document.querySelector("input#filtroSerie").value = "";

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


		    if(!esperaMapaSeries) {
			// Si el cambio de tema se ejecuta manualmente y de modo normal.
		        $("select.filtros").find(":selected").trigger("change");
		    } else {
			// Si el cambio de tema se hace desde el mapa de series.
			// Esto evita que el AJAX se ejecute más de una vez.
                        $('select.filtros option').filter(function() { return this.innerText == thisNode; })
                            .prop('selected',true).trigger("change");
		    }
		    
		    var tema_seleccionado = $("select.filtros").find(":selected").attr("tag");

		    var temaSeleccionado_ = temas_seccion.filter(function(d) { return d.json_arg == tema_seleccionado; })[0];
		    var periodicidad = JSON.parse(temaSeleccionado_.periodicidad);

/*------ vv Habilitar modo de seleccionar periodicidad según lo que esté seleccionado vv ---------*/
		    periodForm(periodicidad);
/*------ ^^ Habilitar modo de seleccionar periodicidad según lo que esté seleccionado ^^ ---------*/
		});
// ===================================================================================

                $("select.filtros").change(function() {//<--CAMBIO DE TEMA..
		      $("input#filtroSerie").prop("disabled",false);
                      document.querySelector("input#filtroSerie").value = "";

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
		   $("div.d>div").append("<div style='width:90px; height:33px; background-color:rgba(0,0,0,0);" +
					"position:relative;bottom:5px;border-radius:3px;' id='divDefense'></div>");

		  $("div#tema_options").append("<div style='width:" + $('div#tema_options').css('width') +
				";height:22px;background-color:transparent;position:relative;bottom:22px;' id='optionsDefense'></div>");
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
                    });


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
		    web_worker.postMessage(worker_tools);

/*-------------------------------Webworker para paralelizar AJAX-----------------------------------------------------*/


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

			  } else {
			    data_buscar = null;
			    ajaxFunction(data,Cubos,filtrarSeries,null,data_buscar); //| ¡"AjaxFunction" & "FiltrarSeries"
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

                $(periodo_selector).change(function() {

/*------ vv Habilitar modo de seleccionar periodicidad según lo que esté seleccionado vv ---------*/
		    periodForm();
/*------ ^^ Habilitar modo de seleccionar periodicidad según lo que esté seleccionado ^^ ---------*/
                });


                var boton_consulta = $("button#consultar");
                var selectors_ = ["select#start_year", "select#end_year", "select#start_month", "select#end_month", "input[type=radio][name=periodicidad]", "#datepicker_start", "#datepicker_end"];


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
		      web_worker.postMessage(worker_tools);

/*-------------------------------Webworker para paralelizar AJAX-----------------------------------------------------*/

                $.ajax({
                    url: HOSTNAME + "/cubos_cuadros.py",
                    type: "get",
                    datatype: "json",
                    data: params,
                    success: function(data) {
			var ifEmpty = checkIfEmpty(data);
                        ajaxFunction(data, Cubos, filtrarSeries, null, null);
                        leyendaNotas(TEMAS, params);
			cambio_ = false;
                    }

                });



                var sel_ = $("select.filtros").find(":selected").attr("tag");

                var title = TEMAS.filter(function(d) {
                    return d.json_arg == sel_;
                })[0].titulo.toUpperCase();

                $("div#mainTitle").html(title);
                var sizE = $("div#mainTitle")[0].getBoundingClientRect().right / 2;
                var LEFT = (window.innerWidth / 2) - (sizE / 2);

                ///////////////////////////////////////////////////////////////////////////////
                //////////////////// AJAX - tabla default - ///////////////////////////////////
                ///////////////////////////////////////////////////////////////////////////////


                $("span.lang").on("click", function() {
                    RenderWords(response, this.id);
                });

                d3.selectAll("button#selection").on("click", function() {
                    var series = obtener_series();

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





});
