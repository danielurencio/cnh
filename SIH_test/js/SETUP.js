function SETUP() {

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
    // -----------------  prevenir zoom ----------------------------------//
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
    // -----------------  prevenir zoom ----------------------------------//

/*---Deshabilitar temporalmente el botón de Consultar para no repetir AJAX---*/
    $("div.d>div").append("<div style='width:90px; height:33px; background-color:rgba(0,0,0,0);" +
				"position:relative;bottom:5px;border-radius:3px;'id='divDefense'></div>");

    $("div#tema_options").append("<div style='width:" + $('div#tema_options').css('width') +
		";height:22px;background-color:transparent;position:relative;bottom:22px;' id='optionsDefense'></div>")
/*---Deshabilitar temporalmente el botón de Consultar para no repetir AJAX---*/


    //----------------    Quitar filtro de búsqueda -------------------------//
    $("div#quitarFiltro").on("click", function() {
        params_especiales = null;
	current_TXT = false;
        var tablaVisible = $("div.overflow").filter(function() {
            return $(this).css("display") == "block";
        });

        var inx = tablaVisible.index();
        if(tablaVisible[0]) {
          var subtitulo_ = tablaVisible[0].parentNode.children[inx - 1];
          subtitulo_.click();
	}
	  $("input#filtroSerie").prop('disabled',false)
          document.querySelector("input#filtroSerie").value = "";
	 $(this).css("display","none")
    });
    //----------------    Quitar filtro de búsqueda -------------------------//
}
