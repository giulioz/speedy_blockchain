import React from "react";
import clsx from "clsx";
import { formatISO } from "date-fns";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import { Block } from "@speedy_blockchain/common";

const useStyles = makeStyles(theme => ({
  paper: {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  },
  upper: {
    textTransform: "uppercase"
  },
  transactionsTitle: {
    marginTop: theme.spacing(1)
  },
  infoBox: {
    marginTop: theme.spacing(2),
    margin: theme.spacing(1)
  },
  baseline: {
    alignSelf: "baseline",
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      flexDirection: "column",
      textAlign: "center",
      alignItems: "center",
      width: "100%",
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      marginLeft: 0
    }
  },
  inline: {
    display: "inline-block",
    marginRight: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0
    }
  }
}));

export default function BlockCard({ block }: { block: Block }) {
  const classes = useStyles();

  return (
    <Paper className={classes.paper}>
      <Typography variant="h4" gutterBottom>
        Block #{block.index}
      </Typography>
      <Divider />

      <div className={classes.infoBox}>
        <div className={classes.baseline}>
          <div className={clsx(classes.upper, classes.inline)}>
            <Typography color="primary" gutterBottom>
              Hash
            </Typography>
            <Typography gutterBottom>{block.hash}</Typography>
          </div>
          <div className={clsx(classes.upper, classes.inline)}>
            <Typography color="primary" gutterBottom>
              Timestamp
            </Typography>
            <Typography gutterBottom>{formatISO(block.timestamp)}</Typography>
          </div>
          <div className={clsx(classes.upper, classes.inline)}>
            <Typography color="primary" gutterBottom>
              N Transactions
            </Typography>
            <Typography gutterBottom>{block.transactions.length}</Typography>
          </div>
          <div className={clsx(classes.upper, classes.inline)}>
            <Typography color="primary" gutterBottom>
              Nonce
            </Typography>
            <Typography gutterBottom>{block.nonce}</Typography>
          </div>
        </div>

        <Typography
          color="primary"
          gutterBottom
          className={clsx(classes.upper, classes.transactionsTitle)}
        >
          Transactions
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>OP_CARRIER_FL_NUM</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {block.transactions.map(t => (
              <TableRow>
                <TableCell>{t.id}</TableCell>
                <TableCell>{t.timestamp}</TableCell>
                <TableCell>{t.content.OP_CARRIER_FL_NUM}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Paper>
  );
}
