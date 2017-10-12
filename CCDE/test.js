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


function rec(obj) {
  for(var k in obj) {
    if(typeof obj[k] == "object" && obj[k] !== null) {
      var n_obj = {};
      n_obj["celdas"] = k;
      n_obj["array"] = obj[k].length ? obj[k] : false;
      if(!n_obj["array"]) n_obj["rowspan"] = Object.keys(obj[k]).length;
      console.log(n_obj);
      rec(obj[k])
    }
  }
}



function appendRecursively(obj,arr) {
  for(var k in obj) {
    if(typeof obj[k] == "object" && obj[k] !== null) {
      var n_obj = {};
      n_obj["celdas"] = k;
      n_obj["array"] = obj[k].length ? obj[k] : false;
      if(!n_obj["array"]) {
	n_obj["rowspan"] = Object.keys(obj[k]).length;
      }
      arr.push(n_obj)      
      appendRecursively(obj[k],arr)
    }
  }
}

function dif(arr) {
  var n = 0;
  var holder = [];
  var new_arr = [];
  while(n<arr.length) {
   if(n == 0) new_arr.push(arr[n])
   if(n > 0) {
     if(arr[n].rowspan && !arr[n-1].rowspan) {
	holder.push(new_arr);
	new_arr = [];
	new_arr.push(arr[n]);
     }
     if(arr[n-1].rowspan && arr[n].rowspan && arr[n-1].rowspan > arr[n].rowspan) {
	new_arr.push(arr[n]);
     }
     if(arr[n].array) { new_arr.push(arr[n]) }
   }
   n += 1;
  }
  return holder
};

function segmentos(data,f1) {
  var arr = [];
  f1(data.data,0,data.keys,arr,'root');
  return arr;
};


