import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Layout from "../components/Layout";
import {
  Typography,
  TextField,
  Paper,
  LinearProgress,
} from "@material-ui/core";
import { RouteRequest, RouteData, Flight } from "@speedy_blockchain/common";
import { useAsyncFormSearch } from "../utils";
import SearchForm from "../components/SearchForm";
import FlightCard from "../components/FlightCard";
import { Spring } from "react-spring/renderprops";

const useStyles = makeStyles(theme => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    height: `calc(100% - 64px)`,
    display: "flex",
    flexDirection: "column",
  },
  progressBar: {
    minHeight: theme.spacing(1),
    width: "100%",
    position: "fixed",
  },
  routeDataContainer: {
    padding: theme.spacing(2),
    minHeight: "200px",
    marginBottom: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  flightDataContainer: {
    textAlign: "right",
  },
}));

const mockData: RouteData = {
  TOTAL_NUMBER_OF_FLIGHTS: 4,
  FLIGHTS: [
    {
      AIR_TIME: 90.0,
      ARR_DELAY: -11.0,
      ARR_TIME: 17.49,
      CANCELLED: 0.0,
      DAY_OF_WEEK: 5,
      DEP_DELAY: -5.0,
      DEP_TIME: 16.05,
      DEST_AIRPORT_ID: 13244,
      DEST_CITY_NAME: "Memphis, TN",
      DEST_STATE_NM: "Tennessee",
      DEST: "MEM",
      FL_DATE: 11111,
      OP_CARRIER_AIRLINE_ID: 20363,
      OP_CARRIER_FL_NUM: 3692,
      ORIGIN_AIRPORT_ID: 14683,
      ORIGIN_CITY_NAME: "San Antonio, TX",
      ORIGIN_STATE_NM: "Texas",
      ORIGIN: "SAT",
      YEAR: 2010,
    },
    {
      AIR_TIME: 90.0,
      ARR_DELAY: -11.0,
      ARR_TIME: 17.49,
      CANCELLED: 0.0,
      DAY_OF_WEEK: 5,
      DEP_DELAY: -5.0,
      DEP_TIME: 16.05,
      DEST_AIRPORT_ID: 13244,
      DEST_CITY_NAME: "Memphis, TN",
      DEST_STATE_NM: "Tennessee",
      DEST: "MEM",
      FL_DATE: 11111,
      OP_CARRIER_AIRLINE_ID: 20363,
      OP_CARRIER_FL_NUM: 3692,
      ORIGIN_AIRPORT_ID: 14683,
      ORIGIN_CITY_NAME: "San Antonio, TX",
      ORIGIN_STATE_NM: "Texas",
      ORIGIN: "SAT",
      YEAR: 2010,
    },
    {
      AIR_TIME: 90.0,
      ARR_DELAY: -11.0,
      ARR_TIME: 17.49,
      CANCELLED: 0.0,
      DAY_OF_WEEK: 5,
      DEP_DELAY: -5.0,
      DEP_TIME: 16.05,
      DEST_AIRPORT_ID: 13244,
      DEST_CITY_NAME: "Memphis, TN",
      DEST_STATE_NM: "Tennessee",
      DEST: "MEM",
      FL_DATE: 11111,
      OP_CARRIER_AIRLINE_ID: 20363,
      OP_CARRIER_FL_NUM: 3692,
      ORIGIN_AIRPORT_ID: 14683,
      ORIGIN_CITY_NAME: "San Antonio, TX",
      ORIGIN_STATE_NM: "Texas",
      ORIGIN: "SAT",
      YEAR: 2010,
    },
    {
      YEAR: 2010,
      DAY_OF_WEEK: 5,
      FL_DATE: 1264114800.0,
      OP_CARRIER_AIRLINE_ID: 19805,
      OP_CARRIER_FL_NUM: 1263,
      ORIGIN_AIRPORT_ID: 13303,
      ORIGIN: "MIA",
      ORIGIN_CITY_NAME: "Miami, FL",
      ORIGIN_STATE_NM: "Florida",
      DEST_AIRPORT_ID: 12266,
      DEST: "IAH",
      DEST_CITY_NAME: "Houston, TX",
      DEST_STATE_NM: "Texas",
      DEP_TIME: 0,
      DEP_DELAY: 0,
      ARR_TIME: 0,
      ARR_DELAY: 0,
      CANCELLED: 1.0,
      AIR_TIME: 0,
    },
  ],
};

const DEFAULT_ROUTE_REQUEST_STATE: RouteRequest = {
  CITY_A: "",
  CITY_B: "",
  DATE_FROM: 0,
  DATE_TO: 0,
};

export default function RouteFinder() {
  const classes = useStyles();

  const {
    data,
    searching,
    onSearch,
    onNamedInputStateChange,
  } = useAsyncFormSearch({
    initialState: DEFAULT_ROUTE_REQUEST_STATE,
    apiCallback: async () => mockData,
  });

  const firstFlight = data?.FLIGHTS[0];

  return (
    <Layout title="Route finder">
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <div className={classes.progressBar}>
          {searching && <LinearProgress color="secondary" />}
        </div>
        <Container maxWidth="xl" className={classes.container}>
          <SearchForm
            title="Enter two cities and a time range"
            searching={searching}
            onSearch={onSearch}
          >
            <TextField
              name="CITY_A"
              label="City A"
              variant="outlined"
              placeholder="Example: Memphis, TN"
              onChange={onNamedInputStateChange}
            />
            <TextField
              name="CITY_B"
              label="City B"
              variant="outlined"
              placeholder="Example: San Antonio, TX"
              onChange={onNamedInputStateChange}
            />
            <TextField
              name="DATE_FROM"
              label="From"
              placeholder={"Example: " + new Date()}
              variant="outlined"
              // onChange={onNamedInputStateChange}
            />
            <TextField
              name="DATE_TO"
              label="To"
              placeholder={"Example: " + new Date()}
              variant="outlined"
              // onChange={onNamedInputStateChange}
            />
          </SearchForm>
          {data && (
            <Paper className={classes.routeDataContainer}>
              <div style={{ display: "flex" }}>
                <Typography variant="h5">Total number of flights:</Typography>
                <Spring
                  config={{ mass: 5, friction: 70, clamp: true }}
                  from={{ number: 0 }}
                  to={{ number: data.TOTAL_NUMBER_OF_FLIGHTS }}
                >
                  {props => (
                    <Typography style={{ paddingLeft: 8 }} variant="h5">
                      {props.number.toFixed(0)}
                    </Typography>
                  )}
                </Spring>
              </div>
              {firstFlight && (
                <div className={classes.flightDataContainer}>
                  <Typography variant="h6">
                    {firstFlight.ORIGIN_CITY_NAME}
                  </Typography>
                  <Typography variant="h6">
                    {firstFlight.DEST_CITY_NAME}
                  </Typography>
                </div>
              )}
            </Paper>
          )}
          {data?.FLIGHTS.map(flight => (
            <FlightCard flight={flight} />
          ))}
        </Container>
      </main>
    </Layout>
  );
}
