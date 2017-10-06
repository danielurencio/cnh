$(document).ready(function() {

  // Todo ocurre aquí.
  $.ajax({
   url:"blueprints.json",
   dataType:'json',
   success:function(response) {
     RenderWords(response,"esp");
     $("span.lang").on("click", function() {
	RenderWords(response,this.id);
     });
   }
  });

  // Agregar tabla.
  $("div#tabla").load("produccion_cuencas.html",function() {

  });


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

  // Obtener los niveles de desagregación del tema o reporte seleccionado,
  // y colocarlos en el apartado de "Nivel".
  var niveles = options.filter(function(d) {
    return d.tema == $("select#tema_options").val()
  })[0].nivel
  .map(function(d) { return "<option>" + d + "</option>"; }).join("");

  $("div#nivel_options select").text("");
  $("div#nivel_options select").append(niveles);

  // En cuanto se elija otro tema o reporte, actualizar los niveles de
  // desagregación que corresponden a ese reporte.
  $("select#tema_options").on("change",function() {
    var text = $(this).val();
    let niveles = options.filter(function(d) {
      return d.tema == text
    })[0].nivel
    .map(function(d) { return "<option>" + d + "</option>"; }).join("");

    $("select#nivel_options").text("")
    $("div#nivel_options select").append(niveles);
  });


};


});
