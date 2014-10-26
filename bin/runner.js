
var path = require("path");
var fs = require("fs.extra");
var winston = require("winston");
var sleep = require('sleep');

var lib = path.resolve(__dirname, "..", "lib");
var streams = require(path.join(lib, "streams"));
var InputStream = streams.InputStream;
var OutputStream = streams.OutputStream;
var NodePhotoSyncUtils = require(path.join(lib, 'utils')).NodePhotoSyncUtils;

var consoleLoggerTransport = new winston.transports.Console({
                               level: (process.env.LOG_LEVEL || "info"),
                               dumpExceptions : true,
                               showStack : true,
                               colorize : true
                             });

NodePhotoSyncUtils.setLogger([ consoleLoggerTransport ]);

NodePhotoSyncUtils.logger.info("Running job: "+process.argv[2]);

fs.readFile(process.argv[2], function(error, data) {
  var job = JSON.parse(data);

  var inputJob = new InputStream(job.i);
  var outputJob = new OutputStream(job.o);

  NodePhotoSyncUtils.logger.debug("Opening input stream");
  inputJob.runner()(function(error, inputStream) {
    if (error) {
      NodePhotoSyncUtils.logger.error(error);
    } else {
      NodePhotoSyncUtils.logger.debug("Opening output stream");
      outputJob.runner()(inputStream, function(error) {
        if (error) {
          NodePhotoSyncUtils.logger.error(error);
        }
      })
    }
  });
});
