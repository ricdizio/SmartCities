//const Raspi = require('raspi-io');
const five = require('johnny-five');
const io = require('socket.io-client');
const shell = require('shelljs');
const dl = require('delivery');
const fs  = require('fs');
const fork = require('child_process').fork;

/*const board = new five.Board({
  io: new Raspi()
});*/

var socket = io.connect('http://190.79.99.19:3001');
var delivery = dl.listen(socket);
var writePath = "./";

var childName = "idk.js";

var led = false;

var identifier = {
    id: 0,
    tag: "Raspberry 1"
};


function ping(){
    socket.emit('identifier', identifier);
}

function setup(){
    socket.on('connect', function(){

        socket.on('clientWritePath', function(path){
            writePath = path;
        });


        socket.on('command', function(command){
            var commandReturn = shell.exec(command);
            socket.emit('commandReturn', commandReturn);
        });

        socket.on('handshake', function(){
            // Si no se pone eso, el socket.id no se genera a tiempo.
            if(socket.id){
                identifier.id = socket.id;
                ping();
            }
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
        });

        socket.on('childKill', function(){
            shell.exec("sudo kill " + child.pid);
        });

        socket.on('childStart', function(){
            child = fork("./" + childName);
            console.log("Child PID: " + child.pid);
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

setup();
var child = fork("./" + childName);
console.log("Client ready");
console.log("Child PID: " + child.pid);



//board.on('ready', setup);