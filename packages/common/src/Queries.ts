import Flight from "./Flight";

export interface CarrierRequest {
  OP_CARRIER_AIRLINE_ID: number;
  DATE_FROM: number;
  DATE_TO: number;
}

export interface CarrierData {
  OP_CARRIER_AIRLINE_ID: number;
  AVERAGE_DELAY: number;
  MAX_DELAY: number;
  MIN_DELAY: number;
  TOTAL_NUMBER_OF_FLIGHTS: number;
  DELAYED_FLIGHTS: number;
  FLIGHTS_IN_ADVANCE: number;
}

export interface FlightsRequest {
  // YOU CAN PASS EVERY ATTRIBUTE OF FLIGHT THAT YOU WANT
  OP_CARRIER_FL_NUM: string;
  FL_DATE: number;
  DATE_FROM: number;
  DATE_TO: number;
  SORT: string; // EXAMPLE: OP_CARRIER_AIRLINE_ID DESC
}

export interface RouteRequest {
  CITY_A: string;
  CITY_B: string;
  DATE_FROM: number;
  DATE_TO: number;
}

export interface RouteData {
  TOTAL_NUMBER_OF_FLIGHTS: number;
  FLIGHTS: Flight[];
}
