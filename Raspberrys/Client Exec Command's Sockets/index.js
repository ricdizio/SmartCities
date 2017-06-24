const shell = require('shelljs');
const io = require('socket.io-client');

const socket = io.connect('http://190.79.99.19:3000');
socket.on('back', function(data){
	console.log(data);
});
const readline = require('readline');
var log = console.log;

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function back (data){
	console.log(data);
}
var recursiveAsyncReadLine = function () {
  rl.question('Command: ', function (answer) {
    if (answer == 'exit') //we need some base case, for recursion
      return rl.close(); //closing RL and returning from function.
    //log('Got it! Your answer was: "', answer, '"');
    socket.emit('command', answer);
    recursiveAsyncReadLine(); //Calling this function again to ask new question
  });
};

recursiveAsyncReadLine(); //we have to actually start our recursion somehow