import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import { Flight } from "@speedy_blockchain/common";
import Title from "../components/Title";
import Layout from "../components/Layout";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import FlightIcon from "@material-ui/icons/Flight";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import ScheduleIcon from "@material-ui/icons/Schedule";
import amber from "@material-ui/core/colors/amber";
import green from "@material-ui/core/colors/green";

function useFlightSearch() {
  const [search, setSearch] = useState<string>("");
  const [flight, setFlight] = useState<Flight | null>(null);

  useEffect(() => {
    async function searchData() {
      // const data = await fetchFlight(search);
      const mockData: Flight = {
        AIR_TIME: 90.0,
        ARR_DELAY: -11.0,
        ARR_TIME: "1749",
        CANCELLED: 0.0,
        DAY_OF_WEEK: 5,
        DEP_DELAY: -5.0,
        DEP_TIME: "1605",
        DEST_AIRPORT_ID: 13244,
        DEST_CITY_NAME: "Memphis, TN",
        DEST_STATE_NM: "Tennessee",
        DEST: "MEM",
        FLIGHT_DATE: new Date(),
        OP_CARRIER_AIRLINE_ID: 20363,
        OP_CARRIER_FL_NUM: "3692",
        ORIGIN_AIRPORT_ID: 14683,
        ORIGIN_CITY_NAME: "San Antonio, TX",
        ORIGIN_STATE_NM: "Texas",
        ORIGIN: "SAT",
        YEAR: 2010
      };
      const data = await new Promise<Flight>(resolve =>
        setTimeout(() => {
          resolve(mockData);
        }, 1000)
      );

      setFlight(data);
    }

    searchData();
  }, [search]);

  return { foundFlight: flight, setSearch };
}

const useStyles = makeStyles(theme => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto"
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    "& > :first-child": {
      marginBottom: theme.spacing(4)
    }
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    "& .MuiTypography-root": {
      margin: 0
    }
  },
  fieldContainer: {
    display: "flex",
    alignItems: "center",
    "& .MuiInputBase-root": {
      marginRight: theme.spacing(2)
    }
  },
  flightContainer: {
    width: "100%",
    minHeight: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  flightTitleContainer: {
    display: "flex",
    alignItems: "center",
    "& > *": {
      marginRight: theme.spacing(4)
    }
  },
  flightInfoContainer: {
    display: "flex",
    alignItems: "center",
    "& > *": {
      marginRight: theme.spacing(4)
    },
    "& > div": {
      display: "flex",
      flexDirection: "column"
    },
    "& > :last-child": {
      alignItems: "flex-end"
    }
  },
  huge: {
    fontSize: 40
  },
  flightBetweenContainer: {
    display: "flex",
    alignItems: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "300px"
  },
  dottedLineContainer: {
    display: "flex",
    alignItems: "center"
  },
  dottedLine: {
    height: "1px",
    width: "80px",
    border: "2px dashed white"
  },
  duration: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(1),
    "& :first-child": {
      marginRight: theme.spacing(1)
    }
  }
}));

function CityTime({ city, time, delay }) {
  const absDelay = Math.abs(delay);
  const sign = delay < 0 ? "-" : "+";
  const delayString = sign + absDelay + " min";
  const color = delay < 0 ? green[500] : amber[500];
  return (
    <div>
      <Typography>{city}</Typography>
      <Typography style={{ marginRight: "5px" }} variant="subtitle1">
        {time}
      </Typography>
      <Typography variant="subtitle1" style={{ color: color }}>
        {delayString}
      </Typography>
    </div>
  );
}

function FlightBetweenIcon({ duration }) {
  const classes = useStyles();
  const durationString = duration + " min";
  return (
    <span>
      <span className={classes.flightBetweenContainer}>
        <LocationOnIcon fontSize="default" />
        <div className={classes.dottedLineContainer}>
          <div className={classes.dottedLine} />
        </div>
        <FlightIcon
          className={classes.huge}
          style={{ transform: "rotate(90deg)" }}
        />
        <div className={classes.dottedLineContainer}>
          <div className={classes.dottedLine} />
        </div>
        <LocationOnIcon fontSize="default" />
      </span>
      <div className={classes.duration}>
        <ScheduleIcon fontSize="small" />
        <span>{durationString}</span>
      </div>
    </span>
  );
}

function FlightCard({ flight }: { flight: Flight }) {
  const classes = useStyles();

  return (
    <Paper className={classes.flightContainer}>
      <div className={classes.flightTitleContainer}>
        <Typography variant="h5">Flight #{flight.OP_CARRIER_FL_NUM}</Typography>
      </div>
      <div className={classes.flightInfoContainer}>
        <CityTime
          city={flight.ORIGIN_CITY_NAME}
          time={flight.DEP_TIME}
          delay={flight.DEP_DELAY}
        />
        <FlightBetweenIcon duration={flight.AIR_TIME} />
        <CityTime
          city={flight.DEST_CITY_NAME}
          time={flight.ARR_TIME}
          delay={flight.ARR_DELAY}
        />
      </div>
    </Paper>
  );
}

export default function FindFlight() {
  const classes = useStyles();

  // const { foundFlight, setSearch } = useFlightSearch();

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
    FLIGHT_DATE: new Date(),
    OP_CARRIER_AIRLINE_ID: 20363,
    OP_CARRIER_FL_NUM: "3692",
    ORIGIN_AIRPORT_ID: 14683,
    ORIGIN_CITY_NAME: "San Antonio, TX",
    ORIGIN_STATE_NM: "Texas",
    ORIGIN: "SAT",
    YEAR: 2010
  };
  return (
    <Layout title="Find a flight">
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Paper className={classes.paper}>
            <Typography variant="h6" color="secondary">
              Enter a flight
            </Typography>
            <div className={classes.fieldContainer}>
              <TextField
                name="OP_CARRIER_AIRLINE_ID"
                label="OP_CARRIER_AIRLINE_ID"
                variant="outlined"
                placeholder="Example: 20363"
              />
              <TextField
                name="FLIGHT_DATE"
                label="FLIGHT_DATE"
                placeholder={"Example: " + new Date()}
                variant="outlined"
              />
              <IconButton>
                <SearchIcon />
              </IconButton>
            </div>
          </Paper>
          <FlightCard flight={mockData} />
        </Container>
      </main>
    </Layout>
  );
}