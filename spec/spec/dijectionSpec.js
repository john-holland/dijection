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
  
  it('should be able to deregister dependencies', function() {
    DI.register("aTemporaryService", function() {
      return "I'm only useful for a while!";
    });
    
    expect(DI(function($aTemporaryService) {
      return $aTemporaryService.length;
    })()).toEqual(1);
    
    DI.deregister("aTemporaryService");
    
    expect(DI(function($aTemporaryService) {
      return $aTemporaryService.length;
    })()).toEqual(0);
  })
  
  describe("shim support for minification", function() {
    it("should be able to shim arguments", function() {
      DI.register("someService", function() {
        return "shim successful";
      })
      
      var shimmedInjected = DI(['_someService', 'param'], function(x, y) {
        return x() + y;
      });
      
      expect(shimmedInjected(5)).toEqual("shim successful5");
    });
    
    it("should be able to shim dependencies", function() {
      DI.register("shimmedService", function() {
        return "shim successful";
      })
      
      DI.register("shimmedService", function() {
        return "shim successful";
      })
      
      var shimmedInjected = DI(['$shimmedService', 'param'], function(x, y) {
        return x.length + " " + y;
      });
      
      expect(shimmedInjected(5)).toEqual("2 5");
    });
  });
  
  describe("context file sugar", function() {
    it("should register all depedencies", function() {
      DI({
        a: {
          someData: "data"
        },
        b: {
          someMoreData: "other data"
        }
      });
      
      expect(DI(function($a) {
        return $a.length;
      })()).toEqual(1);
      
      expect(DI(function($b) {
        return $b.length;
      })()).toEqual(1);
    });
  });
});
