var DI = require('./context');

DI(function(_escapedDatasource, _datasource) {
    var escapedDatasource = _escapedDatasource("/dijection");
    
    console.log(_datasource + " " + escapedDatasource);
})();