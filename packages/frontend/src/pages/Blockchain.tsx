import React, { useState, useEffect } from "react";
import { formatISO } from "date-fns";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import { Block, Transaction } from "@speedy_blockchain/common";
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
  filterBar: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4)
  },
  filterField: {
    marginRight: theme.spacing(2)
  }
}));

function MultipleBlocks({ blocks }: { blocks: Block[] }) {
  const classes = useStyles();

  const [filters, setFilters] = useState<{
    id: string;
    timestamp: string;
    hash: string;
    nonce: string;
  }>({ id: "", timestamp: "", hash: "", nonce: "" });

  const filteredBlocks = blocks.filter(
    b =>
      (filters.id.length == 0 || b.index === parseInt(filters.id, 10)) &&
      (filters.timestamp.length == 0 ||
        formatISO(b.timestamp).includes(filters.timestamp)) &&
      (filters.hash.length == 0 || b.hash.includes(filters.hash)) &&
      (filters.nonce.length == 0 || b.nonce.toString().includes(filters.nonce))
  );

  const handleFilterChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.persist();
    setFilters(f => ({ ...f, [field]: e.target.value }));
  };

  return (
    <>
      <Paper className={classes.filterBar} elevation={8}>
        <div>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
        </div>
        <TextField
          className={classes.filterField}
          variant="outlined"
          label="Block ID"
          value={filters.id}
          onChange={handleFilterChange("id")}
        ></TextField>
        <TextField
          className={classes.filterField}
          variant="outlined"
          label="Timestamp"
          value={filters.timestamp}
          onChange={handleFilterChange("timestamp")}
        ></TextField>
        <TextField
          className={classes.filterField}
          variant="outlined"
          label="Hash"
          value={filters.hash}
          onChange={handleFilterChange("hash")}
        ></TextField>
        <TextField
          className={classes.filterField}
          variant="outlined"
          label="Nonce"
          value={filters.nonce}
          onChange={handleFilterChange("nonce")}
        ></TextField>
      </Paper>

      {filteredBlocks.map(block => (
        <BlockCard key={block.index + block.hash} block={block} />
      ))}
    </>
  );
}

export default function Blockchain() {
  const classes = useStyles();

  const blocks: Block[] = new Array(5)
    .fill(0)
    .map((_, i) => ({
      hash: "f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2",
      index: i,
      transactions: new Array(20).fill(0).map(
        (_, i): Transaction => ({
          id: "test" + i,
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
            OP_CARRIER_FL_NUM: "00" + i,
            ORIGIN_AIRPORT_ID: 0,
            ORIGIN_CITY_NAME: "",
            ORIGIN_STATE_NM: "",
            ORIGIN: "",
            YEAR: 0
          }
        })
      ),
      timestamp: new Date().getTime(),
      previousHash:
        "f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2",
      nonce: 42
    }))
    .reverse();

  const { id } = useParams();
  const nId = parseInt(id);
  const selectedBlock = blocks.find(b => b.index === nId);

  return (
    <Layout title="Explore Blocks">
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          {selectedBlock ? (
            <BlockCard block={selectedBlock} seeAll />
          ) : (
            <MultipleBlocks blocks={blocks} />
          )}
        </Container>
      </main>
    </Layout>
  );
}
