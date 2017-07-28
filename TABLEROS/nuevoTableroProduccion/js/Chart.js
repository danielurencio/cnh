function Chart(selection,margin,parseDate) {
  this.datasets = {}
  this.Nacional = true;
  this.getData = function(x) {
   this.data = x;
// Parse the date / time
   this.data.forEach(function(d) {
     d.date = parseDate(d.date);
     d.close = +d.close;
   });
  };

 this.axisTransition = function(x,activ) {
   var newData = x;
   newData.forEach(function(d) { 
     d.date = parseDate(d.date);
     d.close = +d.close;
   })

   if(!activ.erase) this.datasets[activ.field] = newData;
   var newDateExt = d3.extent(newData, function(d) { return d.date; });
   var newCloseExt = d3.extent(newData, function(d) { return d.close; });

   if(this.Nacional) {
     this.yMin = newCloseExt[0];
     this.yMax = newCloseExt[1];
     this.xMin = newDateExt[0];
     this.xMax = newDateExt[1];
     this.Nacional = false;
   } else { 
     var closeVals = [],dateVals = [];
     for(var k in this.datasets) {
	var closes = this.datasets[k].map(function(d) { return d.close; });
	var dates = this.datasets[k]
	  .map(function(d) { return d.date; });

	closeVals = closeVals.concat(closes);
	dateVals = dateVals.concat(dates);
     }
     this.yMax = d3.max(closeVals);
     this.yMin = d3.min(closeVals);
     this.xMin = d3.min(dateVals);//newDateExt[0];
     this.xMax = d3.max(dateVals);//newDateExt[1];
   }


     this.Y.domain([this.yMin,this.yMax]);
     this.X.domain([this.xMin,this.xMax]);
     var yScale = this.Y, xScale = this.X;
     var yAx = d3.select("g#y");
     var xAx = d3.select("g#x");
     yAx.transition().duration(500).call(this.yAxis);
     xAx.transition().duration(500).call(this.xAxis);

   var datasets = this.datasets;
   var valueline = this.valueline;
   var innerChart = d3.select("g.innerChart");

   innerChart.transition().selectAll(".line")
	.attr("d",function(d) { 
	  var id = d3.select(this).attr("id");
	  var line = d3.svg.line()
	    .x(function(doc) { return xScale(doc.date); })
	    .y(function(doc) { return yScale(doc.close); });

	  return line(datasets[id]);
	})
	.attr("stroke-dasharray",null);

   var newLine = d3.select("#" + activ.field);
   if(!newLine.node() && !activ.erase) {
      innerChart.append("path")
       .attr("class", "line")
       .attr("id",activ.field)
       .attr("d", this.valueline(newData))
       .attr("stroke-dasharray",function(d){
         var largo = d3.select(this).node().getTotalLength();
         return String(largo) + " " + String(largo);
       })
       .attr("stroke-dashoffset",function(d) {
         var largo = d3.select(this).node().getTotalLength();
         return largo;
       })
       .transition()
         .duration(800)
         .attr("stroke-dashoffset",0);
   };
 };

 var width = margin.width - margin.left - margin.right;
 var height = margin.height - margin.top - margin.bottom;

// Set the ranges
 this.X = d3.time.scale().range([0, width]);
 this.Y = d3.scale.linear().range([height, 0]);
 this.x_Scale = this.X, this.y_Scale = this.Y;

// Define the axes
 this.xAxis = d3.svg.axis().scale(this.X)
  .orient("bottom").ticks(5);

 this.yAxis = d3.svg.axis().scale(this.Y)
  .orient("left").ticks(5);

// Define the line
 this.valueline = d3.svg.line()
  .interpolate("linear")
  .x(function(d) { return this.x_Scale(d.date); })
  .y(function(d) { return this.y_Scale(d.close); });

  this.Render = function() {
   var data = this.data;
// Adds the svg canvas
   var svg = d3.select(selection)
    .append("g").attr("id","chart")
   .append("svg").style({"display":"block","margin":"auto"})
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g").attr("class","innerChart")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");

   this.DateExt = d3.extent(data, function(d) { return d.date; });
   this.CloseExt = d3.extent(data, function(d) { return d.close; });
   this.yMax = this.CloseExt[1]
   this.yMin = this.CloseExt[0]
// Scale the range of the data
   this.X.domain(this.DateExt);
   this.Y.domain(this.CloseExt);

// Add the valueline path.
   svg.append("path")
    .attr("class", "line")
    .attr("d", this.valueline(data))
    .attr("stroke-dasharray",function(d){
      var largo = d3.select(".line").node().getTotalLength();
      return String(largo) + " " + String(largo);
    })
    .attr("stroke-dashoffset",function(d) {
      var largo = d3.select(".line").node().getTotalLength();
      return largo;
    })
    .transition()
      .duration(800)
      .attr("stroke-dashoffset",0);

// Add the X Axis
   svg.append("g")
    .attr("class", "axis")
    .attr("id","x")
    .attr("transform", "translate(0," + height + ")")
    .call(this.xAxis);

// Add the Y Axis
   svg.append("g")
    .attr("class", "axis")
    .attr("id","y")
    .call(this.yAxis);


    if(margin.transform) {
      var x = margin.transform[0];
      var y = margin.transform[1];
      d3.select("g#chart")
       .attr("transform","translate(" + x + "," + y + ")");
    }
  }
}
