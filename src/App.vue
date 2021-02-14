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

<style></style>
