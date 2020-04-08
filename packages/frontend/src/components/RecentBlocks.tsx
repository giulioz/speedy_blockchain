import React from "react";
import { Link as RouterLink } from "react-router-dom";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Title from "./Title";
import { useLastNBlocks } from "../api/hooks";
import FullProgress from "./FullProgress";

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

  const recentBlocks = useLastNBlocks(5);

  return (
    <>
      <Title>Recent Transactions</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Index</TableCell>
            <TableCell>Timestamp</TableCell>
            <TableCell>Hash</TableCell>
            <TableCell>Nonce</TableCell>
            <TableCell>Mined By</TableCell>
            <TableCell>Transactions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {recentBlocks ? (
            recentBlocks.map(block => (
              <TableRow key={block.hash}>
                <TableCell>{block.index}</TableCell>
                <TableCell>{block.timestamp}</TableCell>
                <TableCell>{block.hash}</TableCell>
                <TableCell>{block.nonce}</TableCell>
                <TableCell>{block.minedBy}</TableCell>
                <TableCell align="right">{block.transactions.length}</TableCell>
              </TableRow>
            ))
          ) : (
            <FullProgress />
          )}
        </TableBody>
      </Table>
      <div className={classes.seeMore}>
        <Link color="primary" component={RouterLink} to="/blockchain">
          See more blocks
        </Link>
      </div>
    </>
  );
}
