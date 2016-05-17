var express = require('express');
var server = express();
 
var SERVER = {
  IP: '0.0.0.0',
  PORT: 3000
}  

server.use(express.static(__dirname));

server.listen(SERVER.PORT, SERVER.IP, function onStart(err) {
  if (err) {
    console.log(err);
  } else {
    console.info('Server ready: http://' + SERVER.IP + ':' + SERVER.PORT);
  }
});
