import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Zoom from "@material-ui/core/Zoom";

import { useTimeout } from "../utils";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    paddingTop: theme.spacing(16),
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
}));

export default function FullProgress() {
  const classes = useStyles();

  const show = useTimeout(300);

  return (
    <div className={classes.root}>
      <Zoom in={show}>
        <CircularProgress size={60} />
      </Zoom>
    </div>
  );
}
