let data = {
    automod: {
        modifiers: {
            "includes-word" : (text, mod) => {return text.split(/[a-z]+\s*/).indexOf(mod) !== -1},
            "includes" : (text, mod) => {return text.includes(mod)},
            "starts-with" : (text, mod) => {return text.startsWith(mod)},
            "ends-with" : (text, mod) => {return text.endsWith(mod)},
            "full-exact" : (text, mod) => {return text === mod}
        },
        regex_mod: {
            "includes-word" : (text, regex) => {return text.search(`(${regex})|([a-z]+\s*)`) !== -1},
            "includes" : (text, regex) => {return text.search(regex) !== -1},
            "starts-with" : (text, regex) => {return text.search("^" + regex) !== -1},
            "ends-with" : (text, regex) => {return text.search(regex + "$") !== -1},
            "full-exact" : (text, regex) => {return text.replace(regex, "") === ""}
        },
        actions: {
            "delete" : (msg, automodScript) => {return msg.delete()},
            "pin" : (msg, automodScript) => {return msg.pin()},
            "react" : (msg, automodScript) => {return msg.react(automodScript.reaction)},
            "log" : (msg, automodScript) => {return new Promise((resolve) => resolve())},
            "reply" : (msg, automodScript) => {return msg.channel.send(automodScript.response)},
            "dm_reply" : (msg, automodScript) => {return msg.author.send(automodScript.response)}
        },
        display_actions: {
            "delete" : "❌ Message Delete ❌",
            "pin" : "📌 Message Pin 📌",
            "react" : "😃 Message Reacted 😃",
            "log" : "📜 Message Logged 📜",
            "reply" : "💬 Message Replied 💬",
            "dm_reply" : "👁‍🗨 Message Dm'd 👁‍🗨"
        },
        placeholder : (text, msg) => {
            text = text
                .replace("{{username}}", msg.author.username)
                .replace("{{nickname}}", msg.member.nickname)
                .replace("{{discriminator}}", msg.author.discriminator)
                .replace("{{type}}", msg.type)
                .replace("{{body}}", msg.content)
                .replace("{{id}}", msg.id)
                .replace("{{guild}}", msg.guild.name)
                .replace("{{channel}}", msg.channel.name);
            return text
        },
        embedify : (action, description, msg, color=6488064) => {
            return {
                embed: {
                    author: {
                        name: msg.author.username + msg.author.discriminator,
                        icon_url: msg.author.displayAvatarURL
                    },
                    title: "🤖AUTOMOD🤖 : " + action,
                    description: description,
                    timestamp: msg.createdAt,
                    color: color,
                    footer: {
                        text: `#${msg.channel.name}`
                    },
                    fields: [
                        {
                            name : "Message : ",
                            value : msg.content
                        }
                    ]
                }
            }
        },
        mediachecks: (mediaChecks, msg) => {
            let media = [];
            mediaChecks.forEach(value => {
                media.push(
                    value
                        .replace("username", msg.author.username)
                        .replace("nickname", msg.member.nickname)
                        .replace("discriminator", msg.author.discriminator)
                        .replace("type", msg.type)
                        .replace("body", msg.content)
                        .replace("id", msg.id)
                        .replace("guild", msg.guild.name)
                        .replace("channel", msg.channel.name)
                )
            });
            return media
        },
        matchingModifiers: (matchingModifiers, msg) => {
            let regex = false;
            let casesensitive = false;
            let mods = [];
            if (matchingModifiers.indexOf("regex") !== -1) {
                regex = true
            }
            matchingModifiers.forEach(value => {
                if (value === "case-sensitive") {
                    casesensitive = true
                }
                if (value !== "regex" && value !== "case-sensitive") {
                    if (regex) {
                        mods.push(data.automod.regex_mod[value])
                    } else {
                        mods.push(data.automod.modifiers[value])
                    }
                }
            });
            if (regex && mods.length === 0) {
                mods.push("regex")
            }
            return [regex, casesensitive, mods]
        },
        runAutomodScriptSection: (key, value, msg, automodScript) => {
            if (typeof value === "string") {
                value = [value]
            }
            let mediaChecks = data.automod.mediachecks(key.split("(")[0].replace(" ", "").split("+"), msg);
            let regex;
            let casesensitive;
            let matchingModifiers;
            [regex, casesensitive, matchingModifiers] = data.automod.matchingModifiers(key.split("(")[1].split(")")[0].replace(" ", "").split(","), msg)
            let execute = modularData.automod.check(mediaChecks, regex, casesensitive, matchingModifiers, value);
            if (automodScript.chance && execute && Math.floor(Math.random() * (1 / automodScript.chance)) !== 0) {
                execute = false
            }
            return execute
        }
    }
};

module.exports = {
    ready: () => {
        if (!global.fs) global.fs = require("fs");
        if (!global.yaml) global.yaml = require("yaml");
        data.logger = {};
        if (fs.existsSync("./data/logger")) {
            data.logger = JSON.parse(fs.readFileSync("./data/logger", "utf8"))
        } else {
            fs.writeFileSync("./data/logger", "{}")
        }
        data.automod.scripts = {};
        Object.values(data.logger).forEach((value, index) => {
            data.automod.scripts[Object.keys(data.logger)[index]] = value.scripts
        })
    },

    message: (msg) => {
        if (msg.channel.type === 'dm') return;
        if (!data.automod.scripts[msg.guild.id]) return;
        if (msg.member.bot) return;

        let scripts = data.automod.scripts[msg.guild.id];
        scripts.forEach(automodScript => {
            automodScript = global.yaml.parse(automodScript);
            if (automodScript.moderators_exempt && msg.member.hasPermission("MANAGE_GUILD"))
                //moderators_exempt test
                if (automodScript.type && automodScript.type !== msg.type) return;
                //type test
            let execute = false;
            Object.keys(automodScript).forEach(value => {
                if (value.includes("(") && value.includes(")")) {
                    if (data.automod.runAutomodScriptSection(value, automodScript[value], msg, automodScript)) {
                        execute = true
                    }
                }
            });

            if (execute) {
                if (automodScript.action) {
                    if (data.automod.actions[automodScript.action]) {
                        data.automod.actions[automodScript.action](msg, automodScript)
                            .then(() => {
                                if (typeof automodScript.log === "undefined" || automodScript.log) {
                                    data.automod.embedify(data.automod.display_actions[automodScript.action], data.automod.placeholder(automodScript.description, msg), msg)
                                }
                            })
                    }
                }
            }

        })
    }
};