import React from "react";
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

const mockData: CarrierData = {
  OP_CARRIER_AIRLINE_ID: "20363",
  AVERAGE_DELAY: 1.4,
  TOTAL_NUMBER_OF_FLIGHTS: 720,
  DELAYED_FLIGHTS: 69, // nice
  FLIGHTS_IN_ADVANCE: 13,
  // flights: Flights[],
};

const DEFAULT_CARRIER_REQUEST_STATE: CarrierRequest = {
  OP_CARRIER_AIRLINE_ID: "",
  DATE_FROM: 0,
  DATE_TO: 100,
};

export default function CarrierInfo() {
  const classes = useStyles();

  const {
    data,
    searching,
    onSearch,
    onNamedInputStateChange,
  } = useAsyncFormSearch({
    initialState: DEFAULT_CARRIER_REQUEST_STATE,
    apiCallback: () => mockData,
    isMock: true,
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
              label="Carrier Airline ID"
              variant="outlined"
              placeholder="Example: 20363"
              onChange={onNamedInputStateChange}
            />
            <TextField
              name="FROM"
              label="From"
              placeholder={"Example: " + new Date()}
              variant="outlined"
              onChange={onNamedInputStateChange}
            />
            <TextField
              name="TO"
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
