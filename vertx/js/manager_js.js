
var vertx = require('vertx');
var console = require('vertx/console');
var container = require('vertx/container');
var timer = require('vertx/timer');


//Number below which primes are needed
var N = 10000000;

//Number of worker processes
var P = 1;

//Number of worker runs
var Runs = 20;

//lastN runs to be averaged for warmed-up run time
var lastN = 5;

//SQ
var SQ = Math.floor(Math.sqrt(N));
if (SQ%2==0) {SQ -= 1;}

var LPSQ = primes(SQ).length;

//Block size
var B = Math.round(N/P);

//current iteration
var numReported = 0;

//Acc for number of primes (result)
var numPrimes = 0;

var numRuns=0;

//EventBus
var eb = vertx.eventBus;

var startTime;
var endTime;
var timeTaken;
var accTime=0;
var aveTime;

function primes(N){

    var Lnums = [];

    for (var i=3;i<=N;i+=2){
        Lnums.push(true);
    }

    for (var i=3;i<=N;i+=2){
        if (Lnums[(i-3)/2]) {
            for (var j=i*i; j<=N; j+=2*i){
                //if (j==121){console.log("121: j="+j);}
                Lnums[(j-3)/2] = false;
            }
        }
    }

    //console.log("L59 = " + Lnums[59]);

    var Lout = [];

    Lnums.forEach(function(X,I){
        if (X) {
            Lout.push(3 + 2*I);

        }
    })

    return Lout;

}

var WorkerToManager = function(msg) {
    //console.log('Received message from Worker: ' + msg);

    ++numReported;
    numPrimes += parseInt(msg, 10);

    if (numReported==P) {
        endTime = new Date().getTime();
        numPrimes += LPSQ + 1;
        timeTaken = endTime - startTime;
        console.log("Run: " + numRuns + ", Time: " + timeTaken + " ms,  numPrimes = " + numPrimes);

        numRuns++;
        if (numRuns<Runs){
            numPrimes=0;
            numReported=0;
	    if (numRuns>=Runs-lastN){
		accTime += timeTaken;
	    }
            startTime = new Date().getTime();
            eb.publish('ManagerToWorker','go');
        } else {
            eb.publish('ManagerToWorker','stop');
	    aveTime = Math.round(accTime/lastN);
	    console.log("Average time for " + lastN + " runs: " + aveTime);
            container.exit();
        }
    }



}

var argsJSON;
var First, Last;


for (var ctr=0; ctr<P; ctr++){

    if (ctr==0){
        First = SQ+2;
    } else {
        First = ctr*B + 1;
    }

    Last = (ctr+1)*B;

    argsJSON = {
        "Pid": ctr,
        "First": First,
        "Last" : Last,
        "Runs": 20
    };

    eb.registerHandler('WorkerToManager', WorkerToManager, function(){
        container.deployWorkerVerticle("worker.js", argsJSON, function(err, deployID) {
            if (!err) {
                //console.log("Deployment ID: " + deployID);

            }
            else {
                console.log("Deployment failed! " + err.getMessage());
            }
        });
    });

}



//console.log("Manager start time =" + startTime);

timer.setTimer(2000, function(){
    startTime = new Date().getTime();
    eb.publish("ManagerToWorker", "go");
})







