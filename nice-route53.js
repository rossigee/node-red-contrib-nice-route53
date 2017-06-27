module.exports = function(RED) {
    "use strict";
    var Route53 = require("nice-route53");

    function NiceRoute53Node(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        var credentials = RED.nodes.getNode(config.creds);
        if(!credentials) {
            node.error("No AWS credentials configured.", config);
        }

        node.on('input', function (msg) {
            var r53 = new Route53({
                accessKeyId: credentials.aws_access_key,
                secretAccessKey : credentials.aws_secret_key,
            });

            // By default, handle errors and pass results on in payload
            var defaultHandler = function(err, res) {
              if(err) {
                node.error(err, msg);
              }
              else {
                msg.payload = res;
                node.send(msg);
              }
            };

            // For now, user is responsible for sending the payload as
            // the arguments to the method.
            var args = msg.payload;
            if(config.method == "zones") {
              r53.zones(defaultHandler);
            }
            else if(config.method == "createZone") {
              r53.createZone(args, defaultHandler);
            }
            else if(config.method == "zoneInfo") {
              r53.zoneInfo(args, defaultHandler);
            }
            else if(config.method == "records") {
              r53.records(args, defaultHandler);
            }
            else if(config.method == "setRecord") {
              r53.setRecord(args, defaultHandler);
            }
            else if(config.method == "delRecord") {
              r53.delRecord(args, defaultHandler);
            }
            else if(config.method == "getChange") {
              r53.getChange(args, defaultHandler);
            }
            else if(config.method == "pollChangeUntilInSync") {
              r53.pollChangeUntilInSync(args, defaultHandler);
            }
            else {
              node.error("Method '" + config.method + "' not implemented.");
            };

            return msg;
        });
    }
    RED.nodes.registerType("nice-route53", NiceRoute53Node);
};
