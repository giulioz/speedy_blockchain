import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import { Flight, FlightsRequest } from "@speedy_blockchain/common";
import Layout from "../components/Layout";
import { Typography, TextField, LinearProgress } from "@material-ui/core";
import FlightIcon from "@material-ui/icons/Flight";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import ScheduleIcon from "@material-ui/icons/Schedule";
import amber from "@material-ui/core/colors/amber";
import green from "@material-ui/core/colors/green";
import SearchForm from "../components/SearchForm";
import { useAsyncFormSearch } from "../utils";
import FlightCard from "../components/FlightCard";

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
    "& > :first-child": {
      marginBottom: theme.spacing(4),
    },
  },
  progressBar: {
    minHeight: theme.spacing(1),
    width: "100%",
    position: "fixed",
  },
}));

const mockData: Flight = {
  AIR_TIME: 90.0,
  ARR_DELAY: -11.0,
  ARR_TIME: "17:49",
  CANCELLED: 0.0,
  DAY_OF_WEEK: 5,
  DEP_DELAY: -5.0,
  DEP_TIME: "16:05",
  DEST_AIRPORT_ID: 13244,
  DEST_CITY_NAME: "Memphis, TN",
  DEST_STATE_NM: "Tennessee",
  DEST: "MEM",
  FLIGHT_DATE: 0,
  OP_CARRIER_AIRLINE_ID: 20363,
  OP_CARRIER_FL_NUM: "3692",
  ORIGIN_AIRPORT_ID: 14683,
  ORIGIN_CITY_NAME: "San Antonio, TX",
  ORIGIN_STATE_NM: "Texas",
  ORIGIN: "SAT",
  YEAR: 2010,
};

const emptyFlight = {
  FLIGHT_DATE: 0,
  OP_CARRIER_FL_NUM: "",
};

export default function FindFlight() {
  const classes = useStyles();

  const {
    data,
    searching,
    onSearch,
    onNamedInputStateChange,
  } = useAsyncFormSearch({
    initialState: emptyFlight,
    apiCallback: inputState => mockData,
    isMock: true,
  });

  return (
    <Layout title="Find a flight">
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <div className={classes.progressBar}>
          {searching && <LinearProgress color="secondary" />}
        </div>
        <Container maxWidth="lg" className={classes.container}>
          <SearchForm
            title="Enter a flight"
            searching={searching}
            onSearch={onSearch}
          >
            <TextField
              name="OP_CARRIER_FL_NUM"
              label="Flight number"
              variant="outlined"
              placeholder="Example: 20363"
              onChange={onNamedInputStateChange}
            />
            <TextField
              name="FLIGHT_DATE"
              label="Flight date"
              placeholder={"Example: " + new Date()}
              variant="outlined"
              onChange={onNamedInputStateChange}
            />
          </SearchForm>
          {data && <FlightCard flight={data} />}
        </Container>
      </main>
    </Layout>
  );
}
