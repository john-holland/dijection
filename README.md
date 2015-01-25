#Dijection

Dijection is a small javascript dependency injection library that relies on parsing function parameter lists for dependency declaration.

By default, Dijection uses the '\_' prefix to check for dependencies:

```javascript
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

Any parameter not prefixed with '\_' or '$', will be assumed to be a function parameter for the returned injected method:

```javascript
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

Dijection uses the '$' prefix to inject all dependencies with that name.

```javascript
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