const express = require('express')
const app = express()
const port = 3000
const {spawn} = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
app.use(express.json());
app.use(express.static('../client/dist'))

var tsharkProcess = null;
var bluetoothTsharkProcess = null;
var rtlPowerProcess = null;
var bluetoothTargets = []
var trackingFox = ''
var wifiTargetFilters = [];
var sdrFrequency = null;
var wifiScanResults = []
var bluetoothScanResults = []
var sdrScanResults = []
var wifiInitProcess = false;
var sdrInitProcess = false;
var wifiStopped = true;
var bluetoothStopped = true;
var sdrStopped = true;

if(process.getuid()!=0) {
  console.log("Run this with sudo, yeah I know its stupid.. just do it")
  return
}

// to put wifi device in monitor mode
exec('sudo ./monitor.sh wlx9cefd5fcce4e', (error, stdout, stderr) => {
  if (error) {
    console.error(`You suck at wifi, exec error: ${error}`);
    process.exit(1)
  }
  // we hoppin' now, defaults to 1-11 & 36 -161
  //TODO: configure to restart with select channels to monitor
  exec('sudo ./chanhop.sh -i wlx9cefd5fcce4e')
});

app.get('/targets', function(req, res) {
  //return all targets
  //return started status
  let obj = {}
  obj.wifiTargets = wifiTargetFilters.map(wifitarget => {
    return wifitarget.split('==')[1]
  })
  obj.bluetoothTargets = bluetoothTargets
  obj.sdrTarget = sdrFrequency
  obj.wifiStopped = wifiStopped
  obj.bluetoothStopped = bluetoothStopped
  obj.sdrStopped = sdrStopped
  res.json(obj)
}) 

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
    wifiStopped = true
  })

  //TODO: spit this back at the user somehow
  tsharkProcess.on('exit', function(code) {
    wifiStopped = true
  });
}

function wifiStartScanning() {
  if(!wifiTargetFilters.length) {
    console.log("This shouldn't happen.")
    return false
  }
  tsharkProcess = spawn('stdbuf',
    [ '-o', '0', 'tshark', 
      '-i', 'wlx9cefd5fcce4e',
      '-l', '-Y', `"`+wifiTargetFilters.join('')+`"`, 
      '-T', 'fields', 
      '-e', 'wlan.sa',
      '-e', 'wlan_radio.signal_dbm', 
      '-e', 'frame.time'],
    { stdio: ["pipe", "pipe", "ignore"], shell: true}
  );
  initWifiScan()
  wifiStopped = false;
}

function wifiStopScanning() {
  if(tsharkProcess!=null) {
    try{
      exec(`ps aux | grep "tshark -i wl" | head -2 | while read line; do echo $line | cut -f2 -d ' ' | xargs sudo kill; done`)
    }
    catch(error){
      console.log("Error trying to kill wifi process",error)
    }
    wifiInitProcess = false;
  }
  wifiStopped = true;
}

app.get('/wifi/startScan', function(req, res) {
  wifiStartScanning()
  res.end()
})

app.get('/wifi/stopScan', function(req,res) {
  wifiStopScanning();
  res.end()
})

app.post('/wifi/targets', function(req, res) {
  var adrs = req.body
  if(adrs)
    buildWifiTargets(adrs)
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
  if(wifiStopped) {
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
    var [sa, rssi, time] = line.split('\t');
    if(now-Date.parse(time)>=20000)
      count++;
  })
  wifiScanResults.splice(0,count)
}

/***** END WIFI ********/
/*******************/

/***** BLUETOOTH ********/
/************************/

function bluetoothStartScanning() {
  if(!bluetoothTargets.length && trackingFox == '') {
    console.log("No targets, can't start scan.")
    return
  }
  var bluetoothTargetFilter = ''
  bluetoothTargets.forEach((adr,i) => {
    bluetoothTargetFilter += i ? `||bthci_evt.bd_addr==${adr}` : `(bthci_evt.bd_addr==${adr}`;
  })
  bluetoothTargetFilter += ') and bthci_evt.rssi <= 0'
  if(bluetoothTargets.length){
    bluetoothTsharkProcess = spawn('stdbuf',
      [ '-o', '0', 'tshark', 
        '-i', 'bluetooth0',
        '-l', '-Y', `"`+bluetoothTargetFilter+`"`, 
        '-T', 'fields', 
        '-e', 'bthci_evt.bd_addr',
        '-e', 'bthci_evt.rssi', 
        '-e', 'frame.time'],
      { stdio: ["pipe", "pipe", "ignore"], shell: true}
    );
    bluetoothTsharkProcess.stdout.on('data', (data) => {
      var fields = data.toString().split('\t')
      if(fields.length==3)
        bluetoothScanResults.push({
          mac: fields[0],
          rssi: fields[1],
          ts: new Date(fields[2]).getTime() 
        })
    })
  }
  bluetoothDiscovery()
  bluetoothStopped = false
}

async function bluetoothDiscovery() {
  if(bluetoothTargets.length) {
    try{
      await exec('sudo hciconfig hci0 reset')
      await exec('sudo hcitool inq --length=3');
    }
    catch(e) {}
  }
  if(trackingFox!='') {
    try{
      await exec('sudo hciconfig hci0 reset')
      let { stdout } = await exec(`sudo hcitool cc ${trackingFox} && hcitool rssi ${trackingFox}`)
      let found = stdout.match(/\d+/)
      let rssi = parseInt(found[0])
      rssi = -50-rssi
      if(found.length) {
        bluetoothScanResults.push({
          mac: trackingFox,
          rssi: rssi,
          ts: Date.now()
        })
      }
    }
    catch(e) {}
  }
  if(!bluetoothStopped)
    bluetoothDiscovery()
}

function bluetoothStopScanning() {
  if(bluetoothTsharkProcess!=null) {
    try{
      exec(exec(`ps aux | grep "tshark -i bluetooth0" | head -2 | while read line; do echo $line | cut -f2 -d ' ' | xargs sudo kill; done`))
    }
    catch(error) {
      console.log("Error trying to kill bluetooth process",error)
    }
    bluetoothTsharkProcess = null
  }
  bluetoothStopped = true
}

function returnBluetoothScan(res) {
  if(bluetoothStopped) {
    res.end()
    return
  }
  trimBluetoothScan()
  res.write("data: " + JSON.stringify(bluetoothScanResults) + "\n\n")
  setTimeout(() => returnBluetoothScan(res), 1000)
}

function trimBluetoothScan() {
  var count = 0;
  var now = Date.now();
  bluetoothScanResults.forEach(result => {
    if(now-(result.ts)>=20000)
      count++;
  })
  bluetoothScanResults.splice(0,count)
}

app.get('/bluetooth/startScan', function(req, res) {
  bluetoothStartScanning()
  res.end()
})

app.get('/bluetooth/stopScan', function(req,res) {
  bluetoothStopped = true;
  bluetoothStopScanning();
  res.end()
})

app.post('/bluetooth/targets', function(req, res) {
  bluetoothTargets = req.body.targets
  trackingFox = req.body.trackingFox
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

function buildSdrTarget(freq) {
  sdrFrequency = freq
}

function sdrStartScanning() {
  if(!sdrFrequency) {
    console.log("No target frequency, can't start scan.")
    return false
  }
  rtlPowerProcess = spawn('rtl_power', ['-f', `${sdrFrequency-0.1}M:${sdrFrequency+0.1}M:50k`, '-g','1','-i','1','-P'],{stdio: 'pipe'})
  sdrStopped = false
  initSdrScan()
}

function sdrStopScanning() {
  if(rtlPowerProcess!=null) {
    try{
      exec(`sudo kill -9 ${rtlPowerProcess.pid}`)
    }
    catch(error) {
      console.log("Error trying to kill the SDR process",error)
    }
    sdrInitProcess = false
    rtlPowerProcess = null
  }
  sdrStopped = true
}

function initSdrScan() {
  if(sdrInitProcess)
    return
  sdrInitProcess = true;
  rtlPowerProcess.stdout.on('data', (data) => {
    let line = data.toString().split(', ')
    sdrScanResults.push({
      ts: Date.parse(`${line[0]} ${line[1]}`),
      dbm: parseFloat(line.slice(6,line.length).sort()[0])
    })
  })

  rtlPowerProcess.on('error', error => {
    //TODO: spit this back at the user somehow
    console.log(error)
    sdrStopped = true
  })

  rtlPowerProcess.on('exit', function(code) {
    sdrStopped = true
  });
}

function returnSdrScan(res) {
  if(sdrStopped) {
    //TODO: return string saying its stopped
    res.end()
    return
  }
  trimSdrScan()
  res.write("data: " + JSON.stringify(sdrScanResults) + "\n\n")
  setTimeout(() => returnSdrScan(res), 1000)
}

function trimSdrScan() {
  var count = 0;
  var now = Date.now();
  sdrScanResults.forEach(result => {
    if(now-(result.ts)>=20000)
      count++;
  })
  sdrScanResults.splice(0,count)
}

app.get('/sdr/startScan', function(req, res) {
  sdrStartScanning()
  res.end()
})

app.get('/sdr/stopScan', function(req,res) {
  sdrStopped = true;
  sdrStopScanning();
  res.end()
})

app.post('/sdr/target', function(req, res) {
  var freq = req.body.frequency
  if(freq)
    buildSdrTarget(freq)
  res.end()
});

app.get('/sdr/results', function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })
  setTimeout(() => returnSdrScan(res),1000)
})
/***** END SDR *****/
/*******************/

app.listen(port, () => console.log(`Foxxy Pis listening on port ${port}!`))

// if node gets ctrl-c, rtl process doesn't exit on sigint, send sigkill #iknowwhatimdoing
process.on('SIGINT', function() {
  if(rtlPowerProcess){
    try{
      exec(`sudo kill -9 ${rtlPowerProcess.pid}`)
    }
    catch(error){
      console.log("Error trying to kill SDR process",error)
    }
  }
  process.exit()
});
