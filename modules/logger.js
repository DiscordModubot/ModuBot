module.exports = {

    ready: () => {
        //Initialise Data
        global.module_data.logger = {
            api: {
                getLogChannel: (guild_id) => {
                    return global.client.guilds.get(
                        //Get Guild Object
                        guild_id
                    ).channels.get(
                        //Get Channel Object
                        module_data.logger.logger[guild_id]
                    )
                },

                log: (data, guild_id) => {
                    module_data.logger.api.getLogChannel(guild_id).send(data)
                }
            }
        };
        //Check that the 'fs' module is loaded.
        if (!global.fs) global.fs = require("fs");
        module_data.logger.logger = {};
        //Localise the configuration data.
        if (fs.existsSync("./data/logger")) {
            module_data.logger.logger = JSON.parse(fs.readFileSync("./data/logger", "utf8"))
        } else {
            fs.writeFileSync("./data/logger", "{}")
        }
    },

    __cleanup: () => {
        fs.writeFileSync("./data/logger", JSON.stringify(module_data.logger.logger, null, "\t"));
    },

    message: function (msg) {
    }

};