<template>
  <div id="app">
    <wifi ref="wifi"/>
    <bluetooth ref="bt"/>
    <sdr ref="sdr"/>
  </div>
</template>

<script>
import wifi from './components/wifi.vue'
import sdr from './components/sdr.vue'
import bluetooth from './components/bluetooth.vue'

export default {
  name: 'app',
  components: {
    wifi,
    sdr,
    bluetooth
  },
  mounted() {
    this.redraw()
  },
  methods: {
    redraw() {
      this.$refs.bt.redraw()
      this.$refs.wifi.redraw()
      this.$refs.sdr.redraw()
      setTimeout(this.redraw,1000)
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
