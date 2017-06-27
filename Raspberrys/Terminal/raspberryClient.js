const Raspi = require('raspi-io');
const five = require('johnny-five');
const io = require('socket.io-client');
const shell = require('shelljs');
const dl = require('delivery');
const fs  = require('fs');

const board = new five.Board({
  io: new Raspi()
});

var socket = io.connect('http://190.79.99.19:3001');
var delivery = dl.listen(socket);
var writePath = "./";

var pin;

var led = false;

var identifier = {
    id: 0,
    tag: "Raspberry 1"
};


function ping(){
    socket.emit('identifier', identifier);
}

function setup(){
    pin = new five.Pin('P1-7');

    socket.on('connect', function(){

        socket.on('clientWritePath', function(path){
            writePath = path;
        });

        socket.on('handshake', function(){
            // Si no se pone eso, el socket.id no se genera a tiempo.
            if(socket.id){
                identifier.id = socket.id;
                ping();
            }
        });

        socket.on('command', function(command){
            if(command == "high"){
                pin.high();
            }
            else if (command == "low"){
                pin.low();
            }
            else{
                var commandReturn = shell.exec(command);
                socket.emit('commandReturn', commandReturn);
            }
        });

        socket.on('handshake', function(){
            // Si no se pone eso, el socket.id no se genera a tiempo.
            if(socket.id){
                identifier.id = socket.id;
                ping();
            }
        });

        delivery.on('receive.start', function(fileUID){
            console.log('Receiving a file!');
        });

        delivery.on('receive.success', function(file){
            fs.writeFile(writePath + file.name, file.buffer, function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log('File saved.');
                };
            });
        });
    });

    
}

function ping(){
    socket.emit('identifier', identifier);
}

console.log("Client ready");

board.on('ready', setup);