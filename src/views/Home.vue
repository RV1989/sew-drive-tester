<template>
  <div class="home">
    <v-card class="mx-auto" max-width="800">
      <v-toolbar color="cyan lighten-1" dark>
        <v-toolbar-title>Sew Drive Tester</v-toolbar-title>

        <v-spacer></v-spacer>
      </v-toolbar>

      <v-container fluid>
        <v-form class="pa-4 pt-6">
          <v-container>
            <v-row>
              <v-col>
                <v-text-field v-model="model" label="opc://"></v-text-field>
              </v-col>
              <v-col>
                <v-file-input multiple label="File input"></v-file-input>
              </v-col>
            </v-row>
            <v-row>
              <v-spacer></v-spacer>
              <v-btn big color="primary">Connect</v-btn>
            </v-row>
          </v-container>
        </v-form>
      </v-container>

      <v-container>
        <v-list>
          <v-header>Drives</v-header>
          <v-list-item-group>
            <v-list-item v-for="(drive, i) in drives" :key="i" :style="{ 'background-color': drive.color }">
                <v-checkbox v-model="selected"  :value = "drive" color="primary"></v-checkbox>
              <v-list-item-content>
                <v-list-item-title v-html="drive.id"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-container>
    </v-card>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: "home",
  data() {
    return {
      model: "opc://179.158.14:245",
      selected : [],
      drives: [
        { id: "drive1", color: "#80CBC4"},
        { id: "drive2", color: "#F48FB1" },
        { id: "drive3", color: "#BBDEFB" },
        { id: "drive4", color: "#FFFFFF" }
      ]
    };
  },

  components: {}
};
</script>
