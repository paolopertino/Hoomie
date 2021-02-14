<template>
  <div>
    <!-- Dialog to create a new group -->
    <v-row justify="center">
      <v-dialog v-model="dialog" persistent overflowed max-width="600px">
        <v-card :loading="loadStatus">
          <v-card-title>
            <span class="headline secondary--text">Crea un gruppo</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    label="Nome del gruppo"
                    required
                    class="primary--text"
                    v-model="groupName"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-switch
                  label="Abilita la cassa comune."
                  v-model="cassaComuneSwitch"
                ></v-switch>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    label="Aggiungi un partecipante"
                    required
                    clearable
                    append-icon="mdi-plus"
                    @click:append="addMember"
                    @keydown.enter.prevent="addMember"
                    v-model="memberToAdd"
                    class="primary--text"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>

            <v-divider class="ma-2"></v-divider>

            <v-list>
              <v-subheader class="primary--text">Partecipanti</v-subheader>
              <v-list-item v-for="(partecipant, index) in newGroupMembers" :key="index">
                {{ partecipant }}
                <v-spacer></v-spacer>
                <v-icon class="primary--text" @click="removeMember(partecipant)"
                  >mdi-account-remove</v-icon
                >
              </v-list-item>
            </v-list>
            <small
              >Potrai comunque aggiungere nuovi partecipanti al gruppo più tardi.</small
            >
          </v-card-text>
          <v-card-actions class="pa-3">
            <v-spacer></v-spacer>
            <v-btn outlined rounded color="primary" @click="closeDialog()">
              Chiudi
            </v-btn>
            <v-btn outlined rounded color="primary" @click="createGroup"> Crea </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <v-card class="cards">
      <v-container>
        <!-- This card will show a list of user's groups. -->
        <v-card-title primary-title class="primary--text">
          I tuoi gruppi
          <v-spacer></v-spacer>
          <v-icon right @click="openDialog()" class="primary--text"
            >mdi-account-multiple-plus-outline</v-icon
          >
        </v-card-title>
        <v-card-subtitle>Una lista dei tuoi gruppi</v-card-subtitle>
        <v-divider class="ma-1"></v-divider>

        <!-- If no groups are available we display an info message, with an image -->
        <div v-if="yourGroups.length == 0">
          <v-img src="@/assets/noGroup.svg" @click="openDialog()" class="ma-8"></v-img>
          <p class="text-center info--text pa-3">
            Sembra che tu non faccia parte ancora di alcun gruppo. Creane uno cliccando
            l'immagine.
          </p>
        </div>

        <!-- If there are available groups they'll be listed. By clicking on the arrow icon, the user gets in the group dashboard. -->
        <v-list v-if="yourGroups.length != 0">
          <v-list-item v-for="(group, index) in yourGroups" :key="index">
            <v-list-item-avatar>
              <v-icon class="primary--text"> mdi-account-group-outline </v-icon>
            </v-list-item-avatar>
            {{ group.name }}
            <v-spacer></v-spacer>
            <v-icon @click="accessSelectedGroup(group)" class="info--text"
              >mdi-arrow-right-bold</v-icon
            >
          </v-list-item>
        </v-list>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import db from "@/firebase/init.js";
import firebase from "firebase";

export default {
  name: "P_GroupsList",
  data() {
    return {
      /**
       * Personal groups informations data.
       */
      yourGroups: [],

      /**
       * Dialog utils.
       */
      cassaComuneSwitch: false,
      loadStatus: false,
      dialog: false,
      groupName: null,
      memberToAdd: null,
      newGroupMembers: [],
      groupMembersUIDS: [],
    };
  },
  methods: {
    openDialog() {
      this.dialog = true;

      /**
       * The group owner is automatically pushed into the partecipants array.
       */
      this.newGroupMembers.push(firebase.auth().currentUser.email);
    },
    closeDialog() {
      this.dialog = false;
      this.newGroupMembers = [];
    },
    addMember() {
      /**
       * Adding a member to the partecipants list.
       */
      this.newGroupMembers.push(this.memberToAdd);
      this.memberToAdd = null;
    },
    removeMember(toRemove) {
      /**
       * Filtering out a partecipant from the partecipants list.
       */
      this.newGroupMembers = this.newGroupMembers.filter((member) => {
        return member != toRemove;
      });
    },
    createGroup() {
      let newGroup = db.collection("groups").doc();

      /**
       * Firstly we set a status bar while doing the db operations.
       */
      this.loadStatus = true;

      /**
       * Foreach email added to the list, we get the user_uid linked to it and push it to an array.
       * When we get the doc, we also push the group id to the user's group entry.
       */
      let UIDScompiler = new Promise((resolve1) => {
        this.newGroupMembers.forEach((memberEmail, index, array) => {
          let dbDataFetch = new Promise((resolve2) => {
            db.collection("users")
              .where("email", "==", memberEmail)
              .get()
              .then((snapshot) => {
                snapshot.forEach((doc) => {
                  /**
                   * Getting the user UID
                   */
                  this.groupMembersUIDS.push(doc.data().user_id);

                  /**
                   * Setting the group ID into the user's 'groups' array.
                   */
                  let updatedGroupsArray = doc.data().groups;
                  updatedGroupsArray.push(newGroup.id);

                  db.collection("users")
                    .doc(doc.id)
                    .update({
                      groups: updatedGroupsArray,
                    })
                    .then()
                    .catch((err) => {
                      console.log(err);
                    });
                });
                resolve2();
              })
              .catch((err) => {
                console.log(err);
              });
          });

          dbDataFetch.then(() => {
            //console.log("Il dato", memberEmail, "è stato aggiunto all'array.");
            if (index === array.length - 1) resolve1();
          });
        });
      });

      /**
       * Now we have compiled the whole partecipants array. We can create the group entry on the database.
       */
      UIDScompiler.then(() => {
        newGroup
          .set({
            group_name: this.groupName,
            group_members: this.groupMembersUIDS,
            cassa_comune: this.cassaComuneSwitch,
            available_cash: 0,
          })
          .then(() => {
            /**
             * After the operation is done, we reset all the values to the default ones.
             */
            this.newGroupMembers = [];
            this.groupMembersUIDS = [];
            this.groupName = null;
            this.memberToAdd = null;

            /**
             * The operation is completed. The loading bar is stopped and the dialog is closed.
             */
            this.loadStatus = false;
            this.dialog = false;
          })
          .catch((err) => {
            console.log(err);
          });
      });
    },
    accessSelectedGroup(selGroup) {
      this.$router.push({
        name: "G_Dashboard",
        params: { selectedGroup: selGroup, gName: selGroup.name },
      });
    },
  },
  created() {
    /**
     * Creating reference to the groups collection.
     */
    let ref = db.collection("groups");

    /**
     * Now i'm setting up a listener witch will listen to the changes of the collection of groups on the db.
     * If a new group gets added to the db, then we catch that change and we will show it on the template if the current user is a member.
     */
    ref.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type == "added") {
          let doc = change.doc;
          if (doc.data().group_members.includes(firebase.auth().currentUser.uid)) {
            this.yourGroups.push({
              name: doc.data().group_name,
              group_id: doc.id,
            });
          }
        }
      });
    });
  },
};
</script>
