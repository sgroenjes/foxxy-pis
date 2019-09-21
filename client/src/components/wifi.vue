<template>
  <div>
    <button type="button" v-on:click="startScan">Start Wifi Scan</button>
    <button type="button" v-on:click="stopScan">Stop Wifi Scan</button>
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
        $schema: 'https://vega.github.io/schema/vega/v5.json',
        data: {name: 'table'},
        width: 1000,
        height: 200,
        legends: [{
          stroke: "color",
          title: "MACs/SSIDs",
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
              stroke: { scale: 'color', field: 'category'}
            }
          }
        }],
      }
    }
  },
  methods: {
    redraw() {
      this.spec.scales[0].domain = [Date.now()-21000,Date.now()]
      vegaEmbed('#wifiPlot',this.spec, { actions: false })
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
          category: ssid.trim()
        }
      });
      this.spec.data.values = data;
    },
    startScan() {
      this.$service.startWifiScanning()
      this.$service.getWifiResults(this.updateGraph)
    },
    stopScan() {
      this.$service.stopWifiScanning()
    },
  }
}
</script>