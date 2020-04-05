import React, { useState } from "react";
import { formatISO } from "date-fns";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

import { Block } from "@speedy_blockchain/common";
import Layout from "../components/Layout";
import BlockCard from "../components/BlockCard";
import FullProgress from "../components/FullProgress";
import FilterBar, { FilterFieldType } from "../components/FilterBar";
import { useLastNBlocks, useRemoteData } from "../api/hooks";

const useStyles = makeStyles(theme => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
}));

type Filters = {
  id: FilterFieldType;
  timestamp: FilterFieldType;
  hash: FilterFieldType;
  nonce: FilterFieldType;
};

// HACK
const maxBlocks = 50;

function MultipleBlocks() {
  const classes = useStyles();

  const blocks = useLastNBlocks(maxBlocks);

  const [filters, setFilters] = useState<Filters>({
    id: { label: "Block ID", value: "" },
    timestamp: { label: "Timestamp", value: "" },
    hash: { label: "Hash", value: "", grow: true },
    nonce: { label: "Nonce", value: "" },
  });

  const handleFilterChange = (field: keyof Filters) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.persist();
    setFilters(f => ({
      ...f,
      [field]: { ...f[field], value: e.target.value },
    }));
  };

  if (!blocks) {
    return (
      <Layout title="Explore Blocks">
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="lg" className={classes.container}>
            <FilterBar onChange={handleFilterChange} filters={filters} />
            <FullProgress />
          </Container>
        </main>
      </Layout>
    );
  }

  const filteredBlocks = blocks.filter(
    b =>
      (filters.id.value.length === 0 ||
        b.index === parseInt(filters.id.value, 10)) &&
      (filters.timestamp.value.length === 0 ||
        formatISO(b.timestamp).includes(filters.timestamp.value)) &&
      (filters.hash.value.length === 0 ||
        b.hash.includes(filters.hash.value)) &&
      (filters.nonce.value.length === 0 ||
        b.nonce.toString().includes(filters.nonce.value))
  );

  return (
    <Layout title="Explore Blocks">
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <FilterBar onChange={handleFilterChange} filters={filters} />

          {filteredBlocks.map(block => (
            <BlockCard key={block.index + block.hash} block={block} />
          ))}
        </Container>
      </main>
    </Layout>
  );
}

function SingleBlock({ id = 0 }) {
  const classes = useStyles();

  const block = useRemoteData("GET /block/:blockId", {
    blockId: id.toString(),
  });

  return (
    <Layout title="Explore Blocks">
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          {block && block.status === "ok" ? (
            <BlockCard block={block.data} seeAll />
          ) : (
            <FullProgress />
          )}
        </Container>
      </main>
    </Layout>
  );
}

export default function Blockchain() {
  const classes = useStyles();

  const { id } = useParams();
  const nId = id !== undefined ? parseInt(id) : null;

  if (nId !== null) {
    return <SingleBlock id={nId} />;
  } else {
    return <MultipleBlocks />;
  }
}
