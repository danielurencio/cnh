var u_ = require("underscore");
var fs = require("fs")
var file = JSON.parse(fs.readFileSync("data.json","utf-8"))

var len = 4;
var end = 3;
var data = [];

var data 

var loop = function (index) {
  if (index === end) {
    console.log(data);
    return;
  }
  for (var i = index; i < len; i++) {
    data[index] = i; console.log(index)
    loop(index + 1); // <--- HERE
  }
}


function colapsables(obj,counter,limit,arr,parent_) {
  for (var k in obj) {
    if (typeof obj[k] == "object" && obj[k] !== null && counter < limit) {
      if(Object.keys(obj).indexOf(k) === 0 && !obj[k].length) {
        counter+=1; 
	arr.push({
	  "nivel":counter,
	  "labels":Object.keys(obj),
	  "parent":parent_
        })
      }
      parent_ = k;
      colapsables(obj[k],counter,limit,arr,parent_);
    }
  }
};

function segmentos(data,f1) {
  var arr = [];
  f1(data.data,0,data.keys,arr,'root');
  return arr;
};


function rec(arr) {
  for(var i in arr) {
    console.log(arr[i]);
    
  };
};
