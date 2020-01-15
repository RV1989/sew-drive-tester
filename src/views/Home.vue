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
                <v-file-input v-model="file" accept=".xlsx" label="File input" @file="openExcel()"></v-file-input>
              </v-col>
            </v-row>
            <v-row>
              
              <v-spacer></v-spacer>
              <v-btn big color="primary" @click="connectOpcua()">Run test</v-btn>
            </v-row>
          </v-container>
        </v-form>
      </v-container>

      <v-list>
        <v-list-item v-for="(ufr,i) in ufrs" :key="i">
          <v-container>
            <v-list subheader>
              <v-subheader>
                <v-checkbox v-model="selectedUfr" :value="i"></v-checkbox>
                Drives {{ufr.pnName}}
                
              </v-subheader>
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
import { ipcRenderer, remote } from "electron";

export default {
  name: "home",
  data() {
    return {
      opcEndPoint: "opc.tcp://192.168.0.1:4840",
      selected: [],
      selectedUfr: [],
      selectedUfrOld: [],
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
      let args = {};
      args.opcUaEndPoint = this.opcEndPoint;
      args.drives = this.selected;
      ipcRenderer.send("runTest", args);

      /*

      */
    },

    updateDrive(drive) {
      for (let [i, ufr] of this.ufrs.entries()) {
        let index = ufr.drivesId.findIndex(
          obj => obj.hwIdName === drive.hwIdName
        );
        if (index !== -1) {
          this.$set(this.ufrs[i].drivesId, index, { ...drive });
        }
      }
    },
    selectAll(ufr) {
      console.log(this.selectedUfr);

      for (let drive of ufr.drivesId) {
        this.selected.push(drive);
      }
    },
    deSelectAll(ufr) {
      for (let drive of ufr.drivesId) {
        for (var i = 0; i < this.selected.length; i++) {
          if (this.selected[i].hwIdName === drive.hwIdName) {
            this.selected.splice(i, 1);
            i--;
          }
        }
      }
    }
  },
  watch: {
    selectedUfr: function(val) {
      if (val.length > this.selectedUfrOld.length) {
        let diff = val.filter(x => !this.selectedUfrOld.includes(x));
        console.log(diff)
        if (diff) {
          this.selectAll(this.ufrs[diff[0]]);
        }
      } else if (val.length < this.selectedUfrOld.length) {
        let diff = this.selectedUfrOld.filter(x => !val.includes(x));
        console.log(diff)
        if (diff) {
          this.deSelectAll(this.ufrs[diff[0]]);
        }
      }

      console.log(val);
      this.selectedUfrOld = val;
    },
    file : function(val){
      this.openExcel()
    }
  },
  components: {},
  mounted() {
    ipcRenderer.on("Error", (event, data) => {
      console.log(data);
    });
    ipcRenderer.on("UpdateDrive", (event, data) => {
      console.log(data);
      this.updateDrive(data);
    });
  }
};
</script>


