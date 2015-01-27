/***
 * Dijection, a small dependency injection container.
 * 
 * By John Holland, licensed MIT
 */
+function() {
    "use strict";
    //from http://merrickchristensen.com/articles/javascript-dependency-injection.html
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
        injectPrefix = ['_'],
        dependenciesPrefix = ['$'],
        _ = '_' in this ? this._ : null;

    if (typeof _ !== 'function' && typeof require === 'function') {
        _ = require('underscore');
    }
    
    if (!Array.isArray) {
      Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
      };
    }
    function DIFactory() {
        var di = function DI() {
            if (!di.registry) {
                di.registry = { };
            }
            
            var shim = null,
                func = null;
            if (arguments.length > 1) {
                if (Array.isArray(arguments[0]) && typeof arguments[1] === 'function') {
                    shim = arguments[0];
                    func = arguments[1];
                }
            } else if (arguments.length === 1) {
                if (typeof arguments[0] === 'function') {
                    func = arguments[0];
                } else if (typeof arguments[0] === 'object' && !Array.isArray(arguments[0])) {
                    var toRegister = arguments[0];
                    
                    for (var dependency in toRegister) {
                        if (toRegister.hasOwnProperty(dependency)) {
                            di.register(dependency, toRegister[dependency]);
                        }
                    }
                    
                    return di;
                }
            }
            
            if (!func) {
                return null;
            }
            
            var args = !!shim ? shim : func.toString().match(FN_ARGS)[1].split(/\s*,\s*/),
                paramPosition = 0,
                metadatas = _.map(args, function(arg) {
                    var argMetadata = {
                        arg: arg,
                        inject: _.any(injectPrefix, function(prefix) { return arg.indexOf(prefix) == 0; }),
                        injectDependencies: _.any(dependenciesPrefix, function(prefix) { return arg.indexOf(prefix) == 0 })
                    };
                    
                    if (argMetadata.inject && argMetadata.injectDependencies) {
                        console.error('Injection prefix collision, treating ' + arg + ' as a parameter');
                        argMetadata.inject = false;
                        argMetadata.injectDependencies = false;
                    }
                    
                    if (!argMetadata.inject && !argMetadata.injectDependencies) {
                        argMetadata.paramPosition = paramPosition;
                        paramPosition++;
                    } else if (argMetadata.inject) {
                        argMetadata.name = arg.replace(_.find(injectPrefix, function(prefix) { return arg.indexOf(prefix) == 0; }), '').toLowerCase().trim();
                    } else if (argMetadata.injectDependencies) {
                        argMetadata.name = arg.replace(_.find(dependenciesPrefix, function(prefix) { return arg.indexOf(prefix) == 0 }), '').toLowerCase().trim();
                    }
                    
                    return argMetadata;
                });
                
            return function() {
                var argumentsCopy = Array.prototype.slice.call(arguments);
                
                return func.apply(this, _.map(metadatas, function(metadata) {
                    if (metadata.inject) {
                        return di.registry[metadata.name] && di.registry[metadata.name].length ? di.registry[metadata.name][0] : undefined;
                    } else if (metadata.injectDependencies) {
                        return di.registry[metadata.name] ? di.registry[metadata.name] : [];
                    } else if ('paramPosition' in metadata) {
                        return argumentsCopy.length && argumentsCopy.length > metadata.paramPosition ? argumentsCopy[metadata.paramPosition] : undefined;
                    } else {
                        return undefined;
                    }
                }));
            };
        }
        
        di.register = function(name, value) {
            if (!di.registry) di.registry = { };
            var lowerName = name.toLowerCase().trim();
            di.registry[lowerName] = di.registry[lowerName] || [];
            
            di.registry[lowerName].unshift(value);
        }
        
        di.deregister = function(name) {
            if (!di.registry) {
                return;
            }
            var lowerName = name.toLowerCase().trim();
            if (lowerName in di.registry) {
                di.registry[lowerName] = [];
            }
        }
        
        return di;
    }
        
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = DIFactory;
    } else if (typeof define !== 'undefined' && define.amd) {
        define('dijection', [], DIFactory);
    } else {
        this.Dijection = DIFactory;
    }
}.call(this);