test("the base function exists with dependency", function() {
  ok(MultiTabSingleton);
  ok($.jStorage);
  ok(ObjectObserver);
});

test("the base function returns object with same properties and functions", function() {
  var obj = MultiTabSingleton('TestSingleton',{
  	testString : 'String',
  	testInt : 1,
  	testFunc : function() {
  		return "hello"
  	},
  	testObj : {
  		testSubField : 'subString'
  	}
  });

  ok(obj)
  ok(obj.testString === 'String')
  ok(obj.testInt === 1)
  ok(typeof obj.testFunc === 'function')
  ok(typeof obj.testObj === 'object')
});

test("the function function substitution works", function() {
  var obj = MultiTabSingleton('TestSubstitution', {
    test1 : function() {
      return "test1";
    },
    test2 : function(param) {
      return "test2"+param;
    },
    testArr : [
      function() {return "arr"}
    ],
    testObj : {
      test4 : function() {
        return "test4";
      }
    }
  });

  obj = obj.substituteFunctionsInObject(obj, function(path,item,parent) {    
    if (typeof item === 'function') {      
      return function() {
        var args = Array.prototype.slice.call(arguments)
        result = item.apply(parent, args);
        return "wrap"+result;
      }
    }
  });

  ok(obj)
  ok(obj.test1() === 'wraptest1')
  ok(obj.test2('param') === 'wraptest2param')
  ok(obj.testArr[0]() === 'wraparr')
  ok(obj.testObj.test4() === 'wraptest4')
});
