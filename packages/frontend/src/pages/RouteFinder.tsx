import React, { useCallback } from "react";
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
import apiCall from "../api/apiCall";

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

const DEFAULT_ROUTE_REQUEST_STATE: RouteRequest = {
  CITY_A: "Memphis, TN",
  CITY_B: "San Antonio, TX",
  DATE_FROM: 0,
  DATE_TO: Date.now(),
};

export default function RouteFinder() {
  const classes = useStyles();

  const apiCallback = useCallback(async (state: any) => {
    const result = await apiCall("POST /query/route", {
      body: {
        ...state,
        OP_CARRIER_AIRLINE_ID: parseFloat(state.OP_CARRIER_AIRLINE_ID),
        DATE_FROM: parseFloat(state.DATE_FROM),
        DATE_TO: parseFloat(state.DATE_TO),
      },
      params: {},
    });

    if (result.status === "ok") {
      return result.data;
    }
  }, []);

  const {
    data,
    params,
    searching,
    onSearch,
    onNamedInputStateChange,
  } = useAsyncFormSearch({
    initialState: DEFAULT_ROUTE_REQUEST_STATE,
    apiCallback,
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
              value={params.CITY_A}
              label="City A"
              variant="outlined"
              placeholder="Example: Memphis, TN"
              onChange={onNamedInputStateChange}
            />
            <TextField
              name="CITY_B"
              value={params.CITY_B}
              label="City B"
              variant="outlined"
              placeholder="Example: San Antonio, TX"
              onChange={onNamedInputStateChange}
            />
            <TextField
              name="DATE_FROM"
              value={params.DATE_FROM}
              label="From"
              placeholder={"Example: " + new Date()}
              variant="outlined"
              onChange={onNamedInputStateChange}
            />
            <TextField
              name="DATE_TO"
              value={params.DATE_TO}
              label="To"
              placeholder={"Example: " + new Date()}
              variant="outlined"
              onChange={onNamedInputStateChange}
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
