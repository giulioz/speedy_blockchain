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
import PostAddIcon from "@material-ui/icons/PostAdd";
import BusinessIcon from "@material-ui/icons/Business";
import MapIcon from "@material-ui/icons/Map";

export const mainListItems = (
  <div>
    <ListSubheader inset>Administration</ListSubheader>
    <ListItem button>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <LinkIcon />
      </ListItemIcon>
      <ListItemText primary="Blockchain" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <FlightIcon />
      </ListItemIcon>
      <ListItemText primary="Flights" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <ShareIcon />
      </ListItemIcon>
      <ListItemText primary="Peers" />
    </ListItem>
    <ListItem button>
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
    <ListItem button>
      <ListItemIcon>
        <PostAddIcon />
      </ListItemIcon>
      <ListItemText primary="Add Flight" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <FlightIcon />
      </ListItemIcon>
      <ListItemText primary="Flight Status" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <BusinessIcon />
      </ListItemIcon>
      <ListItemText primary="Carrier Info" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <MapIcon />
      </ListItemIcon>
      <ListItemText primary="Route Finder" />
    </ListItem>
  </div>
);
