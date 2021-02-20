<template>
  <v-footer padless class="background">
    <v-row>
      <v-card flat tile width="100%" class="background info--text text-center">
        <v-card-text>
          <v-btn
            v-for="(icon, index) in icons"
            :key="index"
            class="mx-4 primary--text"
            icon
            @click="goTo(icon.linkTo)"
          >
            <v-icon size="24px">
              {{ icon.name }}
            </v-icon>
          </v-btn>
        </v-card-text>
        <v-card-text class="white--text">
          <small>Sviluppato da Paolo Pertino</small><br />
          {{ new Date().getFullYear() }} — <strong>Hoomie</strong>
        </v-card-text>
      </v-card>
    </v-row>
  </v-footer>
</template>

<script>
export default {
  name: "Footer",
  data() {
    return {
      icons: [
        { name: "mdi-github", linkTo: "https://github.com/paolopertino/Hoomie" },
        { name: "mdi-linkedin", linkTo: "https://www.linkedin.com/in/paolo-pertino/" },
        { name: "mdi-instagram", linkTo: "https://www.instagram.com/paolino_x/" },
        { name: "mdi-facebook", linkTo: "https://www.facebook.com/paolopertino" },
      ],
    };
  },
  methods: {
    goTo(link) {
      window.location.href = link;
    },
  },
};
</script>
