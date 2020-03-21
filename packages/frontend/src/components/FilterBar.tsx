import React from "react";
import clsx from "clsx";
import { makeStyles, fade } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Toolbar from "@material-ui/core/Toolbar";
import InputBase from "@material-ui/core/InputBase";
import FiltersIcon from "@material-ui/icons/FilterList";

const useStyles = makeStyles(theme => ({
  filterBarPaper: {
    marginBottom: theme.spacing(4),
  },
  filterBar: {
    alignItems: "center",
  },
  filterIcon: {
    marginRight: theme.spacing(2),
  },
  filterField: {
    borderRadius: theme.shape.borderRadius,
    marginRight: theme.spacing(2),
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
  },
  filterFieldGrow: {
    flexGrow: 1,
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 2),
    transition: theme.transitions.create("width"),
    width: "100%",
  },
}));

export type FilterFieldType = { label: string; value: string; grow?: boolean };

function FilterField({
  placeholder,
  value,
  onChange,
  grow = false,
}: {
  placeholder: string;
  value: string;
  onChange: any;
  grow?: boolean;
}) {
  const classes = useStyles();

  return (
    <InputBase
      className={clsx(classes.filterField, grow && classes.filterFieldGrow)}
      classes={{
        root: classes.inputRoot,
        input: classes.inputInput,
      }}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    ></InputBase>
  );
}

export default function FilterBar({
  filters,
  onChange,
}: {
  filters: { [id: string]: FilterFieldType };
  onChange: (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const classes = useStyles();

  return (
    <Paper className={classes.filterBarPaper} elevation={8}>
      <Toolbar className={classes.filterBar}>
        <FiltersIcon className={classes.filterIcon} />
        {Object.keys(filters).map(filter => (
          <FilterField
            key={filter}
            placeholder={filters[filter].label}
            value={filters[filter].value}
            onChange={onChange(filter)}
            grow={filters[filter].grow}
          />
        ))}
      </Toolbar>
    </Paper>
  );
}
