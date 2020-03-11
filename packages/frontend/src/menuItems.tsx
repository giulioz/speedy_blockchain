import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import DashboardIcon from "@material-ui/icons/Dashboard";
import ShareIcon from "@material-ui/icons/Share";
import FlightIcon from "@material-ui/icons/Flight";
import BarChartIcon from "@material-ui/icons/BarChart";
import LinkIcon from "@material-ui/icons/Link";
import BusinessIcon from "@material-ui/icons/Business";
import MapIcon from "@material-ui/icons/Map";
import FindIcon from "@material-ui/icons/Search";
import { Link } from "react-router-dom";

export const mainListItems = (
  <div>
    <ListSubheader inset>Administration</ListSubheader>

    <ListItem button component={Link} to="/">
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItem>

    <ListItem button component={Link} to="/blockchain">
      <ListItemIcon>
        <LinkIcon />
      </ListItemIcon>
      <ListItemText primary="Blockchain" />
    </ListItem>

    <ListItem button component={Link} to="/peers">
      <ListItemIcon>
        <ShareIcon />
      </ListItemIcon>
      <ListItemText primary="Peers" />
    </ListItem>

    <ListItem button component={Link} to="/stats">
      <ListItemIcon>
        <BarChartIcon />
      </ListItemIcon>
      <ListItemText primary="Stats" />
    </ListItem>
  </div>
);

export const secondaryListItems = (
  <div>
    <ListSubheader inset>User</ListSubheader>

    <ListItem button component={Link} to="/flights">
      <ListItemIcon>
        <FlightIcon />
      </ListItemIcon>
      <ListItemText primary="Flights" />
    </ListItem>

    <ListItem button component={Link} to="/findFlight">
      <ListItemIcon>
        <FindIcon />
      </ListItemIcon>
      <ListItemText primary="Find Flight" />
    </ListItem>

    <ListItem button component={Link} to="/carrierInfo">
      <ListItemIcon>
        <BusinessIcon />
      </ListItemIcon>
      <ListItemText primary="Carrier Info" />
    </ListItem>

    <ListItem button component={Link} to="/routeFinder">
      <ListItemIcon>
        <MapIcon />
      </ListItemIcon>
      <ListItemText primary="Route Finder" />
    </ListItem>
  </div>
);
