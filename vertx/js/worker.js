
var vertx = require('vertx');
var container = require('vertx/container');
var console = require('vertx/console');

var eb = vertx.eventBus;




function primes(N){

    var Lnums = [];

    for (var i=3;i<=N;i+=2){
        Lnums.push(true);
    }

    for (var i=3;i<=N;i+=2){
        if (Lnums[(i-3)/2]) {
            for (var j=i*i; j<=N; j+=2*i){
                Lnums[(j-3)/2] = false;
            }
        }
    }

    var Lout = [];

    Lnums.forEach(function(X,I){
        if (X) {
            Lout.push(3 + 2*I);

        }
    })

    return Lout;

}

function sieve(Lp, First, Last){

    var IntArray = Java.type("int[]");

    var arraySize = 1 + Math.floor((Last-First)/2);

    var Lnums = new IntArray( arraySize );

    var H;
    var xx;

    for (var i=First; i<=Last; i+=2){
        Lnums[Math.floor((i-First)/2)]=1;
    }


    for (var j=0;j<Lp.length;j++){
        H = Lp[j];

        if (H*H>=First){
            for (var k=H*H;k<=Last;k+=2*H){
                xx = Math.floor((k-First)/2);
                if (xx>=0) {
                    Lnums[xx] = 0;
                }

            }
        } else {
            var l = Math.floor((First-H*H)/(2*H));
            for (var k=H*H+2*l*H;k<=Last;k+=2*H){
                xx = Math.floor((k-First)/2);
                if (xx>=0) {
                    Lnums[Math.floor(xx)] = 0;
                }

            }
        }



    }


    var answer=0;

    for (var ctr=0;ctr<Lnums.length;ctr++){
        answer += Lnums[ctr];
    }

    return answer;
}

var ManagerToWorker = function(msg) {
    //console.log('Received message from Manager: ' + message);
    if (msg=="go"){
	runOnce();
    } else if (msg=="stop"){
	container.exit();
    }

}


eb.registerHandler('ManagerToWorker', ManagerToWorker, function(){
    console.log("ManagerToWorker handler registered by worker");
});



function runOnce(){
    var conConf = container.config;
    //console.log('config = ' + JSON.stringify(conConf));

    var Pid = conConf["Pid"];
    var First = conConf["First"];
    var Last = conConf["Last"];


    if (Last > First) {
	var SQ = Math.ceil(Math.sqrt(Last));
	if (SQ % 2 == 0) {
            SQ -= 1;
	}

	var Lp = primes(SQ);
	var ans = sieve(Lp, First, Last);
	eb.send('WorkerToManager', ans);
    }    

}








