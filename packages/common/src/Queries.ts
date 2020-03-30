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
  OP_CARRIER_FL_NUM: number;
  FL_DATE: number;
}

export interface RouteRequest {
  CITY_A: string;
  CITY_B: string;
  DATE_FROM: number;
  DATE_TO: number;
}

export interface RouteData {
  CITY_A: string;
  CITY_B: string;
  AVERAGE_DELAY: number;
  MAX_DELAY: number;
  MIN_DELAY: number;
  TOTAL_NUMBER_OF_FLIGHTS: number;
  DELAYED_FLIGHTS: number;
  FLIGHTS_IN_ADVANCE: number;
  FLIGHTS: Flight[];
}
