# Dijection

Dijection is a small javascript dependency injection library that relies on parsing function parameter lists for dependency declaration.

By default, Dijection uses the '\_' prefix to check for dependencies:

```javascript
var DI = require("dijection")(); //or window.Dijection();

DI.register("serviceA", {
    method: function() {
        return 1;
    }
});

DI.register("serviceB", DI(function(_serviceA) {
    return _serviceA.method() + 1;
}));

var injected = DI(function(_serviceB) {
    return _serviceB() + 2;
});

console.log(injected()); //outputs 4!
```

Dijection uses the '$' prefix to inject all dependencies with that name.

```javascript
var DI = require("dijection")(); //or window.Dijection();

DI.register("service", {
    method: function() {
        return 1;
    }
});

//you can override a dependency simply by re-registering it.
DI.register("service", {
    method: function() {
        //overriden dependencies are still available via the $ prefix.
        return 5;
    }
});

var injected = DI(function(_service, $service) {
    console.log(_service.method()); //5, the most recently registered service
    var sum = 0;
    $service.forEach(function(service) {
        sum += service.method();
    });
    
    console.log(sum); //6!
});
```

Any parameter not prefixed with '\_' or '$', will be assumed to be a function parameter for the returned injected method:

```javascript
var DI = require("dijection")(); //or window.Dijection();

DI.register("serviceA", {
    method: function() {
        return 1;
    }
});

DI.register("serviceB", DI(function(_serviceA) {
    return _serviceA.method() + 1;
}));

//injected dependencies will be omitted from the parameter list for the returned function
var injected = DI(function(parameter, _serviceB, anotherParam, yetAnother) {
    //any parameters that are not passed in when the injected function is called will be passed as undefined.
    return _serviceB() + parameter + anotherParam + yetAnother;
});

console.log(injected(5, 1)); //outputs 8!
```

## Context Files

Setup your context file:
```javascript
var DI = require("dijection")(); //or window.Dijection();

//make sure to return your dependency injection container as your module output
//  Pass an object into DI, where each property value pair is a dependency.
module.exports = DI({
    "escapedDatasource": DI(function(_datasource, appender) {
        return escape(_datasource + (appender ? appender : ""));
    }),
    "datasource": "https://github.com/john-holland"
});
```

Use the dependency injection container exposed by your context file:
```javascript
var DI = require("./context");

DI(function(_escapedDatasource, _datasource) {
    console.log(_datasource + " " + _escapedDatasource("/dijection"));
})();
//outputs: https://github.com/john-holland https%3A//github.com/john-holland/dijection
```


## Minification support

To support javascript minification, a parameter shim can be used to inform Dijection of what needs to be done for the function's parameter list.
The upside of shimming the parameter list is being able to use it to alias dependency names -- the downside is that the order of the shim parameter list and the function parameter list must be the same.

```javascript
var DI = require("dijection")(); //or window.Dijection();

//this is the same as the example above, but using shims.
DI.register("serviceA", {
    method: function() {
        return 1;
    }
});

DI.register("serviceB", DI(["serviceA"], function(service) {
    return service.method() + 1;
}));

//The same prefixes are used for the parameter shim, along with non-prefixed parameters 
//  creating the partial function.
var injected = DI(["param", "_serviceB", "param", "param"], function(parameter, shimmedService, anotherParam, yetAnother) {
    //note that _serviceB is aliased "shimmedService" and does not need a prefix 
    //  since the shim provides the '_' prefix to let dijection know it should be injected.
    return shimmedService() + parameter + anotherParam + yetAnother;
});

console.log(injected(5, 1)); //outputs 8!
```
