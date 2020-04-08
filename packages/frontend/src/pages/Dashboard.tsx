import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { Link as RouterLink } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import RecentBlocks from "../components/RecentBlocks";
import Layout from "../components/Layout";
import { useRemoteData } from "../api/hooks";
import FullProgress from "../components/FullProgress";
import Title from "../components/Title";

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
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  fixedHeight: {
    height: 180,
  },
  grow: {
    flex: 1,
  },
}));

function InfoBox({
  title,
  moreLink,
  moreText,
  children,
}: React.PropsWithChildren<{
  title: string;
  moreLink: string;
  moreText: string;
}>) {
  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  return (
    <Grid item xs={12} md={4} lg={3}>
      <Paper className={fixedHeightPaper}>
        <Title>{title}</Title>
        <Typography component="p" variant="h4" className={classes.grow}>
          {children}
        </Typography>
        <div>
          <Link color="primary" component={RouterLink} to={moreLink}>
            {moreText}
          </Link>
        </div>
      </Paper>
    </Grid>
  );
}

export default function Dashboard() {
  const classes = useStyles();

  const chainInfo = useRemoteData("GET /chainInfo");
  const peersState = useRemoteData("GET /peers");

  // Auto update
  const [forceUpdate, setForceUpdate] = useState(0);
  useEffect(() => {
    function update() {
      setForceUpdate(a => a + 1);
    }

    const timeout = setTimeout(update, 5000);
    return () => clearTimeout(timeout);
  }, [forceUpdate]);

  return (
    <Layout title="Dashboard">
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          {chainInfo &&
          peersState &&
          chainInfo.status === "ok" &&
          peersState.status === "ok" ? (
            <Grid container spacing={3}>
              <InfoBox
                title="Total Number of Blocks"
                moreLink="/blockchain"
                moreText="View all"
              >
                {chainInfo.data.length}
              </InfoBox>
              <InfoBox
                title="Number of Transactions"
                moreLink="/flights"
                moreText="View all"
              >
                {chainInfo.data.transactionCount}
              </InfoBox>
              <InfoBox
                title="Connected Peers"
                moreLink="/peers"
                moreText="View all"
              >
                {peersState.data.length}
              </InfoBox>
              <Grid item xs={12}>
                <Paper className={classes.paper}>
                  <RecentBlocks />
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <FullProgress />
          )}
        </Container>
      </main>
    </Layout>
  );
}
