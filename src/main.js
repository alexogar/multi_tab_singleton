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

  var substituteFunctionsInObject = function(obj) {

  }
  
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

  //also we need to mock all functions we will find in that object


  return obj;
};


// Version.
MultiTabSingleton.VERSION = '0.0.1';


// Export to the root, which is probably `window`.
root.MultiTabSingleton = MultiTabSingleton;
