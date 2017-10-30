window.onscroll = function() {
  var color = getComputedStyle(document.body).getPropertyValue('--titulos');
  var tr = document.querySelectorAll("tbody.hide>tr:first-child");
//	.getBoundingClientRect().top - 110;
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
      $("tr.scroll_aid_header>th").css("color",color);
      $("tr.scroll_aid_header>th:not(:first-child)")
	.css("border","1px solid lightGray");

    } else if(!(els.every(allTrue) && all_Equal != 0 && largeOnesCond)) {
      $("tr.scroll_aid_header>th").css("color","white");
      $("tr.scroll_aid_header>th:not(:first-child)")
	.css("border","1px solid white");
    }

  }

};
