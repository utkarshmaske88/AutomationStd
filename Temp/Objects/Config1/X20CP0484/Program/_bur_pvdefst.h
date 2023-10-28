#ifndef __AS__TYPE_COFFEE_enum
#define __AS__TYPE_COFFEE_enum
typedef enum COFFEE_enum
{	Wait = 0,
	TimerRestart = 1,
	CountMoney = 2,
	Cancel = 3,
	Dispense = 4,
	Idle = 5,
} COFFEE_enum;
#endif

struct TON
{	plctime PT;
	plctime ET;
	plctime StartTime;
	unsigned long Restart;
	plcbit IN;
	plcbit Q;
	plcbit M;
};
_BUR_PUBLIC void TON(struct TON* inst);
_BUR_LOCAL COFFEE_enum COFFEESTEP;
_BUR_LOCAL plcbit iVl_Flag;
_BUR_LOCAL plcbit iMi_Cancel;
_BUR_LOCAL plcbit iMi_COFFEE;
_BUR_LOCAL plcbit iMi_CoinFive;
_BUR_LOCAL plcbit iMi_CoinOne;
_BUR_LOCAL plcbit iMi_CoinTen;
_BUR_LOCAL plcbit iMi_CoinTwo;
_BUR_LOCAL plcbit iMi_COLDCOFFEE;
_BUR_LOCAL plcbit iMi_COLDDRINK;
_BUR_LOCAL signed short iMi_DisTimeSet;
_BUR_LOCAL plcbit iMi_TEA;
_BUR_LOCAL unsigned char iMo_ChangeMoney;
_BUR_LOCAL unsigned char iMo_COFFEEPRICE;
_BUR_LOCAL unsigned char iMo_COLDCOFFEEPRICE;
_BUR_LOCAL unsigned char iMo_COLDDRINKPRICE;
_BUR_LOCAL plcstring iMo_Display[81];
_BUR_LOCAL unsigned char iMo_FIVE;
_BUR_LOCAL plcstring iMo_GenDrink[81];
_BUR_LOCAL unsigned char iMo_GenPrice;
_BUR_LOCAL plcbit iMi_GoIntoCount;
_BUR_LOCAL unsigned char iMo_ONE;
_BUR_LOCAL unsigned char iMo_TEAPRICE;
_BUR_LOCAL unsigned char iMo_TEN;
_BUR_LOCAL struct TON iMo_TimerSmall;
_BUR_LOCAL_RETAIN unsigned char iMo_TotalMoney;
_BUR_LOCAL unsigned char iMo_TWO;
_BUR_LOCAL plcbit iVa_DispenseDrink;
_BUR_LOCAL struct TON iVa_DisTimeSet;
_BUR_LOCAL struct TON iVa_TimerFull;
_BUR_LOCAL plcstring iVa_Svg[81];
_BUR_LOCAL unsigned long iVl_THIRTY;
_BUR_LOCAL plctime iVa_ONESEC;
_BUR_LOCAL plcbit iVa_GoIntoIdle;
_BUR_LOCAL unsigned long iMo_InsertCoin;
_BUR_LOCAL struct TON iVa_Cancel;
_BUR_LOCAL plcbit iVl_ChangeFlag;
_BUR_LOCAL plctime iVl_THIRTYTIMER;
_BUR_LOCAL plcbit iVa_DisAnime;
_BUR_LOCAL unsigned long iMo_Bar;
_BUR_LOCAL signed short iMo_BarMax;
_BUR_LOCAL_RETAIN signed short iMo_TotalInsertMoney;
_BUR_LOCAL signed short iMo_PieCoffee;
_BUR_LOCAL signed short iMo_PieTea;
_BUR_LOCAL signed short iMo_PieCD;
_BUR_LOCAL signed short iMo_PieCC;
