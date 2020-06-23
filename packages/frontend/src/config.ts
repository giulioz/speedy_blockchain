const prodSettings = {
  apiURL: "",
};

const devSettings = {
  apiURL: "http://localhost:8080",
};

const settings =
  process.env.NODE_ENV === "production" ? prodSettings : devSettings;

export default settings;
