import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper, Typography, TextField } from "@material-ui/core";
import FlightIcon from "@material-ui/icons/Flight";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import ScheduleIcon from "@material-ui/icons/Schedule";
import amber from "@material-ui/core/colors/amber";
import green from "@material-ui/core/colors/green";
import { Flight } from "@speedy_blockchain/common";

const useStyles = makeStyles(theme => ({
  flightContainer: {
    width: "100%",
    minHeight: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  flightTitleContainer: {
    display: "flex",
    alignItems: "center",
    "& > *": {
      marginRight: theme.spacing(4),
    },
  },
  flightInfoContainer: {
    display: "flex",
    alignItems: "center",
    "& > *": {
      marginRight: theme.spacing(4),
    },
    "& > div": {
      display: "flex",
      flexDirection: "column",
    },
    "& > :last-child": {
      alignItems: "flex-end",
    },
  },
  huge: {
    fontSize: 40,
  },
  flightBetweenContainer: {
    display: "flex",
    alignItems: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "300px",
  },
  dottedLineContainer: {
    display: "flex",
    alignItems: "center",
  },
  dottedLine: {
    height: "1px",
    width: "80px",
    border: "2px dashed white",
  },
  duration: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(1),
    "& :first-child": {
      marginRight: theme.spacing(1),
    },
  },
}));

function CityTime(props: { city: string; time: string; delay: number }) {
  const { city, time, delay } = props;
  const parsedDelay = +delay;
  const absDelay = Math.abs(parsedDelay);
  const sign = parsedDelay < 0 ? "-" : "+";
  const delayString = sign + absDelay + " min";
  const color = parsedDelay < 0 ? green[500] : amber[500];
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

function FlightBetweenIcon(props: { duration: number }) {
  const { duration } = props;
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

export default function FlightCard(props: { flight: Flight }) {
  const { flight } = props;
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
