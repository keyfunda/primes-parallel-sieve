
console.time("parprimes");

//Takes two arguments N, numCPUs

//number below which we want to find primes
var N = parseInt(process.argv[2], 10);

//number of threads, for cluster
var numCPUs = parseInt(process.argv[3], 10);

//libraries
var cluster = require('cluster');


var numReported=0, numPrimes= 0;


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

    var Lnums = [];
    var H;
    var xx;
    
    for (var i=First; i<=Last; i+=2){
        Lnums.push(true);
    }



    for (var j=0;j<Lp.length;j++){
        H = Lp[j];

        if (H*H>=First){
            for (var k=H*H;k<=Last;k+=2*H){
                xx = Math.floor((k-First)/2);
                if (xx>=0) {
                     Lnums[Math.floor(xx)] = false;
                    }

            }
        } else {
            var l = Math.floor((First-H*H)/(2*H));
            for (var k=H*H+2*l*H;k<=Last;k+=2*H){
                xx = Math.floor((k-First)/2);
                if (xx>=0) {
                    Lnums[Math.floor(xx)] = false;
                }

            }
        }



    }


    return Lnums.reduce(function(x,y){
        return x+y;
    }, 0);

}


//Fork cluster processes
if (cluster.isMaster) {

    var FirstM, LastM;

    var SQ = Math.floor(Math.sqrt(N));
    if (SQ%2==0){SQ=SQ+1;}

    var B = Math.round(N/numCPUs);

    // Fork workers.
    for (var ctr = 0; ctr < numCPUs; ctr++) {

        if (ctr==0){
            FirstM = SQ+2;
        } else {
            FirstM = ctr*B + 1;
        }

        if (FirstM%2==0){FirstM+=1;}

        LastM = (ctr+1)*B;

        var worker = cluster.fork({
            "Pid": ctr,
            "First" : FirstM,
            "Last" : LastM
        });

        worker.on('message', function(msg) {
            //console.log('Received message from Worker: ' + msg);

            ++numReported;
            numPrimes += parseInt(msg, 10);

            if (numReported==numCPUs) {
                var lenPSQ = primes(SQ).length;
                numPrimes += lenPSQ + 1;
                console.log("NumPrimes = " + numPrimes);
                console.timeEnd("parprimes");
                process.exit();
            }
        });
    }



    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' exited');
    });


}
else {



    var conConf = process.env;

    var Pid = conConf["Pid"];
    var First = parseInt(conConf["First"],10);
    var Last = parseInt(conConf["Last"],10);

    //console.log('Pid=' + Pid + ' First=' + First + ' Last=' + Last);


    if (Last >= First){
        var SQ = Math.ceil(Math.sqrt(Last));

        var Lp = primes(SQ);

        console.log("Worker Pid=" + Pid + ", First=" + First + ", Last=" + Last + ", Length of Lp=" + Lp.length);

        process.send(sieve(Lp, First, Last));
    } else {
        console.log("Why here? First=" + First + ", Last=" + Last);
        process.send(0);
    }

    process.exit();
}


process.on('exit', function(code){
    console.log('main exited');
});

