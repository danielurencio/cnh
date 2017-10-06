$(document).ready(function() {

  $.ajax({
   url:"blueprints.json",
   dataType:'json',
   success:function(response) {
     RenderWords(response,"esp");
   }
  })
  $("div#tabla").load("produccion_cuencas.html",function() {

  });


function RenderWords(obj,lang) {
  var titles = obj.A[lang].filtros.titles;
  var options = obj.A[lang].filtros.options;

  for( var k in titles ) {
    var selector = "div#" + k + "_text";
    $(selector).text(titles[k]);
  }

  var temas = options.map(function(d) {
	return "<option>" + d.tema + "</option>";
  }).join("");

  $("div#tema_options select").append(temas);
};


});
