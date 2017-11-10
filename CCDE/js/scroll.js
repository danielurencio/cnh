window.onscroll = function() {
  var color = getComputedStyle(document.body).getPropertyValue('--titulos');
  var tr = document.querySelectorAll("tbody.hide>tr:first-child");

  var els = [];
  var offset = 132-38;

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
	.css("border","1px solid lightGray")

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

  var rows = $("div.overflow tr").filter(function(d) {
    return $(this).css("display") != "none";
  });

  rows_ = Array.prototype.slice.call(rows);

  if(rows.length > 0) {
    var lastRow = computeLastRow()
    var htmlScroll = document.documentElement.scrollHeight;
    console.log("last row: " + lastRow,"window: " + window.innerHeight);
    var diff = lastRow - window.innerHeight;

// Cuando la última fila esté por arriba del fondo de la ventana, que aparezca
// una fila más. Es así como, naturalmente, van a ir apareciendo las nuevas filas.

    if(lastRow < window.innerHeight) {
      d3.select("tr[tag='ocult']")
	.attr("tag",null)
	.style("display","block");

      lastRow = computeLastRow();
    }

// Si la diferencia entre la última fila y el alto de la ventana es negativa
// (la última fila está por arriba del final de la ventana), que aparezcan
// más filas en el fondo para que no se vea un espacio. Esto es para que sea
// fluido el scroll y que para el usuario no parezca que ya llego al final de
// la tabla.

    if(diff < 0) {
      var count = Math.abs(diff) / 17;

      for(var i=0; i<count; i++) {
	d3.select("tr[tag='ocult']")
	  .attr("tag",null)
	  .style("display","block");
      }
      lastRow = computeLastRow();
    }


//  Si la última fila está despues del alto de la ventana, scroll aid!

    if(lastRow  > window.innerHeight) {
	$("#footer").css("display","block");
    } else {
	$("#footer").css("display","none");
    }

  } // <-- If-statement para corroborar que existen filas en la pantalla!


  var upOcult = rows.filter(function(d) {
    return $(this)[0].getBoundingClientRect().bottom < ScrollHeader;
  });

  var upOcult_ = Array.prototype.slice.call(upOcult);
  for(var i in upOcult_) {
    $(upOcult_[i]).css("dispaly","none");
  }

};


function computeLastRow() {
  var rows = $("div.overflow tr").filter(function(d) {
    return $(this).css("display") != "none";
  });

  var rows_ = Array.prototype.slice.call(rows);
  var lastRow = rows_[rows_.length - 1].getBoundingClientRect().bottom;

  return lastRow;
};
