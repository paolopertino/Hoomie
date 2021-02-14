<template>
  <div>
    <!-- Dialog to add a transaction -->
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
                <v-row justify="center" v-if="isActive">
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
      <v-container>
        <v-card-title primary-title class="primary--text">
          Cassa comune
          <v-spacer></v-spacer>

          <v-tooltip left color="cards" v-if="!isActive">
            <template v-if="!isActive" v-slot:activator="{ on, attrs }">
              <v-icon
                v-if="!isActive"
                v-bind="attrs"
                v-on="on"
                class="primary--text"
                @click="activateCashRegister()"
                >mdi-cash-register</v-icon
              >
            </template>
            <span>Attiva</span>
          </v-tooltip>

          <v-tooltip left color="cards" v-if="isActive">
            <template v-if="isActive" v-slot:activator="{ on, attrs }">
              <v-icon
                v-if="isActive"
                v-bind="attrs"
                v-on="on"
                class="primary--text"
                @click="openDialog()"
                >mdi-bank-transfer</v-icon
              >
            </template>
            <span>Nuova Transazione</span>
          </v-tooltip>
        </v-card-title>
        <v-card-subtitle>Status cassa comune.</v-card-subtitle>

        <v-divider class="ma-1"></v-divider>

        <!-- If petty cash is disabled the component shows an info message. Users can activate it by clicking the button above -->
        <v-container v-if="!isActive">
          <v-row justify="center">
            <v-img contain height="200" src="@/assets/investimenti.svg"></v-img>
          </v-row>
          <v-divider class="ma-2"></v-divider>
          <v-row justify="center" class="pa-5">
            <small class="text-center"
              >Sembra che la cassa comune non sia attiva su questo gruppo. Attivala
              cliccando il bottone in alto.
            </small>
          </v-row>
        </v-container>
        <v-row justify="center" class="mt-6 mb-3" v-if="isActive">
          <v-progress-circular
            :rotate="360"
            :size="150"
            :width="15"
            :value="availableCash"
            color="primary"
          >
            € {{ availableCash }}
          </v-progress-circular>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import db from "@/firebase/init.js";
import firebase from "firebase";

export default {
  name: "gCassaComune",
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
      transactionsList: [],
      availableCash: 0,
      isActive: false,
    };
  },
  /**
   * Prossime cose da fare:
   *  (1) - Creare l'interfaccia della cassa comune. (Totale in cassa, numero di ricariche fatte da ciascun partecipante del gruppo)
   *  (2) - Creare un listener alla creazione del componente che intercetti nuove transazioni e modifiche al campo available cash.
   */
  methods: {
    activateCashRegister() {
      db.collection("groups")
        .doc(this.groupID)
        .update({
          cassa_comune: true,
        })
        .catch((err) => {
          console.log(err);
        });
    },
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
    refreshCash() {
      this.availableCash = 0;

      this.transactionsList.forEach((transaction) => {
        let tInfo = transaction.data();

        if (tInfo.cash_refill) {
          this.availableCash += parseFloat(tInfo.import);
        } else {
          this.availableCash -= parseFloat(tInfo.import);
        }
      });

      this.availableCash = this.availableCash.toFixed(2);
      db.collection("groups")
        .doc(this.groupID)
        .update({
          available_cash: this.availableCash,
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
  created() {
    let group = db.collection("groups").doc(this.groupID);
    let transactions = db.collection("transactions");

    group.onSnapshot((doc) => {
      this.isActive = doc.data().cassa_comune;
    });

    transactions.onSnapshot((listOfDocs) => {
      this.transactionsList = listOfDocs.docs.filter((doc) => {
        return doc.data().group_id == this.groupID;
      });

      /**
       * When the list of transactions changes, the component's values gets refreshed.
       */
      this.refreshCash();
    });
  },
};
</script>
