var argv = require('minimist')(process.argv.slice(2));
var async = require('async');
var Slack = require('slack-client');
var config = require('./app/config');
var utils = require('./app/utils');
var Stall = require('./app/stall').Stall;
var PiCloud = require('./app/picloud').PiCloud;


var configFilePath = argv.c;
if (!configFilePath) {
    logger.info('Config file path must be provided with the -c argument');
    process.exit(1);
}
var appConf = config.fromFile(configFilePath);


if (require.main === module) {
    process.on('SIGINT', function() {
        process.exit();
    });
    main();
}


function main() {

    var q = async.queue(worker, 1);

    async.parallel({
        stall: connectStall(appConf.picloud),
        picloud: connectPiCloud(appConf.picloud),
        slack: connectSlack(appConf.bot)
    }, function(err, services) {
        services.slack.on('message', function (message) {
            var channel = services.slack.getChannelGroupOrDMByID(message.channel);
            var user = message.user;
            if (message.text !== appConf.app.keyword) {
                channel.send(appConf.app.messages.help);
                return;
            }
            var userTask = userTaskInQ(q, user);
            // user is either waiting, or currently being processed
            if (userTask !== false) {
                if (userTask.data.pooqStatus === 'go') {
                    channel.send(utils.randomFromArray(appConf.app.messages.timeRunningOut));
                } else {
                    channel.send(utils.randomFromArray(appConf.app.messages.queued));
                }
                return;
            }
            var task = {
                user: user,
                channel: channel,
                stall: services.stall,
                pooqStatus: ''
            };
            if (services.stall.status === 'closed' || q.length() > 0 || q.running() > 0) {
                task.pooqStatus = 'wait';
                channel.send(utils.randomFromArray(appConf.app.messages.occupied));
            } else {
                task.pooqStatus = 'go';
                channel.send(utils.randomFromArray(appConf.app.messages.availableNow));
            }
            q.push(task);
            services.picloud.pooq();
        });
    });
}


function worker(task, cb) {
    if (task.pooqStatus === 'wait') {
        var i = setInterval(function() {
            if (task.stall.status === 'open') {
                task.channel.send(utils.randomFromArray(appConf.app.messages.yourTurn));
                clearInterval(i);
                task.pooqStatus = 'go';
                startCountdown(cb);
            }
        }, appConf.app.statusInterval);
    } else if (task.pooqStatus === 'go') {
        startCountdown(cb);
    }
}


function userTaskInQ(q, user) {
    var inProcess = q.workersList();
    for (var i = 0; i < inProcess.length; i++) {
        if (inProcess[i].data.user === user) {
            return inProcess[i];
        }
    }
    for (var i = 0; i < q.tasks.length; i++) {
        if (q.tasks[i].data.user === user) {
            return q.tasks[i];
        }
    }
    return false;
}


function connectStall(conf) {
    return function(done) {
        var socket = utils.socket(conf.sub);
        var s = new Stall(socket);
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


function connectPiCloud(conf) {
    return function(done) {
        var socket = utils.socket(conf.pub);
        var p = new PiCloud(socket);
        p.once('ready', function () {
            console.log('PiCloud connected');
            done(null, p);
        });
        p.on('error', function(err) {
            console.log('PiCloud error');
            console.log(err);
            process.exit(102);
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
            process.exit(103);
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
