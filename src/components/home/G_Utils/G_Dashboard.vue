<template>
  <div class="dashboard">
    <v-container grid-list-md>
      <!-- The main object on the top will be a graph with group expenses -->
      <v-row justify="center">
        <v-col cols="12">
          <v-card shaped>
            <v-card-title primary-title class="primary--text">
              Grafico spese {{ group.name }}

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
            <v-card-subtitle>Visualizza l'andamento delle tue spese.</v-card-subtitle>
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
            <BarGraph
              v-if="loaded && barActive"
              :chartData="g_graphData"
              :personData="p_graphData"
              :xAxisLabel="listOfLabels"
              :options="graphOptions"
              label="Andamento spese gruppo"
            />
            <LineGraph
              v-if="loaded && lineActive"
              :chartData="g_graphData"
              :personData="p_graphData"
              :xAxisLabel="listOfLabels"
              :options="graphOptions"
              label="Andamento spese gruppo"
            />
          </v-card>
        </v-col>
      </v-row>
      <v-divider class="ma-5"></v-divider>
      <v-row>
        <v-col cols="12" sm="4">
          <gMemberList :groupID="group.group_id" />
        </v-col>
        <v-col cols="12" sm="4">
          <gCassaComune :groupID="group.group_id" />
        </v-col>
        <v-col cols="12" sm="4">
          <gShopping :group="group" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <gTransactions :groupID="group.group_id" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import gMemberList from "@/components/home/G_Utils/G_MemberList.vue";
import gCassaComune from "@/components/home/G_Utils/G_CassaComune.vue";
import gTransactions from "@/components/home/G_Utils/G_Transactions.vue";
import BarGraph from "@/components/home/charts/BarChart.vue";
import LineGraph from "@/components/home/charts/LineChart.vue";
import gShopping from "@/components/home/G_Utils/G_Shopping.vue";

import db from "@/firebase/init.js";
import firebase from "firebase";

export default {
  name: "G_Dashboard",
  components: {
    gMemberList: gMemberList,
    gCassaComune: gCassaComune,
    gTransactions: gTransactions,
    BarGraph: BarGraph,
    LineGraph: LineGraph,
    gShopping: gShopping,
  },
  data() {
    return {
      /**
       * Foundamentals
       */
      group: this.$route.params.selectedGroup,
      prevRoute: null,

      /**
       * Transaction and graph utils
       */
      personUID: firebase.auth().currentUser.uid,
      barActive: false,
      lineActive: true,
      loaded: false,
      trasactionsListRaw: [],
      groupTransactions: [],
      personTransactions: [],
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
      g_graphData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
      this.groupTransactions = [];
      this.personTransactions = [];

      let currentYear = new Date().toISOString().substr(0, 4);
      /**
       * Filtering out transactions of past years.
       */
      this.trasactionsListRaw.forEach((transaction) => {
        if (
          transaction.data().group_id == this.group.group_id &&
          transaction.data().date.substr(0, 4) == currentYear &&
          !transaction.data().cash_refill
        ) {
          this.groupTransactions.push({
            import: transaction.data().import,
            month: transaction.data().date.substr(5, 2),
          });
        }
        if (
          transaction.data().date.substr(0, 4) == currentYear &&
          transaction.data().user_id == this.personUID &&
          ((transaction.data().group_id != this.group.group_id &&
            transaction.data().cash_refill) ||
            (transaction.data().group_id == this.group.group_id &&
              transaction.data().cash_refill) ||
            transaction.data().group_id == null)
        ) {
          this.personTransactions.push({
            import: transaction.data().import,
            month: transaction.data().date.substr(5, 2),
          });
        }
      });

      /**
       * When data is sorted, we compile graph's data array.
       */
      this.compileGraph();
    },
    compileGraph() {
      /**
       * Resetting default values.
       */
      this.loaded = false;
      const sleep = (milliseconds) => {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
      };

      this.g_graphData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      this.p_graphData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      this.groupTransactions.forEach((transaction) => {
        switch (parseInt(transaction.month)) {
          case 1:
            this.g_graphData[0] += parseFloat(transaction.import);
            this.g_graphData[0].toFixed(2);
            break;
          case 2:
            this.g_graphData[1] += parseFloat(transaction.import);
            this.g_graphData[1].toFixed(2);
            break;
          case 3:
            this.g_graphData[2] += parseFloat(transaction.import);
            this.g_graphData[2].toFixed(2);
            break;
          case 4:
            this.g_graphData[3] += parseFloat(transaction.import);
            this.g_graphData[3].toFixed(2);
            break;
          case 5:
            this.g_graphData[4] += parseFloat(transaction.import);
            this.g_graphData[4].toFixed(2);
            break;
          case 6:
            this.g_graphData[5] += parseFloat(transaction.import);
            this.g_graphData[5].toFixed(2);
            break;
          case 7:
            this.g_graphData[6] += parseFloat(transaction.import);
            this.g_graphData[6].toFixed(2);
            break;
          case 8:
            this.g_graphData[7] += parseFloat(transaction.import);
            this.g_graphData[7].toFixed(2);
            break;
          case 9:
            this.g_graphData[8] += parseFloat(transaction.import);
            this.g_graphData[8].toFixed(2);
            break;
          case 10:
            this.g_graphData[9] += parseFloat(transaction.import);
            this.g_graphData[9].toFixed(2);
            break;
          case 11:
            this.g_graphData[10] += parseFloat(transaction.import);
            this.g_graphData[10].toFixed(2);
            break;
          case 12:
            this.g_graphData[11] += parseFloat(transaction.import);
            this.g_graphData[11].toFixed(2);
            break;
        }
      });

      this.personTransactions.forEach((transaction) => {
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

      sleep(700).then(() => {
        this.loaded = true;
      });
    },
  },
  created() {
    let transactions = db.collection("transactions");

    transactions.onSnapshot((listOfDocs) => {
      this.trasactionsListRaw = listOfDocs.docs;
      // .filter((doc) => {
      //   return doc.data().group_id == this.group.group_id;
      // });
      this.sortData();
    });
  },
};
</script>

<style></style>
