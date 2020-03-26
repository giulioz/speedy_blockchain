import React, { useState, useEffect } from "react";
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
import { CarrierData } from "@speedy_blockchain/common";
import { useNamedInputState } from "../utils";
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
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    marginBottom: theme.spacing(2),
    "& .MuiTypography-root": {
      marginBottom: theme.spacing(2),
    },
  },
  fieldContainer: {
    display: "flex",
    alignItems: "center",
    "& .MuiInputBase-root": {
      marginRight: theme.spacing(2),
    },
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

interface CarrierSearchState {
  carrierId: string;
  // from: Date;
  // to: Date;
}

const DEFAULT_CARRIER_SEARCH_STATE: CarrierSearchState = {
  carrierId: "",
};

function useCarrierSearch() {
  const { namedInputState, setNamedInputState } = useNamedInputState(
    DEFAULT_CARRIER_SEARCH_STATE
  );
  const [searching, setSearching] = useState<boolean>(false);
  const [carrierData, setCarrierData] = useState<CarrierData | null>(null);

  const handleSearch = () => setSearching(true);

  async function searchData() {
    console.log(namedInputState);
    // const data = await fetchCarrierData(namedInputState);
    const mockData: CarrierData = {
      carrierID: "20363",
      averageDelay: 1.4,
      totalNumberOfFlights: 720,
      delayedFlights: 69, // nice
      flightsInAdvance: 13,
      // flights: Flights[],
    };
    const data = await new Promise<CarrierData>(resolve =>
      setTimeout(() => {
        resolve(mockData);
      }, 1000)
    );
    setSearching(false);
    setCarrierData(data);
  }

  useEffect(() => {
    if (searching) {
      searchData();
    }
  }, [searchData, searching]);

  return { carrierData, searching, onSearch: handleSearch, setNamedInputState };
}

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

export default function CarrierInfo() {
  const classes = useStyles();
  const {
    carrierData,
    searching,
    onSearch,
    setNamedInputState,
  } = useCarrierSearch();

  return (
    <Layout title="Carrier Info">
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        {searching && <LinearProgress color="secondary" />}
        <Container maxWidth="xl" className={classes.container}>
          <SearchForm
            title="Enter a carrier airline ID and a time range"
            searching={searching}
            onSearch={onSearch}
          >
            <TextField
              name="carrierId"
              label="Carrier Airline ID"
              variant="outlined"
              placeholder="Example: 20363"
              onChange={setNamedInputState}
            />
            <TextField
              name="from"
              label="From"
              placeholder={"Example: " + new Date()}
              variant="outlined"
            />
            <TextField
              name="to"
              label="To"
              placeholder={"Example: " + new Date()}
              variant="outlined"
            />
          </SearchForm>
          {/* WIP */}
          {carrierData && (
            <Paper className={classes.carrierDataContainer}>
              <Typography variant="h4" color="secondary">
                Carrier #{carrierData.carrierID}
              </Typography>
              <div className={classes.dataCardContainer}>
                <DataCard
                  title="Total flights"
                  value={carrierData.totalNumberOfFlights}
                />
                <DataCard
                  title="Average delay"
                  variant="decimal"
                  value={carrierData.averageDelay}
                />
                <DataCard
                  title="Delayed flights"
                  value={carrierData.delayedFlights}
                />
                <DataCard
                  title="Flights in advance"
                  value={carrierData.flightsInAdvance}
                />
              </div>
            </Paper>
          )}
        </Container>
      </main>
    </Layout>
  );
}
