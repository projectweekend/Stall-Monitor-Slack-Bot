var argv = require('minimist')(process.argv.slice(2));
var async = require('async');
var Slack = require('slack-client');
var config = require('./app/config');
var utils = require('./app/utils');
var Stall = require('./app/stall').Stall;

var configFilePath = argv.c;
if (!configFilePath) {
    logger.info('Config file path must be provided with the -c argument');
    process.exit(1);
}
var appConf = config.fromFile(configFilePath);


if (require.main === module) {
    main();
}


function main() {

    var q = async.queue(worker, 1);

    async.parallel({
        stall: connectStall(appConf.picloud),
        slack: connectSlack(appConf.bot)
    }, function(err, services) {
        services.slack.on('message', function (message) {
            var channel = services.slack.getChannelGroupOrDMByID(message.channel);
            var user = message.user;
            var task = {
                user: user,
                channel: channel,
                stall: services.stall,
                waiting: false
            };
            if (userInQ(q, user)) {
                channel.send("Calm down buddy.");
            } else {
                if (services.stall.status === 'closed' || q.length() > 0 || q.running() > 0) {
                    task.waiting = true;
                    channel.send("I'll let you know when the coast is clear.");
                } else {
                    channel.send("You're good to go!");
                }
                q.push(task);
                services.stall.pooq();
            }
        });
    });
}


function worker(task, cb) {
    if (task.waiting) {
        var i = setInterval(function() {
            if (task.stall.status === 'open') {
                task.channel.send("All clear. Better move quick!");
                clearInterval(i);
                startCountdown(cb);
            }
        }, appConf.app.statusInterval);
    } else {
        startCountdown(cb);
    }
}


function userInQ(q, user) {
    var inProcess = q.workersList();
    for (var i = 0; i < inProcess.length; i++) {
        if (inProcess[i].data.user === user) {
            return true;
        }
    }
    for (var i = 0; i < q.tasks.length; i++) {
        if (q.tasks[i].data.user === user) {
            return true;
        }
    }
    return false;
}


function connectStall(conf) {
    return function(done) {
        var subSocket = utils.socket(conf.sub);
        var pubSocket = utils.socket(conf.pub);
        var s = new Stall(subSocket, pubSocket);
        s.once('ready', function () {
            console.log('Stall connected');
            done(null, s);
        });
        s.on('error', function(err) {
            console.log('Stall error');
            console.log(err);
            process.exit(101);
        });
    };
}


function connectSlack(conf) {
    return function(done) {
        var s = new Slack(conf.token, conf.autoReconnect, conf.autoMark);
        s.on('open', function () {
            console.log('Slack connected');
            done(null, s);
        });
        s.on('error', function (err) {
            console.log('Slack error');
            console.log(err);
            process.exit(102);
        });
        s.login();
    };
}


function startCountdown(cb) {
    console.log('timeout started');
    setTimeout(function() {
        console.log('timeout expired');
        cb();
    }, appConf.app.countdownDelay);
}
