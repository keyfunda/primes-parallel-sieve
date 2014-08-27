
import java.util.Arrays;
import java.util.stream.IntStream;
//import org.apache.commons.lang3.ArrayUtils;
import org.vertx.java.platform.Verticle;
import org.vertx.java.platform.Container;
import org.vertx.java.core.json.*;
import org.vertx.java.core.eventbus.*;
import org.vertx.java.core.Handler;

//vertx Manager
//Add command line arguments later on, maybe via config

public class Worker extends Verticle {

    
    @Override
    public void start() {
        
	EventBus eb = vertx.eventBus();

	Handler<Message<String>> ManagerToWorker = new Handler<Message<String>>() {
	    public void handle(Message<String> message){
		String msgBody = message.body();
		//System.out.println("Received message " + msgBody);
		if (msgBody=="go"){
		    int localAns = RunOnce();
		    eb.send("WorkerToManager", localAns);
		} else if (msgBody=="stop"){
		    container.exit();
		}
	    }
	};

	eb.registerHandler("ManagerToWorker", ManagerToWorker);

	
	
    }



    public int RunOnce(){
	JsonObject config = container.config();
	int Pid = config.getInteger("Pid");
	int First = config.getInteger("First");
	int Last = config.getInteger("Last");

	int[] Lp = new int[0];
	int SQ = 0;

	if (Last > First) {
	    SQ = (int)Math.ceil(Math.sqrt(Last));
	    if (SQ % 2 == 0) {
		SQ -= 1;
	    }
	    Lp = SmallPrimes(SQ);
	}
	//System.out.println("Worker: " + Pid + " sieve started");
	int ans = Sieve(Lp, First, Last);
	return ans;
    }



    public int[] SmallPrimes(int N){
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
	//System.out.println("A=" + A + ", B=" + B);

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


    //Sieve
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



