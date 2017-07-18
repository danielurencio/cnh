/*
function MAPA() {
  var obj = {
   selection:'g#mapa',
   type:'rect',
   append:1,
   attr: {
     width:width/2,
     height:height,
     x:0,
     y:0,
     transform:'translate(' + width/2 + ',0)'
   }
  };

  addElement(obj);
}; 
*/
d3.select("g#mapa").append("g").attr("class","hola"); 
