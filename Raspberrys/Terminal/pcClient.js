const io = require('socket.io-client');
const shell = require('shelljs');

var socket = io.connect('http://190.79.99.19:3001');

var delivery = dl.listen(socket);

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


delivery.on('receive.start',function(fileUID){
    console.log('receiving a file!');
});

delivery.on('receive.success',function(file){
    fs.writeFile(file.name,file.buffer, function(err){
        if(err){
            console.log('File could not be saved.');
        }else{
            console.log('File saved.');
        };
    });
}

function ping(){
    socket.emit('identifier', identifier);
}

console.log("Client ready");