var Service = function Service(axios) {
  this.$http = axios;
  this.source = null;
  this.callback = null;
};

Service.prototype.setTargets = async function(targets) {
  this.$http.post('/targets',targets);
}

Service.prototype.startScanning = async function() {
  this.$http.get('/startScan')
}

Service.prototype.getResults = function(cb) {
  var self = this;
  if(cb)
    this.callback = cb
  var self = this;
  this.source = new EventSource('/results')

  this.source.addEventListener('message', function(e) {
    self.callback(e.data)
  }, false)
  this.source.addEventListener('error', function(e) {
    if (e.eventPhase == EventSource.CLOSED)
      self.source.close()
  }, false)
}

Service.prototype.stopScanning = function() {
  if(this.source!=null) {
    this.source.close()
  }
  this.$http.get('/stopScan')
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