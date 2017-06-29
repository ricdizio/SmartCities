
var main = function () {
    var v4l2camera = require("../");
    var io = require("../node_modules/socket.io-client");
    var socket = io.connect('http://190.79.99.19:3000');
    var pantalla; 
    var cam = new v4l2camera.Camera("/dev/video0");
    if (cam.configGet().formatName !== "YUYV") {
        console.log("YUYV camera required");
        process.exit(1);
    }
    cam.configSet({width: 320, height:240});
    cam.start();
    console.log('despues del cam.start')
    times(6, cam.capture.bind(cam), function () {
		pantalla = 'texto';
		console.log('despues del socket emit')
		cam.stop();
    });
    console.log("w: " + cam.width + " h: " + cam.height);
    socket.emit('rgb',pantalla);
};

var times = function (n, async, cont) {
    return async(function rec(r) {return --n == 0 ? cont(r) : async(rec);});
};

main();
