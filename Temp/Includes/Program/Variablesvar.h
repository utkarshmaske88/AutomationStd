/* Automation Studio generated header file */
/* Do not edit ! */

#ifndef _BUR_1698000914_1_
#define _BUR_1698000914_1_

#include <bur/plctypes.h>

/* Constants */
#ifdef _REPLACE_CONST
 #define iVa_ONESEC 1000
 #define iMo_TWO 2U
 #define iMo_TEN 10U
 #define iMo_TEAPRICE 5U
 #define iMo_ONE 1U
 #define iMo_FIVE 5U
 #define iMo_COLDDRINKPRICE 20U
 #define iMo_COLDCOFFEEPRICE 15U
 #define iMo_COFFEEPRICE 10U
#else
 _LOCAL_CONST plctime iVa_ONESEC;
 _LOCAL_CONST unsigned char iMo_TWO;
 _LOCAL_CONST unsigned char iMo_TEN;
 _LOCAL_CONST unsigned char iMo_TEAPRICE;
 _LOCAL_CONST unsigned char iMo_ONE;
 _LOCAL_CONST unsigned char iMo_FIVE;
 _LOCAL_CONST unsigned char iMo_COLDDRINKPRICE;
 _LOCAL_CONST unsigned char iMo_COLDCOFFEEPRICE;
 _LOCAL_CONST unsigned char iMo_COFFEEPRICE;
#endif


/* Variables */
_BUR_LOCAL signed short iMo_PieCC;
_BUR_LOCAL signed short iMo_PieCD;
_BUR_LOCAL signed short iMo_PieTea;
_BUR_LOCAL signed short iMo_PieCoffee;
_BUR_LOCAL_RETAIN signed short iMo_TotalInsertMoney;
_BUR_LOCAL signed short iMo_BarMax;
_BUR_LOCAL unsigned long iMo_Bar;
_BUR_LOCAL plcbit iVa_DisAnime;
_BUR_LOCAL plctime iVl_THIRTYTIMER;
_BUR_LOCAL plcbit iVl_ChangeFlag;
_BUR_LOCAL struct TON iVa_Cancel;
_BUR_LOCAL unsigned long iMo_InsertCoin;
_BUR_LOCAL plcbit iVa_GoIntoIdle;
_BUR_LOCAL unsigned long iVl_THIRTY;
_BUR_LOCAL plcstring iVa_Svg[81];
_BUR_LOCAL struct TON iVa_TimerFull;
_BUR_LOCAL struct TON iVa_DisTimeSet;
_BUR_LOCAL plcbit iVa_DispenseDrink;
_BUR_LOCAL_RETAIN unsigned char iMo_TotalMoney;
_BUR_LOCAL struct TON iMo_TimerSmall;
_BUR_LOCAL plcbit iMi_GoIntoCount;
_BUR_LOCAL unsigned char iMo_GenPrice;
_BUR_LOCAL plcstring iMo_GenDrink[81];
_BUR_LOCAL plcstring iMo_Display[81];
_BUR_LOCAL unsigned char iMo_ChangeMoney;
_BUR_LOCAL plcbit iMi_TEA;
_BUR_LOCAL signed short iMi_DisTimeSet;
_BUR_LOCAL plcbit iMi_COLDDRINK;
_BUR_LOCAL plcbit iMi_COLDCOFFEE;
_BUR_LOCAL plcbit iMi_CoinTwo;
_BUR_LOCAL plcbit iMi_CoinTen;
_BUR_LOCAL plcbit iMi_CoinOne;
_BUR_LOCAL plcbit iMi_CoinFive;
_BUR_LOCAL plcbit iMi_COFFEE;
_BUR_LOCAL plcbit iMi_Cancel;
_BUR_LOCAL plcbit iVl_Flag;
_BUR_LOCAL enum COFFEE_enum COFFEESTEP;





__asm__(".section \".plc\"");

/* Used IEC files */
__asm__(".ascii \"iecfile \\\"Logical/Program/Variables.var\\\" scope \\\"local\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"Logical/Libraries/standard/standard.fun\\\" scope \\\"global\\\"\\n\"");

/* Exported library functions and function blocks */

__asm__(".previous");


#endif /* _BUR_1698000914_1_ */

