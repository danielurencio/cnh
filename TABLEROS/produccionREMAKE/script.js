
            $(function()
            {
                $('#clickme').click(function(){
                //    alert('Im going to start processing');
  var fecha = document.getElementById("fecha").value
//  fecha = fecha.split("-")
                    $.ajax({
                        url: "ajaxpost.py",
                        type: "post",
                        datatype:"json",
                        data: {'fecha': fecha },
                        success: function(response){
                            console.log(response);
			    if(d3.select("#tabla")) d3.select("#tabla").html("");
			    d3.select("#tabla").html(response.data.t.tabla);
			    d3.select("#date").html(response.data.fecha);
                        }
                    });
                });
            });
	    

