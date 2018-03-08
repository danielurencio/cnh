function Cubos(data, tag) {
        ///////////ESTO EVITA BUGS CON EL SCROLLER DEL HEADER/////////////////////////
        $('.scroll_aid_header').attr("visible", "no");
        $(".scroll_header").scrollLeft(0);
        $("#footer_").scrollLeft(0);
        $("button#principal").attr("todos", "no");
        data = formatoData(data);
        /////////////////////////////////////////////////////////////////////////////
        var color = "rgba(13,180,190,0.25)";
        var temas_fondo = "white"

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
                        "<label style='cursor:pointer;width:100%'>&nbsp;<span class='s' id='uno' style='font-weight:400;'>" +
			plus + "&ensp;</span>" + selection.attr("tag") + "</label>" +
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
                            "<div style='width:100%'>&nbsp;&nbsp;<label style='cursor:pointer;'>&ensp;<span id='dos' class='s' " +
			    "style='font-weight:400;'>" + plus + "&ensp;</span>&ensp;&ensp;" + Object.keys(tablas[j])[0] + "</label></div>" +
                            "</thead>";

                        var contenido_tabla; // <-- Solo pegar en DOM la primera tabla! 
                        contenido_tabla = "";
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
/*----------------------------------------------Restaurar filtro---------------------------------------------*/
		$("input#filtroSerie").prop('disabled',false);
                $("div#quitarFiltro").css("display", "none");
/*----------------------------------------------Restaurar filtro---------------------------------------------*/


                var title = this.parentNode.getAttribute("tag");
                var subtitle = this.getAttribute("tag");
//		if($(this).next().css("display") != 'block') {
                  params_especiales = {
                    'title': title,
                    'subtitle': subtitle
                  };
//		} else {
//		  params_especiales = null;
//		}

                var params = parametros();
                params["title"] = title;
                params["subtitle"] = subtitle;
                var algo_ = this;
/*--- Si no está abierta la tabla hacer POST para obtener la tabla que se va a mostrar ---*/
                if (performAjax) {
                    noHayTabla = true;

/*---Deshabilitar temporalmente el botón de Consultar para no repetir AJAX---*/
		   $("div.d>div").append("<div style='width:90px; height:33px; background-color:rgba(0,0,0,0);" +
			"position:relative;bottom:5px;border-radius:3px;' id='divDefense'></div>");

		   $("div#tema_options").append("<div style='width:" + $('div#tema_options').css('width') +
			";height:22px;background-color:transparent;position:relative;bottom:22px;' id='optionsDefense'></div>");
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
		  .append("<div style='width:90px; height:33px; background-color:rgba(0,0,0,0);position:relative;" +
				"bottom:5px;border-radius:3px;' id='divDefense'></div>");

		$("div#tema_options").append("<div style='width:" + $('div#tema_options').css('width') +
			";height:22px;background-color:transparent;position:relative;bottom:22px;' id='optionsDefense'></div>");
	     }
/*--Deshabilitar temporalmente el botón de Consultar para no repetir AJAX---*/

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

		    if(($(this).next().css("display")) != "block") {

                      params_especiales = {
                        'title': title,
                        'subtitle': subtitle
                      };

		    } else {
			params_especiales = null;
		        if($('#filtroSerie').val()) {
			  $('#quitarFiltro').css("display","none");
			  $('#filtroSerie').prop('disabled',false);
			  $('#filtroSerie').val('')
			}

		    }

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
        function TableLogistics(sth, data,cliConsultar) {
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

                            var _docTable = parser
                                .parseFromString(docTable.outerHTML,
								"text/html")
                                .body.querySelector("table");

/*
                            var tds = Array.prototype
                                .slice.call(_docTable
				.querySelectorAll("tr>td:first-child"));


                            var val,valName;

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
*/
			   var _td_ = selected_TD(current_TXT,docTable);
			   val = $(_td_).parent()[0].children;
//                            val = $(tds[c]).parent()[0].children;
			    val = Array.prototype.slice.call(val);
			    val = "<tr>" + val.map(function(d) { return d.outerHTML; }).join("") + "</tr>";
			    val = $(val);

//			    valName = Array.prototype.slice.call(prevTD.parentNode.children);
//			    valName = "<tr>" + valName.map(function(d) { return d.outerHTML; }).join(""); + "</tr>";
//			    valName = $(valName).css("display","none");

                            $(_docTable.querySelectorAll("tbody")).html("");

//                            $(_docTable.querySelectorAll("tbody"))
//				.append(valName);

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
                        headerScroll();
                        colcol();
                        callback();

                        $("td#n").each(function() {
                            let color = $(this.parentNode.children[0])
                                .css("background-color");
                        });

                    } else {

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

				var textoEnFiltro = $("#filtroSerie").val();
				if(textoEnFiltro) tabla_respuesta = filtroHandler(textoEnFiltro,formatoData(tabla_respuesta));

                                var sizeStr = JSON
					.stringify([tabla_respuesta])
					.length;

                                if (sizeStr <= threshold) {
                                    if(!textoEnFiltro) tabla_respuesta = formatoData(tabla_respuesta);
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

                            var CellOffsetWidth = cellHide[0].offsetWidth;
                            var jqueryWidth = "75px";


                            cellHead.css("max-width", jqueryWidth)
                            cellHead.css("width", jqueryWidth)
                            cellHead.css("min-width", jqueryWidth)


                            d3.selectAll(".scroll_aid_header>th:nth-child(n+2)")
                                .style("max-width", jqueryWidth)
                                .style("width", jqueryWidth)
                                .style("min-width", jqueryWidth)

                            var posHeader = document
                                .querySelector(".scroll_aid_header>th:nth-child(2)")
                                .getBoundingClientRect();

                            var posHide = cellHide[0].getBoundingClientRect();

                            $(".scroll_aid_header>th:first-child").css("padding", "0px");
                            $(".scroll_aid_header>th:first-child").css("min-width", "calc(360px + 55px)");
                            $("div.overflow tr>td").css("border-bottom", "0px solid white");
                            $("div.overflow tr>td").css("border-top", "1px solid lightGray");

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
