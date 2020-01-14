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
                <v-text-field v-model="opcEndPoint" label="opc://"></v-text-field>
              </v-col>
              <v-col>
                <v-file-input v-model="file" accept=".xlsx" label="File input"></v-file-input>
              </v-col>
            </v-row>
            <v-row>
              <v-btn big color="primary" @click="openExcel()">ReadFile</v-btn>
              <v-spacer></v-spacer>
              <v-btn big color="primary" @click="connectOpcua()">Connect</v-btn>
            </v-row>
          </v-container>
        </v-form>
      </v-container>

      <v-list>
        <v-list-item v-for="(ufr,i) in ufrs" :key="i">
          <v-container>
            <v-list>
              <v-header>Drives {{ufr.pnName}}</v-header>
              <v-list-item-group>
                <v-list-item
                  v-for="(drive, i) in ufr.drivesId"
                  :key="i"
                  :style="{ 'background-color': drive.color }"
                >
                  <v-checkbox v-model="selected" :value="drive" color="primary"></v-checkbox>
                  <v-list-item-content>
                    <v-list-item-title v-html="drive.hwIdName"></v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-container>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script>
// @ is an alias to /src
import { getUfrs } from "../lib/readExcel";
import { ipcRenderer }  from 'electron'

export default {
  name: "home",
  data() {
    return {
      opcEndPoint: "opc.tcp://192.168.0.1:4840",
      selected: [],
      opcClient: null,
      file: null,
      ufrs: [],
      drives: [
        { id: "drive1", color: "#80CBC4" },
        { id: "drive2", color: "#F48FB1" },
        { id: "drive3", color: "#BBDEFB" },
        { id: "drive4", color: "#FFFFFF" }
      ]
    };
  },
  methods: {
    async openExcel() {
      console.log(this.file);
      this.ufrs = await getUfrs(this.file.path);
    },
    async connectOpcua() {

      ipcRenderer.send('connect',this.opcEndPoint)

      /*

      */
    }
    
  },
  components: {},
  mounted () {


  this.$electron.ipcRenderer.on('connect', (event, data) => {
   
    console.log(data)
  })
}
};
</script>


