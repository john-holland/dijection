describe("Dijection", function() {
  "use strict";
  if (typeof require === 'function') {
    var DI = require("../../dijection.js");
  } else if (typeof window.DI !== 'undefined') {
    var DI = window.DI;
  }
  
  it('should be defined as DI', function() {
    expect(DI).toBeTruthy();
  });
  
  DI.register('injected', function Impl() {
    return "another value";
  });
  
  DI.register('injected', function AnotherImpl() {
    return "some value";
  });
  
  DI.register('anotherInjectedValue', 'some other value');

  it("should be able to inject values", function() {

    var injected = DI(function(_injected, passedInParam, $injected, secondPassedInParam) {
        expect(_injected).toBeTruthy();
        expect(_injected()).toEqual('some value');
        expect($injected.length).toEqual(2);
        expect(secondPassedInParam).toBeFalsy();
        
        return passedInParam;
    });

    var result = injected("some value");

    expect(result).toEqual('some value');
  });
  
  it('should be able to inject multiple values', function() {
    var injected = DI(function(param, _anotherInjectedValue, anotherParam) {
      return param + " " + _anotherInjectedValue + " " + anotherParam;
    });
    
    expect(injected(1, 2)).toEqual("1 some other value 2");
  });
  
  it('should be able to inject in different orders', function() {
    var injected = DI(function(param, _anotherInjectedValue, anotherParam) {
      return param + " " + _anotherInjectedValue + " " + anotherParam;
    });
    
    var injectedReordered = DI(function(param, anotherParam, _anotherInjectedValue) {
      return param + " " + _anotherInjectedValue + " " + anotherParam;
    });
    
    expect(injected(1, 2)).toEqual(injectedReordered(1, 2));
  });
  
  it('should be able to have dependencies with dependencies', function() {
    DI.register("serviceA", {
        method: function() {
            return 1;
        }
    });
    
    DI.register("serviceB", DI(function(_serviceA) {
        return _serviceA.method() + 1;
    }));
    
    var injected = DI(function(_serviceB, parameter) {
        return _serviceB() + parameter;
    });
    
    expect(injected(5)).toEqual(7);
  });
});
