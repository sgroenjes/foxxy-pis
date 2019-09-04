<template>
  <div>
    <button type="button" v-on:click="startScan">Start Bluetooth Scan</button>
    <button type="button" v-on:click="stopScan">Stop Bluetooth Scan</button>
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
      results: [],
      spec: {
        $schema: 'https://vega.github.io/schema/vega-lite/v3.json',
        data: {name: 'table'},
        width: 1000,
        mark: 'line',
        encoding: {
          x: {field: 'x', type: 'temporal'},
          y: {field: 'y', type: 'quantitative'},
          color: {field: 'category', type: 'nominal'}
        }
      },
    }
  },
  mounted() {
    initGraph();
  },
  methods: {
    initGraph() {
      var self = this;
      vegaEmbed('#bluetoothPlot',this.spec, { actions: false }).then(res => {
        self.view = res.view;
      })
    },
    updateGraph(data) {
      data = JSON.parse(data)
      data = data.map(datum => {
        return {
          x: Date.parse(datum.ts),
          y: datum.dbm,
          category: datum.mac
        }
      });
      var changeSet = this.view
        .changeSet()
        .insert(data)
        .remove(function(t) {
          return true;
        });
      this.view.change('table',changeSet).run();
    },
    startScan() {
      this.$service.startBluetoothScanning()
      this.$service.getWifiResults(this.updateGraph)
    },
    stopScan() {
      this.$service.stopWifiScanning()
    }
  }
}
</script>