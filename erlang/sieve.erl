-module('sieve').
-compile(export_all).
-export([primes/1, primes_single/1, primes_parr/2]).


%---------------------------------------------------------------------------------   
primes(N) ->
    simple_sieve(lists:seq(3,N,2),[],N).

simple_sieve(Lin,Lp,N) -> [H|_] = Lin,
		   case H*H < N of
		       true -> simple_sieve([X || X <- Lin, X rem H =/= 0], [H|Lp], N);
		       false -> lists:reverse(Lp) ++ Lin
		   end.

%---------------------------------------------------------------------------------   
primes_single(N) ->
    SQ = round(math:sqrt(N)),
    Lp = primes(SQ),
    1 + notprimes(N,[],Lp).

notprimes(N,Lin,[])-> 
    length(ordsets:subtract(lists:seq(3,N,2),lists:usort(Lin)));
notprimes(N,Lin,[H|T]) -> notprimes(N, lists:seq(H*H,N,2*H) ++ Lin, T). 

%---------------------------------------------------------------------------------
primes_parr(N, Num_blocks) -> 
    Pid_stem = self(),
    SQ = round(math:sqrt(N)),
    Lp = primes(SQ),
    Block_size = round(N/Num_blocks),
    ok = leaf_spawn(Pid_stem, Lp, SQ, Block_size, Num_blocks),
    stem_loop(Lp, 0, Num_blocks).
 
stem_loop(Lp, Primes, 0) ->
    1 + length(Lp) + Primes;
stem_loop(Lp, Primes, Num_blocks) ->
    receive
	{leaf_done, _, Leaf_nums} ->
	    stem_loop(Lp, Primes+Leaf_nums, Num_blocks-1)
    end.
     
leaf_spawn(_, _, _, _, 0) -> ok;
leaf_spawn(Pid_stem, Lp, SQ, Block_size, Num_blocks) ->
    case (Num_blocks==1) of
	true -> case (SQ rem 2 == 0) of
		    true -> Start = SQ+1;
		    false -> Start = SQ
		end;
	false -> Start = 1
    end,
    First = (Num_blocks-1)*Block_size + Start,
    Last = Num_blocks*Block_size,
    spawn(fun() -> leaf(Pid_stem, Num_blocks, First, Last, [], Lp) end),
    leaf_spawn(Pid_stem, Lp, SQ, Block_size, Num_blocks-1).
				  
leaf(Pid_stem, Leaf_id, First, Last, Leaf_nums, []) -> 
    Pid_stem ! {leaf_done, Leaf_id, length(ordsets:subtract(lists:seq(First,Last,2),lists:usort(Leaf_nums)))};
leaf(Pid_stem, Leaf_id, First, Last, Leaf_nums, [H|T]) ->
    case (H*H =< Last)  of
	true -> 
	    case H*H >= First of
		true ->
		    leaf(Pid_stem, Leaf_id, First, Last, lists:seq(H*H, Last, 2*H) ++ Leaf_nums, T);
		false ->
		    K = round((First - H*H)/(2*H)),
		    leaf(Pid_stem, Leaf_id, First, Last, lists:seq(H*H + 2*K*H, Last, 2*H) ++ Leaf_nums, T)
		end;
	false -> 
	    leaf(Pid_stem, Leaf_id, First, Last, Leaf_nums, [])
    end.
    

