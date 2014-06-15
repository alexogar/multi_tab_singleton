$.jStorage.flush();
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

  ok(obj)

  obj.test1(function(result) {

    ok(result === 'test1');

    obj.test2('param', function(result) {
      ok(result === 'test2param');

    });
  });

});

test("the master/slave negotiation when only one instance", function() {
  $.jStorage.flush();

  var obj = MultiTabSingleton('TestMaster',{a:2});
  ok(obj)
  ok(obj.substituteFunctionsInObject)
  ok(obj.api)
  ok(obj.api.master == true)
  ok(obj.a === 2)

  obj = MultiTabSingleton('TestMaster2',{a:2});
  ok(obj)
  ok(obj.substituteFunctionsInObject)
  ok(obj.api)
  ok(obj.api.master == true)
  ok(obj.a === 2)
});

test("the master/slave negotiation when two instances", function() {
  $.jStorage.flush();

  var obj = MultiTabSingleton('TestMaster',{a:2});
  ok(obj)
  ok(obj.substituteFunctionsInObject)
  ok(obj.api)
  ok(obj.api.master == true)
  ok(obj.a === 2)

  var slave = MultiTabSingleton('TestMaster',{a:3});
  ok(slave)
  ok(slave.substituteFunctionsInObject)
  ok(slave.api)
  ok(slave.api.master == false)
  ok(slave.a === 2)
});

asyncTest("the master/slave field change propagation", function() {
  $.jStorage.flush();

  var obj = MultiTabSingleton('TestMaster',{a:2});
  ok(obj)
  ok(obj.substituteFunctionsInObject)
  ok(obj.api)
  ok(obj.api.master == true)
  ok(obj.a === 2)

  var slave = MultiTabSingleton('TestMaster',{a:3});
  ok(slave)
  ok(slave.substituteFunctionsInObject)
  ok(slave.api)
  ok(slave.api.master == false)
  ok(slave.a === 2)

  slave.a = 5;
  setTimeout(function() {
    ok($.jStorage.get('TestMaster_value').a === 5)
    ok(obj.a === 5);
    obj.a = 6;
    setTimeout(function() {
      ok($.jStorage.get('TestMaster_value').a === 6)
      ok(slave.a === 6);
      start();
    },1000);
  },1000);

});

test("test master function execution", function() {
  $.jStorage.flush();
  var obj = MultiTabSingleton('TestMaster',{a:2, test: function() {
    return "MasterResult"
  }});
  var slave = MultiTabSingleton('TestMaster',{a:3, test: function() {
    return "SlaveResult"
  }});

  obj.test(function(result) {
      ok(result === "MasterResult");
  })
});

asyncTest("test slave to master function execution", function() {
  $.jStorage.flush();
  var obj = MultiTabSingleton('TestMaster',{a:2, test: function() {
    return "MasterResult"
  }});
  var slave = MultiTabSingleton('TestMaster',{a:3, test: function() {
    return "SlaveResult"
  }});

  slave.test(function(result) {
      ok(result === "MasterResult");
      start();
  })
  stop();
});

