(*|¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯|*)
(*| Copyright      :-  B&R Industrial Automation GmbH															 |*)
(*| Contact Person :-  maskeu																					 |*)
(*|——————————————————————————————————————————————————————————————————————————————————————————————————————————————|*)
(*| System       :- X20CP0484 																					 |*)
(*| Task Name    :-  Coffee Machine	                                                                	         |*)
(*| Auther Name  :-  maskeu																						 |*)
(*| Created Date :-  October 10, 2023 																		   	 |*)
(*| Task Class   :-  Task Class# Task Class No 1                                                                 |*)
(*| Task Time    :-  Task Timing 10mSec                                                                          |*)
(*| AS Version   :-  AS 4.12.4.107 SP                                                                            |*)
(*|——————————————————————————————————————————————————————————————————————————————————————————————————————————————|*)
(*| Description  :-  Coffee Machine			       	                                                             |*)
(*|______________________________________________________________________________________________________________|*)

PROGRAM _INIT
	//Full timer to put coins
	iVa_TimerFull.PT	:=T#40s;
	iMo_TimerSmall.PT	:=T#10s;
	// Cancel Time
	iVa_Cancel.PT		:=T#1s;
END_PROGRAM


PROGRAM _CYCLIC	
	// ProgressBar max value
	iMo_BarMax			:=TIME_TO_INT(iVa_DisTimeSet.PT-iVa_ONESEC);
	//two seconds buffer time for dispensing
	iVa_DisTimeSet.PT	:=INT_TO_TIME(iMi_DisTimeSet * 1000)+iVa_ONESEC+iVa_ONESEC ;	
	//if cancel is pressed cancel state
	IF iMi_Cancel = TRUE THEN
		COFFEESTEP 		:=Cancel;
	END_IF;
	
	//Enum for the coffeesteps
	CASE COFFEESTEP OF
	
		// Wait State waiting for user to give inputs
		Wait:
			IF iMo_TotalMoney>0 THEN
				iMo_ChangeMoney		:=iMo_TotalMoney;
				iMo_TotalMoney		:=0;
			ELSE	
				iMo_TotalMoney		:=0;
			END_IF;
			IF iMi_GoIntoCount THEN
				iVa_TimerFull.IN	:=TRUE;
				iMo_TimerSmall.IN	:=TRUE;
				COFFEESTEP			:= CountMoney;
			END_IF;
			IF iVa_TimerFull.Q	=TRUE THEN
				COFFEESTEP		:=Idle;
			END_IF
			
			//If any drink is selected then it will become true and timer will start
			IF iMi_TEA=TRUE THEN
				iMo_GenDrink		:='TEA';
				iMo_GenPrice		:=iMo_TEAPRICE;
				iMi_TEA				:=FALSE;
				iVa_TimerFull.IN	:=TRUE;
			ELSIF iMi_COFFEE=TRUE THEN
				iMo_GenDrink		:= 'COFFEE';
				iMo_GenPrice		:=iMo_COFFEEPRICE;
				iMi_COFFEE			:=FALSE;
				iVa_TimerFull.IN	:=TRUE;
			ELSIF iMi_COLDDRINK=TRUE THEN
				iMo_GenDrink		:='COLDDRINK';
				iMo_GenPrice		:=iMo_COLDDRINKPRICE;
				iMi_COLDDRINK		:=FALSE;
				iVa_TimerFull.IN	:=TRUE;
			ELSIF iMi_COLDCOFFEE=TRUE THEN
				iMo_GenDrink		:='COLDCOFFEE';
				iMo_GenPrice 		:=iMo_COLDCOFFEEPRICE;
				iMi_COLDCOFFEE		:=FALSE;
				iVa_TimerFull.IN	:=TRUE;
			END_IF;
			
			// CountMoney State Money Inserted will be counted
		CountMoney:
			iVl_ChangeFlag			:=FALSE;
			iMi_GoIntoCount			:=FALSE;
			iMo_TimerSmall.IN		:=TRUE;
			
			// when timer ends it will go into idle state
			IF iVa_TimerFull.Q=TRUE OR iMo_TimerSmall.Q=TRUE THEN 
				iVa_GoIntoIdle		:=TRUE;
				COFFEESTEP			:=Cancel;
			END_IF;
			
			//if timer of 10sec and 40sec collides then following block will execute
			IF iVa_TimerFull.ET<iVl_THIRTYTIMER THEN
				iMo_InsertCoin		:=iMo_TEN-TIME_TO_UDINT(iMo_TimerSmall.ET)/1000;	
			ELSE
				iMo_InsertCoin		:=iVl_THIRTY+iMo_TEN-TIME_TO_UDINT(iVa_TimerFull.ET)/1000;
			END_IF;
			
			// when timer ends it will go into idle state
			IF iMo_TotalMoney>=iMo_GenPrice THEN
				iMo_Display			:='';
				iVa_DisTimeSet.IN	:=TRUE;
				COFFEESTEP			:=Dispense;
			ELSE
				iMo_Display:= 'Please Insert The Money';
			END_IF;
			
			//if any coin becomes true it will get added into total money
			IF iMi_CoinOne=TRUE THEN
				iMo_TotalMoney	:=iMo_TotalMoney + iMo_ONE;
				COFFEESTEP		:=TimerRestart;
			END_IF;	
			IF iMi_CoinTwo = TRUE THEN
				iMo_TotalMoney	:=iMo_TotalMoney+iMo_TWO;
				COFFEESTEP		:=TimerRestart;
			END_IF;	
			IF iMi_CoinFive=TRUE THEN
				iMo_TotalMoney 	:=iMo_TotalMoney+iMo_FIVE;
				COFFEESTEP		:=TimerRestart;
			END_IF;	
			IF iMi_CoinTen=TRUE THEN
				iMo_TotalMoney 	:=iMo_TotalMoney+iMo_TEN;
				COFFEESTEP		:=TimerRestart;
			END_IF;	

			// TimeRestart State TimerSmall will be restarted
		TimerRestart:
			iMo_TimerSmall.IN	:=FALSE;
			iMi_CoinFive		:=FALSE;
			iMi_CoinOne			:=FALSE;
			iMi_CoinTwo			:=FALSE ;
			iMi_CoinTen			:=FALSE;
			iVl_Flag			:=TRUE;
			COFFEESTEP			:=CountMoney;
			
			// Dispense State Drink will be out
			//concating strings to give svh animation 
			//iVa_DisAnime- Is for animation of dispensing
		Dispense:
			iVa_DispenseDrink	:=TRUE;
			iMo_ChangeMoney		:=iMo_TotalMoney-iMo_GenPrice;		
			iMo_Bar				:=TIME_TO_INT(iVa_DisTimeSet.ET);
			
			//paper svg animation code block 
			IF iVa_DisTimeSet.ET<iVa_ONESEC THEN
				iVa_Svg			:='[{"select":"#cup","duration":1000,"translate":[190,0]}]';
				iMo_Display		:='Put the Cup';
				iVa_DisAnime	:=FALSE;
			ELSIF iVa_DisTimeSet.ET>iVa_DisTimeSet.PT - iVa_ONESEC THEN
				iVa_Svg			:='[{"select":"#cup","duration":1000,"translate":[0,0]}]';
				iMo_Display		:='Enjoy the Drink';
				iVa_DisAnime	:=FALSE;
				iMo_Bar			:=0;
			ELSE
				iMo_Display:='Dispensing the Drink';
				iVa_DisAnime:=TRUE;
			END_IF;
			IF iVa_DisTimeSet.Q = TRUE THEN
				COFFEESTEP		:=Idle;
			END_IF;
			
			//cancel button state
		Cancel:
			iMo_Bar					:=0;
			iMi_Cancel 				:=FALSE;
			iVa_Cancel.IN			:=TRUE;
			iVa_DisAnime			:=FALSE;
			iVa_Svg					:='[{"select":"#cup","translate":[0,0]}]';
			IF iVa_Cancel.Q=TRUE THEN
				COFFEESTEP			:=Idle;
			END_IF
			
			//if cancelled and money is inserted it will refund the moneuy
			IF iMo_TotalMoney>0 AND iVa_DispenseDrink=FALSE THEN
				iMo_TotalInsertMoney:=iMo_TotalInsertMoney+iMo_TotalMoney;
				iMo_ChangeMoney		:=iMo_TotalMoney;
				iMo_TotalMoney		:=0;
				iVl_ChangeFlag		:=TRUE;
			ELSE	
				iMo_TotalMoney		:=0;
			END_IF;
			
			//Everything will be off in Idle state
		Idle:
			IF iMo_GenDrink = 'COFFEE'THEN
				iMo_PieCoffee:=iMo_PieCoffee+1;
			ELSIF iMo_GenDrink = 'TEA'THEN
				iMo_PieTea:=iMo_PieTea+1;
			ELSIF iMo_GenDrink = 'COLDCOFFEE'THEN
				iMo_PieCC:=iMo_PieCC+1;
			ELSIF iMo_GenDrink = 'COLDDRINK'THEN
				iMo_PieCD:=iMo_PieCD+1;
			END_IF;
			iMo_TotalInsertMoney	:=iMo_TotalInsertMoney+iMo_TotalMoney;
			iMo_Bar					:=0;
			iMo_TotalMoney			:=0;
			iVa_GoIntoIdle			:=FALSE;
			iMo_GenDrink			:='';
			iMo_GenPrice			:=0;
			iVa_DispenseDrink		:=FALSE;
			IF iVl_ChangeFlag=FALSE THEN
				iMo_ChangeMoney		:=0;
			END_IF;
			iMo_TotalMoney			:=0;
			iVa_TimerFull.IN		:=FALSE;
			iMo_TimerSmall.IN		:=FALSE;
			iVa_DisTimeSet.IN		:=FALSE;
			iVa_Cancel.IN			:=FALSE;
			iVa_DisAnime			:=FALSE;
			iMo_InsertCoin			:=0;
			iVa_Svg					:='[{"select":"#cup","translate":[0,0]}]';
			COFFEESTEP				:=Wait;
	END_CASE;
	//starting all timers
	iVa_TimerFull();
	iMo_TimerSmall();
	iVa_DisTimeSet();
	iVa_Cancel();
END_PROGRAM

PROGRAM _EXIT
	 
END_PROGRAM

