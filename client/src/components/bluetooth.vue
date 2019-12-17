<template>
  <div>
    <div class="text-center">
      <v-dialog v-model="dialog" max-width="80%">
        <template v-slot:activator="{ on }">
          <v-btn x-small v-on="on" class="mr-5" color="#0000ff">Bluetooth Targets</v-btn>
        </template>
        <v-card>
          <v-row no-gutters>
            <v-col cols="2" class="pl-2" xs="1">
              <v-text-field ref='target0' v-model="targetToAdd[0]" maxlength="2" @input.native="focusNext(0)">
                <template v-slot:append-outer>:</template>
              </v-text-field>
            </v-col>
            <v-col cols="2" class="pl-2" xs="1">
              <v-text-field ref='target1' v-model="targetToAdd[1]" maxlength="2" @input.native="focusNext(1)">
                <template v-slot:append-outer>:</template>
              </v-text-field>
            </v-col>
            <v-col cols="2" class="pl-2" xs="1">
              <v-text-field ref='target2' v-model="targetToAdd[2]" maxlength="2" @input.native="focusNext(2)">
                <template v-slot:append-outer>:</template>
              </v-text-field>
            </v-col>
            <v-col cols="2" class="pl-2" xs="1">
              <v-text-field ref='target3' v-model="targetToAdd[3]" maxlength="2" @input.native="focusNext(3)">
                <template v-slot:append-outer>:</template>
              </v-text-field>
            </v-col>
            <v-col cols="2" class="pl-2" xs="1">
              <v-text-field ref='target4' v-model="targetToAdd[4]" maxlength="2" @input.native="focusNext(4)">
                <template v-slot:append-outer>:</template>
              </v-text-field>
            </v-col>
            <v-col cols="2" class="pl-2" xs="1">
              <v-text-field ref='target5' v-model="targetToAdd[5]" maxlength="2"/>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="3" class="pl-5" xs="1">
              <v-btn color="#0000ff" x-small v-on:click="addTarget">Add</v-btn>
            </v-col>
            <v-col cols="6" class="pl-5" xs="1">
              <v-checkbox v-model="tracking" label="Tracking Fox?"></v-checkbox>
            </v-col>
          </v-row>
          <span v-if="error" class="red--text pl-4">Invalid target address</span>
          <span class="pl-2" v-if="trackingFox">Tracking Fox: {{trackingFox}}</span>
          <v-divider></v-divider>
          <span class="pl-2 headline">Beaconing Targets</span>
          <v-list-item v-if="!bluetoothTargets.length">
            <v-list-item-content>
              <v-list-item-title>No targets</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list v-if="bluetoothTargets.length">
            <v-list-item v-for="(target,index) in bluetoothTargets" :key="index">
              <v-list-item-content>
                <v-list-item-title>{{target}}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn v-on:click="removeFromList(index)" class="red--text" icon>X</v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-dialog>
      <v-btn color="#008000" x-small :disabled="disable || (bluetoothTargets.length==0 && trackingFox == '')" v-if="!started" v-on:click="startScan">Start Bluetooth Scan</v-btn>
      <v-btn color="#ff0000" x-small :disabled="disable || (bluetoothTargets.length==0 && trackingFox == '')" v-if="started" v-on:click="stopScan">Stop Bluetooth Scan</v-btn>
    </div>
    <div id="bluetoothPlot"></div>
  </div>
</template>
<script>
import vegaEmbed from 'vega-embed'
export default {
  name: 'bluetooth',
  data() {
    return {
      view: null,
      started: false,
      dialog: false,
      disable: true,
      tracking: false,
      trackingFox: '',
      error: false,
      targetToAdd: ['','','','','',''],
      bluetoothTargets: [],
      spec: {
        $schema: 'https://vega.github.io/schema/vega/v5.json',
        data: {name: 'table'},
        width: document.documentElement.clientWidth*.7,
        height: document.documentElement.clientHeight*.25,
        legends: [{
          stroke: "color",
          title: "MACs",
          encode: {
            symbols: {
              enter: {
                strokeWidth: { value: 2 },
                size: { value: 50 }
              }
            }
          }
        }],
        config: {
          axis: {
            grid: true
          },
        },
        scales: [
          { name: 'x', type: 'time', domain: [Date.now()-21000,Date.now()], range: "width"},
          { name: 'y', type: 'linear', domain: [-100, 0], range: "height"},
          { name: 'color', type: 'ordinal', range: 'category', domain: { data: 'table', field: 'category', sort: true} }
        ],
        axes: [
          { type: 'x', scale: 'x', orient: 'bottom', tickCount: 20},
          { type: 'y', scale: 'y', orient: 'right', tickCount: 10}
        ],
        marks: [{
          type: 'symbol',
          shape: 'circle',
          
          from: {data: 'table'},
          encode: {
            update: {
              x: { scale: 'x', field: 'x'},
              y: { scale: 'y', field: 'y'},
              stroke: { scale: 'color', field: 'category'},
              fill: { scale: 'color', field: 'category'}
            }
          }
        }],
      }
    }
  },
  watch: {
    dialog(val) {
      var self = this
      if(val)
        setTimeout(() => { self.$nextTick(self.$refs.target0.focus) },250)
    }
  },
  methods: {
    redraw() {
      this.spec.height = document.documentElement.clientHeight*.25
      this.spec.width = document.documentElement.clientWidth*.7
      this.spec.scales[0].domain = [Date.now()-21000,Date.now()]
      vegaEmbed('#bluetoothPlot',this.spec, { actions: false })
    },
    updateGraph(data) {
      data = JSON.parse(data)
      data = data.map(datum => {
        return {
          x: datum.ts,
          y: datum.rssi,
          category: datum.mac
        }
      });
      data = data.filter(datum => {
        return /[0-9a-fA-F:]{17}/.test(datum.category)
      })
      this.spec.data.values = data;
    },
    startScan() {
      this.started = true;
      this.$service.startBluetoothScanning()
      this.$service.getBluetoothResults(this.updateGraph)
    },
    stopScan() {
      this.started = false;
      this.$service.stopBluetoothScanning()
      this.spec.data.values = []
    },
    addTarget() {
      let target = this.targetToAdd.join(':')
      if(/[0-9a-fA-F:]{17}/.test(target)) {
        this.error = false
        if(this.tracking)
          this.trackingFox = target
        else
          this.bluetoothTargets.push(target)
        this.$service.setBluetoothTargets(this.bluetoothTargets,this.trackingFox)
        this.resetForm()
        this.stopScan()
      }
    },
    resetForm() {
      this.targetToAdd = ['','','','','','']
    },
    focusNext(index) {
      if(this.targetToAdd[index].length==2) {
        this.$nextTick(this.$refs[`target${index+1}`].focus)
      }
    },
    removeFromList(index) {
      this.bluetoothTargets.splice(index,1)
      this.$service.setBluetoothTargets(this.bluetoothTargets,this.trackingFox)
      this.stopScan()
    },
    setTargets(targets, stopped) {
      this.bluetoothTargets = targets
      this.started = !stopped
      if(this.started)
        this.$service.getBluetoothResults(this.updateGraph)
      this.disable = false
    },
  }
}
</script>