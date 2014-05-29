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
