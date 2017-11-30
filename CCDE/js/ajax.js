$(function() {
  $("button#consultar").on("click",function() {
    var params = {};
    params['topic'] = $("select.filtros").find(":selected").text();
    params['start_year'] = $("select#start_year").find(":selected").text();
    params['end_year'] = $("select#end_year").find(":selected").text();
    params['start_month'] = $("select#start_month").find(":selected").text();
    params['end_month'] = $("select#end_month").find(":selected").text();
    params['period'] = $('input[name=periodicidad]:checked').val();
    params['title'] = '';
    params['subtitle'] = '';

    var str = "AJAX!\n\n"

    for(var k in params) {
      var chars = k.length + params[k].length;
      var spcs = ":";

      while(chars + spcs.length < 50) {
	spcs += ".";
      };

      str += k + spcs + params[k] + "\n";
    }

//    alert(str);

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
