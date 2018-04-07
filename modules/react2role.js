let data = {};

module.exports = {

    __help: {
        moduleName: "React2Role",
        description: "A module providing support for reaction based role giving.",
        commands: [
            {
                name : "Help",
                description : "Display help on modules.",
                syntax : "help {moduleName}"
            }
        ],
        hidden: false
    },

    __init: async () => {
        if (!global.fs) global.fs = require("fs");
        data.react2roles = {};
        if (fs.existsSync("./data/react2role")) {
            data.react2roles = JSON.parse(fs.readFileSync("./data/react2role", "utf8"))
        } else {
            fs.writeFileSync("./data/react2role", "{}")
        }
        Object.values(data.react2roles).forEach(async (r2r, index) => {
            await global.client.guilds.get([r2r.guild]).channels.get(r2r.channel).fetchMessage(Object.keys(data.react2roles)[index])
        })
    },

    __cleanup: () => {
        console.verbose("Translating react2role data to non-volatile memory");
        fs.writeFileSync(JSON.stringify(data.react2roles))
    },

    messageReactionAdd: (reaction, user) => {
        if (!data.react2roles[reaction.message.id]) return;
        let r2r = data.react2roles[reaction.message.id];
        if (!r2r.roles[reaction.emoji.toString()]) return;
        user.addRole(r2r.roles[reaction.emoji.toString()], "React2Role")
            .catch((err) => {
                console.error(err)
            })
    },

    messageReactionRemove: (reaction, user) => {
        if (!data.react2roles[reaction.message.id]) return;
        let r2r = data.react2roles[reaction.message.id];
        if (!r2r.roles[reaction.emoji.toString()]) return;
        user.removeRole(r2r.roles[reaction.emoji.toString()], "React2Role")
            .catch((err) => {
                console.error(err)
            })
    }

};