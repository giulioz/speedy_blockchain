import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import { PeersState, Peer } from "@speedy_blockchain/common";
import Title from "../components/Title";
import Layout from "../components/Layout";
import fetchPeers from "../api/peers";
import { Card, CardContent, Typography, Grid } from "@material-ui/core";

function usePeers() {
  const [peers, setPeers] = useState<PeersState | null>(null);
  useEffect(() => {
    async function loadData() {
      // const data: PeersState = await fetchPeers();
      const data: PeersState = {
        peers: [
          { ip: "1.1.1.1", name: "Miner1", active: true },
          { ip: "1.1.1.2", name: "Miner2", active: false },
          { ip: "1.1.1.3", name: "Miner3" }
        ]
      };
      setPeers(data);
    }

    loadData();
  }, []);

  return peers;
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
    minHeight: "80vh",
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    "& > .MuiTypography-root": {
      marginBottom: theme.spacing(3)
    }
  },
  block: {
    paddingLeft: theme.spacing(1),
    width: "100%",
    backgroundColor: theme.palette.background.default,
    marginBottom: theme.spacing(1)
  },
  cardContent: {
    display: "flex",
    justifyContent: "space-between",
    "& > div": {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      flexBasis: "200px"
    },
    "& > :last-child": {
      justifyContent: "flex-end"
    },
    "& .MuiTypography-root": {
      display: "flex",
      alignItems: "center",
      flexBasis: "100px"
    }
  },
  online: {
    color: "green"
  },
  disconnected: {
    color: "tomato"
  }
}));

function PeerBlock(props) {
  const { peer } = props;
  const classes = useStyles();

  return (
    <Card className={classes.block}>
      <CardContent className={classes.cardContent}>
        <div>
          <Typography variant="h6">
            {peer.name ? peer.name : "Anonymous"}
          </Typography>
          <Typography color="textSecondary">( {peer.ip} )</Typography>
        </div>
        <Typography
          className={peer.active ? classes.online : classes.disconnected}
        >
          {peer.active ? "Online" : "Disconnected"}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Peers() {
  const classes = useStyles();

  const peersState = usePeers();
  console.log(peersState);
  return (
    <Layout title="Explore Blocks">
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Paper className={classes.paper}>
            <Title>Peers list</Title>
            {peersState
              ? peersState.peers.map(peer => <PeerBlock peer={peer} />)
              : null}
          </Paper>
        </Container>
      </main>
    </Layout>
  );
}
