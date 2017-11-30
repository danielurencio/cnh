$(function() {
  $("button#consultar").on("click",function() {

     $.ajax({
        url: "http://172.16.24.57/cubos_produccion.py",
        type: "post",
        datatype:"json",
        data: params,
        success: function(response){
          console.log(response);
        }
     });


  });


})
