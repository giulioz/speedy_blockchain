export interface CarrierRequest {
  OP_CARRIER_AIRLINE_ID: string;
  // FROM: Date;
  // TO: Date;
}

export interface CarrierData {
  OP_CARRIER_AIRLINE_ID: string;
  AVERAGE_DELAY: number;
  TOTAL_NUMBER_OF_FLIGHTS: number;
  DELAYED_FLIGHTS: number;
  FLIGHTS_IN_ADVANCE: number;
  // flights: Flights[],
}

export interface FlightRequest {
  OP_CARRIER_FL_NUM: string;
  FLIGHT_DATE: Date;
}
