This is a Slack bot that interacts with [Stall-Monitor-Raspberry-Pi](https://github.com/projectweekend/Stall-Monitor-Raspberry-Pi) so that a user can check the status of the bathroom stall and get an update when it becomes available.


## Run it using Docker


### Pull it
```
docker pull projectweekend/stall-monitor-slack-bot
```


## Configure it
Configuration is saved in a JSON file and passed to the bot via a command line arg:
```
{
    "bot": {
        "token": "your Slack bot token",
        "autoReconnect": true,
        "autoMark": true
    },
    "picloud": {
        "sub": {
            "protocol": "wss:",
            "slashes": true,
            "host": "a picloud server host",
            "pathname": "/subscribe",
            "query": {
                "apiKey": "picloud api key",
                "clientName": "whatever"
            }
        },
        "pub": {
            "protocol": "wss:",
            "slashes": true,
            "host": "a picloud server host",
            "pathname": "/publish",
            "query": {
                "apiKey": "picloud api key",
                "clientName": "whatever"
            }
        }
    },
    "app": {
        "countdownDelay": 60000,
        "statusInterval": 100,
        "messages": {
            "help": "Send `?` to check stall status.",
            "availableNow": [
                "Today is your lucky day, if you leave right now--right now!  You can do your business- you can perform your shameful deed- without the slightest impedance.  Go!  Go, be with- well, yes.  Go.",
                "Nothing is in your way, nothing can stop you this time.",
                "Could you go?  Absolutely, there's no question.  But, ah- should you?"
            ],
            "yourTurn": [
                "You'll be absolutely delighted to know that the stall is now available, and you can begin your journey.",
                "This is it, this is what you were waiting for.  The light is green, it's all clear ahead, if you go now you can make it- you can grab it with both hands, you can turn the key and rev the engine and- you're off!",
                "The throne lays bare and you are King Arthur, pull your sword and claim that which is yours- that which has always been yours!"
            ],
            "timeRunningOut": [
                "You're here!  You're still here, and I couldn't say why.",
                "All time is finite, but some time is more finite than the rest.  Ah- this is such a time.",
                "Poop now, or forever, well- aha, well, you know."
            ],
            "occupied": [
                "Ah, you're looking for a little expulsion here yes?  Want to lighten the load?  Let me look into that for you.  Let me get you, let me get you on the list--yes!  Yes, we have it now, when there's a slot you'll be the first to know.",
                "When you gotta go, you gotta- oh, no!  No, the forces, the forces in your body must yield, they must be calm.  Soon you will have your release, but wait- just wait.",
                "You can feel it, can't you?  It burgeons within, it is like new life, it wants to come into the world screaming, screaming the chorus of its existence!  No, the time is not ripe.  But soon."
            ],
            "queued": [
                "Patience, like the great Buddha at Savatthi, is virtuous.  Heheheheh ahhreheheheHeh- heh-Haah haHaah!",
                "You have your place, your time will come.  All of our times will, well, come.",
                "This- this cacophony, these messages! You think it's funny, to, to goad me like this?  To place this kind of evil upon me?"
            ]
        },
        "keyword": "?"
    }
}
```


## Launch it

A volume needs to be mounted into the running container for the config file and one for the log file:

```
docker run -v /path/to/config.json:/src/config.json projectweekend/stall-monitor-slack-bot -c ./config.json
```
