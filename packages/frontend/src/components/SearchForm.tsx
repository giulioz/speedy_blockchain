import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Layout from "../components/Layout";
import {
  Typography,
  TextField,
  Paper,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import { Spring } from "react-spring/renderprops";
import { CarrierData } from "@speedy_blockchain/common";
import { useNamedInputState } from "../utils";

const useStyles = makeStyles(theme => ({
  root: {
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
    justifyContent: "space-between",
    flexWrap: "wrap",
    "& .MuiInputBase-root": {
      marginRight: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
  },
}));

interface SearchFormProps {
  title: string;
  searching: boolean;
  children: any;
  onSearch: () => void;
}

export default function SearchForm(props: SearchFormProps) {
  const { title, children, onSearch, searching } = props;
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <Typography variant="h6" color="secondary">
        {title}
      </Typography>
      <div className={classes.fieldContainer}>
        {children}
        <IconButton disabled={searching} onClick={onSearch}>
          <SearchIcon />
        </IconButton>
      </div>
    </Paper>
  );
}
