window.onscroll = function() {
  var color = getComputedStyle(document.body).getPropertyValue('--titulos');
  var tr = document.querySelectorAll("tbody.hide>tr:first-child");
//	.getBoundingClientRect().top - 110;
  var els = [];
  var offset = 132;

  for(var i in tr) {
    if(tr[i].nodeName == "TR") {
      els.push(tr[i].getBoundingClientRect().top - offset);
    }
  }

  function allTrue(element,index,array) {
    return element < 0 //&& element != -offset;
  };


  if(els.every(allTrue)) {
    console.log(els)
    $("tr.scroll_aid_header>th").css("color",color);
    $("tr.scroll_aid_header>th:not(:first-child)")
	.css("border","1px solid lightGray")

  } else {
    $("tr.scroll_aid_header>th").css("color","white");
    $("tr.scroll_aid_header>th:not(:first-child)").css("border","none");
  }
};
