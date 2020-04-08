import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";

import { Block } from "@speedy_blockchain/common";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(3),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "500px",
  },
}));

export default function LoadingCard({ style }: any) {
  const classes = useStyles();
  const rootStyle = classes.root;
  return (
    <div style={{ ...style, padding: "32px" }}>
      <Paper className={classes.paper} elevation={4}>
        Loading
      </Paper>
    </div>
  );
}
