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
      (filters.id.value.length === 0 ||
        b.index === parseInt(filters.id.value, 10)) &&
      (filters.timestamp.value.length === 0 ||
        formatISO(b.timestamp).includes(filters.timestamp.value)) &&
      (filters.hash.value.length === 0 ||
        b.hash.includes(filters.hash.value)) &&
      (filters.nonce.value.length === 0 ||
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

// HACK
const maxBlocks = 50;

export default function Blockchain() {
  const classes = useStyles();

  const lastBlock = useRemoteData("GET /block/last", {});
  const from =
    (lastBlock && typeof lastBlock !== "string" && lastBlock.index) || 0;
  const to = from + maxBlocks;

  const blocks = useRemoteData("GET /blocks/from/:from/to/:to", {
    from: from.toString(),
    to: to.toString()
  });

  const { id } = useParams();
  const nId = parseInt(id);
  const selectedBlock = blocks && blocks.find(b => b.index === nId);

  return (
    <Layout title="Explore Blocks">
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          {blocks ? (
            selectedBlock ? (
              <BlockCard block={selectedBlock} seeAll />
            ) : (
              <MultipleBlocks blocks={blocks} />
            )
          ) : (
            <FullProgress />
          )}
        </Container>
      </main>
    </Layout>
  );
}
