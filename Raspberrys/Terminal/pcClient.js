const io = require('socket.io-client');
const shell = require('shelljs');
const dl = require('delivery');
const fs  = require('fs');

var socket = io.connect('http://190.79.99.19:3001');

var delivery = dl.listen(socket);

// Para identificar cada raspb por ahora.
var identifier = {
    id: 0,
    tag: "Raspberry Noya"
};

var writePath = "./";

socket.on('connect', function(){

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

    socket.on('clientWritePath', function(path){
        writePath = path;
    });

    socket.on('getFile', function(fileName, clientPath){

        delivery.connect();

        delivery.on('delivery.connect',function(delivery){
            delivery.send({
                name: fileName,
                path : clientPath
            });

            delivery.on('send.success',function(file){
                console.log('File successfully sent to client!');
            });
        });
    })

    delivery.on('receive.start',function(fileUID){
        console.log('Receiving a file!');
    });

    delivery.on('receive.success',function(file){
        fs.writeFile(writePath + file.name, file.buffer, function(err){
            if(err){
                console.log(err);
            } else{
                console.log('File saved.');
            };
        });
    });

});


function ping(){
    socket.emit('identifier', identifier);
}

console.log("Client ready");