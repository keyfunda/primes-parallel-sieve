primes-parallel-sieve
====================

Prime number parallel sieve in Erlang, Javascript, &amp; Java

Important Note: The code here is intended to be of an educational nature. The run-time performance numbers and comments should not be interpreted as language benchmarks, they are provided to invite discussion for improving the code.


Algorithm
---------
The code is based on the incremental form of the [Sieve of Eratosthenes](http://en.wikipedia.org/wiki/Sieve_of_eratosthenes), see [Ref [2]](http://en.wikipedia.org/wiki/Sieve_of_eratosthenes#cite_note-ONeill-2). There are several useful notes about coding prime sieves, a good starting point is the commentary [in this link] (http://codereview.stackexchange.com/questions/42420/sieve-of-eratosthenes-python). The fastest prime sieve presented here would be *at least* 10X slower than what could be achieved on the same hardware (using arrays sized to processor cache, using wheel factorization, etc).

The parallel version (across P processing elements), to find the primes below a given N, operates as follows:

    1. Find the set of primes Lp that are each less than S = sqrt(N)
    2. Split the odd numbers in [S,N] into P segments & sieve each with the set Lp
    3. Combine the results from each of the P resources

We might expect this simple algorithm to be embarassingly parallel, but there are issues like contention in a shared memory bus that could cause serial overhead in a processing element, refer to [Amdahl's law](http://en.wikipedia.org/wiki/Amdahl%27s_law).

To keep the console output simple and verifiable the code reports only the number of primes below N. For reference [the correct results](http://primes.utm.edu/howmany.shtml) are:

    N       Primes < N
    100     25
    1000    168
    1M      78498
    10M     664579
    100M    5761455


Erlang
------
Erlang release R17 was used to test the code.

All functions run on the same Erlang node. The erl shell was used to time the code using timer:tc/3

The module `sieve` in `sieve.erl` exports the following functions:

       Function/arity  	    args
       primes/1		    	N	   Simple sieve, slow
       primes_single/1      N	   Incremental sieve, single Erlang process
       primes_parr/2        N,P	   Incremental parallel sieve, P Erlang processes


node.js
-------
node v0.10.26 (V8 js engine) was used to test the code from the command line.

The cluster module was used to fork workers, the worker reports are collected via `process.send` and `worker.on`. Note that [`Array.prototype.reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce) is used in the `sieve` function.

Usage:  
`foo@bar:~/erlang$ node primes_parr.js N P`  
where P is the number of cluster workers.


vertx
-----
vertx 2.1 was used to test the command from the command line with Java 8 (java version "1.8.0").

There are two versions of the code - `java` uses Java worker verticles, while `js` uses Javascript workers via the Nashorn js engine. The js engine can be set in `langs.properties` to other engines e.g; Rhino.

Usage:  
Java worker verticle:		`foo@bar:~/vertx/java$ vertx run manager_java.js`  
Javascript worker verticle:	`foo@bar:~/vertx/js$ vertx run manager_js.js`  
The values of N and P are set in the source files, but they can also be passed to vertx via config. The code should be organized better as a module.

IMPORTANT: Ensure that the JVM is warmed before collecting run time information.


Test results
------------










