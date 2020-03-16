import React from "react";
import clsx from "clsx";
import { Link as RouterLink } from "react-router-dom";
import { formatISO } from "date-fns";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
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
    padding: theme.spacing(3),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  },
  upper: {
    textTransform: "uppercase"
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
  },
  transactionsTitle: {
    marginTop: theme.spacing(2)
  },
  seeMore: {
    marginTop: theme.spacing(1)
  }
}));

export default function BlockCard({
  block,
  seeAll = false
}: {
  block: Block;
  seeAll?: boolean;
}) {
  const classes = useStyles();

  const transactions = seeAll
    ? block.transactions
    : block.transactions.slice(0, 4);

  return (
    <Paper className={classes.paper} elevation={4}>
      <Link
        variant="h4"
        color="textPrimary"
        gutterBottom
        component={RouterLink}
        to={`/blockchain/${block.index}`}
      >
        Block #{block.index}
      </Link>
      <Divider />

      <div className={classes.infoBox}>
        <div className={classes.baseline}>
          <div className={clsx(classes.upper, classes.inline)}>
            <Typography color="secondary" gutterBottom>
              Trans. Count
            </Typography>
            <Typography gutterBottom>{block.transactions.length}</Typography>
          </div>
          <div className={clsx(classes.upper, classes.inline)}>
            <Typography color="secondary" gutterBottom>
              Timestamp
            </Typography>
            <Typography gutterBottom>{formatISO(block.timestamp)}</Typography>
          </div>
          <div className={clsx(classes.upper, classes.inline)}>
            <Typography color="secondary" gutterBottom>
              Hash
            </Typography>
            <Typography gutterBottom>{block.hash}</Typography>
          </div>
          <div className={clsx(classes.upper, classes.inline)}>
            <Typography color="secondary" gutterBottom>
              Nonce
            </Typography>
            <Typography gutterBottom>{block.nonce}</Typography>
          </div>
        </div>

        <Typography
          color="secondary"
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
            {transactions.map(t => (
              <TableRow key={t.id}>
                <TableCell>{t.id}</TableCell>
                <TableCell>{formatISO(t.timestamp)}</TableCell>
                <TableCell>{t.content.OP_CARRIER_FL_NUM}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!seeAll && (
          <div className={classes.seeMore}>
            <Button component={RouterLink} to={`/blockchain/${block.index}`}>
              See more
            </Button>
          </div>
        )}
      </div>
    </Paper>
  );
}
