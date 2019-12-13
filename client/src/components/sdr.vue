<template>
  <div>
    <div class="text-center">
      <v-dialog v-model="dialog" max-width="80%">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" class="mr-5" x-small color="#0000ff">SDR Target Frequency</v-btn>
        </template>
        <v-card>
          <v-card-title>
            <v-row no-gutters>
              <v-col cols="12" class="pl-2" xs="10">
                <v-text-field ref='freqTarget' @change="checkFreq" dense v-model="freqTarget" type="number" label="Frequency Target in MHz">
                </v-text-field>
              </v-col>
            </v-row>
          </v-card-title>
        </v-card>
      </v-dialog>
      <v-btn color="#008000" x-small :disabled="disable || freqTarget==null" v-if="!started" v-on:click="startScan">Start SDR Scan</v-btn>
      <v-btn color="#ff0000" x-small :disabled="disable || freqTarget==null" v-if="started" v-on:click="stopScan">Stop SDR Scan</v-btn>
    </div>
    <div id="sdrPlot"></div>
  </div>
</template>
<script>
import vegaEmbed from 'vega-embed'
export default {
  name: 'sdr',
  data() {
    return {
      view: null,
      started: false,
      dialog: false,
      disable: true,
      error: false,
      freqTarget: null,
      spec: {
        $schema: 'https://vega.github.io/schema/vega/v5.json',
        data: {name: 'table'},
        width: document.documentElement.clientWidth*.8,
        height: document.documentElement.clientHeight*.25,
        config: {
          axis: {
            grid: true
          },
        },
        scales: [
          { name: 'x', type: 'time', domain: [Date.now()-21000,Date.now()], range: "width"},
          { name: 'y', type: 'linear', domain: [-100, 0], range: "height"},
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
              stroke: { value: '#0000ff' },
              fill: { value: '#0000ff' }
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
        setTimeout(()=> { self.$nextTick(self.$refs.freqTarget.focus) },250)
    }
  },
  methods: {
    redraw() {
      this.spec.height = document.documentElement.clientHeight*.25
      this.spec.width = document.documentElement.clientWidth*.7
      this.spec.scales[0].domain = [Date.now()-21000,Date.now()]
      //TODO: add changeset to remove data older than 20s
      vegaEmbed('#sdrPlot',this.spec, { actions: false })
    },
    updateGraph(data) {
      data = JSON.parse(data)
      data = data.map(datum => {
        return {
          x: datum.ts,
          y: datum.dbm
        }
      });
      this.spec.data.values = data;
    },
    startScan() {
      this.started = true
      this.$service.startSDRScanning()
      this.$service.getSDRResults(this.updateGraph)
    },
    stopScan() {
      this.started = false
      this.$service.stopSDRScanning()
      this.spec.data.values = []
    },
    setFrequency(freq, stopped) {
      this.started = !stopped
      this.freqTarget = freq
      if(this.started)
        this.$service.getSDRResults(this.updateGraph)
      this.disable = false
    },
    checkFreq() {
      let freq = parseFloat(this.freqTarget)
      if(typeof freq != 'number' || freq == NaN)
        this.error = true
      else {
        this.error = false
        this.$service.setSDRTarget(freq)
      }
    }
  }
}
</script>