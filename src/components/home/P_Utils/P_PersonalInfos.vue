<template>
  <div>
    <v-card class="cards">
      <v-card-title primary-title class="primary--text"> Informazioni </v-card-title>
      <v-card-subtitle>Informazioni personali</v-card-subtitle>
      <v-divider class="ma-3"></v-divider>

      <v-list>
        <v-list-item>
          <v-list-item-content>
            <p class="text-center">
              <v-chip outlined v-if="isOnline" class="ma-2 success--text">Online</v-chip>
              <v-chip outlined v-if="!isOnline" class="ma-2 error">Offline</v-chip>
              <br />
              {{ nickname }} ~ {{ email }}
            </p>
          </v-list-item-content>
        </v-list-item>

        <v-divider class="ma-3"></v-divider>

        <v-list-item>
          <v-list-item-content>
            <p class="text-center">
              <v-icon class="primary--text">mdi-currency-eur</v-icon>
              Totale spese ~ {{ totalImport }} €
            </p>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script>
import db from "@/firebase/init.js";
import firebase from "firebase";

export default {
  name: "P_PersonalInfos",
  props: {
    transactions: {
      type: Array,
    },
  },
  watch: {
    transactions: {
      handler: function () {
        this.calcImport();
      },
      deep: true,
    },
  },
  data() {
    return {
      nickname: null,
      email: null,
      totalImport: 0,
      isOnline: navigator.onLine ? true : false,
    };
  },
  methods: {
    calcImport() {
      /**
       * Resetting default value.
       */
      this.totalImport = 0.0;

      this.transactions.forEach((t) => {
        this.totalImport += parseFloat(t.import);
      });

      this.totalImport = this.totalImport.toFixed(2);
    },
    checkOnline() {
      this.isOnline = navigator.onLine ? true : false;
    },
  },
  created() {
    /**
     * Compiling user nickname
     */
    db.collection("users")
      .where("user_id", "==", firebase.auth().currentUser.uid)
      .get()
      .then((snapshot) => {
        snapshot.forEach((user) => {
          this.nickname = user.data().nickname;
          this.email = user.data().email;
        });
      })
      .catch((error) => {
        console.log(error);
      });

    this.calcImport();

    setInterval(() => {
      this.checkOnline();
    }, 5000);
  },
};
</script>
