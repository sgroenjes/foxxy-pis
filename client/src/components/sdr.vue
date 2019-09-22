<template>
  <div>
    <v-btn color="#008000" v-if="!started" v-on:click="startScan">Start SDR Scan</v-btn>
    <v-btn color="#ff0000" v-if="started" v-on:click="stopScan">Stop SDR Scan</v-btn>
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
      results: [],
      spec: {
        $schema: 'https://vega.github.io/schema/vega/v5.json',
        data: {name: 'table'},
        width: 1000,
        height: 200,
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
            }
          }
        }],
      }
    }
  },
  methods: {
    redraw() {
      this.spec.scales[0].domain = [Date.now()-21000,Date.now()]
      vegaEmbed('#sdrPlot',this.spec, { actions: false })
    },
    updateGraph(data) {
      data = JSON.parse(data)
      // data = data.map(datum => {
      //   var [ssid,rssi,time] = datum.split('\t');
      //   time = Date.parse(time);
      //   rssi = parseInt(rssi)
      //   return {
      //     x: time,
      //     y: rssi
      //   }
      // });
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
    },
  }
}
</script>