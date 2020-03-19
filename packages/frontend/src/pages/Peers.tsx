import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";

import { Peer } from "@speedy_blockchain/common";
import Title from "../components/Title";
import Layout from "../components/Layout";
import { Card, CardContent, Typography } from "@material-ui/core";
import { useRemoteData } from "../api/hooks";

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

function PeerBlock({ peer }: { peer: Peer }) {
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

  const peersState = useRemoteData("GET /peers");

  return (
    <Layout title="Explore Blocks">
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Paper className={classes.paper}>
            <Title>Peers list</Title>
            {peersState &&
              peersState.peers.map(peer => (
                <PeerBlock key={peer.ip} peer={peer} />
              ))}
          </Paper>
        </Container>
      </main>
    </Layout>
  );
}
