module.exports = {
    __help : {
        moduleName: "Help",
        description: "A module providing the `help` command.",
        commands: [
            {
                name : "Help",
                description : "Display help on modules.",
                syntax : "help {moduleName}"
            }
        ],
        hidden: false
    },

    message: (msg) => {
        if (!msg.content.toLowerCase().startsWith(`${global.CONFIG.PREFIX}help`)) return;
        let embed = {
            embed: {
                title: "❓ Help ❓",
                fields: []
            }
        };
        if (!msg.content.split(" ")[1]) {
            //No arguments
            Object.values(modules).forEach((m) => {
                if (m.__help && !m.__help.hidden) embed.embed.fields.push({
                    name: m.__help.moduleName,
                    value: m.__help.description
                });
            })
        } else {
            //Arguments
            let modname = msg.content.split(" ").slice(1).join(" ").toLowerCase();
            Object.values(modules).forEach((m) => {
                if (m.__help && m.__help.moduleName.toLowerCase() === modname) {
                    embed.embed.title += ` | ⚙ ${m.__help.moduleName} ⚙`;
                    if (!m.__help.commands) {
                        embed.embed.fields.push({
                            name : "No commands!",
                            value : "🤔"
                        })
                    } else {
                        m.__help.commands.forEach((c) => {
                            embed.embed.fields.push({
                                name: c.name,
                                value: `${c.description}\n\`${global.CONFIG.PREFIX + c.syntax}\``
                            })
                        })
                    }
                }
            });
            if (!embed.embed.fields) {
                embed.embed.fields.push({
                    name: "Not a real module!",
                    value: "🤔"
                })
            }
        }
        if (msg.channel.type !== 'dm') {
            msg.reply("\nSent you a DM with details!")
                .then((m) => {
                    m.delete(5000)
                })
        }
        msg.author.send(embed)
    }
};