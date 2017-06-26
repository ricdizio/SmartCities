const io = require('socket.io-client');
const socket = io.connect('http://127.0.0.1:3000');
const dl = require('delivery');
const fs  = require('fs');

  
socket.on('connect', function(){
  var delivery = dl.listen(socket);
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
  });
});