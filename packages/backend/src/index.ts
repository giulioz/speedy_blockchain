import dotenv from "dotenv";

import app from "./app";

dotenv.config();

const port = process.env.NODE_PORT ? parseInt(process.env.NODE_PORT) : 8080;
app.listen(port, process.env.NODE_HOST || "0.0.0.0", () =>
  console.log("Node listening on " + port)
);
