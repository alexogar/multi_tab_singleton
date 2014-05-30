/* multi_tab_singleton main */
/*global window */
/*global ObjectObserver */

/**
 * @param name unique name for that object to be referenced
 * @param obj future singleton object
 * @returns object with same fields that is singleton across tabs
 */
 var MultiTabSingleton = function(name,obj) {

  var store = window.$.jStorage || window.jStorage;

  if (store === null) {
    throw new ReferenceError("jStorage is not defined");
  }

  if (ObjectObserver === null) {
    throw new ReferenceError("observer-js is not exists");
  }

  var __toString = Object.prototype.toString;

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

  //We also need to negotiate master/slave configuration

  //also we need to mock all functions we will find in that object
  //so we can execute function only on master singleton object

  obj = substituteFunctionsInObject(obj, function(path,item,parent) {

  });

  obj.substituteFunctionsInObject = substituteFunctionsInObject;

  return obj;
};


// Version.
MultiTabSingleton.VERSION = '0.0.1';


// Export to the root, which is probably `window`.
root.MultiTabSingleton = MultiTabSingleton;
