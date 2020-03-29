import React, { useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Layout from "../components/Layout";
import { TextField, LinearProgress } from "@material-ui/core";
import SearchForm from "../components/SearchForm";
import { useAsyncFormSearch } from "../utils";
import FlightCard from "../components/FlightCard";
import apiCall from "../api/apiCall";

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
    "& > :first-child": {
      marginBottom: theme.spacing(4),
    },
  },
  progressBar: {
    minHeight: theme.spacing(1),
    width: "100%",
    position: "fixed",
  },
}));

const emptyFlight = {
  OP_CARRIER_FL_NUM: 3692,
  FL_DATE: 1263855600,
};

export default function FindFlight() {
  const classes = useStyles();

  const apiCallback = useCallback(async (state: any) => {
    const result = await apiCall("POST /query/flights", {
      body: {
        OP_CARRIER_FL_NUM: parseFloat(state.OP_CARRIER_FL_NUM),
        FL_DATE: parseFloat(state.FL_DATE),
      },
      params: {},
    });

    if (result.status === "ok") {
      return result.data;
    }
  }, []);

  const {
    data,
    params,
    searching,
    onSearch,
    onNamedInputStateChange,
  } = useAsyncFormSearch({
    initialState: emptyFlight,
    apiCallback,
  });

  return (
    <Layout title="Find a flight">
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <div className={classes.progressBar}>
          {searching && <LinearProgress color="secondary" />}
        </div>
        <Container maxWidth="lg" className={classes.container}>
          <SearchForm
            title="Enter a flight"
            searching={searching}
            onSearch={onSearch}
          >
            <TextField
              name="OP_CARRIER_FL_NUM"
              label="Flight number"
              variant="outlined"
              placeholder="Example: 20363"
              value={params?.OP_CARRIER_FL_NUM}
              onChange={onNamedInputStateChange}
            />
            <TextField
              name="FL_DATE"
              label="Flight date"
              placeholder={"Example: " + new Date()}
              variant="outlined"
              value={params?.FL_DATE}
              onChange={onNamedInputStateChange}
            />
          </SearchForm>
          {data?.map(flight => (
            <FlightCard flight={flight} />
          ))}
        </Container>
      </main>
    </Layout>
  );
}
