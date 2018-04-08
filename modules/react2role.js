let data = {};

module.exports = {

    __help: {
        moduleName: "React2Role",
        description: "A module providing support for reaction based role giving.",
        commands: [
            {
                name : "Set_R2R",
                description : "Transform a previous message into a R2R message.",
                syntax : "set_r2r [msg_id] {emoji|role_id} {emoji|role_id} {...}"
            },
            {
                name : "New_R2R",
                description : "Make the bot create a new R2R message.",
                syntax : "new_r2r \`[content]\` {emoji|role_id} {emoji|role_id} {...}"
            }
        ],
        hidden: false
    },

    ready: () => {
        if (!global.fs) global.fs = require("fs");
        data.react2roles = {};
        if (fs.existsSync("./data/react2role")) {
            data.react2roles = JSON.parse(fs.readFileSync("./data/react2role", "utf8"))
        } else {
            fs.writeFileSync("./data/react2role", "{}")
        }
        Object.values(data.react2roles).forEach((r2r, index) => {
            global.client.guilds.get(r2r.guild).channels.get(r2r.channel).fetchMessage(Object.keys(data.react2roles)[index])
                .catch(console.error)
        })
    },

    __cleanup: () => {
        console.verbose("Translating react2role data to non-volatile memory");
        fs.writeFileSync("./data/react2role", JSON.stringify(data.react2roles))
    },

    messageReactionAdd: (reaction, user) => {
        if (user.bot) return;
        if (!data.react2roles[reaction.message.id]) return;
        let r2r = data.react2roles[reaction.message.id];
        if (!r2r.roles[reaction.emoji.toString()]) return;
        reaction.message.guild.fetchMember(user.id)
            .then((member) => {
                member.addRole(r2r.roles[reaction.emoji.toString()], "React2Role")
                    .catch((err) => {
                        console.error(err)
                    })
            })

    },

    messageReactionRemove: (reaction, user) => {
        if (user.bot) return;
        if (!data.react2roles[reaction.message.id]) return;
        let r2r = data.react2roles[reaction.message.id];
        if (!r2r.roles[reaction.emoji.toString()]) return;
        reaction.message.guild.fetchMember(user.id)
            .then((member) => {
                member.removeRole(r2r.roles[reaction.emoji.toString()], "React2Role")
                    .catch(console.error)
            })
    },

    messageDelete: (msg) => {
        if (data.react2roles[msg.id]) {
            console.verbose("deleted react2role message");
            delete data.react2roles[msg.id]
        }
    },

    message: (msg) => {
        if (msg.content.toLowerCase().startsWith(`${global.CONFIG.PREFIX}set_r2r`)) {
            let r2r = {
                guild : "",
                channel : "",
                roles: {}
            };
            let msgid = msg.content.split(" ")[1];
            let roles = msg.content.split(" ").slice(2).filter(n => true);
            if (!msgid || !roles) {
                msg.channel.send("Syntax Error. Please check the help page.")
                    .then((message) => {
                        msg.react("❌")
                            .then(() => {
                                message.delete(10000)
                            })
                    });
                return;
            }
            let stop = false;
            Object.keys(r2r.roles).forEach((emoji) => {
                if (emoji.length !== 1) {
                    if (!global.client.emojis.get(emoji.split(":").slice(-1)[0].slice(0, -1))) {
                        //if client does not have emoji
                        msg.channel.send(`Api Error. Client does not have access to \`${emoji}\``)
                            .then((message) => {
                                msg.react("❌")
                                    .then(() => {
                                        message.delete(10000)
                                    })
                            });
                        stop = true
                    }
                }
            });
            if (stop) return;
            msg.channel.fetchMessage(msgid)
                .then((r2rmsg) => {
                    roles.forEach((data) => {
                        let roledata = data.split("|");
                        r2r.roles[roledata[0]] = roledata[1]
                    });
                    Object.keys(r2r.roles).forEach((emoji) => {
                        r2rmsg.react(global.client.emojis.get(emoji.split(":").slice(-1)[0].slice(0, -1)))
                            .catch(console.error)
                    });
                    r2r.guild = msg.guild.id;
                    r2r.channel = msg.channel.id;
                    data.react2roles[r2rmsg.id] = r2r;
                    msg.react("✅")
                        .catch(console.error)
                })
                    .catch(console.error)
                .catch(() => {
                    msg.channel.send(`Api Error. Cant find msg with msg id ${msgid}`)
                        .then((message) => {
                            msg.react("❌")
                                .then(() => {
                                    message.delete(10000)
                                })
                        });
                })
        } else if (msg.content.toLowerCase().startsWith(`${global.CONFIG.PREFIX}new_r2r`)) {
            let r2r = {
                guild : "",
                channel : "",
                roles: {}
            };
            let content = msg.content.split("`").slice(1,-1).join("`");
            let roles = msg.content.split("`").slice(-1)[0].split(" ").filter(n => true);
            if (!content || !roles) {
                msg.channel.send("Syntax Error. Please check the help page.")
                    .then((message) => {
                        msg.react("❌")
                            .then(() => {
                                message.delete(10000)
                            })
                    });
                return;
            }
            roles.forEach((data) => {
                if (data) {
                    let roledata = data.split("|");
                    r2r.roles[roledata[0]] = roledata[1]
                }
            });
            let stop = false;
            Object.keys(r2r.roles).forEach((emoji) => {
                    if (emoji.length !== 1) {
                        console.verbose(emoji.split(":").slice(-1)[0].slice(-1));
                        if (!global.client.emojis.get(emoji.split(":").slice(-1)[0].slice(0, -1))) {
                            //if client does not have emoji
                            msg.channel.send(`Api Error. Client does not have access to \`${emoji}\``)
                                .then((message) => {
                                    msg.react("❌")
                                        .then(() => {
                                            message.delete(10000)
                                        })
                                });
                            stop = true
                        }
                    }
            });
            if (stop) return;
            msg.channel.send(content)
                .then((message) => {
                    Object.keys(r2r.roles).forEach((emoji) => {
                        message.react(global.client.emojis.get(emoji.split(":").slice(-1)[0].slice(0, -1)))
                            .catch(console.error)
                    });
                    r2r.guild = msg.guild.id;
                    r2r.channel = msg.channel.id;
                    data.react2roles[message.id] = r2r;
                    msg.react("✅")
                        .catch(console.error)
                })
                .catch(console.error)
        }
    }
};