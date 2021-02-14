<template>
  <div>
    <!-- Dialog to add a transaction -->
    <v-row justify="center">
      <v-dialog v-model="dialog" persistent overflowed max-width="600px">
        <v-card :loading="loadStatus">
          <v-card-title>
            <span class="headline secondary--text">Aggiungi una lista</span>
          </v-card-title>
          <v-card-subtitle>
            Crea una lista della spesa per il tuo gruppo.
          </v-card-subtitle>
          <v-card-text>
            <v-form v-model="valid" @submit.prevent="addList()">
              <v-container>
                <!-- Transaction name -->
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      label="Nome"
                      required
                      class="primary--text"
                      v-model="listName"
                      :rules="[rules.required]"
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
            <v-btn outlined rounded color="primary" @click="addList()"> Crea </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <v-card class="cards">
      <v-container>
        <v-card-title primary-title class="primary--text">
          Liste della spesa
          <v-spacer></v-spacer>
          <v-tooltip left color="cards">
            <template v-slot:activator="{ on, attrs }">
              <v-icon @click="openDialog()" v-on="on" v-bind="attrs" class="primary--text"
                >mdi-cart-plus</v-icon
              >
            </template>
            <span>Nuova lista</span>
          </v-tooltip>
        </v-card-title>
        <v-card-subtitle>Tutte le liste della spesa del gruppo.</v-card-subtitle>
        <v-divider class="ma-1"></v-divider>

        <v-list v-if="listOfLists.length != 0">
          <v-list-item v-for="(list, index) in listOfLists" :key="index">
            <v-list-item-content>
              <v-list-item-title>{{ list.name }}</v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
              <v-icon @click="editList(list)" class="info--text"
                >mdi-playlist-edit</v-icon
              >
            </v-list-item-action>
            <v-list-item-action
              ><v-icon @click="deleteList(list)" class="info--text"
                >mdi-delete</v-icon
              ></v-list-item-action
            >
          </v-list-item>
        </v-list>

        <div v-if="listOfLists.length == 0">
          <v-img src="@/assets/emptyCart.svg" contain height="210"> </v-img>
          <v-divider class="ma-2"></v-divider>
          <v-row justify="center pa-5">
            <small class="text-center">
              Sembra che non sia ancora stata creata alcuna lista... <br />
              Creane una cliccando il bottone in alto!
            </small>
          </v-row>
        </div>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import db from "@/firebase/init.js";

export default {
  name: "gShopping",
  props: {
    group: {
      type: Object,
    },
  },
  data() {
    return {
      /**
       * Dialog Utils
       */
      dialog: false,
      loadStatus: false,
      valid: false,
      listName: null,
      rules: {
        required: (value) => !!value || "Campo richiesto.",
      },

      /**
       * Extra Utils
       */
      allListsRaw: [],
      listOfLists: [],
    };
  },
  methods: {
    openDialog() {
      this.loadStatus = false;
      this.listName = null;
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
      this.loadStatus = false;
      this.listName = null;
    },
    addList() {
      if (this.valid) {
        this.loadStatus = true;

        db.collection("shopping_lists")
          .add({
            name: this.listName,
            group_id: this.group.group_id,
            list_of_ingredients: [],
          })
          .then((doc) => {
            this.loadStatus = false;
            this.dialog = false;

            this.$router.push({
              name: "EditShoppingList",
              params: {
                listName: this.listName,
                selectedList: doc.id,
                parentGroup: this.group,
              },
            });
          })
          .catch((error) => {
            this.loadStatus = false;
            console.log(error);
          });
      }
    },
    compileList() {
      this.allListsRaw.forEach((list) => {
        let listToManage = {
          name: list.data().name,
          id: list.id,
        };
        this.listOfLists.push(listToManage);
      });
    },
    editList(list) {
      this.$router.push({
        name: "EditShoppingList",
        params: {
          listName: list.name,
          selectedList: list.id,
          parentGroup: this.group,
        },
      });
    },
    deleteList(list) {
      db.collection("shopping_lists")
        .doc(list.id)
        .delete()
        .then(() => {
          console.log("Eliminazione completata");
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
  created() {
    let listsRef = db.collection("shopping_lists");
    listsRef.onSnapshot((listOfDocs) => {
      this.listOfLists = [];
      this.allListsRaw = listOfDocs.docs.filter((doc) => {
        return doc.data().group_id == this.group.group_id;
      });

      this.compileList();
    });
  },
};
</script>
