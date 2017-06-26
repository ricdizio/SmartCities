const Raspi = require('raspi-io');
const five = require('johnny-five');
const io = require('socket.io-client');
const shell = require('shelljs');

const board = new five.Board({
  io: new Raspi()
});

var socket = io.connect('http://190.79.99.19:3001');

var pin;

var led = false;

var identifier = {
    id: 0,
    tag: "Raspberry 1"
};


function action(){
    if(led){
        console.log("High")
        pin.high();
    }
    else{
        console.log("Low")
        pin.low();
    }
}

function ping(){
    socket.emit('identifier', identifier);
}

function setup(){
    pin = new five.Pin('P1-7');

    socket.on('handshake', function(){
        // Si no se pone eso, el socket.id no se genera a tiempo.
        if(socket.id){
            identifier.id = socket.id;
            ping();
        }
    });

    socket.on('command', function(command){
        if(command == "true"){
            led = true;
        }
        else{
            led = false;
        }
        action();
    });

    action();
}

board.on('ready', setup);