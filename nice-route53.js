module.exports = function(RED) {
    "use strict";
    var Route53 = require("nice-route53");

    function NiceRoute53Config(n) {
      RED.nodes.createNode(this, n);
      this.name = n.name;
      this.aws_access_key = n.aws_access_key;
      this.aws_secret_key = n.aws_secret_key;
    }
    RED.nodes.registerType("nice-route53-config", NiceRoute53Config);

    function NiceRoute53Node(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        var credentials = RED.nodes.getNode(config.credentials);

        var notify_error = function(err) {
          if(err != null) node.error(err);
        };

        try {
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
                    node.send({payload: res});
                  }
                };

                // For now, user is responsible for sending the payload as
                // the arguments to the method.
                var args = msg.payload;
                if(config.method == "zones") {
                  r53.zones(args, defaultHandler);
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
        } catch (err) {
            node.status({fill: "red", shape: "dot", text: err.message});
            node.error(err.message, msg);
        }
    }
    RED.nodes.registerType("nice-route53", NiceRoute53Node);
};
