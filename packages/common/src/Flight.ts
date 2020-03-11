export default interface Flight {
  YEAR: number; //2010
  DAY_OF_WEEK: number; //5
  FL_DATE: Date; //2010-01-15
  OP_CARRIER_AIRLINE_ID: number; //20363
  OP_CARRIER_FL_NUM: string; //"3692"
  ORIGIN_AIRPORT_ID: number; //14683
  ORIGIN: string; //"SAT"
  ORIGIN_CITY_NAME: string; //"San Antonio, TX"
  ORIGIN_STATE_NM: string; //"Texas"
  DEST_AIRPORT_ID: number; //13244
  DEST: string; //"MEM"
  DEST_CITY_NAME: string; //"Memphis, TN"
  DEST_STATE_NM: string; //"Tennessee"
  DEP_TIME: string; //"1605"
  DEP_DELAY: number; //-5.00
  ARR_TIME: string; //"1749"
  ARR_DELAY: number; //-11.00
  CANCELLED: number; //0.00
  AIR_TIM: number; //90.00
}
