
self.addEventListener('message', function(e) {
  var msg = e.data.params;
  var params = '';

  for(var k in msg) {
    params += k + '=' + msg[k] + '&'
  };

  console.log(params);

  var xhr = new XMLHttpRequest();
//  xhr.open()
  var url = e.data.url//"xhr://172.16.24.57/cubos_cuadros.py";

  xhr.open("GET", url+"?"+params, true);
//  xhr.setRequestHeader('Content-type', 'text/plain')
  xhr.responseType = 'json'

  xhr.onreadystatechange = function() {
	if(xhr.readyState == 4 && xhr.status == 200) {
		var response = xhr.response//Text;
		self.postMessage(response);
//		self.close()
	}
  }

  xhr.send(null);


}, false);
