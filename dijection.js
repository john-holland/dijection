+function() {
    "use strict";
    //from http://merrickchristensen.com/articles/javascript-dependency-injection.html
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
        injectPrefix = ['_'],
        dependenciesPrefix = ['$'],
        _ = '_' in this ? this._ : null;

    if (typeof _ !== 'function' && typeof require === 'function') {
        var _ = require('underscore');
    }
    
    function DI(func) {
        if (!DI.registry) {
            DI.registry = { };
        }
        
        if (!func || !(typeof func == 'function' || typeof func == 'object')) {
            return null;
        }
        
        var args = func.toString().match(FN_ARGS)[1].split(/\s*,\s*/),
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
                    return DI.registry[metadata.name] && DI.registry[metadata.name].length ? DI.registry[metadata.name][0] : undefined;
                } else if (metadata.injectDependencies) {
                    return DI.registry[metadata.name] ? DI.registry[metadata.name] : [];
                } else if ('paramPosition' in metadata) {
                    return argumentsCopy.length && argumentsCopy.length > metadata.paramPosition ? argumentsCopy[metadata.paramPosition] : undefined;
                } else {
                    return undefined;
                }
            }));
        };
    }
    
    DI.register = function(name, value) {
        if (!DI.registry) DI.registry = { };
        var lowerName = name.toLowerCase().trim();
        DI.registry[lowerName] = DI.registry[lowerName] || [];
        
        DI.registry[lowerName].unshift(value);
    }
    
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = DI;
    } else if (typeof define !== 'undefined' && define.amd) {
        define('dijection', [], DI);
    } else {
        this.DI = DI;
    }
}.call(this);