var Service = function Service(axios) {
  this.$http = axios;
  
  this.wifisource = null;
  this.btsource = null;
  this.sdrsource = null;

  this.wificallback = null;
  this.btcallback = null;
  this.sdrcallback = null;
};

Service.prototype.getAllTargets = async function() {
  let response = await this.$http.get('/targets')
  return response.data
}

/******* WIFI *******
 * 
 * 
 * 
*********************/
Service.prototype.setWifiTargets = async function(targets) {
  this.$http.post('/wifi/targets',targets);
}

Service.prototype.startWifiScanning = async function() {
  this.$http.get('/wifi/startScan')
}

Service.prototype.getWifiResults = function(cb) {
  var self = this;
  if(cb)
    this.wificallback = cb
  var self = this;
  this.wifisource = new EventSource('/wifi/results')

  this.wifisource.addEventListener('message', function(e) {
    self.wificallback(e.data)
  }, false)
  this.wifisource.addEventListener('error', function(e) {
    if (e.eventPhase == EventSource.CLOSED)
      self.wifisource.close()
  }, false)
}

Service.prototype.stopWifiScanning = function() {
  if(this.wifisource!=null) {
    this.wifisource.close()
  }
  this.$http.get('/wifi/stopScan')
}

/******** Bluetooth******** 
 * 
 * 
 * 
***************************/
Service.prototype.setBluetoothTargets = async function(targets) {
  this.$http.post('/bluetooth/targets',targets);
}

Service.prototype.startBluetoothScanning = async function() {
  this.$http.get('/bluetooth/startScan')
}

Service.prototype.getBluetoothResults = function(cb) {
  var self = this;
  if(cb)
    this.btcallback = cb
  var self = this;
  this.btsource = new EventSource('/bluetooth/results')

  this.btsource.addEventListener('message', function(e) {
    self.btcallback(e.data)
  }, false)
  this.btsource.addEventListener('error', function(e) {
    if (e.eventPhase == EventSource.CLOSED)
      self.btsource.close()
  }, false)
}

Service.prototype.stopBluetoothScanning = function() {
  if(this.btsource!=null) {
    this.btsource.close()
  }
  this.$http.get('/bluetooth/stopScan')
}


/******** SDR ************ 
 * 
 * 
 * 
**************************/
Service.prototype.setSDRTarget = async function(target) {
  this.$http.post('/sdr/target',{frequency: target});
}

Service.prototype.startSDRScanning = async function() {
  this.$http.get('/sdr/startScan')
}

Service.prototype.getSDRResults = function(cb) {
  var self = this;
  if(cb)
    this.sdrcallback = cb
  var self = this;
  this.sdrsource = new EventSource('/sdr/results')

  this.sdrsource.addEventListener('message', function(e) {
    self.sdrcallback(e.data)
  }, false)
  this.sdrsource.addEventListener('error', function(e) {
    if (e.eventPhase == EventSource.CLOSED)
      self.sdrsource.close()
  }, false)
}

Service.prototype.stopSDRScanning = function() {
  if(this.sdrsource!=null) {
    this.sdrsource.close()
  }
  this.$http.get('/sdr/stopScan')
}

function plugin(Vue, options) {
  if(plugin.installed)
    return;
  plugin.installed = true;

  var service = null;
  Object.defineProperties(Vue.prototype, {
    $service: {
      get: function get() {
        if(!service) {
          if(!this.$http) {
            throw new Error('Request handler instance not found');
          }
          service = new Service(this.$http);
        }
        return service;
      }
    }
  });
}

export default plugin;
export { Service };