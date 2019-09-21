<template>
  <div>
    <v-btn v-if="!started" v-on:click="startScan">Start Wifi Scan</v-btn>
    <v-btn v-if="started" v-on:click="stopScan">Stop Wifi Scan</v-btn>
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
      started: false,
      results: [],
      spec: {
        $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
        data: {name: 'table'},
        width: 1000,
        mark: 'point',
        encoding: {
          x: {field: 'x', type: 'temporal', scale: { domain: [Date.now()-20000, Date.now()]}},
          y: {field: 'y', type: 'quantitative', scale: { domain: [-100, 0]} },
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
        self.moveTime()
      })
    },
    moveTime() {
      var scaleX = this.view.scale("x")
      scaleX.domain([Date.now()-20000, Date.now()])
      setTimeout(this.moveTime,1000);
    },
    updateGraph(data) {
      data = JSON.parse(data)
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
      var changeSet = this.view
        .changeset()
        .insert(data)
        .remove(function(t) {
          return true;
        });
      this.view.change('table', changeSet).run();
    },
    startScan() {
      this.started = true;
      this.$service.startWifiScanning()
      this.$service.getWifiResults(this.updateGraph)
    },
    stopScan() {
      this.started = false;
      this.$service.stopWifiScanning()
    },
  }
}
</script>