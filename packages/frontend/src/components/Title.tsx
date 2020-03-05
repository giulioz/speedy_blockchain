import React from "react";
import Typography from "@material-ui/core/Typography";

export default function Title(props: React.PropsWithChildren<{}>) {
  return (
    <Typography component="h2" variant="h6" color="primary" gutterBottom>
      {props.children}
    </Typography>
  );
}
