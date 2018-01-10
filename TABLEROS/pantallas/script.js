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


//    var sel_ = $("select.filtros").find(":selected").attr("tag");
/*
    var NOTAS = TEMAS.filter(function(d) {
            return d.json_arg == sel_;
        })[0].metodologia
        .replace("Fuente:", "<b>Fuente:</b>")
        .replace("Notas:", "<br><b>Notas:</b>")
        .replace("Portal de información técnica",
            "<tspan>Portal de información técnica</tspan>");
*/
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
            marginBottom: 120
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
            text:"", //NOTAS,
            position: {
                align: "left",
                x: 50,
                y: -60
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

function descargarPNG() {
    var SVG = document.querySelector("svg.highcharts-root")
    var svg_w = $(SVG).css("width");
    var svg_h = $(SVG).css("height");
    var rawSVG = new XMLSerializer().serializeToString(SVG);

    $("body").append("<canvas class='PNG_' id='canvas' width='"
                        + svg_w + "' height='" + svg_h + "'></canvas>");
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');


    if(canvas.msToBlob) {
      canvg(canvas,rawSVG)
      var blob = canvas.msToBlob();
      window.navigator.msSaveBlob(blob,"chart.png");
    
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
                console.log(svg)
                triggerDownload(canvas.toDataURL(),svg);
            };

            img.src = url; 
    }

    function triggerDownload(imgURI,svg) {

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          console.log(svg)
//          window.navigator.msSaveOrOpenBlob(svg, "a.png");
      } else {
          var a = document.createElement('a');
          a.setAttribute('download', 'chart.png');
          a.setAttribute('href', imgURI);
          a.setAttribute('target', '_blank');
          a.click();
          d3.selectAll(".PNG_").remove();
          a.remove();
      }
    };   

};


function descargarSerie() {
    var titulo = "Gráfica"//document.querySelector("select.filtros");
//    titulo = titulo[titulo.selectedIndex].value;

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

//    var sel_ = $("select.filtros").find(":selected").attr("tag");
/*
    var NOTAS = TEMAS.filter(function(d) {
            return d.json_arg == sel_;
        })[0].metodologia
        .replace(/\<a href="([ a-z\/\:=?.]*)/, '$1')
        .replace(/"\starget="_blank">Portal de información técnica<\/a\>/, "")
        .replace(/\<br\>/g, "").toUpperCase()
        .replace(/,/g, ";");
*/
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
    csv = [csv, "\n\n"/*, NOTAS*/].join("\n");

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
}


