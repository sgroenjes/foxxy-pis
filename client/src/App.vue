<template>
  <div id="body">
    <v-dialog v-model="settings" fullscreen hide-overlay transition="dialog-bottom-transition">
      <template v-slot:activator="{ on }">
        <v-btn x-small id="settings" v-on="on">Settings</v-btn>
      </template>
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="settings = false">X</v-btn>
          <v-toolbar-title>Settings</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-list three-line subheader>
          <v-subheader>Wifi</v-subheader>
          <v-list-item>
            <v-list-item-content>
              <v-row no-gutters>
                <v-col cols="1" class="pl-2" xs="1">
                  <v-text-field
                    ref="target0"
                    v-model="wifiTargetToAdd[0]"
                    maxlength="2"
                    @input.native="focusNext(0)"
                  >
                    <template v-slot:append-outer>:</template>
                  </v-text-field>
                </v-col>
                <v-col cols="1" class="pl-2" xs="1">
                  <v-text-field
                    ref="target1"
                    v-model="wifiTargetToAdd[1]"
                    maxlength="2"
                    @input.native="focusNext(1)"
                  >
                    <template v-slot:append-outer>:</template>
                  </v-text-field>
                </v-col>
                <v-col cols="1" class="pl-2" xs="1">
                  <v-text-field
                    ref="target2"
                    v-model="wifiTargetToAdd[2]"
                    maxlength="2"
                    @input.native="focusNext(2)"
                  >
                    <template v-slot:append-outer>:</template>
                  </v-text-field>
                </v-col>
                <v-col cols="1" class="pl-2" xs="1">
                  <v-text-field
                    ref="target3"
                    v-model="wifiTargetToAdd[3]"
                    maxlength="2"
                    @input.native="focusNext(3)"
                  >
                    <template v-slot:append-outer>:</template>
                  </v-text-field>
                </v-col>
                <v-col cols="1" class="pl-2" xs="1">
                  <v-text-field
                    ref="target4"
                    v-model="wifiTargetToAdd[4]"
                    maxlength="2"
                    @input.native="focusNext(4)"
                  >
                    <template v-slot:append-outer>:</template>
                  </v-text-field>
                </v-col>
                <v-col cols="1" class="pl-2" xs="1">
                  <v-text-field ref="target5" v-model="wifiTargetToAdd[5]" maxlength="2" />
                </v-col>
                <v-col cols="3" xs="1">
                  <v-btn small color="#0000ff" class="ma-4" v-on:click="addWifiTarget">Add</v-btn>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="8">
                  <v-text-field label="Expected RSSI in immediate proximity" v-model="wifiPowerTarget" type="number"></v-text-field>
                </v-col>
                <v-col cols="8">
                  <v-text-field label="Target Name" v-model="wifiTargetDescription"></v-text-field>
                </v-col>
              </v-row>
            </v-list-item-content>
          </v-list-item>
          <span v-if="wifiError" class="red--text ml-4">Invalid target address</span>
        </v-list>
        <v-list-item v-if="!wifiTargets.length">
          <v-list-item-content>
            <v-list-item-title>No targets</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list v-if="wifiTargets.length">
          <v-list-item v-for="(target,index) in wifiTargets" :key="index">
            <v-list-item-content>
              <v-list-item-title>{{target}}</v-list-item-title>
              <v-list-item-subtitle v-if="wifiDescriptions[target]">{{wifiDescriptions[target]}}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn v-on:click="removeFromWifiList(index)" class="red--text" icon>X</v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <v-list-item>
          <v-btn color="#008000" x-small :disabled="wifiDisable || wifiTargets.length==0" v-if="!wifiStarted" v-on:click="startWifiScan">Start Wifi Scan</v-btn>
          <v-btn color="#ff0000" x-small :disabled="wifiDisable || wifiTargets.length==0" v-if="wifiStarted" v-on:click="stopWifiScan">Stop Wifi Scan</v-btn>
        </v-list-item>

        <v-divider></v-divider>

        <v-list three-line subheader>
          <v-subheader>Bluetooth</v-subheader>
          <v-list-item>
            <v-list-item-content>
              <v-container class="px-0" fluid>
              <v-row no-gutters>
                <v-col cols="1" class="pl-2" xs="1">
                  <v-text-field
                    ref="bttarget0"
                    v-model="btTargetToAdd[0]"
                    maxlength="2"
                    @input.native="focusNextBT(0)"
                  >
                    <template v-slot:append-outer>:</template>
                  </v-text-field>
                </v-col>
                <v-col cols="1" class="pl-2" xs="1">
                  <v-text-field
                    ref="bttarget1"
                    v-model="btTargetToAdd[1]"
                    maxlength="2"
                    @input.native="focusNextBT(1)"
                  >
                    <template v-slot:append-outer>:</template>
                  </v-text-field>
                </v-col>
                <v-col cols="1" class="pl-2" xs="1">
                  <v-text-field
                    ref="bttarget2"
                    v-model="btTargetToAdd[2]"
                    maxlength="2"
                    @input.native="focusNextBT(2)"
                  >
                    <template v-slot:append-outer>:</template>
                  </v-text-field>
                </v-col>
                <v-col cols="1" class="pl-2" xs="1">
                  <v-text-field
                    ref="bttarget3"
                    v-model="btTargetToAdd[3]"
                    maxlength="2"
                    @input.native="focusNextBT(3)"
                  >
                    <template v-slot:append-outer>:</template>
                  </v-text-field>
                </v-col>
                <v-col cols="1" class="pl-2" xs="1">
                  <v-text-field
                    ref="bttarget4"
                    v-model="btTargetToAdd[4]"
                    maxlength="2"
                    @input.native="focusNextBT(4)"
                  >
                    <template v-slot:append-outer>:</template>
                  </v-text-field>
                </v-col>
                <v-col cols="1" class="pl-2" xs="1">
                  <v-text-field ref="bttarget5" v-model="btTargetToAdd[5]" maxlength="2" />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6" class="pl-5" xs="1">
                  <input type="checkbox" id="checkbox" v-model="tracking">
                  <label for="checkbox">Tracking Fox?</label>
                </v-col>
                <v-col cols="1" xs="1">
                  <v-btn color="#0000ff" small v-on:click="addBtTarget">Add</v-btn>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="8">
                  <v-text-field label="Expected RSSI in immediate proximity" v-model="btPowerTarget" type="number"></v-text-field>
                </v-col>
                <v-col cols="8">
                  <v-text-field label="Target Name" v-model="btTargetDescription"></v-text-field>
                </v-col>
              </v-row>
              </v-container>
              <span v-if="btError" class="red--text pl-4">Invalid target address</span>
              <span class="pl-2" v-if="trackingFox">Tracking Fox: {{trackingFox+(btDescriptions[trackingFox]?' - '+btDescriptions[trackingFox]:'')}}
                <v-btn v-on:click="removeTrackingFox()" class="red--text" icon>X</v-btn>
              </span>
              <span class="pl-2 headline">Beaconing Targets</span>
              <v-list-item v-if="!btTargets.length">
                <v-list-item-content>
                  <v-list-item-title>No targets</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list v-if="btTargets.length">
                <v-list-item v-for="(target,index) in btTargets" :key="index">
                  <v-list-item-content>
                    <v-list-item-title>{{target}}</v-list-item-title>
                    <v-list-item-subtitle v-if="btDescriptions[target]">{{btDescriptions[target]}}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn v-on:click="removeFromBtList(index)" class="red--text" icon>X</v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-btn
              color="#008000"
              x-small
              :disabled="btDisable || (btTargets.length==0 && trackingFox == '')"
              v-if="!btStarted"
              v-on:click="startBtScan"
            >Start Bluetooth Scan</v-btn>
            <v-btn
              color="#ff0000"
              x-small
              :disabled="btDisable || (btTargets.length==0 && trackingFox == '')"
              v-if="btStarted"
              v-on:click="stopBtScan"
            >Stop Bluetooth Scan</v-btn>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list three-line subheader>
          <v-subheader>SDR</v-subheader>
          <v-list-item>
            <v-list-item-content>
              <v-row>
                <v-col cols="8">
                  <v-text-field
                    ref="freqTarget"
                    @change="checkFreq"
                    v-model="freqTarget"
                    type="number"
                    label="Frequency Target in MHz"
                  ></v-text-field>
                </v-col>
                <v-col cols="8">
                  <v-text-field label="Expected RSSI in immediate proximity" v-model="sdrPowerTarget" type="number"></v-text-field>
                </v-col>
              </v-row>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-list-item>
          <v-btn
            color="#008000"
            x-small
            :disabled="sdrDisable || freqTarget==null"
            v-if="!sdrStarted"
            v-on:click="startSDRScan"
          >Start SDR Scan</v-btn>
          <v-btn
            color="#ff0000"
            x-small
            :disabled="sdrDisable || freqTarget==null"
            v-if="sdrStarted"
            v-on:click="stopSDRScan"
          >Stop SDR Scan</v-btn>
        </v-list-item>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
const d3 = require("d3");
export default {
  name: "app",
  data() {
    return {
      scale: null,
      btScale: null,
      wifiError: null,
      btError: null,
      settings: false,
      space: null,
      spaceWidth: 0,
      spaceHeight: 0,
      lengths: {},
      wifiTargetToAdd: ["", "", "", "", "", ""],
      wifiTargets: [],
      wifiElementTargets: [],
      wifiTargetText: [],
      wifiPowerTarget: -25,
      wifiTargetDescription: '',
      wifiDescriptions: {},
      wifiDisable: true,
      wifiStarted: false,
      freqTarget: null,
      sdrTargetText: null,
      sdrTargets: [],
      sdrStarted: false,
      sdrDisable: true,
      sdrPowerTarget: -32,
      btTargetToAdd: ["", "", "", "", "", ""],
      btTargets: [],
      btElementTargets: [],
      btTargetText: [],
      btPowerTarget: -38,
      btTargetDescription: '',
      btDescriptions: {},
      trackingFox: "",
      btStarted: false,
      btDisable: true,
      tracking: false,
      colors: ["red","orange","lime","blue"]
    };
  },
  mounted() {
    var self = this;
    this.$service.getAllTargets().then(data => {
      self.setWifiTargets(data.wifiTargets, data.wifiStopped, data.wifiDescriptions);
      self.setBtTargets({btTargets:data.bluetoothTargets,trackingFox:data.trackingFox}, data.bluetoothStopped, data.btDescriptions);
      self.setFrequency(data.sdrTarget, data.sdrStopped);
    });
    var spaceTime = d3.select("#body");
    this.spaceWidth = window.innerWidth;
    this.spaceHeight = window.innerHeight;
    this.scale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([0, this.spaceHeight * 0.9])
      .clamp(true);
    this.btScale = d3
      .scaleLinear()
      .domain([0,10])
      .range([0,this.spaceHeight * 0.9])
      .clamp(true)
    this.sdrScale = d3
      .scaleLinear()
      .domain([0,40])
      .range([0,this.spaceHeight * 0.9])
      .clamp(true)
    this.lengths = {
      far: this.spaceHeight / 3,
      near: -this.spaceHeight / 6,
      immediate: -this.spaceHeight / 3
    };
    this.space = spaceTime
      .append("svg")
      .attr("width", this.spaceWidth)
      .attr("height", this.spaceHeight)
      .append("g")
      .attr(
        "transform",
        "translate(" + this.spaceWidth / 2 + "," + this.spaceHeight / 2 + ")"
      );
    var line = d3.line().context(null);
    this.space.append("text")
      .text("Wifi")
      .attr("font-size","20px")
      .attr("fill","white")
      .style("text-anchor", "middle")
      .attr("transform","translate(-"+this.spaceWidth / 4 +","+(-this.spaceHeight/2+20)+")")
    this.space.append("text")
      .text("Bluetooth")
      .attr("font-size","20px")
      .attr("fill","white")
      .style("text-anchor", "middle")
      .attr("transform","translate(0,"+(-this.spaceHeight/2+20)+")")
    this.space.append("text")
      .text("SDR")
      .attr("font-size","20px")
      .attr("fill","white")
      .style("text-anchor", "middle")
      .attr("transform","translate("+this.spaceWidth / 4 +","+(-this.spaceHeight/2+20)+")")
    //FAR
    this.space
      .append("path")
      .attr(
        "d",
        line([
          [-this.spaceWidth / 2, this.lengths.far],
          [this.spaceWidth / 2, this.lengths.far]
        ])
      )
      .style("stroke", "rgb(0,0,255)");
    this.space
      .append("text")
      .text("FAR")
      .attr("font-size", "16px")
      .attr("fill", "white")
      .attr(
        "transform",
        "translate(-" +
          this.spaceWidth / 2 +
          "," +
          (this.lengths.far - 10) +
          ")"
      );

    //NEAR
    this.space
      .append("path")
      .attr(
        "d",
        line([
          [-this.spaceWidth / 2, this.lengths.near],
          [this.spaceWidth / 2, this.lengths.near]
        ])
      )
      .style("stroke", "rgb(193,51,255)");
    this.space
      .append("text")
      .text("NEAR")
      .attr("font-size", "16px")
      .attr("fill", "white")
      .attr(
        "transform",
        "translate(-" +
          this.spaceWidth / 2 +
          "," +
          (this.lengths.near - 10) +
          ")"
      );

    //IMMEDIATE
    this.space
      .append("path")
      .attr(
        "d",
        line([
          [-this.spaceWidth / 2, this.lengths.immediate],
          [this.spaceWidth / 2, this.lengths.immediate]
        ])
      )
      .style("stroke", "rgb(255,51,199)");
    this.space
      .append("text")
      .text("CLOSE")
      .attr("font-size", "16px")
      .attr("fill", "white")
      .attr(
        "transform",
        "translate(-" +
          this.spaceWidth / 2 +
          "," +
          (this.lengths.immediate - 10) +
          ")"
      );
  },
  methods: {
    calcDistance(txCalibratedPower, rssi) {
      var ratio_db = txCalibratedPower - rssi;
      var ratio_linear = Math.pow(10, ratio_db / 10);

      var r = Math.sqrt(ratio_linear);
      return r;
    },
    resetForm() {
      this.wifiTargetToAdd = ["", "", "", "", "", ""];
      this.btTargetToAdd = ["", "", "", "", "", ""];
    },
    updateWifi(data) {
      this.removeWifi()
      var time = Date.now()
      data = JSON.parse(data)
      var devices = {}
      data.forEach(datum => {
        var [mac, rssi, ts] = datum.split("\t")
        if(Object.keys(devices).includes(mac))
          devices[mac].push({mac,rssi,ts:new Date(ts).valueOf()})
        else
          devices[mac] = [{mac,rssi,ts:new Date(ts).valueOf()}]
      })
      Object.keys(devices).sort().forEach((device,devIndex) => {
        devices[device].forEach((datum, index) => {
          var dist = this.calcDistance(this.wifiPowerTarget, datum.rssi)
          var y = this.scale(dist)
          if (index == devices[device].length - 1) {
            //draw the big one
            this.wifiElementTargets.push(
              this.space
                .append("circle")
                .attr("r", 10)
                .style("stroke", this.colors[devIndex%this.colors.length])
                .style("fill", "white")
                .style("fill-opacity", 1 - (time - datum.ts) / 1000 / 20)
                .style("stroke-width", 5)
                .attr(
                  "transform",
                  "translate(-" +
                    this.spaceWidth / 4 +
                    "," +
                    (y - this.spaceHeight * 0.45) +
                    ")"
                )
            );
            this.wifiTargetText.push(this.space
              .append("text")
              .text(datum.mac)
              .attr("font-size", "10px")
              .attr("fill", "white")
              .style("text-anchor", "middle")
              .attr(
                "transform",
                "translate(-" +
                  this.spaceWidth / 4 +
                  "," +
                  (y - this.spaceHeight * 0.45 - 25) +
                  ")"
              ))
            if(this.wifiDescriptions[datum.mac])
              this.wifiTargetText.push(this.space
                .append("text")
                .text('('+this.wifiDescriptions[datum.mac]+')')
                .attr("font-size", "10px")
                .attr("fill", "white")
                .style("text-anchor", "middle")
                .attr(
                  "transform",
                  "translate(-" +
                    this.spaceWidth / 4 +
                    "," +
                    (y - this.spaceHeight * 0.45 - 15) +
                    ")"
                ))
          } else {
            //draw the past readings that fade away
            this.wifiElementTargets.push(
              this.space
                .append("path")
                .attr(
                  "d",
                  d3
                    .symbol()
                    .type(d3.symbolCircle)
                    .size(100)
                )
                .attr("fill", this.colors[devIndex%this.colors.length])
                .attr("fill-opacity", 1 - (time - datum.ts) / 1000 / 20)
                .attr(
                  "transform",
                  "translate(-" +
                    this.spaceWidth / 4 +
                    "," +
                    (y - this.spaceHeight * 0.45) +
                    ")"
                )
            );
          }
        },this)
      },this)
    },
    startWifiScan() {
      this.wifiStarted = true;
      this.$service.startWifiScanning();
      this.$service.getWifiResults(this.updateWifi);
    },
    stopWifiScan() {
      this.wifiStarted = false;
      this.$service.stopWifiScanning();
      this.removeWifi()
    },
    addWifiTarget() {
      let target = this.wifiTargetToAdd.join(":");
      if (/[0-9a-fA-F:]{17}/.test(target)) {
        this.error = false;
        this.wifiTargets.push(target);
        if(this.wifiTargetDescription)
          this.wifiDescriptions[target] = this.wifiTargetDescription
        this.$service.setWifiTargets({wifiTargets:this.wifiTargets,wifiDescriptions:this.wifiDescriptions});
        this.resetForm();
        this.stopWifiScan();
      } else {
        this.error = true;
      }
    },
    focusNext(index) {
      if (this.wifiTargetToAdd[index].length == 2) {
        this.$nextTick(this.$refs[`target${index + 1}`].focus);
      }
    },
    removeFromWifiList(index) {
      this.wifiTargets.splice(index, 1);
      this.$service.setWifiTargets(this.wifiTargets);
      this.stopWifiScan();
    },
    setWifiTargets(targets, stopped, descriptions) {
      this.wifiTargets = targets;
      this.wifiDescriptions = descriptions;
      this.wifiStarted = !stopped;
      if (this.wifiStarted) 
        this.$service.getWifiResults(this.updateWifi);
      this.wifiDisable = false;
    },
    removeWifi() {
      this.wifiElementTargets.forEach(target => {
        target.remove();
      });
      if (this.wifiTargetText.length) this.wifiTargetText.forEach(text => { text.remove() });
      this.wifiElementTargets = [];
      this.wifiTargetText = [];
    },

    //Bluetooth
    focusNextBT(index) {
      if (this.btTargetToAdd[index].length == 2) {
        this.$nextTick(this.$refs[`bttarget${index + 1}`].focus);
      }
    },
    updateBt(data) {
      this.removeBt();
      var time = Date.now();
      data = JSON.parse(data);
      var devices = {}
      data.forEach(datum => {
        if(Object.keys(devices).includes(datum.mac))
          devices[datum.mac].push(datum)
        else
          devices[datum.mac] = [datum]
      })
      Object.keys(devices).sort().forEach((device,devIndex) => {
        devices[device].forEach((datum, index) => {
          var dist, y;
          if(device == this.trackingFox) {
            dist = this.calcDistance(-50,datum.rssi)
            y = this.btScale(dist)
          }
          else {
            dist = this.calcDistance(this.btPowerTarget,datum.rssi)
            y = this.scale(dist)
          }
          if (index == devices[device].length - 1) {
            this.btElementTargets.push(
              this.space
                .append("circle")
                .attr("r", 10)
                .style("stroke", this.colors[devIndex%this.colors.length])
                .style("fill", "white")
                .style("fill-opacity", 1 - (time - datum.ts) / 1000 / 20)
                .style("stroke-width", 5)
                .attr(
                  "transform",
                  "translate(0," + (y - this.spaceHeight * 0.45) + ")"
                )
            );
            this.btTargetText.push(this.space
              .append("text")
              .text(datum.mac)
              .attr("font-size", "10px")
              .attr("fill", "white")
              .style("text-anchor", "middle")
              .attr(
                "transform",
                "translate(0," + (y - this.spaceHeight * 0.45 - 25) + ")"
              ))
            if(this.btDescriptions[datum.mac])
              this.btTargetText.push(this.space
                .append("text")
                .text('('+this.btDescriptions[datum.mac]+')')
                .attr("font-size", "10px")
                .attr("fill", "white")
                .style("text-anchor", "middle")
                .attr(
                  "transform",
                  "translate(0," + (y - this.spaceHeight * 0.45 - 15) + ")"
                ))
          } 
          else {
            this.btElementTargets.push(
              this.space
                .append("path")
                .attr(
                  "d",
                  d3
                    .symbol()
                    .type(d3.symbolCircle)
                    .size(100)
                )
                .attr("fill", this.colors[devIndex%this.colors.length])
                .attr("fill-opacity", 1 - (time - datum.ts) / 1000 / 20)
                .attr(
                  "transform",
                  "translate(0," + (y - this.spaceHeight * 0.45) + ")"
                )
            );
          }
        },this)
      },this)
    },
    setBtTargets(targets, stopped, descriptions) {
      this.btTargets = targets.btTargets;
      this.trackingFox = targets.trackingFox
      this.btDescriptions = descriptions
      this.btStarted = !stopped;
      if (this.btStarted) 
        this.$service.getBluetoothResults(this.updateBt);
      this.btDisable = false;
    },
    removeFromBtList(index) {
      this.btTargets.splice(index, 1);
      this.$service.setBluetoothTargets(this.btTargets, this.trackingFox);
      this.stopBtScan();
    },
    removeTrackingFox() {
      this.trackingFox = ''
      this.$service.setBluetoothTargets(this.btTargets, this.trackingFox)
      this.stopBtScan()
    },
    startBtScan() {
      this.btStarted = true;
      this.$service.startBluetoothScanning();
      this.$service.getBluetoothResults(this.updateBt);
    },
    stopBtScan() {
      this.btStarted = false;
      this.$service.stopBluetoothScanning();
      this.removeBt();
    },
    addBtTarget() {
      let target = this.btTargetToAdd.join(":");
      if (/[0-9a-fA-F:]{17}/.test(target)) {
        this.btError = false;
        if (this.tracking) this.trackingFox = target;
        else this.btTargets.push(target);
        if(this.btTargetDescription)
          this.btDescriptions[target] = this.btTargetDescription
        this.$service.setBluetoothTargets(this.btTargets, this.trackingFox, this.btDescriptions);
        this.resetForm();
        this.stopBtScan();
      }
    },
    removeBt() {
      this.btElementTargets.forEach(target => {
        target.remove();
      });
      if (this.btTargetText.length) this.btTargetText.forEach(text => { text.remove() });
      this.btElementTargets = [];
      this.btTargetText = [];
    },
    //SDR
    updateSDR(data) {
      this.removeSDR();
      var time = Date.now();
      data = JSON.parse(data);
      data.forEach((datum, index) => {
        var dist = this.calcDistance(this.sdrPowerTarget, datum.dbm);
        var y = this.sdrScale(dist);
        if (index == data.length - 1) {
          //draw the big one
          this.sdrTargets.push(
            this.space
              .append("circle")
              .attr("r", 10)
              .style("stroke", "red")
              .style("fill", "white")
              .style("fill-opacity", 1 - (time - datum.ts) / 1000 / 20)
              .style("stroke-width", 5)
              .attr(
                "transform",
                "translate(" +
                  this.spaceWidth / 4 +
                  "," +
                  (y - this.spaceHeight * 0.45) +
                  ")"
              )
          );
          this.sdrTargetText = this.space
            .append("text")
            .text(this.freqTarget + " MHz")
            .attr("font-size", "10px")
            .attr("fill", "white")
            .style("text-anchor", "middle")
            .attr(
              "transform",
              "translate(" +
                this.spaceWidth / 4 +
                "," +
                (y - this.spaceHeight * 0.45 - 15) +
                ")"
            );
        } else {
          //draw the past readings that fade away
          this.sdrTargets.push(
            this.space
              .append("path")
              .attr(
                "d",
                d3
                  .symbol()
                  .type(d3.symbolCircle)
                  .size(100)
              )
              .attr("fill", "yellow")
              .attr("fill-opacity", 1 - (time - datum.ts) / 1000 / 20)
              .attr(
                "transform",
                "translate(" +
                  this.spaceWidth / 4 +
                  "," +
                  (y - this.spaceHeight * 0.45) +
                  ")"
              )
          );
        }
      }, this);
    },
    removeSDR() {
      this.sdrTargets.forEach(target => {
        target.remove();
      });
      if (this.sdrTargetText) this.sdrTargetText.remove();
      this.sdrTargets = [];
      this.sdrTargetText = null;
    },
    startSDRScan() {
      this.sdrStarted = true;
      this.$service.startSDRScanning();
      this.$service.getSDRResults(this.updateSDR);
    },
    stopSDRScan() {
      this.sdrStarted = false;
      this.$service.stopSDRScanning();
      this.removeSDR();
    },
    setFrequency(freq, stopped) {
      this.sdrStarted = !stopped;
      this.freqTarget = freq;
      if (this.sdrStarted) this.$service.getSDRResults(this.updateSDR);
      this.sdrDisable = false;
    },
    checkFreq() {
      let freq = parseFloat(this.freqTarget);
      if (typeof freq != "number" || isNaN(freq)) this.error = true;
      else {
        this.error = false;
        this.$service.setSDRTarget(freq);
      }
    }
  }
};
</script>
<style>
#body {
  background: #222;
  font-family: sans-serif;
}
#settings {
  position: absolute;
  left: 10px;
  bottom: 10px;
}
</style>
