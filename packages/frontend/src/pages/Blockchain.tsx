import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

import { Block } from "@speedy_blockchain/common";
import Layout from "../components/Layout";
import BlockCard from "../components/BlockCard";

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

export default function Blockchain() {
  const classes = useStyles();

  const blocks: Block[] = new Array(5)
    .fill(0)
    .map((_, i) => ({
      hash: "f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2",
      index: i,
      transactions: [
        {
          id: "test",
          timestamp: 0,
          content: {
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
            OP_CARRIER_FL_NUM: "000",
            ORIGIN_AIRPORT_ID: 0,
            ORIGIN_CITY_NAME: "",
            ORIGIN_STATE_NM: "",
            ORIGIN: "",
            YEAR: 0
          }
        }
      ],
      timestamp: new Date().getTime(),
      previousHash:
        "f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2",
      nonce: 42
    }))
    .reverse();

  return (
    <Layout title="Explore Blocks">
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          {blocks.map(block => (
            <BlockCard block={block} />
          ))}
        </Container>
      </main>
    </Layout>
  );
}
