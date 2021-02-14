<template>
  <div>
    <v-container grid-list-xs v-if="yourGroups.length != 0">
      <v-row>
        <v-col cols="12" sm="4" v-for="group in yourGroups" :key="group.id">
          <v-card class="cards">
            <v-card-title class="primary--text">
              {{ group.name }}

              <v-spacer></v-spacer>
              <v-chip :color="group.cassaComune ? 'success' : 'error'" outlined>
                <v-icon left> mdi-piggy-bank </v-icon>
                <p v-if="group.cassaComune" class="text-center mt-4">
                  € {{ group.import }}
                </p>
                <p v-if="!group.cassaComune" class="text-center mt-4">Cassa Offline</p>
              </v-chip>
              <v-spacer></v-spacer>
              <v-icon @click="accessGroup(group)" class="primary--text"
                >mdi-account-group</v-icon
              >
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-container v-if="yourGroups.length == 0">
      <v-row justify="center">
        <v-img src="@/assets/noGroup.svg" contain class="ma-8" />
      </v-row>
    </v-container>
  </div>
</template>

<script>
import db from "@/firebase/init.js";
import firebase from "firebase";

export default {
  name: "MyGroups",
  data() {
    return {
      yourGroups: [],
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
    accessGroup(group) {
      let param1 = { name: group.name, group_id: group.id };

      this.$router.push({
        name: "G_Dashboard",
        params: { selectedGroup: param1, gName: group.name },
      });
    },
  },
  created() {
    let groupsRef = db.collection("groups");

    groupsRef.onSnapshot((listOfGroups) => {
      /**
       * Resetting default value and compiling the array whenever it gets modified.
       */
      this.yourGroups = [];
      listOfGroups.forEach((group) => {
        if (group.data().group_members.includes(firebase.auth().currentUser.uid)) {
          this.yourGroups.push({
            name: group.data().group_name,
            cassaComune: group.data().cassa_comune,
            import: group.data().available_cash,
            id: group.id,
          });
        }
      });
    });
  },
};
</script>
