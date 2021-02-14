<template>
  <div>
    <v-row justify="center">
      <v-dialog v-model="dialog" persistent overflowed max-width="600px">
        <v-card :loading="loadStatus">
          <v-card-title>
            <span class="headline secondary--text">Aggiungi una transazione</span>
          </v-card-title>
          <v-card-subtitle>
            Aggiungi una transazione effettuata dal tuo gruppo.
          </v-card-subtitle>
          <v-card-text>
            <v-form v-model="valid" @submit.prevent="addTransaction()">
              <v-container>
                <!-- Transaction name -->
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="Nome"
                      required
                      class="primary--text"
                      v-model="transactionName"
                      :rules="[rules.required]"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <!-- Data picker -->
                <v-menu
                  ref="menu"
                  v-model="menu"
                  :close-on-content-click="false"
                  :return-value.sync="date"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="date"
                      label="Data della transazione."
                      append-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="date"
                    color="primary"
                    no-title
                    scrollable
                    locale="it-IT"
                  >
                    <v-spacer></v-spacer>
                    <v-btn text color="secondary" @click="menu = false"> Annulla </v-btn>
                    <v-btn text color="secondary" @click="$refs.menu.save(date)">
                      Scegli
                    </v-btn>
                  </v-date-picker>
                </v-menu>

                <!-- Transaction value -->
                <v-row>
                  <v-col>
                    <v-text-field
                      label="Importo"
                      required
                      type="number"
                      clearable
                      :rules="[rules.required, rules.number]"
                      append-icon="mdi-currency-eur"
                      v-model="transactionImport"
                      class="primary--text"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions class="pa-3">
            <v-spacer></v-spacer>
            <v-btn outlined rounded color="primary" @click="closeDialog()">
              Chiudi
            </v-btn>
            <v-btn outlined rounded color="primary" @click="addTransaction()">
              Aggiungi
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <v-card class="cards">
      <v-card-title primary-title class="primary--text">
        Spese recenti
        <v-spacer></v-spacer>
        <v-tooltip left color="cards">
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on" class="primary--text" @click="openDialog()"
              >mdi-bank-transfer</v-icon
            >
          </template>
          <span>Nuova Transazione</span>
        </v-tooltip>
      </v-card-title>
      <v-card-subtitle> Le tue ultime transazioni registrate </v-card-subtitle>

      <v-divider class="ma-1"></v-divider>

      <v-container grid-list-xs v-if="transactions.length != 0">
        <v-list subheader three-line>
          <v-list-item v-for="(transaction, index) in transactions" :key="index">
            <v-list-item-avatar>
              <v-icon :class="transaction.isRefill ? 'success--text' : 'error--text'"
                >mdi-currency-eur</v-icon
              >
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title class="info--text"
                >{{ transaction.name }} | € {{ transaction.import }}</v-list-item-title
              >
              <small>{{ transaction.date }}</small>
              <v-list-item-subtitle>{{ transaction.author }}</v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action>
              <v-icon
                @click="deleteTransaction(transaction.transaction_id)"
                class="info--text"
                >mdi-trash-can-outline</v-icon
              >
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-container>

      <v-container v-if="transactions.length == 0">
        <v-row justify="center">
          <v-img src="@/assets/noTransactions.svg" contain height="200"></v-img>
        </v-row>
        <v-row justify="center" class="pa-5">
          <small class="text-center"
            >Non hai ancora effettuato alcuna operazione. Clicca l'icona sulla destra per
            iniziare!
          </small>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import db from "@/firebase/init.js";
import firebase from "firebase";

export default {
  name: "P_Transactions",
  props: {
    transactions: {
      type: Array,
    },
  },
  data() {
    return {
      /**
       * Dialog Utils
       */
      valid: false,
      dialog: false,
      loadStatus: false,
      transactionName: null,
      transactionImport: null,
      date: new Date().toISOString().substr(0, 10),
      menu: false,
      rules: {
        required: (value) => !!value || "Campo richiesto.",
        number: (value) => !isNaN(value) || "Inserisci un valore valido.",
      },
    };
  },
  methods: {
    addTransaction() {
      /**
       * Checking if the form is correct.
       */
      if (this.valid) {
        /**
         * If all the values are correctly given, then they'll be added to the database.
         */
        this.loadStatus = true;

        db.collection("transactions")
          .doc()
          .set({
            cash_refill: null,
            group_id: null,
            import: this.transactionImport,
            name: this.transactionName,
            user_id: firebase.auth().currentUser.uid,
            date: this.date,
          })
          .then(() => {
            /**
             * Closing the dialog after the operation is successfully completed.
             */
            this.closeDialog();
          })
          .catch((error) => {
            console.log(error);
            this.closeDialog();
          });
      }
    },
    deleteTransaction(id) {
      db.collection("transactions")
        .doc(id)
        .delete()
        .then(() => {
          console.log("Transazione eliminata.");
        })
        .catch((error) => {
          console.log(error, "\nErrore nell'eliminazione della transazione.");
        });
    },
    openDialog() {
      /**
       * Before opening the dialog, all the dialog's utils datas get the default values.
       */
      this.transactionName = null;
      this.transactionImport = null;

      this.dialog = true;
    },
    closeDialog() {
      /**
       * Resetting dialog utils values.
       */
      this.transactionName = null;
      this.transactionImport = null;
      this.loadStatus = false;

      this.dialog = false;
    },
  },
};
</script>
