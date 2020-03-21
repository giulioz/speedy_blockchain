import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Fab from "@material-ui/core/Fab";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import AddIcon from "@material-ui/icons/Add";
import MUIDataTable, { MUIDataTableOptions } from "mui-datatables";

import { Flight } from "@speedy_blockchain/common";
import Layout from "../components/Layout";
import AddFlightDialog from "../components/AddFlightDialog";
import { addFlight } from "../api/endpoints";

const csv = `2010;5;2010-01-15;20363;"3692";14683;"SAT";"San Antonio, TX";"Texas";13244;"MEM";"Memphis, TN";"Tennessee";"1605";-5.00;"1749";-11.00;0.00;90.00;
2010;6;2010-01-16;20363;"3692";14683;"SAT";"San Antonio, TX";"Texas";13244;"MEM";"Memphis, TN";"Tennessee";"1609";-1.00;"1803";3.00;0.00;91.00;
2010;7;2010-01-17;20363;"3692";14683;"SAT";"San Antonio, TX";"Texas";13244;"MEM";"Memphis, TN";"Tennessee";"1556";-14.00;"1735";-25.00;0.00;77.00;
2010;1;2010-01-18;20363;"3692";14683;"SAT";"San Antonio, TX";"Texas";13244;"MEM";"Memphis, TN";"Tennessee";"1610";0.00;"1805";5.00;0.00;88.00;
2010;2;2010-01-19;20363;"3692";14683;"SAT";"San Antonio, TX";"Texas";13244;"MEM";"Memphis, TN";"Tennessee";"1609";-1.00;"1756";-4.00;0.00;89.00;
2010;3;2010-01-20;20363;"3692";14683;"SAT";"San Antonio, TX";"Texas";13244;"MEM";"Memphis, TN";"Tennessee";"1607";-3.00;"1800";0.00;0.00;95.00;
2010;4;2010-01-21;20363;"3692";14683;"SAT";"San Antonio, TX";"Texas";13244;"MEM";"Memphis, TN";"Tennessee";"1601";-9.00;"1750";-10.00;0.00;82.00;
2010;5;2010-01-22;20363;"3692";14683;"SAT";"San Antonio, TX";"Texas";13244;"MEM";"Memphis, TN";"Tennessee";"1615";5.00;"1812";12.00;0.00;82.00;
2010;6;2010-01-23;20363;"3692";14683;"SAT";"San Antonio, TX";"Texas";13244;"MEM";"Memphis, TN";"Tennessee";"1713";63.00;"1849";49.00;0.00;85.00;
2010;7;2010-01-24;20363;"3692";14683;"SAT";"San Antonio, TX";"Texas";13244;"MEM";"Memphis, TN";"Tennessee";"1620";10.00;"1802";2.00;0.00;86.00;
2010;1;2010-01-25;20363;"3692";14683;"SAT";"San Antonio, TX";"Texas";13244;"MEM";"Memphis, TN";"Tennessee";"1612";2.00;"1758";-2.00;0.00;84.00;
2010;2;2010-01-26;20363;"3692";14683;"SAT";"San Antonio, TX";"Texas";13244;"MEM";"Memphis, TN";"Tennessee";"1712";62.00;"1857";57.00;0.00;80.00;
2010;3;2010-01-27;20363;"3692";14683;"SAT";"San Antonio, TX";"Texas";13244;"MEM";"Memphis, TN";"Tennessee";"1604";-6.00;"1757";-3.00;0.00;84.00;
2010;4;2010-01-28;20363;"3692";14683;"SAT";"San Antonio, TX";"Texas";13244;"MEM";"Memphis, TN";"Tennessee";"1621";11.00;"1808";8.00;0.00;79.00;
2010;5;2010-01-29;20363;"3692";14683;"SAT";"San Antonio, TX";"Texas";13244;"MEM";"Memphis, TN";"Tennessee";"";;"";;1.00;;
2010;6;2010-01-30;20363;"3692";14683;"SAT";"San Antonio, TX";"Texas";13244;"MEM";"Memphis, TN";"Tennessee";"1613";3.00;"1754";-6.00;0.00;86.00;
2010;7;2010-01-31;20363;"3692";14683;"SAT";"San Antonio, TX";"Texas";13244;"MEM";"Memphis, TN";"Tennessee";"1656";46.00;"1833";33.00;0.00;81.00;
2010;2;2010-01-05;20363;"3693";10693;"BNA";"Nashville, TN";"Tennessee";13487;"MSP";"Minneapolis, MN";"Minnesota";"0659";-1.00;"0923";-1.00;0.00;103.00;
2010;5;2010-01-01;20363;"3693";11433;"DTW";"Detroit, MI";"Michigan";11996;"GSP";"Greer, SC";"South Carolina";"1759";-1.00;"1939";-9.00;0.00;77.00;
2010;6;2010-01-02;20363;"3693";11433;"DTW";"Detroit, MI";"Michigan";11996;"GSP";"Greer, SC";"South Carolina";"1738";-2.00;"1914";-14.00;0.00;70.00;
2010;7;2010-01-03;20363;"3693";11433;"DTW";"Detroit, MI";"Michigan";11996;"GSP";"Greer, SC";"South Carolina";"1734";-6.00;"1912";-16.00;0.00;77.00;
2010;1;2010-01-04;20363;"3693";11433;"DTW";"Detroit, MI";"Michigan";11996;"GSP";"Greer, SC";"South Carolina";"1738";-2.00;"2010";42.00;0.00;87.00;
2010;2;2010-01-19;20363;"3693";11433;"DTW";"Detroit, MI";"Michigan";12992;"LIT";"Little Rock, AR";"Arkansas";"1546";1.00;"1659";-4.00;0.00;107.00;
2010;3;2010-01-06;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1120";-5.00;"1235";-10.00;0.00;59.00;
2010;4;2010-01-07;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1158";33.00;"1305";20.00;0.00;52.00;
2010;5;2010-01-08;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1244";79.00;"1401";76.00;0.00;56.00;
2010;6;2010-01-09;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1122";-3.00;"1242";-3.00;0.00;60.00;
2010;7;2010-01-10;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1122";-3.00;"1238";-7.00;0.00;56.00;
2010;1;2010-01-11;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1117";-8.00;"1241";-4.00;0.00;57.00;
2010;3;2010-01-13;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1123";-2.00;"1234";-11.00;0.00;52.00;
2010;4;2010-01-14;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1120";-5.00;"1243";-2.00;0.00;62.00;
2010;5;2010-01-15;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1117";-8.00;"1237";-8.00;0.00;61.00;
2010;6;2010-01-16;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"";;"";;1.00;;
2010;7;2010-01-17;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1121";-4.00;"1240";-5.00;0.00;59.00;
2010;1;2010-01-18;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1126";1.00;"1250";5.00;0.00;60.00;
2010;3;2010-01-20;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1134";9.00;"1255";10.00;0.00;64.00;
2010;4;2010-01-21;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1121";-4.00;"1255";10.00;0.00;74.00;
2010;5;2010-01-22;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1120";-5.00;"1244";-1.00;0.00;60.00;
2010;6;2010-01-23;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1120";-5.00;"1245";0.00;0.00;54.00;
2010;7;2010-01-24;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1120";-5.00;"1231";-14.00;0.00;49.00;
2010;1;2010-01-25;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1123";-2.00;"1248";3.00;0.00;56.00;
2010;3;2010-01-27;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1122";-3.00;"1252";7.00;0.00;56.00;
2010;4;2010-01-28;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1119";-6.00;"1231";-14.00;0.00;53.00;
2010;5;2010-01-29;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"";;"";;1.00;;
2010;6;2010-01-30;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1118";-7.00;"1239";-6.00;0.00;61.00;
2010;7;2010-01-31;20363;"3693";12951;"LFT";"Lafayette, LA";"Louisiana";13244;"MEM";"Memphis, TN";"Tennessee";"1121";-4.00;"1256";11.00;0.00;56.00;
2010;6;2010-01-02;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0724";9.00;"0900";12.00;0.00;74.00;
2010;7;2010-01-03;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0725";10.00;"0903";15.00;0.00;75.00;
2010;1;2010-01-04;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0715";0.00;"0927";39.00;0.00;72.00;
2010;2;2010-01-05;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0728";13.00;"0922";35.00;0.00;72.00;
2010;3;2010-01-06;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0712";-3.00;"0858";11.00;0.00;69.00;
2010;4;2010-01-07;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0715";0.00;"0907";20.00;0.00;69.00;
2010;5;2010-01-08;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0719";4.00;"0915";28.00;0.00;73.00;
2010;7;2010-01-10;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0708";-7.00;"0857";10.00;0.00;69.00;
2010;1;2010-01-11;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0757";42.00;"0936";49.00;0.00;67.00;
2010;2;2010-01-12;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0847";92.00;"1019";92.00;0.00;71.00;
2010;3;2010-01-13;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0723";8.00;"0852";5.00;0.00;63.00;
2010;4;2010-01-14;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0711";-4.00;"0859";12.00;0.00;68.00;
2010;5;2010-01-15;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0710";-5.00;"0838";-9.00;0.00;65.00;
2010;7;2010-01-17;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0715";0.00;"0847";0.00;0.00;65.00;
2010;2;2010-01-19;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0710";-5.00;"0847";0.00;0.00;64.00;
2010;3;2010-01-20;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0714";-1.00;"0846";-1.00;0.00;64.00;
2010;4;2010-01-21;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0714";-1.00;"0912";25.00;0.00;67.00;
2010;5;2010-01-22;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0711";-4.00;"0902";15.00;0.00;66.00;
2010;7;2010-01-24;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0815";60.00;"0951";64.00;0.00;67.00;
2010;1;2010-01-25;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0708";-7.00;"0908";21.00;0.00;70.00;
2010;2;2010-01-26;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0710";-5.00;"0852";5.00;0.00;65.00;
2010;3;2010-01-27;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0712";-3.00;"0903";16.00;0.00;61.00;
2010;4;2010-01-28;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0727";12.00;"0926";39.00;0.00;64.00;
2010;5;2010-01-29;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0711";-4.00;"0837";-10.00;0.00;58.00;
2010;7;2010-01-31;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10257;"ALB";"Albany, NY";"New York";"0714";-1.00;"0841";-6.00;0.00;66.00;
2010;5;2010-01-01;20363;"3694";11433;"DTW";"Detroit, MI";"Michigan";10529;"BDL";"Hartford, CT";"Connecticut";"1010";-5.00;"1200";6.00;0.00;77.00;
2010;2;2010-01-05;20363;"3694";11986;"GRR";"Grand Rapids, MI";"Michigan";11433;"DTW";"Detroit, MI";"Michigan";"0530";0.00;"0620";-6.00;0.00;26.00;
2010;3;2010-01-06;20363;"3694";11986;"GRR";"Grand Rapids, MI";"Michigan";11433;"DTW";"Detroit, MI";"Michigan";"0531";1.00;"0645";19.00;0.00;32.00;
2010;4;2010-01-07;20363;"3694";11986;"GRR";"Grand Rapids, MI";"Michigan";11433;"DTW";"Detroit, MI";"Michigan";"0527";-3.00;"0651";25.00;0.00;28.00;
2010;5;2010-01-08;20363;"3694";11986;"GRR";"Grand Rapids, MI";"Michigan";11433;"DTW";"Detroit, MI";"Michigan";"";;"";;1.00;;
2010;6;2010-01-09;20363;"3694";11986;"GRR";"Grand Rapids, MI";"Michigan";11433;"DTW";"Detroit, MI";"Michigan";"0524";-6.00;"0632";6.00;0.00;30.00;
2010;1;2010-01-11;20363;"3694";11986;"GRR";"Grand Rapids, MI";"Michigan";11433;"DTW";"Detroit, MI";"Michigan";"0525";-5.00;"0628";2.00;0.00;24.00;
2010;2;2010-01-12;20363;"3694";11986;"GRR";"Grand Rapids, MI";"Michigan";11433;"DTW";"Detroit, MI";"Michigan";"0527";-3.00;"0613";-13.00;0.00;28.00;
2010;3;2010-01-13;20363;"3694";11986;"GRR";"Grand Rapids, MI";"Michigan";11433;"DTW";"Detroit, MI";"Michigan";"0523";-7.00;"0616";-10.00;0.00;27.00;`;

const useStyles = makeStyles(theme => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
  },
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    flexGrow: 1,
  },
  fab: {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

export default function Flights() {
  const classes = useStyles();

  const columns = [
    "YEAR",
    "DAY_OF_WEEK",
    "FL_DATE",
    "OP_CARRIER_AIRLINE_ID",
    "OP_CARRIER_FL_NUM",
    "ORIGIN_AIRPORT_ID",
    "ORIGIN",
    "ORIGIN_CITY_NAME",
    "ORIGIN_STATE_NM",
    "DEST_AIRPORT_ID",
    "DEST",
    "DEST_CITY_NAME",
    "DEST_STATE_NM",
    "DEP_TIME",
    "DEP_DELAY",
    "ARR_TIME",
    "ARR_DELAY",
    "CANCELLED",
    "AIR_TIME",
  ];

  const data = csv.split("\n").map(l => l.split(";"));

  const options: MUIDataTableOptions = {
    filterType: "checkbox",
    responsive: "scrollFullHeight",
    fixedHeaderOptions: { xAxis: true, yAxis: true },
  };

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addConfirmOpen, setAddConfirmOpen] = useState(false);

  function handleOpenAddDialog() {
    setAddDialogOpen(true);
  }
  function handleCloseAddDialog() {
    setAddDialogOpen(false);
  }

  function handleCloseAddConfirm() {
    setAddConfirmOpen(false);
  }

  function handleAddFlight(f: Flight) {
    addFlight(f);
    setAddConfirmOpen(true);
    handleCloseAddDialog();
  }

  return (
    <Layout title="Flights">
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="xl" className={classes.container}>
          <MUIDataTable
            title={"Flight List"}
            data={data}
            columns={columns}
            options={options}
          />
        </Container>
      </main>

      <AddFlightDialog
        open={addDialogOpen}
        onClose={handleCloseAddDialog}
        onSubmit={handleAddFlight}
      />
      <Fab
        aria-label="add flight"
        className={classes.fab}
        color="primary"
        onClick={handleOpenAddDialog}
      >
        <AddIcon />
      </Fab>
      <Snackbar
        open={addConfirmOpen}
        autoHideDuration={6000}
        onClose={handleCloseAddConfirm}
      >
        <Alert onClose={handleCloseAddConfirm} severity="success">
          Flight added
        </Alert>
      </Snackbar>
    </Layout>
  );
}
