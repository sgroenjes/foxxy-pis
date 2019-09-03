var net = require('net')

setInterval(connectAndGetRssis,1000)

function connectAndGetRssis() {
  var client = new net.Socket();
  client.connect(1124, '127.0.0.1', function() {
    setTimeout(() => client.write('bluetooth\n'),500);
  });

  client.on('data', function(data) {
    console.log(data.toString());
    client.destroy(); // kill client after server's response
  });
}