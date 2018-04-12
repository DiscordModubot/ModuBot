module.exports = {

    __data: {},

    __template: {},

    __default_template: {
        empty: {},

        normal: {
            embed: {
                title: "**normal**",
                description: "*This is a description*",
            }
        }
    },

    __api: {
        getLogChannel: (guild_id) => {
            return global.client.guilds.get(
                //Get Guild Object
                guild_id
            ).channels.get(
                //Get Channel Object
                module.exports.__data[guild_id]
            )
        },

        log: (data, guild_id, template="empty") => {
            template = module.exports.__template[template];
            if (!template) template = module.exports.__template[template];
            if (typeof data === "string") data = {description: data};
            data = Object.assign(template, data);
            module.exports.__api.getLogChannel(guild_id).send(data)
    },

    ready: () => {
        //Check that the 'fs' module is loaded.
        if (!global.fs) global.fs = require("fs");
        module.exports.__data.logger = {};
        //Localise the configuration data.
        if (fs.existsSync("./data/logger")) {
            module.exports.__data.logger = JSON.parse(fs.readFileSync("./data/logger", "utf8"))
        } else {
            fs.writeFileSync("./data/logger", "{}")
        }
        //Set template.
        if (fs.existsSync("./data/logger_template")) {
            module.exports.__data.template = JSON.parse(fs.readFileSync("./data/logger_template", "utf8"))
        } else {
            fs.writeFileSync("./data/logger_template", "{}")
        }
    },

    __cleanup: () => {
        fs.writeFileSync("./data/logger", JSON.stringify(module.exports.__data.logger, null, "\t"));
        //fs.writeFileSync("./data/logger_template", JSON.stringify(module.exports.__data.logger, null, "\t"));
    }

};