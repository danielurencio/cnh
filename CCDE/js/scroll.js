window.onscroll = function() {
  var color = getComputedStyle(document.body).getPropertyValue('--titulos');
  var tr = document.querySelectorAll("tbody.hide>tr:first-child");

  var els = [];
  var offset = 132-38+20;

  for(var i in tr) {
    if(tr[i].nodeName == "TR") {
      els.push(tr[i].getBoundingClientRect().top - offset);
    }
  }

  function allTrue(element,index,array) {
    return element < 0;
  };

  function priorIsHidden(arr) {  // <-- Esta función puede ser útil.
    var cond = false;
    for(var i=1; i<arr.length; i++) {
       if(arr[i] > 0 && arr[i-1]<0) {
	cond = true;
	break
       }
    }
    return cond; 
  };

  if(els.length > 0) {
    var all_Equal = els.reduce(function(a,b) {
	return Math.abs(a) - Math.abs(b);
    });

    var largeOnes = els.filter(function(d) {
	return d > window.innerHeight;
    });

    var elsCopy = JSON.parse(JSON.stringify(els));

    for(var i in largeOnes) {
      elsCopy.splice(elsCopy.indexOf(largeOnes[i]),1);
    }

    var largeOnesCond = elsCopy.every(allTrue) && elsCopy < els;

    if((els.every(allTrue) && all_Equal != 0) || largeOnesCond) {
      $("tr.scroll_aid_header").attr("visible","yes");
      $("tr.scroll_aid_header>th").css("color",color);
      $("tr.scroll_aid_header>th:not(:first-child)")
	.css("border","1px solid lightGray");

    } else if(!(els.every(allTrue) && all_Equal != 0 && largeOnesCond)) {
      $("tr.scroll_aid_header").attr("visible","no");
      $("tr.scroll_aid_header>th").css("color","white");
      $("tr.scroll_aid_header>th:not(:first-child)")
	.css("border","1px solid white")

    }

  }

  if($("tr.scroll_aid_header").attr("visible") == "no") {
    $("tr.scroll_aid_header[visible='no']>th")
	.css("background","white");
  };

  if($(".overflow:visible")[0]) {
    var table_bottom = $(".overflow:visible")[0]
	.getBoundingClientRect().bottom + 10;
    var scroll_h_bottom = $(".scroll_header")[0]
	.getBoundingClientRect().bottom; 

    if(table_bottom <= scroll_h_bottom) {
      $("tr.scroll_aid_header").attr("visible","no");
      $("tr.scroll_aid_header>th").css("color","white");
      $("tr.scroll_aid_header>th:not(:first-child)")
	.css("border","1px solid white")

    }

/* // Si el fondo de la tabla es mayor al tamaño de la ventama, que salga scroll.
    if(table_bottom > window.innerHeight) {
	$("#footer").css("display","block");
    } else {
	$("#footer").css("display","none");
    }
*/
  }

/////////////////////////////////////////////////////////////////////
///////////// Aparecer y desaparecer filas según el viewport
/////////////////////////////////////////////////////////////////////
if(SS_){
  var rows = $("div.overflow tr").filter(function(d) {
    return $(this).css("display") != "none";
  });

  var rows_ = Array.prototype.slice.call(rows);

  if(rows.length > 0) {
    var lastRow = computeLastRow()[1];
    var firstRow = computeLastRow()[0];

    var htmlScroll = document.documentElement.scrollHeight;

    var diff_first = ScrollHeader - firstRow;
    var diff_last = lastRow - window.innerHeight;

// Cuando la última fila esté por arriba del fondo de la ventana, que aparezca
// una fila más. Es así como, naturalmente, van a ir apareciendo las nuevas filas.

    if(lastRow < window.innerHeight) {
      var ff = d3.select("tr[tag='ocult']")
	.attr("tag",null)
	.style("display","block");


/////////////////// COLOR FIX //////////////////////////////////////////////
      colorFIX(ff);
/////////////////// COLOR FIX //////////////////////////////////////////////

      lastRow = computeLastRow()[1];
    }

// Si la diferencia entre la última fila y el alto de la ventana es negativa
// (la última fila está por arriba del final de la ventana), que aparezcan
// más filas en el fondo para que no se vea un espacio. Esto es para que sea
// fluido el scroll y que para el usuario no parezca que ya llego al final de
// la tabla.

    if(diff_last < 0) {
      var count = Math.abs(diff_last) / 17;

      for(var i=0; i<count; i++) {
	var ff = d3.select("tr[tag='ocult']")
	  .attr("tag",null)
	  .style("display","block")


/////////////////// COLOR FIX //////////////////////////////////////////////
	colorFIX(ff);
/////////////////// COLOR FIX //////////////////////////////////////////////

      }
      lastRow = computeLastRow()[1];
    }


//  Si la última fila está despues del alto de la ventana, scroll aid!

    if(lastRow  > window.innerHeight) {
	$("#footer").css("display","block");
    } else {
	$("#footer").css("display","none");
    }

  } // <-- If-statement para corroborar que existen filas en la pantalla!


/////////////////////////////////////////////////////////////////////////////
//////////// Desaparecer filas según la posición del scroll ////////////////
///////////////////////////////////////////////////////////////////////////

// Todas las filas que estén arriba de la posición n (n=1000) serán ocultadas.
  var n = 1000;

  var upOcult = rows.filter(function(d) {
    return $(this)[0].getBoundingClientRect().bottom < -n//ScrollHeader;
  });

  d3.selectAll(upOcult)
    .style("display","none")
    .attr("tag","arriba");



// Si la primera fila de la tabla es

  var arriba = $("div.overflow tr").filter(function(d) {
    return $(this).attr("tag") == "arriba" && $(this).css("display") == "none";
  });

  if(firstRow > -n) {
      var ff = d3.select(arriba[arriba.length-1])
	.attr("tag",null)
	.style("display","block");


/////////////////// COLOR FIX //////////////////////////////////////////////
	colorFIX(ff);
/////////////////// COLOR FIX //////////////////////////////////////////////

      firstRow = computeLastRow()[0];
  }


    if(diff_first < 0) {
      var count_ = Math.abs(diff_first) / 17;

      for(var i=1; i<=count_+1; i++) {
	if(arriba[arriba.length - i]) {
	  var ff = d3.select(arriba[arriba.length - i])
	    .attr("tag",null)
	    .style("display","block");

/////////////////// COLOR FIX //////////////////////////////////////////////
	  colorFIX(ff);
/////////////////// COLOR FIX //////////////////////////////////////////////

        }
      }
      firstRow = computeLastRow()[0];
    }


    if(document.querySelectorAll("div.overflow").length > 0) {
     try {
        var tableTitle = $("div.overflow").filter(function() {
           return $(this).css("display") == "block"
        })[0]
       .parentNode.children[0]
       .getBoundingClientRect().bottom;

        if(tableTitle > ScrollHeader) {
           var ff = d3.selectAll(arriba)   // <-- No todas, sólo algunas!
	    .attr("tag",null)
	    .style("display","block");

/////////////////// COLOR FIX //////////////////////////////////////////////
	   colorFIX(ff);
/////////////////// COLOR FIX //////////////////////////////////////////////

        }

      } catch(err) {
	console.log(err);
      }

    }


// Las filtas de abajo que no estén ocultas se ocultarán cuando se haga scroll
// hacia arriba.

    var abajo = rows.filter(function() {
      return $(this)[0].getBoundingClientRect().top > window.innerHeight
    });

    d3.selectAll(abajo)
      .attr("tag","ocult")
      .style("display","none")

//  console.log(rows);
 }
};


function computeLastRow() {
  var rows = $("div.overflow tr").filter(function(d) {
    return $(this).css("display") != "none";
  });

  var rows_ = Array.prototype.slice.call(rows);
  var firstRow = rows_[1].getBoundingClientRect().bottom;
  var lastRow = rows_[rows_.length - 1].getBoundingClientRect().bottom;

  return [firstRow,lastRow];
};


function colorFIX(rows) {
/*
      var appearingRow = $(rows._groups[0][0]);
      var color_TAG = appearingRow.first().css("background-color");
//      var color_TAG = appearingRow.attr("color_tag");
      if(appearingRow[0]) {
//        $(appearingRow[0].querySelectorAll("td")).css("background","transparent");
	appearingRow.css("background-color","transparent");
        $(appearingRow[0].querySelectorAll("td")).css("background",color_TAG);
      }
*/
    

}
