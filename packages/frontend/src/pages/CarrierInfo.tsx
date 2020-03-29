import React, { useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Layout from "../components/Layout";
import {
  Typography,
  TextField,
  Paper,
  LinearProgress,
} from "@material-ui/core";
import { Spring } from "react-spring/renderprops";
import { CarrierRequest, CarrierData } from "@speedy_blockchain/common";
import { useAsyncFormSearch } from "../utils";
import SearchForm from "../components/SearchForm";
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
    height: `calc(100% - 64px)`,
    display: "flex",
    flexDirection: "column",
  },
  progressBar: {
    minHeight: theme.spacing(1),
    width: "100%",
    position: "fixed",
  },
  carrierDataContainer: {
    padding: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexGrow: 1,
  },
  dataCardContainer: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  dataCard: {
    display: "flex",
    width: "200px",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
}));

interface DataCardProps {
  title: string;
  value: number;
  /** @default 'integer' */
  variant?: "integer" | "decimal";
}

function DataCard(props: DataCardProps) {
  const { title, value, variant } = props;
  const classes = useStyles();
  return (
    <div className={classes.dataCard}>
      <Typography variant="h5">{title}</Typography>{" "}
      <Spring
        config={{ mass: 5, friction: 70, clamp: true }}
        from={{ number: 0 }}
        to={{ number: value }}
      >
        {props => (
          <Typography variant="h4">
            {props.number.toFixed(variant === "decimal" ? 2 : 0)}
          </Typography>
        )}
      </Spring>
    </div>
  );
}

const DEFAULT_CARRIER_REQUEST_STATE: CarrierRequest = {
  OP_CARRIER_AIRLINE_ID: 20378,
  DATE_FROM: 0,
  DATE_TO: Date.now(),
};

export default function CarrierInfo() {
  const classes = useStyles();

  const apiCallback = useCallback(async (state: any) => {
    const result = await apiCall("POST /query/carriers", {
      body: {
        OP_CARRIER_AIRLINE_ID: parseFloat(state.OP_CARRIER_AIRLINE_ID),
        DATE_FROM: parseFloat(state.DATE_FROM),
        DATE_TO: parseFloat(state.DATE_TO),
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
    initialState: DEFAULT_CARRIER_REQUEST_STATE,
    apiCallback,
  });

  return (
    <Layout title="Carrier Info">
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <div className={classes.progressBar}>
          {searching && <LinearProgress color="secondary" />}
        </div>
        <Container maxWidth="xl" className={classes.container}>
          <SearchForm
            title="Enter a carrier airline ID and a time range"
            searching={searching}
            onSearch={onSearch}
          >
            <TextField
              name="OP_CARRIER_AIRLINE_ID"
              value={params?.OP_CARRIER_AIRLINE_ID}
              label="Carrier Airline ID"
              variant="outlined"
              placeholder="Example: 20363"
              onChange={onNamedInputStateChange}
            />
            <TextField
              name="DATE_FROM"
              value={params?.DATE_FROM}
              label="From"
              placeholder={"Example: " + new Date()}
              variant="outlined"
              onChange={onNamedInputStateChange}
            />
            <TextField
              name="DATE_TO"
              value={params?.DATE_TO}
              label="To"
              placeholder={"Example: " + new Date()}
              variant="outlined"
              onChange={onNamedInputStateChange}
            />
          </SearchForm>
          {data && (
            <Paper className={classes.carrierDataContainer}>
              <Typography variant="h4" color="secondary">
                Carrier #{data.OP_CARRIER_AIRLINE_ID}
              </Typography>
              <div className={classes.dataCardContainer}>
                <DataCard
                  title="Total flights"
                  value={data.TOTAL_NUMBER_OF_FLIGHTS}
                />
                <DataCard
                  title="Average delay"
                  variant="decimal"
                  value={data.AVERAGE_DELAY}
                />
                <DataCard
                  title="Delayed flights"
                  value={data.DELAYED_FLIGHTS}
                />
                <DataCard
                  title="Flights in advance"
                  value={data.FLIGHTS_IN_ADVANCE}
                />
              </div>
            </Paper>
          )}
        </Container>
      </main>
    </Layout>
  );
}
