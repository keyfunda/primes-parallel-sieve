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


Java
----
The Java code is single threaded. It is provided for reference because the same code is used in vertx Java.

Usage:  
`foo@bar:~/java$ javac WarmPrimesJava.java`  
`foo@bar:~/java$ java WarmPrimesJava N R L`
where R is the number of runs, and L is the "last few runs" for averaging the run time (hence R-minus-L is the number of JVM warm-up runs).


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

Note that the js code uses 'var IntArray = Java.type("int[]")' to define the js array as a Java type. This is not done in the Primes function since its argument is O(sqrt(N)).

Usage:  
Java worker verticle:		`foo@bar:~/vertx/java$ vertx run manager_java.js`  
Javascript worker verticle:	`foo@bar:~/vertx/js$ vertx run manager_js.js`  
The values of N and P are set in the source files, but they can also be passed to vertx via config. The code should be organized better as a module.

IMPORTANT: Ensure that the JVM is warmed before collecting run time information.


Test results
------------
Important Note: These numbers and comments should not be interpreted as language benchmarks, they are provided to invite discussion for improving the code. Any shortcoming should be primarily attributed to the code provided herein & not the languages or runtimes which they employ.

Operating system: Ubuntu Trusty 14.04 LTS.
Hardware: Cloud machine with 8 virtualized CPU's and 30GB memory.
Access: ssh shell, bash with tmux (no desktop load)

All times are in seconds.   

###100M primes (5761455)
	P		Erlang		node.js				 vert.x   
										js			Java   
	1		36.07		10.24			8.44		1.15   
	2		18.73		 5.03			5.30		0.63   
	4		 9.66		 2.67			3.47		0.55   
	8		 8.06		 2.76			2.97		0.43   

In each case [glances](http://nicolargo.github.io/glances/) was used to verify CPU usage i.e; the processors were being exercised per P.

###Discussion
It is probably not surprising that the Erlang code runs 30X slower than the Java code, since copies of large immutable lists are being passed around. Attempts were made to write mutable structures in Erlang, before staying with idiomatic Erlang. No doubt certain types of heavy computation in Erlang would be best handled via well-tuned NIF's in C or Java.

The Erlang syntax seems to naturally lead even beginners to write concise and readable code. The `primes_single` Erlang function is all of 4 lines of code. This functional style is similar to the Haskell example (see [Ref [2] in the Wikipedia article](http://en.wikipedia.org/wiki/Sieve_of_eratosthenes#cite_note-ONeill-2).

It was a pleasant surprise - at least for the author - to see the js Nashorn code perform as well as the js V8.

Since this was the author's very first experience writing Java code, it was educative to find that the Java code outperformed everything else.

The polyglot features of vert.x, combined with its EventBus plumbing, make it an attractive candidate for those from the Javascript and Python worlds seeking a reactive distributed systems programming environment. Heavy computations can be idiomatically passed on to Java worker verticles.

The scaling across P needs further discussion in view of the embarassingly parallel nature of the algorithm. The initial ~2X scaling gain for every doubling of P drops sharply going from P=4 to P=8.

Comments and suggestions for improvement are welcome, feel free to fork the code and play with it.












