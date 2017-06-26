var server = require('http').createServer();
var io = require('socket.io')(server);
const dl = require('delivery');
var port = 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

io.on('connection', function(socket) {  
    console.log('Un cliente se ha conectado');
    delivery = dl.listen( socket );
    delivery.connect();
    delivery.on('delivery.connect',function(delivery){

      delivery.send({
        name: 'sample-image.jpg',
        path : './sample-image.jpg'
      });

      delivery.on('send.success',function(file){
        console.log('File successfully sent to client!');
      });

    });
});

