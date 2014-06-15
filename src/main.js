/* multi_tab_singleton main */
/*global window */
/*global ObjectObserver */
/**
 * @param name unique name for that object to be referenced
 * @param obj future singleton object
 * @param options {
 *   heartBeat : 100 in milliseconds
 * }
 * @returns object with same fields that is singleton across tabs
 */
var MultiTabSingleton = function(name, obj, optionsParam) {
  var __toString = Object.prototype.toString;

  var defaultOptions = {
    heartBeat : 50,
    heartBeatTimeout : 50,
    forseMaster : false,
    singletonFunctionExecution : true
  };

  if (optionsParam == null) {
    optionsParam = {}
  }

  var options = {};
  for ( var o in defaultOptions) {
    options[o] = optionsParam[o] || defaultOptions[o];
  }
  var clone = function(source, destination) {
    for(var property in source) {
      if(typeof source[property] === "object" && source[property] !== null && destination[property]) {
        clone(destination[property], source[property]);
      } else {
        destination[property] = source[property];
      }
    }
  };

  var generateId = function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  };

  var substituteFunctionsInObject = function(obj, fn, iterPosParam) {
    var ret, objType, iterPos = iterPosParam || [],
      i = 0;

    if(__toString.call(obj) === '[object Array]') {
      obj.forEach(function(item) {
        objType = __toString.call(item);
        if((objType === "[object Object]") || (objType === "[object Array]")) {
          ret = substituteFunctionsInObject(item, fn, iterPos.concat(i));
        } else {
          ret = fn(iterPos.concat(i), item, obj);
        }
        if(ret) {
          obj[i] = ret;
        }
        i++;
      });
    }

    for(var key in obj) {
      if(!("" + key).match(/^\d+$/)) {
        objType = __toString.call(obj[key]);
        if((objType === "[object Object]") || (objType === "[object Array]")) {
          ret = substituteFunctionsInObject(obj[key], fn, iterPos.concat(key));
        } else {
          ret = fn(iterPos.concat(key), obj[key], obj);
        }
        if(ret) {
          obj[key] = ret;
        }
      }
    }
    return obj;
  };

  var store = {
    _s: null,
    init: function() {
      this._s = window.$.jStorage || window.jStorage;
      if(this._s === null) {
        throw new ReferenceError("Error referencing jStorage, include jStorage or use full distribution");
      }
    },
    get: function(key, defaultValue) {
      return this._s.get(key, defaultValue);
    },
    set: function(key, value) {
      this._s.set(key, value);
    },
    subscribeToChanges: function(key,callback) {
      this._s.listenKeyChange(key,callback);
    },
    subscribe: function(channel,callback) {
      this._s.subscribe(channel,callback);
    },
    publish: function(channel,payload) {
      this._s.publish(channel,payload);
    },
    del: function(key) {
      this._s.deleteKey(key);
    }
  };
  store.init();

  if(ObjectObserver === null) {
    throw new ReferenceError("observer-js is not exists");
  }

  var observer = {
    _o: null,
    _obj: null,
    init: function(objToObserve) {
      if (objToObserve === null) {
        throw new ReferenceError("Object should not be null");
      }
      this._obj = objToObserve;

      if(ObjectObserver === null) {
        throw new ReferenceError("observer-js is not exists");
      }
      this._o = new ObjectObserver(this._obj);
      var self = this;
      this._o.open(function(added, removed, changed, getOldValueFn) {
        self._obj.saveValues();
      });
    },
    close : function() {
      this._o.close();
    }
  }
  var api = {
    id: generateId(),
    master: false,
    lastAccessedTime: new Date().getTime()
  };

  //We also need to negotiate master/slave configuration
  var negotiateMasterSlave = function() {
    //let`s check participants section in store, if there are idle participants
    //We delete them and becomes master, if there are live one we becomes slave
    var participants = store.get(name+'_participants', [])
    var liveParticipants = []
    for(var p in participants) {
      var part = participants[p];
      var currentTimestamp = new Date().getTime();
      if(part.lastAccessedTime > currentTimestamp - options.heartBeat) {
        if (part.id !== api.id) { //we skip ourselfs if we need to add.
          liveParticipants.push(part);
        }
      }
    }

    //We need to check weather there is any master in live list
    var master = null;

    for(var lp in liveParticipants) {
      var liveP = liveParticipants[lp];
      if(liveP.master && master) {
        liveP.master = false;
      } else if(liveP.master) {
        master = liveP;
      }
    }

    if(master === null) {
      //then we could become master
      api.master = true;
    }

    api.lastAccessedTime = new Date().getTime();

    liveParticipants.push(api);
    store.del(name+'_participants');
    store.set(name+'_participants', liveParticipants);
    return api;
  };

  //also we need to mock all functions we will find in that object
  //so we can execute function only on master singleton object
  obj = substituteFunctionsInObject(obj, function(path, item, parent) {
    if (typeof item === 'function') {
      return function() {
        var args = Array.prototype.slice.call(arguments);
        var callback = args[args.length-1];
        if (obj.api.master) {
          //We just call function, and pass call back
          var result = item.apply(parent, args);
          var futureArgs = [];
          futureArgs.push(result);
          if (callback) {
            callback.apply(parent,futureArgs);
          }
        } else {

          var payload = {};
          payload.id = generateId();
          payload.params = args;
          payload.name = path;
          console.log("Payload", payload);
          this.results[payload.id] = callback;

          store.publish(name + "_function_calls", payload);

        }
      }
    }
  });
  api = negotiateMasterSlave();
  obj.results = {};

  obj.loadValues = function() {
    var storedObj = store.get(name + "_value");
    //
    if(storedObj) {
      clone(storedObj, this);
    }
  };

  obj.saveValues = function() {
    store.set(name + "_value", this)
  };

  obj.subscribe = function() {
    var self = this;
    store.subscribeToChanges(name + "_value", function(key, action){
      self.loadValues();
    });

    store.subscribe(name + "_function_calls", function(channel,payload) {
      //Here we get definition for function call
      //We will return result into function_results channel with id sended to us
      if (self.api.master) {
        console.info("master payload",payload)
        var id = payload.id;
        var name = payload.name;
        var params = payload.params;
        console.info("Going to execute ",payload.name)
        var result = obj[name].apply(obj,params);
        store.publish(name + "_function_results", {
          id : id,
          result : result
        });
      }

    });

    store.subscribe(name + "_function_results", function(channel,payload) {
      var id = payload.id;
      if (this.results[id]) {
        var result = payload.result;
        var futureArgs = [];
        futureArgs.push(result);

        this.results[id].apply(obj,futureArgs);
        delete this.resuls[id];
      }
    });

  }

  api.id = generateId();

  obj.substituteFunctionsInObject = substituteFunctionsInObject;
  obj.api = api;

  if (obj.api.master) {
    obj.saveValues();
  }

  obj.loadValues();
  observer.init(obj);
  //setup periodic interval to propagate changes and function calls if object observe doesn`t exists
  if (Object.observe == null) {
    var timeoutCallback = function() {
      Platform.performMicrotaskCheckpoint();
      api = negotiateMasterSlave();
      setTimeout(timeoutCallback, options.heartBeatTimeout);
    }
    timeoutCallback();
  }
  obj.subscribe();
  return observer._obj;
};
// Version.
MultiTabSingleton.VERSION = '0.0.1';
// Export to the root, which is probably `window`.
root.MultiTabSingleton = MultiTabSingleton;