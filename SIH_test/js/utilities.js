function fechas_() {
//
// NO se invoca en script.js
//
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

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////


function resizeHighchart(exp_size, activ) {
/*------------- Se invoca en otras funciones de utilities.js ------------*/
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


///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////


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


///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////


function descargarSerie() {
/*------- Esta función se invoca en otras funciones dentro de utilities.js-----------*/
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

    csv = csv.replace(/&LEQ;/g,"<=");

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

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

function parametros() {
/*--------- Regresa los parametros seleccionados en la franja con los filtros principales. ---------*/
    var params = {};
    params['period'] = $('input[name=periodicidad]:checked').val();

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

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

function ajaxFunction(data, Cubos, filtrarSeries, special_params,
							data_buscar) {
    var consulta;
    var key_ = Object.keys(data[0][1])[0];
    var tableString = data[0][1];
    data = formatoData(data);
    Cubos(data);

    if (special_params) {
        if ($("tbody[tag='" + special_params.title + "']")[0]) {
            consulta = $("tbody[tag='" + special_params.title + "'].hide")[0]
                .querySelector("div[tag='" + special_params.subtitle + "']");
        } else {

            consulta = $($("tbody#tabla>tbody.hide")[0]
                .querySelectorAll("div.labels:nth-child(1)"));

        }

	try {
          var parTAG = consulta.parentNode.getAttribute("tag");
          $("tbody.labels[tag='" + parTAG + "']").click();
          consulta.click();

	} catch(err) {
	  console.log(err);	  
	}

    } else {
        consulta = $($("tbody#tabla>tbody.hide")[0]
            .querySelectorAll("div.labels:nth-child(1)"));
    }


    if (tableString[key_]) {
        caso_especial = false;

    } else {
        caso_especial = true;
        $("tbody.hide>div.labels").attr("especial", "1");

    }


    // Esconder mensaje de espera.
    if (!noHayTabla && !special_params) {
        /*if(!esperaMapaSeries)*/ $("div#espere").css("visibility", "hidden");
    }
    // Esconder mensaje de espera.

    $("div#divDefense").remove();
    $("div#optionsDefense").remove();

};

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

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
                    .replace(/Categor¡a/g, '')

            }
        }
    }
    return data;
};

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

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


///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////



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

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

function descargar_selection(series) {
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
	    var cached_sum = [];

            subfamilia.forEach(function(ss) {
                var serie_ = ss.serie.join(",").replace(/NaN/g, "");

		var buff_zeros = serie_.split(",").map(function(d) { return 0; });
		var serie_nums = serie_.split(",").map(function(d) { return Number(d); });
		buffer.push(serie_nums);

		if(cached_sum.length == 0) {
		  cached_sum = buff_zeros;
		}


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

		    var serie__ = ss.subtema.length > 0 ? arr_sum : serie_;

                    var _cont_ = ss['prevRow'] ? "    " + tema : "     ";
					+ tema + "," + serie__;
                    chunk.push(_cont_);
                }


                var subtema = ss.subtema.replace(/,/g,';');
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


///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////


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

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////


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

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////


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

    NOTAS = NOTAS.replace(/<b>|<\/b>/g,"");

    // Los símbolos matemáticos no aparecen en IE (fix adicional).
    if(navigator.userAgent.match(/.NET/)) {
	NOTAS = NOTAS.replace(/&leq;/g,"<=")
    }

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
                y: marginCred > 100 ? -75 * offsetCred : -50
            },
            style: {
                fontSize: '10px',
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

   fixMathChars.each(function() {
     $(this).html(this.textContent);
   });


   if(document.querySelector("tspan[onclick]")) {
     $(".highcharts-credits").css("cursor","auto");

     var liga_nombre = $("tspan[onclick]").html();
     var liga = $("tspan[onclick]").attr("onclick")
		.split("=")[1].replace(/"/g,"");

     console.log([liga,liga_nombre])

     $("tspan[onclick]").html("<a href='" + liga + "' target='_blank'>"
					  + liga_nombre + "</a>");
//     $("tspan[onclick]").attr("onclick",null);

   } else {
     console.log("No hay [onclick].");
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

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////


// ---------CALCULAR TAMAÑO DE CELDAS PARA EL ENCABEZADO-SCROLLER ----
function headerScroll() {
    var first_th = $("tbody.hide")[0].querySelectorAll("th")[1];

    var first_th = $("div.overflow").filter(function() {
        return $(this).css("display") == "block";
    })[0].querySelectorAll("th")[1];

    if (first_th) {
        var cell_Width = first_th.offsetWidth - 1;

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

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

function descargarPNG() {
    if($('.highcharts-anchor').length) {
//    if($(".highcharts-credits a").length) {
      var _tspans = $(".highcharts-credits>tspan");
      $(_tspans[_tspans.length-1]).attr("fill","white");
      $(_tspans[_tspans.length-2]).attr("fill","white");
      $(".highcharts-credits a").attr("fill","white");
    }

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
		triggerDownload(canvas.toDataURL(),svg);
	    };

    	    img.src = url;
	    $("PNG_").remove();
    }

    function triggerDownload(imgURI,svg) {

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(svg, "a.png");
      } else {
          var a = document.createElement('a');
          a.setAttribute('download', 'chart.png');
          a.setAttribute('href', imgURI);
          a.setAttribute('target', '_blank');
	  document.body.appendChild(a);
          a.click();
          d3.selectAll(".PNG_").remove();
          a.remove();
      }
    };

     if($('.highcharts-anchor').length) {
//   if($(".highcharts-credits a").length) {
      var _tspans = $(".highcharts-credits>tspan");
      $(_tspans[_tspans.length-1]).attr("fill","black");
      $(_tspans[_tspans.length-2]).attr("fill","black");
      $(".highcharts-credits a").attr("fill","black");
   }

};

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////


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

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

function checkIfEmpty(data) {

  var cond = data.every(function(d) {
    return d.filter(function(d,i) { return i > 0; }).every(function(d) {
		return typeof(d) == "object" && d[Object.keys(d)[0]] == '' }) });

  return cond;
};

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

function periodForm(periodicidad) {

/*-----------------Activar y desactivar periodicidades según el caso----------------------------------*/
	if(periodicidad) {

		   var values = [];
		   for( var k in periodicidad) { values.push(periodicidad[k]) }

		   var _items = document.querySelectorAll('input[type=radio][name=periodicidad]');
		   _items = Array.prototype.slice.call(_items);

		   var _existen = _items.filter(function(d) {
			return values.some(function(e) { return e == d.value; });
		   });

		   if(_existen.some(function(d) { return d.value == 'monthly'; })) {
		     _existen.filter(function(d) { return d.value == 'monthly'; })[0].checked = true;
		   } else {
		     _existen[0].checked = true;
		   }

		   _existen.forEach(function(d) {
			d.disabled = false;
			$("div#" + d.value).css("color","rgb(25%,25%,25%)");
		   });

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
};

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

function mapaDeSeries(TEMAS) {

  $("span#info_circle").hover(function(){
    $(this).css("color", "rgb(120,255,255)");
    }, function(){
    $(this).css("color", "rgb(13,180,190)");
  });

  $('span#info_circle').click(function() {
    $("#mapaSeries").css("visibility","visible");
  });

  $('.mapaSeries_titulo').click(function() {
    $("#mapaSeries").css("visibility","visible");
  });


  $('.close_mapaSeries').on("click", function() {
    $("#mapaSeries").css("visibility","hidden");
  });

  var secciones = _.uniq(TEMAS.map(function(d) { return d.seccion; }));

  var reglas = ["i <= 2", "i > 2"];

  // Esto ayuda a partir los temas en dos para el índice en el mapa de series.
  var dataSets = reglas.map(function(regla) { 
    return secciones.map(function(tema,i) {
	  if(eval(regla)) return tema;
	}).filter(function(tema) { return tema; });
  });


// Evento personalizado: Se detona el cambio por sección y se acepta una función como argumento
// para que, posteriormente, se detone el cambio por tema.
  $('select.filtros_ option').bind("customCall", function(e,callback) {
	$(this).trigger("change");
	window.setTimeout(callback, 1250);  // ¿Es ésta la mejor manera? ¿Cómo asegurar que sea 'asíncrono'?
  });



   d3.selectAll('.indice').each(function(d,i) {
	   var ix = i;
	   d3.select(this).append("div")
	      .style('position','relative')
	      .style('top','20%')
		.selectAll('li').data(dataSets[ix]).enter()
		.append('li')
		.attr("tag",function(d) { return d; })
		.style('padding-bottom','3vw')
		.style("list-style-type","none")
		.style('font-size','1.8vw')
		.style('font-weight','600')
		.html(function(d) { return d; })
	    .each(function(li) {
	      var temas = TEMAS.filter(function(d) { return d.seccion == li; })
				  .map(function(d) { return d.tema; });

	      d3.select(this)
		.append("ul")
		  .style("padding-left","7%")
		.selectAll('li').data(temas).enter()
		.append('li')
		.attr("tag",function(d) { return d; })
		   .style('font-size','1.3vw')
		   .style('font-weight','300')
		   .style('color','rgb(13,180,190)')
		   .style('text-decoration','underline')
		   .attr('class','liMapa')
		 .html(function(d) {
		    var str = ix == 0 ? d + "&ensp;" : "&ensp;" + d;
		    return d;
		 });
	    });


	    d3.selectAll('.liMapa')
		    .on('click',function(d) {
		    $('div#mapaSeries').css('visibility','hidden');

		    thisNode = $(this).text();
		    var parentNode = this.parentNode.parentNode.getAttribute('tag');

		    var sel_parentNode = $('select.filtros_').find(':selected').attr('tag');
		    var sel_thisNode = $('select.filtros').find(':selected').attr('tag');
		 

		    if(sel_parentNode == parentNode) {
		      $('select.filtros option').filter(function() { return this.innerText == thisNode; })
			.prop('selected',true).trigger("change");

		    } else if(sel_parentNode != parentNode) {

		      esperaMapaSeries = true;  // <-- Sirve para controlar la aparición del mensaje de espera.
						//     La variable de arriba pausa el mecanismo natural del mensaje de espera
						//     para que parezca que se cambia de tema naturalmente y así el pop-up
						//     de espera no 'parpadee'.

		      $('select.filtros_ option').filter(function() { return this.innerText == parentNode; })
			.prop('selected',true).trigger("customCall",function() {

			    esperaMapaSeries = false; // <-- Reestablece el funcionamiento natural del mensaje de espera.

//			    $('select.filtros option').filter(function() { return this.innerText == thisNode; })
//				.prop('selected',true).trigger("change");

			});

		    };

		 })
		.on("mouseover", function() { $(this).css("font-weight","700"); })
		.on("mouseout", function() { $(this).css("font-weight","300"); });

   });

};

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////


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


        var s_Year = start_year.indexOf(dateBefore[1]);
        var e_Year = start_year.indexOf(dateNow[1]);
        var s_Month = start_month.indexOf(dateBefore[0]);
        var e_Month = start_month.indexOf(dateNow[0]);

        document.getElementById("start_year").selectedIndex = s_Year;
        document.getElementById("end_year").selectedIndex = e_Year;
        document.getElementById("start_month").selectedIndex = s_Month;
        document.getElementById("end_month").selectedIndex = e_Month;

};
