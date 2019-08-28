<template>
  <div>
    <button type="button" v-on:click="startScan">Start Scan</button>
    <button type="button" v-on:click="stopScan">Stop Scan</button>
    <div id="wifiPlot"></div>
  </div>
</template>
<script>
import vegaEmbed from 'vega-embed'
export default {
  name: 'wifi',
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
    this.initGraph();
  },
  methods: {
    initGraph() {
      var self = this;
      vegaEmbed('#wifiPlot',this.spec, { actions: false }).then(res => {
        self.view = res.view;
      })
    },
    updateGraph(data) {
      data = JSON.parse(data)
      console.log(data)
      data = data.map(datum => {
        var [ssid,rssi,time] = datum.split('\t');
        time = Date.parse(time);
        rssi = parseInt(rssi)
        return {
          x: time,
          y: rssi,
          category: ssid
        }
      });

      console.log(data)
      var changeSet = this.view
        .changeset()
        .insert(data)
        .remove(function(t) {
          return true;
        });
      this.view.change('table', changeSet).run();
    },
    startScan() {
      this.$service.startScanning()
      this.$service.getResults(this.updateGraph)
    },
    stopScan() {
      this.$service.stopScanning()
    },
  }
}
</script>