
import java.util.Arrays;
import java.util.stream.IntStream;
import java.util.Date;

//Java implementation implementation to find # of primes < N
//Takes 3 arguments N, R (number of Runs), lastN (warmed-up runs to average run time)

public class WarmPrimesJava {

    public static void main(String[] args) {
        
	long startTime = new Date().getTime();
	long endTime=0;
	long runTime=0;
	long accTime=0;
	long aveTime=0;

	int N = Integer.parseInt(args[0]);
	int R = Integer.parseInt(args[1]);
	int lastN = Integer.parseInt(args[2]);

	int SQ = (int)Math.floor(Math.sqrt(N));
	if (SQ%2==0) {SQ -= 1;}

	int[] Lpsq = SmallPrimes(SQ);

	int First = SQ+2;
	int Last = N;

	int ansSieve = 0;
	int numPrimes;

	for (int runCtr=0; runCtr<R; runCtr++){
	    ansSieve = Sieve(Lpsq , First, Last);
	    numPrimes = 1 + Lpsq.length + ansSieve;

	    endTime = new Date().getTime();
	    runTime = endTime - startTime;

	    System.out.println("Run #" + runCtr + ", time = " + runTime + " ms,  no. of primes = " + numPrimes);
	    
	    if (runCtr >= R-lastN){
		accTime += runTime;
	    }

	    if (runCtr==R-1){
		aveTime = (int) Math.round(accTime/lastN);
		System.out.println("Last " + lastN + " runs: Average run time = " + aveTime + " ms");
	    }

	    startTime = new Date().getTime();
	
	}
	
	
    }


    public static int[] SmallPrimes(int N){
	int A = 1 + (int)Math.floor((N-3)/2);
	int[] Lnums = new int[A];
	Arrays.fill(Lnums, 1);

	for (int i=3;i<=N;i+=2){
	    if (Lnums[(i-3)/2]==1) {
		for (int j=i*i; j<=N; j+=2*i){
		    Lnums[(j-3)/2] = 0;
		}
	    }
	}

	//System.out.println("Lnums=" + Arrays.toString(Lnums));
	int B = IntStream.of(Lnums).parallel().sum();

	int[] Lout = new int[B];

	int newk = 0;

	for (int k=0; k<Lnums.length; k++){
	    if (Lnums[k]==1){
		Lout[newk] = 2*k+3;
		newk++;		
	    }
	}

	return Lout;
    }

    
    public static int Sieve(int[] Lp, int First, int Last) {
        int arraySize = 1 + (int)Math.floor((Last-First)/2);
	int[] Lnums = new int[arraySize];

	int H;
	int xx;

        for (int i=First; i<=Last; i+=2){
	    Lnums[(int)Math.floor((i-First)/2)]=1;
	}

	for (int j=0;j<Lp.length;j++){
	    H = Lp[j];

	    if (H*H>=First){
		for (int k=H*H;k<=Last;k+=2*H){
		    xx = (int)Math.floor((k-First)/2);
		    
		    if (xx>=0) {
			Lnums[xx] = 0;
		    }

		}
	    } else {
		int l = (int)Math.floor((First-H*H)/(2*H));
		for (int k=H*H+2*l*H;k<=Last;k+=2*H){
		    xx = (int)Math.floor((k-First)/2);
		    
		    if (xx>=0) {
			Lnums[(int)Math.floor(xx)] = 0;
		    }

		}
	    }

	}


    int answer=0;

    for (int ctr=0;ctr<Lnums.length;ctr++){
        answer += Lnums[ctr];
    }

    return answer;


    }




}



