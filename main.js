var argv = require('minimist')(process.argv.slice(2));
var Slack = require('slack-client');
var config = require('./app/config');


if (require.main === module) {
    main();
}


function main() {
    var configFilePath = argv.c;
    if (!configFilePath) {
        logger.info('Config file path must be provided with the -c argument');
        process.exit(1);
    }

    var appConf = config.fromFile(configFilePath);

    var slack = new Slack(appConf.bot.token, appConf.bot.autoReconnect, appConf.bot.autoMark);
    slack.on('open', function () {
        console.log(slack.team.name);
        console.log(slack.self.name);
    });
    slack.on('message', function (message) {
        console.log(message);
    });
    slack.on('error', function (err) {
        console.log(err);
    });
    slack.login();
}
