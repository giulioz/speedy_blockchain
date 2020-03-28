export interface CarrierRequest {
  OP_CARRIER_AIRLINE_ID: string;
  DATE_FROM: number;
  DATE_TO: number;
}

export interface CarrierData {
  OP_CARRIER_AIRLINE_ID: string;
  AVERAGE_DELAY: number;
  TOTAL_NUMBER_OF_FLIGHTS: number;
  DELAYED_FLIGHTS: number;
  FLIGHTS_IN_ADVANCE: number;
}

export interface FlightsRequest {
  // YOU CAN PASS EVERY ATTRIBUTE OF FLIGHT THAT YOU WANT
  OP_CARRIER_FL_NUM: string;
  FLIGHT_DATE: number;
  DATE_FROM: number;
  DATE_TO: number;
  SORT: string; // EXAMPLE: OP_CARRIER_AIRLINE_ID DESC
}
