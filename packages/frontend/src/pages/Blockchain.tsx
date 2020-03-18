import React, { useState } from "react";
import { formatISO } from "date-fns";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

import { Block, Transaction } from "@speedy_blockchain/common";
import Layout from "../components/Layout";
import BlockCard from "../components/BlockCard";
import FilterBar, { FilterFieldType } from "../components/FilterBar";

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
  }
}));

function MultipleBlocks({ blocks }: { blocks: Block[] }) {
  const [filters, setFilters] = useState<{
    id: FilterFieldType;
    timestamp: FilterFieldType;
    hash: FilterFieldType;
    nonce: FilterFieldType;
  }>({
    id: { label: "Block ID", value: "" },
    timestamp: { label: "Timestamp", value: "" },
    hash: { label: "Hash", value: "", grow: true },
    nonce: { label: "Nonce", value: "" }
  });

  const filteredBlocks = blocks.filter(
    b =>
      (filters.id.value.length == 0 ||
        b.index === parseInt(filters.id.value, 10)) &&
      (filters.timestamp.value.length == 0 ||
        formatISO(b.timestamp).includes(filters.timestamp.value)) &&
      (filters.hash.value.length == 0 || b.hash.includes(filters.hash.value)) &&
      (filters.nonce.value.length == 0 ||
        b.nonce.toString().includes(filters.nonce.value))
  );

  const handleFilterChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.persist();
    setFilters(f => ({
      ...f,
      [field]: { ...f[field], value: e.target.value }
    }));
  };

  return (
    <>
      <FilterBar onChange={handleFilterChange} filters={filters} />

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
