<template>
  <v-app>
    <Navbar v-if="this.$route.name != 'Home'" />

    <v-main class="background">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import Navbar from "@/components/layout/Navbar.vue";

export default {
  name: "App",
  components: {
    Navbar: Navbar,
  },
  data() {
    return {};
  },
};
</script>

<style>
/* Styling scrollbar */
* {
  scrollbar-width: thin;
  scrollbar-color: #ffe082 #121212;
}

/* Works on Chrome/Edge/Safari */
*::-webkit-scrollbar {
  width: 7px;
}
*::-webkit-scrollbar-track {
  background-color: #121212;
}
*::-webkit-scrollbar-thumb {
  background-color: #ffe082;
  border-radius: 20px;
  border: 0px solid #121212;
}
</style>
