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

                <!-- If the cash register is active, we ask the user if the transaction he's making is filling the group's fund or if he's using it -->
                <v-row justify="center">
                  <v-switch
                    label="Stai effettuando una ricarica della cassa comune?"
                    v-model="isRicarica"
                  >
                  </v-switch>

                  <v-spacer></v-spacer>

                  <v-icon v-if="isRicarica" class="success--text" large
                    >mdi-bank-transfer-in</v-icon
                  >
                  <v-icon v-if="!isRicarica" class="error--text" large
                    >mdi-bank-transfer-out</v-icon
                  >
                </v-row>

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
        Lista transazioni del gruppo
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
      <v-card-subtitle> Lista delle ultime transazioni del gruppo </v-card-subtitle>

      <v-divider class="ma-1"></v-divider>

      <v-container grid-list-xs v-if="allTransactions.length != 0">
        <v-list subheader three-line>
          <v-list-item v-for="(transaction, index) in allTransactions" :key="index">
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

      <v-container v-if="allTransactions.length == 0">
        <v-row justify="center">
          <v-img src="@/assets/noTransactions.svg" contain height="200"></v-img>
        </v-row>
        <v-row justify="center" class="pa-5">
          <small class="text-center"
            >Non sono ancora state effettuate operazioni su questo gruppo. Clicca l'icona
            sulla destra per iniziare!
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
  name: "gTransactions",
  props: {
    groupID: {
      type: String,
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
      isRicarica: false,
      transactionImport: null,
      date: new Date().toISOString().substr(0, 10),
      menu: false,
      rules: {
        required: (value) => !!value || "Campo richiesto.",
        number: (value) => !isNaN(value) || "Inserisci un valore valido.",
      },

      /**
       * Extra Utils
       */
      trasactionsListRaw: [],
      allTransactions: [],
    };
  },
  methods: {
    openDialog() {
      /**
       * Before opening the dialog, all the dialog's utils datas get the default values.
       */
      this.transactionName = null;
      this.isRicarica = false;
      this.transactionImport = null;

      this.dialog = true;
    },
    closeDialog() {
      /**
       * Resetting dialog utils values.
       */
      this.transactionName = null;
      this.isRicarica = false;
      this.transactionImport = null;
      this.loadStatus = false;

      this.dialog = false;
    },
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
            cash_refill: this.isRicarica,
            group_id: this.groupID,
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
    refreshList() {
      let counter = 0;
      this.allTransactions = [];

      let compileList = new Promise((resolve) => {
        this.trasactionsListRaw.forEach((transaction) => {
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

              this.allTransactions.push({
                name: tInfo.name,
                author: tAuthor,
                import: tInfo.import,
                date: tInfo.date,
                isRefill: tInfo.cash_refill,
                transaction_id: transaction.id,
              });

              counter++;
              if (counter == this.trasactionsListRaw.length) resolve();
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
        this.allTransactions.sort((a, b) => {
          return (
            parseInt(b.date.replaceAll("-", "")) - parseInt(a.date.replaceAll("-", ""))
          );
        });

        /**
         * Changing date format
         */
        let day, month, year;
        this.allTransactions.forEach((transaction) => {
          year = transaction.date.substr(0, 4);
          month = transaction.date.substr(5, 2);
          day = transaction.date.substr(8, 2);
          transaction.date = day.concat("-", month, "-", year);
        });
      });
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
  },
  created() {
    let transactions = db.collection("transactions");

    transactions.onSnapshot((listOfDocs) => {
      this.trasactionsListRaw = listOfDocs.docs.filter((doc) => {
        return doc.data().group_id == this.groupID;
      });

      this.refreshList();
    });
  },
};
</script>
