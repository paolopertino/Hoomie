<template>
  <div class="home">
    <div class="mt-12">
      <v-container grid-list-xs>
        <v-row no-gutters>
          <v-col sm="5" align-self="center">
            <v-img
              src="@/assets/homepage_illustration1.svg"
              class="d-flex justify-center"
            />
          </v-col>
          <v-spacer></v-spacer>
          <v-col sm="5" align-self="center">
            <h1 class="primary--text text-center">Hoomie</h1>
            <p class="text-center">
              Benvenuto su Hoomie, un utile strumento per agevolare le tue attività
              quotidiane e per tenere traccia delle tue spese. Registrati o fai il login
              per provare tutte le funzionalità!
            </p>
            <v-row justify="center">
              <v-btn outlined rounded width="150px" class="ma-2" router to="/register"
                >Registrati</v-btn
              >
              <v-btn outlined rounded width="150px" class="ma-2" router to="/login"
                >Login</v-btn
              >
              <v-btn outlined rounded width="150px" class="ma-2" router to="/dashboard"
                >Dashboard</v-btn
              >
            </v-row>
          </v-col>
        </v-row>
        <v-divider class="ma-5"></v-divider>
      </v-container>
      <v-container fluid grid-list-md>
        <h1 class="text-center primary--text">Features</h1>
        <v-row no-gutters justify="center">
          <v-col cols="12" md="4">
            <v-card class="cards pa-10 ma-5">
              <v-img contain height="200" src="@/assets/shopping_list.svg" class="mb-2" />
              <h2 class="secondary--text text-center">Lista della spesa</h2>
              <p class="text-center">
                Crea e gestisci le tue liste della spesa con un semplice click.
                Condividile con gli altri membri di Hoomie!
              </p>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="cards pa-10 ma-5">
              <v-img contain height="200" src="@/assets/investimenti.svg" class="mb-2" />
              <h2 class="secondary--text text-center">Cassa Comune</h2>
              <p class="text-center">
                Organizzi un viaggio con gli amici e vuoi tenere traccia delle spese di
                gruppo? Convivi e decidi di voler dividere le spese con il tuo
                coinquilino? Tieni traccia delle transazioni degli utenti e dei fondi
                comuni rimasti utilizzando la cassa comune!
              </p>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="cards pa-10 ma-5">
              <v-img contain height="200" src="@/assets/people.svg" class="mb-2" />
              <h2 class="secondary--text text-center">Gruppi Multipli</h2>
              <p class="text-center">
                Con Hoomie hai la possibilità di creare i gruppi. Registrati o accedi per
                poterne creare uno con i tuoi amici. Ricorda che ogni membro può vedere e
                gestire le liste della spese e le transazioni del gruppo a cui fa parte.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      prevRoute: null,
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.prevRoute = from;
      console.log(vm.prevRoute);
    });
  },
  beforeRouteLeave(to, from, next) {
    console.log(to);
    if (
      (to.name == "G_Dashboard" && !to.params.selectedGroup) ||
      (to.name == "EditShoppingList" && !to.params.selectedList)
    ) {
      next({ name: to.name, params: this.prevRoute.params });
    } else {
      next();
    }
  },
  methods: {},
};
</script>

<style></style>
