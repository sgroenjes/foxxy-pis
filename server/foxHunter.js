const express = require('express')
const net = require('net')
const fs = require('fs')
const app = express()
const port = 3000
const {spawn,exec} = require('child_process');
app.use(express.json());
app.use(express.static('../client/dist'))

var tsharkProcess = null;
var blueHydraProcess = null;
var bluetoothTargets = []
var wifiTargetFilters = [];
var wifiScanResults = []
var wifiInitProcess = false;
var wifiStop = false;


/***** WIFI ********/
/*******************/

function buildWifiTargets(adrs) {
  wifiTargetFilters = []
  adrs.forEach((adr,i) => {
    var filter = i ? `||wlan.sa==${adr}` : `wlan.sa==${adr}`;
    wifiTargetFilters.push(filter)
  })
}

function initWifiScan() {
  if(wifiInitProcess)
    return
  wifiInitProcess = true;
  tsharkProcess.stdout.on('data', (data) => {
    var fields = data.toString().split('\t')
    if(fields.length==3 && fields[0].length)
      wifiScanResults.push(data.toString())
  })

  //TODO: spit this back at the user somehow
  tsharkProcess.on('error', error => {
    console.log(error)
  })

  //TODO: spit this back at the user somehow
  tsharkProcess.on('exit', function(code) {
    console.log('Scanning process exited with code '+code);
  });
}

function wifiStartScanning() {
  wifiStop = false;
  // var targets = ["78:8a:20:54:99:8e","7a:8a:20:54:99:8e"]
  var targets = [`\\"Dark Wolf\\"`,`\\"Dark Wolf Guest\\"`,`\\"Samsung Galaxy S7 edge 1879\\"`]
  // var targets = [`\\"`]
  wifiTargetFilters = targets.map((target,index) => {
    return `wlan.ssid==${target}`
  })

  if(!wifiTargetFilters.length) {
    console.log("No targets, can't start scan.")
    return false
  }
  tsharkProcess = spawn('stdbuf',
    [ '-o', '0', 'tshark', 
      '-i', 'wlx9cefd5fc1011',
      '-l', '-Y', `"`+wifiTargetFilters.join("||")+`"`, 
      '-T', 'fields', 
      '-e', 'wlan.ssid',
      '-e', 'wlan_radio.signal_dbm', 
      '-e', 'frame.time'],
    { stdio: ["pipe", "pipe", "ignore"], shell: true}
  );
  initWifiScan()
}

function wifiStopScanning() {
  if(tsharkProcess!=null) {
    // kills the child tshark process... assumes it will always be pid+1... bad assumption
    exec(`sudo kill ${tsharkProcess.pid+1}`)
    wifiInitProcess = false;
    //TODO: kill method kills stdbuf process, but not the tshark process...
    // tsharkProcess.kill()
  }
}

app.get('/wifi/startScan', function(req, res) {
  wifiStartScanning()
  res.end()
})

app.get('/wifi/stopScan', function(req,res) {
  stop = true;
  wifiStopScanning();
  res.end()
})

app.post('/wifi/targets', function(req, res) {
  var adrs = req.body.targets
  if(adrs && adrs.length)
    buildWifiTargets(adrs)
  else {
    //TODO: no targets lul, l2gitgud
  }
  res.end()
});

app.get('/wifi/results', function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })
  returnWifiScan(res)
})

function returnWifiScan(res) {
  if(wifiStop) {
    res.end()
    return
  }
  trimWifiScan()
  res.write("data: " + JSON.stringify(wifiScanResults) + "\n\n")
  setTimeout(() => returnWifiScan(res), 1000)
}

//remove all scans over 20s ago
function trimWifiScan() {
  var count = 0;
  var now = Date.now();
  wifiScanResults.forEach(line => {
    var [ssid, rssi, time] = line.split('\t');
    if(now-Date.parse(time)>=20000)
      count++;
  })
  wifiScanResults.splice(0,count)
}

/***** END WIFI ********/
/*******************/

/***** BLUETOOTH ********/
/************************/

function buildBluetoothTargets(targets) {
  bluetoothTargets = []
  targets = targets.map(adr => {
    return '- '+adr.toUpperCase();
  })
  //assumes git projects sit next to each other
  fs.writeFileSync('../../blue_hydra/blue_hydra.yml',
`log_level: debug
bt_device: hci0
info_scan_rate: 240
btmon_log: false
btmon_rawlog: false
file: false
rssi_log: true
aggressive_rssi: true
ui_inc_filter_mode: :exclusive
ui_inc_filter_mac:
${targets.join('\n')}
ui_inc_filter_prox: []
ui_exc_filter_mac: []
ui_exc_filter_prox: []
ignore_mac: []
signal_spitter: true
chunker_debug: false`)
}

function bluetoothStartScanning() {
  // if(!bluetoothTargets.length) {
  //   console.log("No targets, can't start scan.")
  //   return false
  // }
  blueHydraProcess = spawn('../../blue_hydra/bin/blue_hydra',
    ['--rssi-api', '--no-info', '-d'],
    { stdio: "ignore" }
  );
}

function bluetoothStopScanning() {
  if(blueHydraProcess!=null) {
    exec(`sudo kill ${blueHydraProcess.pid}`)
    blueHydraProcess = null
  }
}

function returnBluetoothScan(res) {
  var client = new net.Socket();
  client.connect(1124, '127.0.0.1', function() {
    //complains if you write immediately.. no idea why
    setTimeout(() => client.write('bluetooth\n'),250);
  })
  client.on('data', function(data) {
    res.write("data: " + data.toString() + "\n\n")
    client.destroy();
    setTimeout(() => returnBluetoothScan(res), 750)
  })
  client.on('error', function(err) {
    console.log(err)
  })
}

app.get('/bluetooth/startScan', function(req, res) {
  bluetoothStartScanning()
  res.end()
})

app.get('/bluetooth/stopScan', function(req,res) {
  bluetoothStop = true;
  bluetoothStopScanning();
  res.end()
})

app.post('/bluetooth/targets', function(req, res) {
  var adrs = req.body.targets
  if(adrs && adrs.length)
    buildBluetoothTargets(adrs)
  else {
    //TODO: no targets lul, l2gitgud
  }
  res.end()
});

app.get('/bluetooth/results', function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })
  setTimeout(() => returnBluetoothScan(res),1000)
})
/***** END BLUETOOTH ********/
/****************************/

/***** SDR ********/
/******************/

/***** END SDR *****/
/*******************/

// TESTING
// bluetoothTargets = ['']
// bluetoothStartScanning()
// setTimeout(returnBluetoothScan,5000)

app.listen(port, () => console.log(`SSE app listening on port ${port}!`))