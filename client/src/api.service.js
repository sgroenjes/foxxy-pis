var Service = function Service(axios) {
  this.$http = axios;
  this.source = null;
  this.callback = null;
};
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
    this.callback = cb
  var self = this;
  this.source = new EventSource('/wifi/results')

  this.source.addEventListener('message', function(e) {
    self.callback(e.data)
  }, false)
  this.source.addEventListener('error', function(e) {
    if (e.eventPhase == EventSource.CLOSED)
      self.source.close()
  }, false)
}

Service.prototype.stopWifiScanning = function() {
  if(this.source!=null) {
    this.source.close()
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
    this.callback = cb
  var self = this;
  this.source = new EventSource('/bluetooth/results')

  this.source.addEventListener('message', function(e) {
    self.callback(e.data)
  }, false)
  this.source.addEventListener('error', function(e) {
    if (e.eventPhase == EventSource.CLOSED)
      self.source.close()
  }, false)
}

Service.prototype.stopBluetoothScanning = function() {
  if(this.source!=null) {
    this.source.close()
  }
  this.$http.get('/bluetooth/stopScan')
}


/******** SDR ************ 
 * 
 * 
 * 
**************************/
Service.prototype.setSDRTargets = async function(targets) {
  this.$http.post('/sdr/targets',targets);
}

Service.prototype.startSDRScanning = async function() {
  this.$http.get('/sdr/startScan')
}

Service.prototype.getSDRResults = function(cb) {
  var self = this;
  if(cb)
    this.callback = cb
  var self = this;
  this.source = new EventSource('/sdr/results')

  this.source.addEventListener('message', function(e) {
    self.callback(e.data)
  }, false)
  this.source.addEventListener('error', function(e) {
    if (e.eventPhase == EventSource.CLOSED)
      self.source.close()
  }, false)
}

Service.prototype.stopSDRScanning = function() {
  if(this.source!=null) {
    this.source.close()
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