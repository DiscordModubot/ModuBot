module.exports = () => {
    let CONFIG = require(global.CONFIG);

    if (global.VERBOSE) {
        console.verbose = console.log
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
    const client = new discord.Client();

    console.verbose("Importing modules");
    let modules = {};
    CONFIG.MODULES.split(" ,").forEach(file => {
        console.verbose("Importing " + file);
        modules[file] = require(`${global.MODULES}/${file}`);
        if (modules[file].__init) modules[file].__init();
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
    })
};