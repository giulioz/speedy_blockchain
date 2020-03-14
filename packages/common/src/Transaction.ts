import Flight from "./Flight";

export default interface Transaction {
  timestamp: number;
  content: Flight;
}
