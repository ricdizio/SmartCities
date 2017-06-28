const five = require('johnny-five');
const board = new five.Board({
    port: "COM21"
});

// PIN PAD

var password = "";
var col = [];
var row = [];
var i,j,pos=0;
var state=1, numpres, save=0;
var num = [
  ['1','2','3'],
  ['4','5','6'],
  ['7','8','9'],
  ['*','0','#']
];
var rowAux0,rowAux1,rowAux2,rowAux3;
var pulseCooldown=true;
var interval, intervalCooldown;

// SERVER 

var mysql = require('mysql');
var access;

var connection = mysql.createConnection({
    host     : '186.90.30.43',
    user     : 'test',
    password : 'test',
    database : 'noyagay'
});



board.on('ready', () => {
    console.log("ON");
    col[0] = new five.Pin(5);
    col[1] = new five.Pin(4);
    col[2] = new five.Pin(3);
    
    row[0] = new five.Pin({
        pin: 8,
        mode: 0,
        value: 0,
        type: "digital"
    });
    row[1] = new five.Pin({
        pin: 9,
        mode: 0,
        value: 0,
        type: "digital"
    });
    row[2] = new five.Pin({
        pin: 10,
        mode: 0,
        value: 0,
        type: "digital"
    });
    row[3] = new five.Pin({
        pin: 11,
        mode: 0,
        value: 0,
        type: "digital"
    });

    row[0].read(function(error, value) {
        rowAux0 = value;
    });
    row[1].read(function(error, value) {   
        rowAux1 = value;
    });
    row[2].read(function(error, value) {  
        rowAux2 = value
    });
    row[3].read(function(error, value) {
        rowAux3 = value
    });
    
    turn0();
});

function turn0(){
    clearInterval(interval);
    col[2].low();
    col[0].high();
    interval = setInterval(turn1, 50);
    if(pulseCooldown){
        checkRow(2);
    }
}

function turn1(){
    clearInterval(interval);
    col[0].low();
    col[1].high();
    interval = setInterval(turn2, 50);
    if(pulseCooldown){
        checkRow(0);
    }
}

function turn2(){
    clearInterval(interval);
    col[1].low();
    col[2].high();
    interval = setInterval(turn0, 50);
    if(pulseCooldown){
        checkRow(1);
    }
}

function checkRow(col){
    
    if(rowAux0==1){
        password+=(num[0][col]);
        pulseCooldown=false;
        intervalCooldown = setInterval(refreshCooldown,250);
        console.log(num[0][col]);
    } 
    else if(rowAux1==1){
        password+=(num[1][col]);
        pulseCooldown=false;
        intervalCooldown = setInterval(refreshCooldown,250);
        console.log(num[1][col]);
    } 
    else if(rowAux2==1){
        password+=(num[2][col]);
        pulseCooldown=false;
        intervalCooldown = setInterval(refreshCooldown,250);
        console.log(num[2][col]);
    } 
    else if(rowAux3==1){
        password+=(num[3][col]);
        pulseCooldown=false;
        intervalCooldown = setInterval(refreshCooldown,250);
        console.log(num[3][col]);
    } 

    if(password.length==4){                             //Finish reading 1210925
        console.log("Password: " + password);
        conectionVerify(password);
        password="";
    }
}

function refreshCooldown(){
    clearInterval(intervalCooldown);
    pulseCooldown = true;
}

function conectionVerify(password){
    connection.query("SELECT CLAVE from usuarios WHERE CLAVE='" + password + "'", function (error, results) {
        if (error) throw error;
        else if (results.length!=0) {
            if(results[0].CLAVE == password) {
                console.log("Acceso permitido");
            }
        }
        else{
                console.log("No puedes entrar por ser muy puta");
            }
    });
}
