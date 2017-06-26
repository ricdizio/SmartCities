const io = require('socket.io-client');
const shell = require('shelljs');

var socket = io.connect('http://190.79.99.19:3001');

// Para identificar cada raspb por ahora.
var identifier = {
    id: 0,
    tag: "Raspberry Noya"
};

socket.on('handshake', function(){
    // Si no se pone eso, el socket.id no se genera a tiempo.
    if(socket.id){
        identifier.id = socket.id;
        ping();
    }
});

socket.on('command', function(command){
    console.log(command);
    shell.exec(command);
});


function ping(){
    socket.emit('identifier', identifier);
}

console.log("Client ready");