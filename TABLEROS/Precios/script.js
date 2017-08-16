$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "jj.json",
        dataType: "json",
        success: function(data) {
	  var serie = data.map(function(d) {
	    var fecha = d.FECHA.split("/");
//	    console.log(fecha[2],fecha[1],fecha[0])
	    fecha = new Date(fecha[1] + "/" + fecha[0] + "/" + fecha[2]);
	    fecha = fecha.getTime();
	    return [fecha,d.BRENT];
	  });
	  var GRAF = new SerieDeTiempo(serie);
	  GRAF.graficar();
//	  console.log(serie);
	}
     });
});

function SerieDeTiempo(data) {
   this.data = data;
};

 SerieDeTiempo.prototype.title = "";
 SerieDeTiempo.prototype.graficar = function() {
    Highcharts.chart('container', {

    title: {
        text: ''
    },

    subtitle: {
        text: ''
    },

    yAxis: {
        title: {
            text: ''
        }
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },

    plotOptions: {
        series: {
            pointStart: 2010
        }
    },

    series: [{
//        name: 'Installation',
        data: this.data
    }]

});

 };
