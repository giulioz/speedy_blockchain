import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Blockchain from "./pages/Blockchain";
import Flights from "./pages/Flights";
import Peers from "./pages/Peers";
import CarrierInfo from "./pages/CarrierInfo";

const theme = (createMuiTheme as any)({
  palette: {
    type: "dark",
    primary: {
      main: "#bf6618",
    },
    secondary: {
      main: "#71bf18",
    },
  },
  overrides: {
    MUIDataTable: {
      responsiveScrollFullHeight: {
        overflow: "scroll",
      },
    },
  },
});

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route path="/blockchain/:id">
            <Blockchain />
          </Route>
          <Route exact path="/blockchain">
            <Blockchain />
          </Route>
          <Route path="/flights">
            <Flights />
          </Route>
          <Route path="/peers">
            <Peers />
          </Route>
          <Route path="/findFlight">
            <Layout title="Find Flight"></Layout>
          </Route>
          <Route path="/carrierInfo">
            <CarrierInfo />
          </Route>
          <Route path="/routeFinder">
            <Layout title="Route Finder"></Layout>
          </Route>
          <Route path="/" exact>
            <Dashboard />
          </Route>
        </Switch>
      </Router>
    </MuiThemeProvider>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
