<template>
  <v-app>
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <!-- TODO: do something with this -->
          <v-alert v-if="error">{{error}}</v-alert>
          <wifi ref="wifi"/>
          <bluetooth ref="bt"/>
          <sdr ref="sdr"/>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
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
  data() {
    return {
      error: null
    }
  },
  mounted() {
    var self = this
    this.redraw()
    this.$service.getAllTargets().then(data => {
      self.$refs.wifi.setTargets(data.wifiTargets, data.wifiStopped)
      self.$refs.bt.setTargets(data.bluetoothTargets, data.bluetoothStopped)
      self.$refs.sdr.setFrequency(data.sdrTarget, data.sdrStopped)
    })
  },
  methods: {
    redraw() {
      this.$refs.bt.redraw()
      this.$refs.wifi.redraw()
      this.$refs.sdr.redraw()
      setTimeout(this.redraw,1000)
    },
  }
}
</script>
