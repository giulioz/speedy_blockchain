import React from "react";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import Container from "@material-ui/core/Container";
import Layout from "../components/Layout";
import BlockCard from "../components/BlockCard";
import LoadingCard from "../components/LoadingCard";
import FullProgress from "../components/FullProgress";
import FilterBar, { FilterFieldType } from "../components/FilterBar";
import {
  useBlockLoader,
  useRemoteData,
  useUpdatedChainLength,
} from "../api/hooks";
import { useInfiniteLoader } from "../utils";

const useStyles = makeStyles(theme => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    width: "100%",
    flexGrow: 1,
    overflow: "hidden",
    paddingLeft: 0,
    paddingRight: 0,
  },
  list: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(4),
    paddingTop: theme.spacing(4),
  },
}));

type Filters = {
  id: FilterFieldType;
  timestamp: FilterFieldType;
  hash: FilterFieldType;
  nonce: FilterFieldType;
};

const BLOCK_SIZE = 542;

function MultipleBlocks() {
  const { chainLength } = useUpdatedChainLength();
  const { blocks, loadMoreBlocks } = useBlockLoader(chainLength);

  React.useEffect(() => {
    loadMoreBlocks({ startIndex: 0, endIndex: 10 });
  }, [loadMoreBlocks]);

  if (blocks == null) {
    return <FullProgress />;
  } else {
    return (
      <VirtualizedBlockList
        chainLength={chainLength}
        blocks={blocks}
        loadMoreBlocks={loadMoreBlocks}
      />
    );
  }
}

function VirtualizedBlockList(props: any) {
  const { blocks, loadMoreBlocks, chainLength } = props;
  const listRef = React.useRef(null);
  const classes = useStyles();

  const { onItemsRendered } = useInfiniteLoader(listRef, {
    isItemLoaded,
    loadMoreItems: loadMoreBlocks,
    itemCount: chainLength,
  });

  function isItemLoaded(index: any) {
    return blocks && blocks[index] != null;
  }

  return (
    <AutoSizer>
      {({ width, height }) => (
        <FixedSizeList
          className={classes.list}
          ref={listRef}
          itemData={blocks}
          itemCount={chainLength}
          itemSize={BLOCK_SIZE}
          width={width}
          height={height}
          onItemsRendered={onItemsRendered}
        >
          {Row}
        </FixedSizeList>
      )}
    </AutoSizer>
  );
}

function Row({ index, data, style }: any) {
  const block = data[index];
  if (block) {
    return <BlockCard style={style} block={block} />;
  } else {
    return <LoadingCard style={style} />;
  }
}

function SingleBlock({ id = 0 }) {
  const block = useRemoteData("GET /block/:blockId", {
    blockId: id.toString(),
  });

  return (
    <>
      {block && block.status === "ok" ? (
        <BlockCard block={block.data} seeAll />
      ) : (
        <FullProgress />
      )}
    </>
  );
}

export default function Blockchain() {
  const classes = useStyles();

  const { id } = useParams();
  const nId = id !== undefined ? parseInt(id) : null;

  return (
    <Layout title="Explore Blocks">
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container
          maxWidth="lg"
          className={classes.container}
          style={nId === null ? { height: "calc(100% - 64px)" } : {}}
        >
          {nId !== null ? <SingleBlock id={nId} /> : <MultipleBlocks />}
        </Container>
      </main>
    </Layout>
  );
}
