<template>
  <div>
    <v-container grid-list-xs v-if="listOfLists.length != 0">
      <v-row>
        <v-col cols="12" sm="4" v-for="list in listOfLists" :key="list.id">
          <v-card class="cards">
            <v-card-title class="primary--text">
              {{ list.name }}
              <v-spacer></v-spacer>
              <v-icon @click="editList(list)" class="primary--text mt-4"
                >mdi-clipboard-edit-outline</v-icon
              >
            </v-card-title>
            <v-card-subtitle v-text="list.groupName" />
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-container v-if="listOfLists.length == 0">
      <v-row justify="center">
        <v-img src="@/assets/shopping_list.svg" contain height="500" class="ma-8" />
      </v-row>
      <v-row justify="center">
        <p class="text-center mt-4">
          Ooops... Sembra che tu non abbia ancora una lista della spesa. <br />
          Entra in un gruppo per crearne una!
        </p>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import db from "@/firebase/init.js";
import firebase from "firebase";
export default {
  name: "MyLists",
  data() {
    return {
      listOfLists: [],
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
    editList(list) {
      this.$router.push({
        name: "EditShoppingList",
        params: {
          listName: list.name,
          selectedList: list.id,
          parentGroup: list.groupID,
        },
      });
    },
  },
  created() {
    let listsRef = db.collection("shopping_lists");
    let userRef = db.collection("users");
    let groupList = [];

    userRef
      .where("user_id", "==", firebase.auth().currentUser.uid)
      .get()
      .then((snapshot) => {
        snapshot.forEach((user) => {
          groupList = user.data().groups;
        });

        groupList.forEach((groupID) => {
          listsRef
            .where("group_id", "==", groupID)
            .get()
            .then((lists) => {
              lists.forEach((list) => {
                db.collection("groups")
                  .doc(list.data().group_id)
                  .get()
                  .then((g) => {
                    let gName = g.data().group_name;

                    this.listOfLists.push({
                      name: list.data().name,
                      groupName: gName,
                      id: list.id,
                      groupID: list.data().group_id,
                    });
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              });
            })
            .catch((error) => {
              console.log(error);
            });
        });
      })
      .catch((error) => {
        console.log(error);
      });
  },
};
</script>
