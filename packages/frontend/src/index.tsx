import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Blockchain from "./pages/Blockchain";
import Flights from "./pages/Flights";

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#2979ff"
    },
    secondary: {
      main: "#ff5252"
    }
  }
});

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route path="/blockchain">
            <Blockchain />
          </Route>
          <Route path="/flights">
            <Flights />
          </Route>
          <Route path="/peers">
            <Layout title="Peers"></Layout>
          </Route>
          <Route path="/stats">
            <Layout title="Stats"></Layout>
          </Route>
          <Route path="/findFlight">
            <Layout title="Find Flight"></Layout>
          </Route>
          <Route path="/carrierInfo">
            <Layout title="Carrier Info"></Layout>
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
