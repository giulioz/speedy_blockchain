import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import { ChainState } from "@speedy_blockchain/common";
import { getChain } from "../api/blockchainREST";
import Title from "../components/Title";

function useChain() {
  const [chain, setChain] = useState<ChainState | null>(null);
  useEffect(() => {
    async function loadData() {
      const data = await getChain();
      setChain(data);
    }

    loadData();
  }, []);

  return chain;
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
    paddingBottom: theme.spacing(4)
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  }
}));

export default function Index() {
  const classes = useStyles();

  const chainState = useChain();

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Container maxWidth="lg" className={classes.container}>
        <Paper className={classes.paper}>
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
              {chainState
                ? chainState.chain.map(row => (
                    <TableRow key={row.hash}>
                      <TableCell>{row.hash}</TableCell>
                      <TableCell>{row.index}</TableCell>
                      <TableCell>{row.nonce}</TableCell>
                      <TableCell>{row.previousHash}</TableCell>
                      <TableCell>{row.timestamp}</TableCell>
                      <TableCell>{row.transactions.length}</TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </Paper>
      </Container>
    </main>
  );
}
