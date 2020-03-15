import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import { Flight } from "@speedy_blockchain/common/dist";

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: "500px"
  },
  form: {
    display: "grid",
    width: "100%",
    gridTemplateColumns: "1fr 1fr 1fr",
    gridColumnGap: theme.spacing(4),
    gridRowGap: theme.spacing(2)
  },
  bigField: {
    gridColumn: "1 / 4"
  },
  mediumFieldLeft: {
    gridColumn: "1 / 3"
  },
  mediumFieldRight: {
    gridColumn: "2 / 4"
  }
}));

const EMPTY_FLIGHT: Flight = {
  AIR_TIME: 0,
  ARR_DELAY: 0,
  ARR_TIME: "",
  CANCELLED: 0,
  DAY_OF_WEEK: 0,
  DEP_DELAY: 0,
  DEP_TIME: "",
  DEST_AIRPORT_ID: 0,
  DEST_CITY_NAME: "",
  DEST_STATE_NM: "",
  DEST: "",
  FLIGHT_DATE: new Date(),
  OP_CARRIER_AIRLINE_ID: 0,
  OP_CARRIER_FL_NUM: "",
  ORIGIN_AIRPORT_ID: 0,
  ORIGIN_CITY_NAME: "",
  ORIGIN_STATE_NM: "",
  ORIGIN: "",
  YEAR: 0
};

export default function AddFlightDialog({
  open,
  onClose,
  onSubmit
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (flight: Flight) => void;
}) {
  const classes = useStyles();

  const [flight, setFlight] = useState<Flight>(EMPTY_FLIGHT);

  const changeFlightValue = ({ target }) =>
    setFlight(prev => ({ ...prev, [target.name]: target.value }));

  return (
    <Dialog className={classes.root} open={open} onClose={onClose}>
      <DialogTitle>Add a new flight</DialogTitle>
      <DialogContent className={classes.form}>
        <TextField
          className={classes.bigField}
          onChange={changeFlightValue}
          name="YEAR"
          label="YEAR"
          placeholder="Example: 2010"
        />
        <TextField
          className={classes.mediumFieldLeft}
          onChange={changeFlightValue}
          name="DAY_OF_WEEK"
          label="DAY_OF_WEEK"
          placeholder="Example: 5"
        />
        <TextField
          onChange={changeFlightValue}
          name="FL_DATE"
          label="FL_DATE"
          placeholder="Example: 2010-01-15"
        />
        <TextField
          onChange={changeFlightValue}
          name="OP_CARRIER_AIRLINE_ID"
          label="OP_CARRIER_AIRLINE_ID"
          placeholder="Example: 20363"
        />
        <TextField
          onChange={changeFlightValue}
          className={classes.mediumFieldRight}
          name="OP_CARRIER_FL_NUM"
          label="OP_CARRIER_FL_NUM"
          placeholder="Example: 3692"
        />
        <TextField
          onChange={changeFlightValue}
          name="ORIGIN_AIRPORT_ID"
          label="ORIGIN_AIRPORT_ID"
          placeholder="Example: 14683"
        />
        <TextField
          onChange={changeFlightValue}
          name="ORIGIN"
          label="ORIGIN"
          placeholder="Example: SAT"
        />
        <TextField
          onChange={changeFlightValue}
          name="ORIGIN_CITY_NAME"
          label="ORIGIN_CITY_NAME"
          placeholder="Example: San Antonio, TX"
        />
        <TextField
          onChange={changeFlightValue}
          name="ORIGIN_STATE_NM"
          label="ORIGIN_STATE_NM"
          placeholder="Example: Texas"
        />
        <TextField
          onChange={changeFlightValue}
          name="DEST_AIRPORT_ID"
          label="DEST_AIRPORT_ID"
          placeholder="Example: 13244"
        />
        <TextField
          onChange={changeFlightValue}
          name="DEST"
          label="DEST"
          placeholder="Example: MEM"
        />
        <TextField
          onChange={changeFlightValue}
          name="DEST_CITY_NAME"
          label="DEST_CITY_NAME"
          placeholder="Example: Memphis, TN"
        />
        <TextField
          onChange={changeFlightValue}
          name="DEST_STATE_NM"
          label="DEST_STATE_NM"
          placeholder="Example: Tennessee"
        />
        <TextField
          onChange={changeFlightValue}
          name="DEP_TIME"
          label="DEP_TIME"
          placeholder="Example: 1605"
        />
        <TextField
          onChange={changeFlightValue}
          name="DEP_DELAY"
          label="DEP_DELAY"
          placeholder="Example: -5.00"
        />
        <TextField
          onChange={changeFlightValue}
          name="ARR_TIME"
          label="ARR_TIME"
          placeholder="Example: 1749"
        />
        <TextField
          onChange={changeFlightValue}
          name="ARR_DELAY"
          label="ARR_DELAY"
          placeholder="Example: -11.00"
        />
        <TextField
          onChange={changeFlightValue}
          name="CANCELLED"
          label="CANCELLED"
          placeholder="Example: 0.00"
        />
        <TextField
          onChange={changeFlightValue}
          name="AIR_TIM"
          label="AIR_TIM"
          placeholder="Example: 90.00"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={() => onSubmit(flight)} color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
