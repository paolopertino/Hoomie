<template>
  <div class="dashboard">
    <v-container grid-list-md>
      <!-- The main object on the top will be a graph with personal expenses -->
      <v-row justify="center">
        <v-col cols="12">
          <v-card shaped>
            <v-card-title primary-title class="primary--text">
              Grafico spese personali
              <v-spacer></v-spacer>
              <v-tooltip v-if="lineActive" left color="cards">
                <template v-if="lineActive" v-slot:activator="{ on, attrs }">
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                    class="primary--text"
                    @click="changeGraph()"
                    >mdi-chart-bar</v-icon
                  >
                </template>
                <span>Cambia Grafico</span>
              </v-tooltip>

              <v-tooltip v-if="barActive" left color="cards">
                <template v-if="barActive" v-slot:activator="{ on, attrs }">
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                    class="primary--text"
                    @click="changeGraph()"
                    >mdi-chart-line</v-icon
                  >
                </template>
                <span>Cambia Grafico</span>
              </v-tooltip>
            </v-card-title>
            <v-card-subtitle
              >Un grafico delle tue spese personali, raccolte da tutti i tuoi
              gruppi.</v-card-subtitle
            >
            <v-container v-if="!loaded">
              <v-row justify="center">
                <v-progress-circular
                  v-if="!loaded"
                  :size="50"
                  color="primary"
                  indeterminate
                ></v-progress-circular
              ></v-row>
            </v-container>
            <pBarGraph
              v-if="loaded && barActive"
              :personData="p_graphData"
              :xAxisLabel="listOfLabels"
              :options="graphOptions"
              label="Andamento spese personali"
            />
            <pLineGraph
              v-if="loaded && lineActive"
              :personData="p_graphData"
              :xAxisLabel="listOfLabels"
              :options="graphOptions"
              label="Andamento spese personali"
            />
          </v-card>
        </v-col>
      </v-row>
      <v-divider class="ma-5"></v-divider>
      <v-row>
        <v-col cols="12" sm="6">
          <pGroupsList />
        </v-col>
        <v-col cols="12" sm="6">
          <pInfos :transactions="personTransactionDisplay" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <pTransactions :transactions="personTransactionDisplay" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import pGroupsList from "@/components/home/P_Utils/P_GroupsList.vue";
import pBarGraph from "@/components/home/charts/pBarChart.vue";
import pLineGraph from "@/components/home/charts/pLineChart.vue";
import pInfos from "@/components/home/P_Utils/P_PersonalInfos.vue";
import pTransactions from "@/components/home/P_Utils/P_Transactions.vue";

import db from "@/firebase/init.js";
import firebase from "firebase";

/**
 * RICORDA CHE QUANDO UN UTENTE AGGIUNGE UNA TRANSAZIONE NON LEGATA AD ALCUN GRUPPO, ESSA DEVE AVERE NEL CAMPO group_id IL VALORE null
 */

export default {
  name: "Dashboard",
  components: {
    pGroupsList: pGroupsList,
    pBarGraph: pBarGraph,
    pLineGraph: pLineGraph,
    pInfos: pInfos,
    pTransactions: pTransactions,
  },
  data() {
    return {
      /**
       * General Utils
       */
      transactionsListRaw: [],
      personTransactionsGraph: [],
      personTransactionDisplay: [],
      prevRoute: null,

      /**
       * Graph Utils
       */
      loaded: false,
      lineActive: true,
      barActive: false,
      listOfLabels: [
        "Gennaio",
        "Febbraio",
        "Marzo",
        "Aprile",
        "Maggio",
        "Giugno",
        "Luglio",
        "Agosto",
        "Settembre",
        "Ottobre",
        "Novembre",
        "Dicembre",
      ],
      p_graphData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      graphOptions: {
        responsive: true,
        maintainAspectRatio: false,
      },
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.prevRoute = from;
    });
  },
  beforeRouteLeave(to, from, next) {
    if (
      (to.name == "G_Dashboard" && !to.params.selectedGroup) ||
      (to.name == "EditShoppingList" && !to.params.selectedList)
    ) {
      next({ name: to.name, params: this.prevRoute.params });
    } else {
      next();
    }
  },
  methods: {
    changeGraph() {
      this.barActive = !this.barActive;
      this.lineActive = !this.lineActive;
    },
    sortData() {
      this.personTransactionsGraph = [];
      this.personTransactionDisplay = [];

      this.transactionsListRaw = this.transactionsListRaw.filter((t) => {
        return (
          t.data().user_id == firebase.auth().currentUser.uid &&
          (!t.data().group_id || t.data().cash_refill)
        );
      });

      /**
       * Sorting data for graphs
       */
      let currentYear = new Date().toISOString().substr(0, 4);
      this.transactionsListRaw.forEach((transaction) => {
        if (
          (transaction.data().date.substr(0, 4) == currentYear &&
            transaction.data().group_id != null &&
            transaction.data().cash_refill) ||
          (transaction.data().date.substr(0, 4) == currentYear &&
            transaction.data().group_id == null)
        ) {
          this.personTransactionsGraph.push({
            import: transaction.data().import,
            month: transaction.data().date.substr(5, 2),
          });
        }
      });

      this.compileGraph();

      /**
       * Sorting data for transactions list.
       */
      let compileList = new Promise((resolve) => {
        let counter = 0;
        this.transactionsListRaw.forEach((transaction) => {
          let tInfo = transaction.data();
          let tAuthor;

          /**
           * Getting user nickname.
           */
          db.collection("users")
            .where("user_id", "==", tInfo.user_id)
            .get()
            .then((snapshot) => {
              snapshot.forEach((doc) => {
                tAuthor = doc.data().nickname;
              });

              this.personTransactionDisplay.push({
                name: tInfo.name,
                author: tAuthor,
                import: tInfo.import,
                date: tInfo.date,
                isRefill: tInfo.cash_refill,
                transaction_id: transaction.id,
              });

              counter++;
              if (counter == this.transactionsListRaw.length) resolve();
            })
            .catch((error) => {
              console.log(error);
              resolve();
            });
        });
      });

      compileList.then(() => {
        /**
         * Sorting objects by date.
         */
        this.personTransactionDisplay.sort((a, b) => {
          return (
            parseInt(b.date.replaceAll("-", "")) - parseInt(a.date.replaceAll("-", ""))
          );
        });

        /**
         * Changing date format.
         */
        let day, month, year;
        this.personTransactionDisplay.forEach((transaction) => {
          year = transaction.date.substr(0, 4);
          month = transaction.date.substr(5, 2);
          day = transaction.date.substr(8, 2);
          transaction.date = day.concat("-", month, "-", year);
        });
      });
    },
    compileGraph() {
      /**
       * Resetting default values.
       */
      this.loaded = false;
      const sleep = (milliseconds) => {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
      };

      this.p_graphData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      this.personTransactionsGraph.forEach((transaction) => {
        switch (parseInt(transaction.month)) {
          case 1:
            this.p_graphData[0] += parseFloat(transaction.import);
            this.p_graphData[0].toFixed(2);
            break;
          case 2:
            this.p_graphData[1] += parseFloat(transaction.import);
            this.p_graphData[1].toFixed(2);
            break;
          case 3:
            this.p_graphData[2] += parseFloat(transaction.import);
            this.p_graphData[2].toFixed(2);
            break;
          case 4:
            this.p_graphData[3] += parseFloat(transaction.import);
            this.p_graphData[3].toFixed(2);
            break;
          case 5:
            this.p_graphData[4] += parseFloat(transaction.import);
            this.p_graphData[4].toFixed(2);
            break;
          case 6:
            this.p_graphData[5] += parseFloat(transaction.import);
            this.p_graphData[5].toFixed(2);
            break;
          case 7:
            this.p_graphData[6] += parseFloat(transaction.import);
            this.p_graphData[6].toFixed(2);
            break;
          case 8:
            this.p_graphData[7] += parseFloat(transaction.import);
            this.p_graphData[7].toFixed(2);
            break;
          case 9:
            this.p_graphData[8] += parseFloat(transaction.import);
            this.p_graphData[8].toFixed(2);
            break;
          case 10:
            this.p_graphData[9] += parseFloat(transaction.import);
            this.p_graphData[9].toFixed(2);
            break;
          case 11:
            this.p_graphData[10] += parseFloat(transaction.import);
            this.p_graphData[10].toFixed(2);
            break;
          case 12:
            this.p_graphData[11] += parseFloat(transaction.import);
            this.p_graphData[11].toFixed(2);
            break;
        }
      });

      //console.log(this.p_graphData);
      sleep(700).then(() => {
        this.loaded = true;
      });
    },
  },
  created() {
    let transactionsRef = db.collection("transactions");

    transactionsRef.onSnapshot((listOfDocs) => {
      this.transactionsListRaw = listOfDocs.docs;

      this.sortData();
    });
  },
};
</script>

<style></style>
