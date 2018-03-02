
self.addEventListener('message', function(e) {
  var msg = e.data.params;
  var params = '';

  for(var k in msg) {
    params += k + '=' + msg[k] + '&'
  };


  var xhr = new XMLHttpRequest();
  var url = e.data.url;

  xhr.open("GET", url+"?"+params, true);
  xhr.responseType = 'json'

  xhr.onreadystatechange = function() {
	if(xhr.readyState == 4 && xhr.status == 200) {
		var response = xhr.response//Text;
		self.postMessage(response);
	}
  }

  xhr.send(null);


}, false);
