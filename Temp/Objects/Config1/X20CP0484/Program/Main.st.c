#define _DEFAULT_INCLUDE
#include <bur\plctypes.h>
#include "C:/Users/maskeu/Desktop/All/projects/ECamp/CoffeeMachine/Temp/Objects/Config1/X20CP0484/Program/Mainst.h"
#line 1 "C:/Users/maskeu/Desktop/All/projects/ECamp/CoffeeMachine/Logical/Program/Main.nodebug"
#line 16 "C:/Users/maskeu/Desktop/All/projects/ECamp/CoffeeMachine/Logical/Program/Main.st"
void __BUR__ENTRY_INIT_FUNCT__(void){{

(iVa_TimerFull.PT=(40000));
(iMo_TimerSmall.PT=(10000));

(iVa_Cancel.PT=(1000));
}}
#line 22 "C:/Users/maskeu/Desktop/All/projects/ECamp/CoffeeMachine/Logical/Program/Main.nodebug"
#line 25 "C:/Users/maskeu/Desktop/All/projects/ECamp/CoffeeMachine/Logical/Program/Main.st"
void _CYCLIC __BUR__ENTRY_CYCLIC_FUNCT__(void){int __AS__Local0_00000;plcstring* __AS__Local3_00000;plcstring* __AS__Local4_00000;{

(iMo_BarMax=(signed short)(iVa_DisTimeSet.PT-iVa_ONESEC));

(iVa_DisTimeSet.PT=(((plctime)(iMi_DisTimeSet*1000)+iVa_ONESEC)+iVa_ONESEC));

if((((unsigned long)(unsigned char)iMi_Cancel==(unsigned long)(unsigned char)1))){
(COFFEESTEP=3);
}


switch(COFFEESTEP){


case 0:{
if((((unsigned long)(unsigned char)iMo_TotalMoney>(unsigned long)(unsigned char)0))){
(iMo_ChangeMoney=iMo_TotalMoney);
(iMo_TotalMoney=0);
}else{
(iMo_TotalMoney=0);
}
if(iMi_GoIntoCount){
(iVa_TimerFull.IN=1);
(iMo_TimerSmall.IN=1);
(COFFEESTEP=2);
}
if((((unsigned long)(unsigned char)iVa_TimerFull.Q==(unsigned long)(unsigned char)1))){
(COFFEESTEP=5);
}


if((((unsigned long)(unsigned char)iMi_TEA==(unsigned long)(unsigned char)1))){
__AS__Local3_00000=(plcstring*)iMo_GenDrink; __AS__Local4_00000=(plcstring*)"TEA"; for(__AS__Local0_00000=0; __AS__Local0_00000<3l && __AS__Local4_00000[__AS__Local0_00000]!=0; __AS__Local0_00000++) __AS__Local3_00000[__AS__Local0_00000] = __AS__Local4_00000[__AS__Local0_00000]; __AS__Local3_00000[__AS__Local0_00000] = 0;
(iMo_GenPrice=iMo_TEAPRICE);
(iMi_TEA=0);
(iVa_TimerFull.IN=1);
}else if((((unsigned long)(unsigned char)iMi_COFFEE==(unsigned long)(unsigned char)1))){
__AS__Local3_00000=(plcstring*)iMo_GenDrink; __AS__Local4_00000=(plcstring*)"COFFEE"; for(__AS__Local0_00000=0; __AS__Local0_00000<6l && __AS__Local4_00000[__AS__Local0_00000]!=0; __AS__Local0_00000++) __AS__Local3_00000[__AS__Local0_00000] = __AS__Local4_00000[__AS__Local0_00000]; __AS__Local3_00000[__AS__Local0_00000] = 0;
(iMo_GenPrice=iMo_COFFEEPRICE);
(iMi_COFFEE=0);
(iVa_TimerFull.IN=1);
}else if((((unsigned long)(unsigned char)iMi_COLDDRINK==(unsigned long)(unsigned char)1))){
__AS__Local3_00000=(plcstring*)iMo_GenDrink; __AS__Local4_00000=(plcstring*)"COLDDRINK"; for(__AS__Local0_00000=0; __AS__Local0_00000<9l && __AS__Local4_00000[__AS__Local0_00000]!=0; __AS__Local0_00000++) __AS__Local3_00000[__AS__Local0_00000] = __AS__Local4_00000[__AS__Local0_00000]; __AS__Local3_00000[__AS__Local0_00000] = 0;
(iMo_GenPrice=iMo_COLDDRINKPRICE);
(iMi_COLDDRINK=0);
(iVa_TimerFull.IN=1);
}else if((((unsigned long)(unsigned char)iMi_COLDCOFFEE==(unsigned long)(unsigned char)1))){
__AS__Local3_00000=(plcstring*)iMo_GenDrink; __AS__Local4_00000=(plcstring*)"COLDCOFFEE"; for(__AS__Local0_00000=0; __AS__Local0_00000<10l && __AS__Local4_00000[__AS__Local0_00000]!=0; __AS__Local0_00000++) __AS__Local3_00000[__AS__Local0_00000] = __AS__Local4_00000[__AS__Local0_00000]; __AS__Local3_00000[__AS__Local0_00000] = 0;
(iMo_GenPrice=iMo_COLDCOFFEEPRICE);
(iMi_COLDCOFFEE=0);
(iVa_TimerFull.IN=1);
}


}break;case 2:{
(iVl_ChangeFlag=0);
(iMi_GoIntoCount=0);
(iMo_TimerSmall.IN=1);


if(((((unsigned long)(unsigned char)iVa_TimerFull.Q==(unsigned long)(unsigned char)1))|(((unsigned long)(unsigned char)iMo_TimerSmall.Q==(unsigned long)(unsigned char)1)))){
(iVa_GoIntoIdle=1);
(COFFEESTEP=3);
}


if((((signed long)iVa_TimerFull.ET<(signed long)iVl_THIRTYTIMER))){
(iMo_InsertCoin=(iMo_TEN-(((unsigned long)((unsigned long)iMo_TimerSmall.ET))/((unsigned long)(1000)))));
}else{
(iMo_InsertCoin=((iVl_THIRTY+iMo_TEN)-(((unsigned long)((unsigned long)iVa_TimerFull.ET))/((unsigned long)(1000)))));
}


if((((unsigned long)(unsigned char)iMo_TotalMoney>=(unsigned long)(unsigned char)iMo_GenPrice))){
__AS__Local3_00000=(plcstring*)iMo_Display; __AS__Local4_00000=(plcstring*)""; for(__AS__Local0_00000=0; __AS__Local0_00000<0l && __AS__Local4_00000[__AS__Local0_00000]!=0; __AS__Local0_00000++) __AS__Local3_00000[__AS__Local0_00000] = __AS__Local4_00000[__AS__Local0_00000]; __AS__Local3_00000[__AS__Local0_00000] = 0;
(iVa_DisTimeSet.IN=1);
(COFFEESTEP=4);
}else{
__AS__Local3_00000=(plcstring*)iMo_Display; __AS__Local4_00000=(plcstring*)"Please Insert The Money"; for(__AS__Local0_00000=0; __AS__Local0_00000<23l && __AS__Local4_00000[__AS__Local0_00000]!=0; __AS__Local0_00000++) __AS__Local3_00000[__AS__Local0_00000] = __AS__Local4_00000[__AS__Local0_00000]; __AS__Local3_00000[__AS__Local0_00000] = 0;
}


if((((unsigned long)(unsigned char)iMi_CoinOne==(unsigned long)(unsigned char)1))){
(iMo_TotalMoney=(iMo_TotalMoney+iMo_ONE));
(COFFEESTEP=1);
}
if((((unsigned long)(unsigned char)iMi_CoinTwo==(unsigned long)(unsigned char)1))){
(iMo_TotalMoney=(iMo_TotalMoney+iMo_TWO));
(COFFEESTEP=1);
}
if((((unsigned long)(unsigned char)iMi_CoinFive==(unsigned long)(unsigned char)1))){
(iMo_TotalMoney=(iMo_TotalMoney+iMo_FIVE));
(COFFEESTEP=1);
}
if((((unsigned long)(unsigned char)iMi_CoinTen==(unsigned long)(unsigned char)1))){
(iMo_TotalMoney=(iMo_TotalMoney+iMo_TEN));
(COFFEESTEP=1);
}


}break;case 1:{
(iMo_TimerSmall.IN=0);
(iMi_CoinFive=0);
(iMi_CoinOne=0);
(iMi_CoinTwo=0);
(iMi_CoinTen=0);
(iVl_Flag=1);
(COFFEESTEP=2);




}break;case 4:{
(iVa_DispenseDrink=1);
(iMo_ChangeMoney=(iMo_TotalMoney-iMo_GenPrice));
(iMo_Bar=(signed short)iVa_DisTimeSet.ET);


if((((signed long)iVa_DisTimeSet.ET<(signed long)iVa_ONESEC))){
__AS__Local3_00000=(plcstring*)iVa_Svg; __AS__Local4_00000=(plcstring*)"[{\"select\":\"#cup\",\"duration\":1000,\"translate\":[190,0]}]"; for(__AS__Local0_00000=0; __AS__Local0_00000<55l && __AS__Local4_00000[__AS__Local0_00000]!=0; __AS__Local0_00000++) __AS__Local3_00000[__AS__Local0_00000] = __AS__Local4_00000[__AS__Local0_00000]; __AS__Local3_00000[__AS__Local0_00000] = 0;
__AS__Local3_00000=(plcstring*)iMo_Display; __AS__Local4_00000=(plcstring*)"Put the Cup"; for(__AS__Local0_00000=0; __AS__Local0_00000<11l && __AS__Local4_00000[__AS__Local0_00000]!=0; __AS__Local0_00000++) __AS__Local3_00000[__AS__Local0_00000] = __AS__Local4_00000[__AS__Local0_00000]; __AS__Local3_00000[__AS__Local0_00000] = 0;
(iVa_DisAnime=0);
}else if((((signed long)iVa_DisTimeSet.ET>(signed long)(iVa_DisTimeSet.PT-iVa_ONESEC)))){
__AS__Local3_00000=(plcstring*)iVa_Svg; __AS__Local4_00000=(plcstring*)"[{\"select\":\"#cup\",\"duration\":1000,\"translate\":[0,0]}]"; for(__AS__Local0_00000=0; __AS__Local0_00000<53l && __AS__Local4_00000[__AS__Local0_00000]!=0; __AS__Local0_00000++) __AS__Local3_00000[__AS__Local0_00000] = __AS__Local4_00000[__AS__Local0_00000]; __AS__Local3_00000[__AS__Local0_00000] = 0;
__AS__Local3_00000=(plcstring*)iMo_Display; __AS__Local4_00000=(plcstring*)"Enjoy the Drink"; for(__AS__Local0_00000=0; __AS__Local0_00000<15l && __AS__Local4_00000[__AS__Local0_00000]!=0; __AS__Local0_00000++) __AS__Local3_00000[__AS__Local0_00000] = __AS__Local4_00000[__AS__Local0_00000]; __AS__Local3_00000[__AS__Local0_00000] = 0;
(iVa_DisAnime=0);
(iMo_Bar=0);
}else{
__AS__Local3_00000=(plcstring*)iMo_Display; __AS__Local4_00000=(plcstring*)"Dispensing the Drink"; for(__AS__Local0_00000=0; __AS__Local0_00000<20l && __AS__Local4_00000[__AS__Local0_00000]!=0; __AS__Local0_00000++) __AS__Local3_00000[__AS__Local0_00000] = __AS__Local4_00000[__AS__Local0_00000]; __AS__Local3_00000[__AS__Local0_00000] = 0;
(iVa_DisAnime=1);
}
if((((unsigned long)(unsigned char)iVa_DisTimeSet.Q==(unsigned long)(unsigned char)1))){
(COFFEESTEP=5);
}


}break;case 3:{
(iMo_Bar=0);
(iMi_Cancel=0);
(iVa_Cancel.IN=1);
(iVa_DisAnime=0);
__AS__Local3_00000=(plcstring*)iVa_Svg; __AS__Local4_00000=(plcstring*)"[{\"select\":\"#cup\",\"translate\":[0,0]}]"; for(__AS__Local0_00000=0; __AS__Local0_00000<37l && __AS__Local4_00000[__AS__Local0_00000]!=0; __AS__Local0_00000++) __AS__Local3_00000[__AS__Local0_00000] = __AS__Local4_00000[__AS__Local0_00000]; __AS__Local3_00000[__AS__Local0_00000] = 0;
if((((unsigned long)(unsigned char)iVa_Cancel.Q==(unsigned long)(unsigned char)1))){
(COFFEESTEP=5);
}


if(((((unsigned long)(unsigned char)iMo_TotalMoney>(unsigned long)(unsigned char)0))&(((unsigned long)(unsigned char)iVa_DispenseDrink==(unsigned long)(unsigned char)0)))){
(iMo_TotalInsertMoney=(iMo_TotalInsertMoney+iMo_TotalMoney));
(iMo_ChangeMoney=iMo_TotalMoney);
(iMo_TotalMoney=0);
(iVl_ChangeFlag=1);
}else{
(iMo_TotalMoney=0);
}


}break;case 5:{
if(((__AS__STRING_CMP(iMo_GenDrink,"COFFEE")==0))){
(iMo_PieCoffee=(iMo_PieCoffee+1));
}else if(((__AS__STRING_CMP(iMo_GenDrink,"TEA")==0))){
(iMo_PieTea=(iMo_PieTea+1));
}else if(((__AS__STRING_CMP(iMo_GenDrink,"COLDCOFFEE")==0))){
(iMo_PieCC=(iMo_PieCC+1));
}else if(((__AS__STRING_CMP(iMo_GenDrink,"COLDDRINK")==0))){
(iMo_PieCD=(iMo_PieCD+1));
}
(iMo_TotalInsertMoney=(iMo_TotalInsertMoney+iMo_TotalMoney));
(iMo_Bar=0);
(iMo_TotalMoney=0);
(iVa_GoIntoIdle=0);
__AS__Local3_00000=(plcstring*)iMo_GenDrink; __AS__Local4_00000=(plcstring*)""; for(__AS__Local0_00000=0; __AS__Local0_00000<0l && __AS__Local4_00000[__AS__Local0_00000]!=0; __AS__Local0_00000++) __AS__Local3_00000[__AS__Local0_00000] = __AS__Local4_00000[__AS__Local0_00000]; __AS__Local3_00000[__AS__Local0_00000] = 0;
(iMo_GenPrice=0);
(iVa_DispenseDrink=0);
if((((unsigned long)(unsigned char)iVl_ChangeFlag==(unsigned long)(unsigned char)0))){
(iMo_ChangeMoney=0);
}
(iMo_TotalMoney=0);
(iVa_TimerFull.IN=0);
(iMo_TimerSmall.IN=0);
(iVa_DisTimeSet.IN=0);
(iVa_Cancel.IN=0);
(iVa_DisAnime=0);
(iMo_InsertCoin=0);
__AS__Local3_00000=(plcstring*)iVa_Svg; __AS__Local4_00000=(plcstring*)"[{\"select\":\"#cup\",\"translate\":[0,0]}]"; for(__AS__Local0_00000=0; __AS__Local0_00000<37l && __AS__Local4_00000[__AS__Local0_00000]!=0; __AS__Local0_00000++) __AS__Local3_00000[__AS__Local0_00000] = __AS__Local4_00000[__AS__Local0_00000]; __AS__Local3_00000[__AS__Local0_00000] = 0;
(COFFEESTEP=0);
}break;}

TON(&iVa_TimerFull);
TON(&iMo_TimerSmall);
TON(&iVa_DisTimeSet);
TON(&iVa_Cancel);
}}
#line 217 "C:/Users/maskeu/Desktop/All/projects/ECamp/CoffeeMachine/Logical/Program/Main.nodebug"
#line 219 "C:/Users/maskeu/Desktop/All/projects/ECamp/CoffeeMachine/Logical/Program/Main.st"
void _EXIT __BUR__ENTRY_EXIT_FUNCT__(void){{

}}
#line 221 "C:/Users/maskeu/Desktop/All/projects/ECamp/CoffeeMachine/Logical/Program/Main.nodebug"

void __AS__ImplInitMain_st(void){__BUR__ENTRY_INIT_FUNCT__();}

signed long __AS__STRING_CMP(char* pstr1, char* pstr2)
{while (*pstr1 != 0 && *pstr1 == *pstr2){ pstr1++;pstr2++; } return (*pstr1 == 0 && *pstr2 != 0) ? -1 : (*pstr1 != 0 && *pstr2 == 0) ? 1 : *pstr1 - *pstr2;}

__asm__(".section \".plc\"");
__asm__(".ascii \"iecfile \\\"Logical/Global.typ\\\" scope \\\"global\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"Logical/Libraries/operator/operator.typ\\\" scope \\\"global\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"Logical/Libraries/runtime/runtime.typ\\\" scope \\\"global\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"Logical/Libraries/astime/astime.typ\\\" scope \\\"global\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"Logical/Libraries/AsIecCon/AsIecCon.typ\\\" scope \\\"global\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"Logical/Libraries/standard/standard.typ\\\" scope \\\"global\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"Logical/Libraries/operator/operator.fun\\\" scope \\\"global\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"Logical/Libraries/runtime/runtime.fun\\\" scope \\\"global\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"Logical/Libraries/astime/astime.fun\\\" scope \\\"global\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"Logical/Libraries/AsIecCon/AsIecCon.fun\\\" scope \\\"global\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"Logical/Libraries/standard/standard.fun\\\" scope \\\"global\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"Logical/Global.var\\\" scope \\\"global\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"Logical/Libraries/operator/operator.var\\\" scope \\\"global\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"Logical/Libraries/runtime/runtime.var\\\" scope \\\"global\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"Logical/Libraries/astime/astime.var\\\" scope \\\"global\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"Logical/Libraries/AsIecCon/AsIecCon.var\\\" scope \\\"global\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"Logical/Libraries/standard/standard.var\\\" scope \\\"global\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"Logical/Program/Types.typ\\\" scope \\\"local\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"Logical/Program/Variables.var\\\" scope \\\"local\\\"\\n\"");
__asm__(".ascii \"iecfile \\\"C:/Users/maskeu/Desktop/All/projects/ECamp/CoffeeMachine/Temp/Objects/Config1/X20CP0484/Program/Main.st.var\\\" scope \\\"local\\\"\\n\"");
__asm__(".ascii \"plcreplace \\\"C:/Users/maskeu/Desktop/All/projects/ECamp/CoffeeMachine/Temp/Objects/Config1/X20CP0484/Program/Main.st.c\\\" \\\"C:/Users/maskeu/Desktop/All/projects/ECamp/CoffeeMachine/Logical/Program/Main.st\\\"\\n\"");
__asm__(".previous");

__asm__(".section \".plciec\"");
__asm__(".ascii \"plcdata_const 'iMo_COFFEEPRICE'\\n\"");
__asm__(".ascii \"plcdata_const 'iMo_COLDCOFFEEPRICE'\\n\"");
__asm__(".ascii \"plcdata_const 'iMo_COLDDRINKPRICE'\\n\"");
__asm__(".ascii \"plcdata_const 'iMo_FIVE'\\n\"");
__asm__(".ascii \"plcdata_const 'iMo_ONE'\\n\"");
__asm__(".ascii \"plcdata_const 'iMo_TEAPRICE'\\n\"");
__asm__(".ascii \"plcdata_const 'iMo_TEN'\\n\"");
__asm__(".ascii \"plcdata_const 'iMo_TWO'\\n\"");
__asm__(".ascii \"plcdata_const 'iVa_ONESEC'\\n\"");
__asm__(".previous");
