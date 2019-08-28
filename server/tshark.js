const express = require('express')
const app = express()
const port = 3000
const {spawn,exec} = require('child_process');
app.use(express.json());
app.use(express.static('../client/dist'))

var tsharkProcess = null;
var targetFilters = [];
var scanResults = []
var initProcess = false;
var stop = false;

function buildTargets(adrs) {
  targetFilters = []
  adrs.forEach((adr,i) => {
    var filter = i ? `||wlan.sa==${adr}` : `wlan.sa==${adr}`;
    targetFilters.push(filter)
  })
}

function initScan() {
  if(initProcess)
    return
  initProcess = true;
  tsharkProcess.stdout.on('data', (data) => {
    var fields = data.toString().split('\t')
    if(fields.length==3 && fields[0].length)
      scanResults.push(data.toString())
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

function startScanning() {
  stop = false;
  var targets = ["78:8a:20:54:99:8e","7a:8a:20:54:99:8e"]
  targetFilters = targets.map((target,index) => {
    return `wlan.sa==${target}`
  })

  if(!targets.length) {
    console.log("No targets, can't start scan.")
    return false
  }
  console.log(`tshark -i wlx9cefd5fc1011 -l -Y "${targetFilters.join('||')}" -T fields -e wlan.sa -e wlan_radio.signal_dbm -e frame.time`)
  console.log("Starting scan...")
  tsharkProcess = spawn('stdbuf',
    [ '-o', '0', 'tshark', 
      '-i', 'wlx9cefd5fc1011', //TODO: devices on pis go to wlan#, usually wlan1
      '-l', '-Y', `"`+targetFilters.join("||")+`"`, 
      '-T', 'fields', 
      '-e', 'wlan.sa',
      '-e', 'wlan_radio.signal_dbm', 
      '-e', 'frame.time'],
    { stdio: ["pipe", "pipe", "ignore"], shell: true}
  );
  initScan()
}

function stopScanning() {
  if(tsharkProcess!=null) {
    // kills the child tshark process... assumes it will always be pid+1... bad assumption
    exec(`sudo kill ${tsharkProcess.pid+1}`)
    initProcess = false;
    //TODO: kill method kills stdbuf process, but not the tshark process...
    // tsharkProcess.kill()
  }
}

app.get('/startScan', function(req, res) {
  startScanning()
  res.end()
})

app.get('/stopScan', function(req,res) {
  stop = true;
  stopScanning();
  res.end()
})

app.post('/targets', function(req, res) {
  var adrs = req.body.targets
  if(adrs && adrs.length)
    buildTargets(adrs)
  else {
    //TODO: no targets lul, l2gitgud
  }
  res.end()
});

app.get('/results', function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })
  returnScan(res)
})

function returnScan(res) {
  if(stop) {
    res.end()
    return
  }
  trimScan()
  res.write("data: " + JSON.stringify(scanResults) + "\n\n")
  console.log(scanResults.length+' scan results sent')
  setTimeout(() => returnScan(res), 1000)
}

//remove all scans over 20s ago
function trimScan() {
  var count = 0;
  var now = Date.now();
  scanResults.forEach(line => {
    var [ssid, rssi, time] = line.split('\t');
    if(now-Date.parse(time)>=20000)
      count++;
  })
  scanResults.splice(0,count)
  console.log(scanResults)
}

//TODO: do same thing for bluetooth and sdr

app.listen(port, () => console.log(`SSE app listening on port ${port}!`))