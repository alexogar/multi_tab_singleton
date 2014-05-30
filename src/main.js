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
 var MultiTabSingleton = function(name,obj,optionsParam) {
  var __toString = Object.prototype.toString;
   /*
  var defaultOptions = {
    heartBeat : 100
  };     
  
  if (optionsParam == null) {
    optionsParam = {}
  }
     
  var options = {};
  for ( var o in defaultOptions) {
    options[o] = optionsParam[o] || defaultOptions[o];
  }  */     

  var substituteFunctionsInObject = function(obj, fn, iterPosParam) {

    var ret, objType, iterPos = iterPosParam || [], i = 0;


    if (__toString.call(obj) === '[object Array]') {
      obj.forEach(function (item) {
        objType = __toString.call(item);
        if ( (objType === "[object Object]") || (objType === "[object Array]") ) {
          ret = substituteFunctionsInObject(item, fn, iterPos.concat(i));
        } else {
          ret = fn(iterPos.concat(i), item, obj);
        }

        if (ret) {
          obj[i] = ret;
        }
        i++;
      });
    }
    for (var key in obj) {
      if (!("" + key).match(/^\d+$/)) {
        objType = __toString.call(obj[key]);
        if ( (objType === "[object Object]") || (objType === "[object Array]") ) {
          ret = substituteFunctionsInObject(obj[key], fn, iterPos.concat(key));
        } else {
          ret = fn(iterPos.concat(key), obj[key], obj);
        }

        if (ret) {
          obj[key] = ret;
        }
      }
    }

    return obj;
  };
  
  var store = {
    _s : null,
    init : function() {
      this._s = window.$.jStorage || window.jStorage;
      
      if (this._s == null) {
        throw new ReferenceError("Error referencing jStorage, include jStorage or use full distribution");
      }
    },
    get : function(key, defaultValue) {
      return _s.get(key, defaultValue);
    },
    set : function(key, value) {
      _s.set(key,value);
    }
  };
    
  store.init();
  
  if (ObjectObserver === null) {
    throw new ReferenceError("observer-js is not exists");
  }

  
  /*
   var observer = new ObjectObserver(obj);
  observer.open(function(added, removed, changed, getOldValueFn) {
    // respond to changes to the obj.
    Object.keys(added).forEach(function(property) {
      //property; // a property which has been been added to obj
      //added[property]; // its value
    });
    Object.keys(removed).forEach(function(property) {
      //property; // a property which has been been removed from obj
      //getOldValueFn(property); // its old value
    });
    Object.keys(changed).forEach(function(property) {
      //property; // a property on obj which has changed value.
      //changed[property]; // its value
      //getOldValueFn(property); // its old value
    });
  });
   */
  var api = {
    master : false
  };

  //We also need to negotiate master/slave configuration
  var negotiateMasterSlave = function(apiObj) {
    //let`s check participants section in store, if there are idle participants
    //We delete them and becomes master, if there are live one we becomes slave
    var participants = store.get('participants',[])
    var liveParticipants = []

    for (var p in participants) {
      var part = participants[p];
      var currentTimestamp = new Date().getTime();
      if (part.lastAccessedTime > currentTimestamp - 100) {
        liveParticipants.push(part)
      }
    }

    //We need to check weather there is any master in live list
    var master = null;
    for (var lp in liveParticipants) {
      var liveP = liveParticipants[lp];
      if (liveP.master && master) {
        liveP.master = false;
      } else if (liveP.master) {
        master = liveP;          
      }
    }    
    
    if (master == null) {
      //then we could become master
      apiObj.master = true;
      
    } 
    
    liveParticipants.push(apiObj)
      
    store.set('participants',liveParticipants);
    return apiObj;
  };
  //also we need to mock all functions we will find in that object
  //so we can execute function only on master singleton object
  obj = substituteFunctionsInObject(obj, function(path,item,parent) {

  });

  obj.substituteFunctionsInObject = substituteFunctionsInObject;
   
 // api = negotiateMasterSlave(api); 
  obj.api = api;

  return obj;
};


// Version.
MultiTabSingleton.VERSION = '0.0.1';


// Export to the root, which is probably `window`.
root.MultiTabSingleton = MultiTabSingleton;
