prime-parallel-sieve
====================

Prime number parallel sieve in Erlang, Javascript, &amp; Java

Note: The code here is intended to be of an educational nature. The run-time performance numbers and comments are not language benchmarks, they are provided to invite discussion for improving the code.


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




