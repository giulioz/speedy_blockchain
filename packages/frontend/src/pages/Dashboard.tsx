import React, { useCallback, useState, useEffect, useRef } from "react";
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

export default function Dashboard() {
  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  // Auto update
  const setForceUpdate = useState(0)[1];
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceUpdate(a => a + 1);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const chainInfo = useRemoteData("GET /chainInfo");

  return (
    <Layout title="Dashboard">
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          {chainInfo?.status === "ok" ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} lg={3}>
                <Paper className={fixedHeightPaper}>
                  <Title>Total Number of Blocks</Title>
                  <Typography
                    component="p"
                    variant="h4"
                    className={classes.grow}
                  >
                    {chainInfo.data.length}
                  </Typography>
                  <div>
                    <Link
                      color="primary"
                      component={RouterLink}
                      to="blockchain"
                    >
                      View all
                    </Link>
                  </div>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4} lg={3}>
                <Paper className={fixedHeightPaper}>
                  <Title>Number of Transactions</Title>
                  <Typography
                    component="p"
                    variant="h4"
                    className={classes.grow}
                  >
                    {chainInfo.data.transactionCount}
                  </Typography>
                  <div>
                    <Link
                      color="primary"
                      component={RouterLink}
                      to="blockchain"
                    >
                      View all
                    </Link>
                  </div>
                </Paper>
              </Grid>
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
