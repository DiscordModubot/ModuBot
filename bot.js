module.exports = () => {
    global.CONFIG = require(global.CONFIG);

    if (global.VERBOSE) {
        console.verbose = console.log;
    } else {
        console.verbose = function () {
        }
    }
    if (global.QUIET) {
        console.log = function () {
        }
    }
    let TOKEN = global.TOKEN || CONFIG.TOKEN;

    let USERNAME = global.USERNAME || CONFIG.USERNAME;

    let initTime = Date.now();
    console.log("--INITIALISATION--");

    console.verbose("Importing discord.js library");
    const discord = require("discord.js");

    console.verbose("Creating discord client");
    global.client = new discord.Client();

    client.on("message", (msg) => {
        if (msg.content.startsWith(global.CONFIG.PREFIX)) {
            msg.arg = msg.content.split(" ").splice(1) || [];
            msg.cmd = msg.content.replace(CONFIG.PREFIX, "").split(" ")[0].toLowerCase();
            msg.channel.tempSend = (content, options = {}, time = 5000) => {
                return new Promise((resolve, reject) => {
                    msg.channel.send(content, options)
                        .then(() => {
                            msg.delete(time)
                                .then(() => {
                                    resolve(true)
                                })
                                .catch((err) => {
                                    reject(err)
                                })
                        })
                        .catch((err) => {
                            reject(err)
                        })
                })
            }
        }
    });

    console.verbose("Importing modules");
    global.modules = {};
    global.module_data = {};
    CONFIG.MODULES.split(", ").forEach(file => {
        console.verbose("Importing " + file);
        modules[file] = require(`${global.MODULES}/${file}`);
        module_data[file] = {};
        Object.keys(modules[file]).forEach((val, i) => {
            if (!val.startsWith("__")) client.on(val, Object.values(modules[file])[i]);
        })
    });

    console.verbose("Logging into discord client");
    client.login(TOKEN)
        .catch((err) => console.error(err))
        .then(() => {
            if (USERNAME) {
                console.verbose("Checking username");
                if (client.user.username !== USERNAME) {
                    console.verbose("Setting username");
                    client.user.setUsername(USERNAME)
                        .catch((err) => {console.error(err)})
                }
            }
            console.verbose(`Initialisation done, took ${Date.now() - initTime}ms`);
    });

    client.on("ready", () => {
        console.log(`> ${client.user.username} is up and running`)
    });

    let cleanup = (code) => {
        console.verbose(`Got exit code ${code}, cleaning up`);
        Object.values(modules).forEach((m) => {
             if (m.__cleanup) m.__cleanup(code);
        });
        console.verbose('Cleanup finished, exiting');
        process.exit(code)
    };
    process.stdin.resume();
    //process.on('exit', cleanup.bind(null));
    process.on('SIGINT', cleanup.bind(null));
    process.on('SIGUSR1', cleanup.bind(null));
    process.on('SIGUSR2', cleanup.bind(null));
};