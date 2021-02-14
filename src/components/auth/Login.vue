<template>
  <div class="login">
    <!--
    <nav>
      <v-toolbar flat class="appbar">
        <v-btn icon class="hidden-xs-only" router to="/">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>

        <v-toolbar-title class="secondary--text">Hoomie</v-toolbar-title>
        <v-spacer></v-spacer>

        <v-tooltip left v-if="!user" color="appbar">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              depressed
              v-on="on"
              v-bind="attrs"
              class="appbar secondary--text"
              router
              to="/register"
            >
              <v-icon>mdi-account-multiple-plus-outline</v-icon>
            </v-btn>
          </template>
          <span>Registrati</span>
        </v-tooltip>

        <v-tooltip left v-if="user" color="appbar">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              depressed
              @click="logout"
              v-on="on"
              v-bind="attrs"
              class="appbar secondary--text"
            >
              <v-icon>mdi-logout</v-icon>
            </v-btn>
          </template>
          <span>Esci</span>
        </v-tooltip>
      </v-toolbar>
    </nav>
    -->
    <v-container grid-list-xs class="mt-10">
      <v-card shaped :loading="loadStatus" class="cards">
        <v-card-title primary-title class="primary--text"> Accedi a Hoomie </v-card-title>
        <v-card-subtitle>Compila il form per accedere su Hoomie</v-card-subtitle>
        <v-spacer></v-spacer>
        <v-card-text>
          <v-form v-model="valid" @submit.prevent="login">
            <v-container>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="email"
                    type="email"
                    :rules="emailRules"
                    label="E-mail"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="password"
                    type="password"
                    :rules="passwordRules"
                    label="Password"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <p class="error--text text-center" v-if="feedback">{{ feedback }}</p>
              <v-spacer></v-spacer>
              <v-row justify="center">
                <v-btn type="submit" outlined rounded width="150px" color="primary"
                  >Accedi</v-btn
                >
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import firebase from "firebase";

export default {
  name: "Login",
  data() {
    return {
      /**
       * Form utils
       */
      valid: false,
      email: null,
      password: null,
      passwordRules: [
        (v) => !!v || "La password è richiesta.",
        (v) => (v && v.length >= 6) || "La password deve essere almeno di 6 caratteri.",
      ],
      emailRules: [
        (v) => !!v || "L'indirizzo e-mail è richiesto.",
        (v) => /.+@.+/.test(v) || "Inserisci un indirizzo mail valido.",
      ],

      /**
       * Card utils
       */
      loadStatus: false,
      feedback: null,

      /**
       * Firebase data
       */
      user: firebase.auth().currentUser,
    };
  },
  methods: {
    login() {
      this.loadStatus = true;

      if (this.valid) {
        firebase
          .auth()
          .signInWithEmailAndPassword(this.email, this.password)
          .then(() => {
            this.loadStatus = false;
            this.$router.push({ name: "Dashboard" });
          })
          .catch((error) => {
            this.loadStatus = false;
            console.log(error);
          });
      }
    },
    logout() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          this.user = null;
          this.$router.push({ name: "Home" });
        });
    },
  },
};
</script>

<style></style>
