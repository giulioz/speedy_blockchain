export interface CarrierRequest {
  OP_CARRIER_AIRLINE_ID: string;
  FROM: number;
  TO: number;
}

export interface CarrierData {
  OP_CARRIER_AIRLINE_ID: string;
  AVERAGE_DELAY: number;
  TOTAL_NUMBER_OF_FLIGHTS: number;
  DELAYED_FLIGHTS: number;
  FLIGHTS_IN_ADVANCE: number;
}

export interface FlightsRequest {
  OP_CARRIER_FL_NUM: string;
  FLIGHT_DATE: number;
}
