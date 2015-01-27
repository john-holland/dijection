var DI = require("../dijection")();
    
module.exports = DI({
    "escapedDatasource": DI(function(_datasource, appender) {
        return escape(_datasource + (appender ? appender : ""));
    }),
    "datasource": "http://github.com/john-holland"
});