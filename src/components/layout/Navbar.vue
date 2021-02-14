<template>
  <nav>
    <v-app-bar flat class="appbar">
      <v-app-bar-nav-icon
        @click="
          () => {
            this.drawer = !this.drawer;
          }
        "
      ></v-app-bar-nav-icon>
      <v-icon
        v-if="this.$route.name == 'G_Dashboard'"
        @click="() => this.$router.push({ name: 'Dashboard' })"
        class="ma-2"
        >mdi-arrow-left</v-icon
      >
      <v-toolbar-title
        @click="() => this.$router.push({ name: 'Home' })"
        class="secondary--text"
        >Hoomie</v-toolbar-title
      >
      <v-spacer></v-spacer>
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
    </v-app-bar>

    <v-navigation-drawer app temporary v-model="drawer">
      <v-chip
        pill
        outlined
        v-if="user"
        class="secondary mt-4 ml-2"
        router
        to="/dashboard"
      >
        {{ user.email }}
        <v-avatar right>
          <v-icon color="secondary">mdi-account-circle</v-icon>
        </v-avatar>
      </v-chip>

      <v-container grid-list-xs v-if="!user">
        <v-row justify="center">
          <v-btn
            rounded
            outlined
            width="150"
            color="primary"
            class="ma-2"
            router
            to="/register"
          >
            <v-icon left>mdi-account-multiple-plus-outline</v-icon>
            <span>Registrati</span>
          </v-btn>
        </v-row>
        <v-row justify="center">
          <v-btn
            rounded
            outlined
            width="150"
            color="primary"
            class="ma-2"
            router
            to="/login"
          >
            <v-icon left>mdi-account-arrow-left-outline</v-icon>
            <span>Accedi</span>
          </v-btn>
        </v-row>
      </v-container>

      <v-divider class="ma-3"></v-divider>
      <v-list v-if="user">
        <v-list-item-group v-model="selectedItem" color="primary">
          <v-list-item v-for="link in links" :key="link.text" router :to="link.route">
            <v-list-item-icon>
              <v-icon v-text="link.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="link.text"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
  </nav>
</template>

<script>
import firebase from "firebase";

export default {
  name: "Navbar",
  data() {
    return {
      drawer: false,
      selectedItem: 1,
      links: [
        { icon: "mdi-view-dashboard", text: "Dashboard", route: "/dashboard" },
        { icon: "mdi-shopping-outline", text: "Le tue liste", route: "/le-mie-liste" },
        { icon: "mdi-account-group", text: "Gruppi", route: "/gruppi" },
      ],

      /**
       * Firebase data
       */
      user: null,
    };
  },
  methods: {
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
  created() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.user = user;
        // console.log(this.user);
      } else {
        this.user = null;
      }
    });
  },
};
</script>
