<template>
  <div>
    <!-- Dialog to add new members to the group -->
    <v-row justify="center">
      <v-dialog v-model="dialog" persistent overflowed max-width="600px">
        <v-card :loading="loadStatus">
          <v-card-title>
            <span class="headline secondary--text">Aggiungi un membro al gruppo</span>
          </v-card-title>
          <v-card-text>
            <v-container>
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
                  <small
                    >I membri vanno aggiunti attraverso la loro mail di registrazione alla
                    piattaforma.</small
                  >
                </v-col>
              </v-row>
            </v-container>

            <v-divider class="ma-2"></v-divider>

            <v-list v-if="newGroupMembers.length != 0">
              <v-subheader class="primary--text">Nuovi membri</v-subheader>
              <v-list-item v-for="(partecipant, index) in newGroupMembers" :key="index">
                {{ partecipant }}
                <v-spacer></v-spacer>
                <v-icon class="primary--text" @click="removeMember(partecipant)"
                  >mdi-account-remove</v-icon
                >
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions class="pa-3">
            <v-spacer></v-spacer>
            <v-btn outlined rounded color="primary" @click="closeDialog"> Chiudi </v-btn>
            <v-btn outlined rounded color="primary" @click="addPartecipant">
              Aggiungi
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <v-card class="cards">
      <v-container>
        <!-- This card will show a list of user's groups. -->
        <v-card-title primary-title class="primary--text">
          Membri del gruppo
          <v-spacer></v-spacer>
          <v-icon right @click="dialog = true" class="primary--text"
            >mdi-account-multiple-plus-outline</v-icon
          >
        </v-card-title>
        <v-card-subtitle>Una lista di tutti i membri del gruppo.</v-card-subtitle>

        <v-divider class="ma-1"></v-divider>

        <v-skeleton-loader v-if="currentlyFetching" type="list-item-three-line">
        </v-skeleton-loader>
        <v-list v-if="!currentlyFetching">
          <v-list-item v-for="(member, index) in membersList" :key="index">
            {{ member }}
            <v-spacer></v-spacer>
            <v-icon @click="kickMember(member)" class="info--text"
              >mdi-account-remove-outline</v-icon
            >
          </v-list-item>
        </v-list>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import db from "@/firebase/init.js";

export default {
  name: "G_MemberList",
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
      dialog: false,
      memberToAdd: null,
      loadStatus: false,
      newGroupMembers: [],
      groupMembersUIDS: [],

      /**
       * Member List Utils
       */
      memberListIDs: [],
      membersList: [],

      /**
       * Extra utils
       */
      currentlyFetching: false,
    };
  },
  methods: {
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
    addPartecipant() {
      let currentGroup = db.collection("groups").doc(this.groupID);

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
                  updatedGroupsArray.push(this.groupID);

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

      UIDScompiler.then(() => {
        currentGroup.get().then((group) => {
          group.data().group_members.forEach((memberID) => {
            this.groupMembersUIDS.push(memberID);
          });
          currentGroup.update({ group_members: this.groupMembersUIDS }).then(() => {
            /**
             * After the operation is done, we reset all the values to the default ones.
             */
            this.newGroupMembers = [];
            this.groupMembersUIDS = [];
            this.memberToAdd = null;

            /**
             * The operation is completed. The loading bar is stopped and the dialog is closed.
             */
            this.loadStatus = false;
            this.dialog = false;
          });
        });
      });
    },
    kickMember(memberToKick) {
      let memberUID;
      let groupsArray;

      let getMemberUID = new Promise((resolve) => {
        db.collection("users")
          .where("nickname", "==", memberToKick)
          .get()
          .then((snapshot) => {
            snapshot.forEach((doc) => {
              memberUID = doc.data().user_id;
              groupsArray = doc.data().groups;
              resolve();
            });
          });
      });

      getMemberUID.then(() => {
        /**
         * Filtering out the user UID from the group's user IDs array.
         */
        db.collection("groups")
          .doc(this.groupID)
          .get()
          .then((doc) => {
            let updatedMembers = doc.data().group_members.filter((id) => {
              return id != memberUID;
            });

            db.collection("groups").doc(this.groupID).update({
              group_members: updatedMembers,
            });
          });

        /**
         * Filtering out the group id from the user's group's IDs array entry.
         */
        groupsArray = groupsArray.filter((id) => {
          return id != this.groupID;
        });

        db.collection("users")
          .where("user_id", "==", memberUID)
          .get()
          .then((snapshot) => {
            snapshot.forEach((doc) => {
              db.collection("users").doc(doc.id).update({
                groups: groupsArray,
              });
            });
          });
      });
    },
  },
  created() {
    let group = db.collection("groups").doc(this.groupID);

    group.onSnapshot((doc) => {
      this.currentlyFetching = true;
      this.memberListIDs = doc.data().group_members;
      this.membersList = [];
      this.memberListIDs.forEach((id) => {
        db.collection("users")
          .where("user_id", "==", id)
          .get()
          .then((snapshot) => {
            snapshot.forEach((doc) => {
              this.membersList.push(doc.data().nickname);
            });

            this.currentlyFetching = false;
          });
      });
    });
  },
};
</script>

<style></style>
