import React from "react";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Title from "./Title";

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

const useStyles = makeStyles(theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function RecentBlocks() {
  const classes = useStyles();
  return (
    <>
      <Title>Recent Transactions</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Hash</TableCell>
            <TableCell>Index</TableCell>
            <TableCell>Nonce</TableCell>
            <TableCell>Previous Hash</TableCell>
            <TableCell>Timestamp</TableCell>
            <TableCell>Transactions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* <TableRow key={row.id}>
            <TableCell>{row.date}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.shipTo}</TableCell>
            <TableCell>{row.paymentMethod}</TableCell>
            <TableCell align="right">{row.amount}</TableCell>
          </TableRow> */}
        </TableBody>
      </Table>
      <div className={classes.seeMore}>
        <Link color="primary" href="#" onClick={preventDefault}>
          See more transactions
        </Link>
      </div>
    </>
  );
}
