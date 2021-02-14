<template>
  <div>
    <v-container grid-list-xs>
      <v-card class="cards">
        <v-container grid-list-xs>
          <v-card-title primary-title class="primary--text">
            {{ listName }}
            <v-spacer></v-spacer>
            <v-tooltip left color="cards">
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on" class="primary--text" @click="saveList()"
                  >mdi-content-save-move</v-icon
                >
              </template>
              <span>Salva ed esci</span>
            </v-tooltip>
          </v-card-title>
          <v-card-subtitle>
            Aggiungi o rimuovi oggetti alla lista della spesa.
          </v-card-subtitle>

          <v-divider class="ma-1"></v-divider>
          <v-text-field
            label="Aggiungi un oggetto..."
            v-model="newIngredient"
            append-icon="mdi-plus"
            @click:append="addIngredient()"
            @keydown.enter.prevent="addIngredient()"
            @keydown.tab.prevent="addIngredient()"
          >
          </v-text-field>
          <v-divider class="ma-1"></v-divider>

          <v-list v-if="listIngredients.length != 0">
            <v-list-item v-for="(ingredient, index) in listIngredients" :key="index">
              <v-list-item-content>
                <v-list-item-title>{{ ingredient }}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon @click="deleteIngredient(ingredient)" class="info--text"
                  >mdi-delete</v-icon
                >
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-container>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import db from "@/firebase/init.js";

export default {
  name: "EditShoppingList",
  data() {
    return {
      list_id: this.$route.params.selectedList,
      listName: null,
      newIngredient: null,
      listIngredients: [],
      prevRoute: null,
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
    addIngredient() {
      if (this.newIngredient) {
        this.listIngredients.push(this.newIngredient);

        db.collection("shopping_lists")
          .doc(this.list_id)
          .update({
            list_of_ingredients: this.listIngredients,
          })
          .then(() => {
            this.newIngredient = null;
          });
      }
    },
    deleteIngredient(ing) {
      this.listIngredients = this.listIngredients.filter((i) => {
        return i != ing;
      });

      db.collection("shopping_lists").doc(this.list_id).update({
        list_of_ingredients: this.listIngredients,
      });
    },
    saveList() {
      this.$router.push({
        name: "G_Dashboard",
        params: {
          selectedGroup: this.$route.params.parentGroup,
          gName: this.$route.params.parentGroup.name,
        },
      });
    },
  },
  created() {
    let listRef = db.collection("shopping_lists").doc(this.list_id);

    listRef.onSnapshot((doc) => {
      this.listName = doc.data().name;
      this.listIngredients = doc.data().list_of_ingredients;
    });
  },
};
</script>
