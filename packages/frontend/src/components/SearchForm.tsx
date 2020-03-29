import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Paper, IconButton } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";

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
