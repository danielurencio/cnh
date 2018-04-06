    function filtrarSeries(data, data_buscar) {
        data_BUSCAR = false;

	if($('div#dropDown>div')[0]) {
	  $('div#dropDown>div').remove();
	}

        var str_;

        function regexCheck(patt) {
            return patt.test(str_);
        };

        var color = _azul_;
        var color_ = _azul_;

        var parser = new DOMParser();
        var arr = [];


        if(data_buscar) {
	  cosas(data_buscar);
        } else {
	  if(asyncAJAX) { asyncAJAX.abort(); }

        }

       function cosas(data_buscar_) {
	// Fix necesario para que el filtro funcione con IE y Chrome.
	if(typeof(data_buscar) == 'string') var data_buscar_ = JSON.parse(data_buscar_);

        var data_buscar_ = data_buscar_.map(function(d) {
            return d.join(" > ");
        });

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
                        .on("click", function() { /// Asignación de current_TXT_
                      	    document.querySelector("input#filtroSerie").value = "";

                            var txt = this.textContent.split(" > ");

                            caso_especial ? siFiltro = true : siFiltro = false;
                            caso_especial ? current_TXT = txt : current_TXT = null;
                            irAserie(txt);

			   // Agrega el nombre de la selección en el filtro y lo inhabilita.
                            $("div#quitarFiltro").css("display", "block");
			    $("input#filtroSerie").prop("disabled",true);
			    document.querySelector("input#filtroSerie").value = "    " + txt.join(" > ");
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

	if($('#filtroSerie').val()) {
	  d3.select('input#filtroSerie').dispatch('input');
	}


        $("body *>*:not(div#dropDown)").on("click", function() {
            d3.selectAll("div#dropDown>div").remove();
            d3.selectAll("div#dropDown").style("display", "none");
	    if(!$("input#filtroSerie").prop("disabled")) {
              document.querySelector("input#filtroSerie").value = "";
	    }
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

//	var el_ = selected_TD(txt)[0];
//	var docTable = el_.parentNode.parentNode;
//	var specialType = docTable.querySelectorAll('td#dist_').length;


        if (subtitulo_overflow.css("display") == "none") {
            /* Función anónima que (a) hace click en la tabla solicitada y, de manera
            'asíncrona', (b) obtiene la celda buscada para (c) alimentarla en una
            función que desplazará el viewport hasta encontrar la celda... */
            (function() {

                subtitulo_label.click(); // <-- (a)
                window.setTimeout(function() { /*------------------Async--*/

                    if (!siFiltro) {
                        var el_ = selected_TD(txt)[0]; // <-- (b)
	var docTable = el_.parentNode.parentNode;
	var specialType = docTable.querySelectorAll('td#dist_').length;

                        if (el_) {
			    if(specialType) {
	
			      filterSpecialType(docTable,el_);
			      enableGraphs();

			    } else {
                              mostrar(el_);
			    }
                        } else {

                            var sleep_ = setInterval(function() {
                                el_ = selected_TD(txt)[0];
	var docTable = el_.parentNode.parentNode;
	var specialType = docTable.querySelectorAll('td#dist_').length;

                                if (el_) {
                                    clearInterval(sleep_);
				    if(specialType) {
				      filterSpecialType(docTable,el_);
				      enableGraphs();

				    } else {
                                      mostrar(el_);
				    }
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
	    // Cuando la tabla ya está abierta, en vez de volver a pedir los servicios web,
	    // se tiene que encontrar la fila de interés y deshacerse de las demás.
            var el_ = selected_TD(txt)[0];
	    var docTable = el_.parentNode.parentNode;
	    var specialType = docTable.querySelectorAll('td#dist_').length;

	    if(caso_especial  || specialType) {
		filterSpecialType(docTable,el_);
		enableGraphs();

	    } else {

              mostrar(el_);
	    }

        }
//enableGraphs();
    };

    function mostrar(el) {

        SS_ = false;
        d3.selectAll("div.overflow tr").style("display", "none");
        $(document.querySelectorAll("div.overflow tr")[0]).css("display", "block");
        $(el.parentNode).css("display", "block");
        var pos = el.parentNode.parentNode.parentNode.parentNode.parentNode.offsetTop;

        $(window).scrollTop(
            $(el).offset().top - 250
        );

    }

    ////////////////////////////////////////////////////////////////////////
    ///////// Búsqueda de celda específica a través del filtro...
    ////////////////////////////////////////////////////////////////////////
    function selected_TD(txt,fake_table) {
	// 'fake_table' debe de ser un elemento jQuery!
        if(!fake_table) {
          var titulo = txt[0];
          var subtitulo = txt[1];
          var subtitulo_label = $("tbody.hide[tag='" + titulo + "']>div.labels[tag='" +
              subtitulo + "']");
          var subtitulo_overflow = subtitulo_label.next();
        } else {
          var subtitulo_overflow = $(fake_table);
        }

        var tds = Array.prototype
            .slice.call(subtitulo_overflow[0]
                .querySelectorAll("tr>td:first-child"));

        var val;

        var prevTD = tds.filter(function(d) {
            return d.textContent.replace(/\s/g, "").toUpperCase() == txt[2].replace(/\s/g, "").toUpperCase();
        })[0];


        var c = tds.indexOf(prevTD) + 0; // <-- Más uno!
        var tdFromList;
        var referenceTd = txt[3].replace(/\s/g, "").toUpperCase();
        var condTD;

        for (c; c < tds.length; c++) {
//	    if($(tds[c]).attr("id")) alert("¡OJO! TE pasaste de pozo, estamos en:" + $(tds[c]).text())
            tdFromList = tds[c].textContent.replace(/\s/g, "").toUpperCase();
            condTD = tdFromList == referenceTd;

            if (condTD) {
                break;
            }
        };

        val = [tds[c]];

        return val;
    }


function filterSpecialType(docTable,el_) {

	      $(docTable).find("tr:not(first-child)").each(function(i,d) {
                if(!$(d).find('td:first-child').attr("id")) $(d).attr("id","d")
              });

	      var datesRow = "<tr>" + $(docTable).find('tr:first-child').html() + "</tr>";
	      var content = datesRow + nameGasNoil(el_);

	      $(docTable).html(content)
};

