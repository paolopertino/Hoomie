<template>
  <div>
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
              to="/login"
            >
              <v-icon>mdi-account-arrow-left-outline</v-icon>
            </v-btn>
          </template>
          <span>Login</span>
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

        <v-chip pill outlined v-if="user" class="secondary ml-2" router to="/dashboard">
          {{ user.email }}
          <v-avatar right>
            <v-icon color="secondary">mdi-account-circle</v-icon>
          </v-avatar>
        </v-chip>
      </v-toolbar>
    </nav>
    -->

    <v-container grid-list-xs class="mt-10">
      <v-card shaped :loading="loadStatus" class="cards">
        <v-card-title primary-title class="primary--text">
          Registrati a Hoomie
        </v-card-title>
        <v-card-subtitle>Compila il form per registrarti su Hoomie</v-card-subtitle>
        <v-spacer></v-spacer>
        <v-card-text>
          <v-form v-model="valid" @submit.prevent="register">
            <v-container>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="firstname"
                    :rules="nameRules"
                    label="Nome"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="lastname"
                    :rules="nameRules"
                    label="Cognome"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="nickname"
                    :rules="nameRules"
                    label="Nickname"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
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
                  >Registrati</v-btn
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
import db from "@/firebase/init.js";
import firebase from "firebase";

export default {
  name: "Register",
  data() {
    return {
      /**
       * Form data utils
       */
      valid: false,
      firstname: null,
      lastname: null,
      nickname: null,
      tag: null,
      nameRules: [(v) => !!v || "Il nome è richiesto."],
      password: null,
      passwordRules: [
        (v) => !!v || "La password è richiesta.",
        (v) => (v && v.length >= 6) || "La password deve essere almeno di 6 caratteri.",
      ],
      email: null,
      emailRules: [
        (v) => !!v || "L'indirizzo e-mail è richiesto.",
        (v) => /.+@.+/.test(v) || "Inserisci un indirizzo mail valido.",
      ],

      /**
       * Card Utils
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
    register() {
      if (this.valid) {
        /**
         * Creating a tag for the user who is signing up. We will use it later to access his profile page.
         */
        this.createTag(this.nickname);

        /**
         * Checking if the nickname chosen is already used. While the component fetches the data, it's gonna show a loading bar.
         */
        this.loadStatus = true;
        let ref = db.collection("users").doc(this.tag);
        ref.get().then((doc) => {
          this.loadStatus = false;
          if (doc.exists) {
            /**
             * If it is, then it shows an error message.
             */
            this.feedback = "Il nickname da te scelto è già in uso.";
          } else {
            /**
             * If it isn't, it starts creating the new record into the database.
             */
            this.loadStatus = true;
            this.feedback = null;

            firebase
              .auth()
              .createUserWithEmailAndPassword(this.email, this.password)
              .then((credential) => {
                ref
                  .set({
                    nickname: this.nickname,
                    groups: [],
                    email: this.email,
                    user_id: credential.user.uid,
                  })
                  .then(() => {
                    this.$router.push({ name: "Dashboard" });
                  });
              })
              .catch((error) => {
                console.log(error);
              });

            this.loadStatus = false;
          }
        });
      } else {
        console.log("Form invalido.");
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
    createTag(textToModify) {
      if (textToModify) {
        this.tag = textToModify
          .toLowerCase()
          .replace(/['"()$%_*+.!/\-:@~]/g, "")
          .trim()
          .replace(/ /g, "-");
        // console.log(this.tag)
      } else {
        console.log("Error... Nothing to modify...");
      }
    },
  },
};
</script>

<style></style>
