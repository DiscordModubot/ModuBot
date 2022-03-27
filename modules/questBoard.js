module.exports = {
    __help : {
        //This is used by the popular help module
        moduleName: "Quest Board",
        description: "Module providing quest board functionality",
        commands: [
            {
                name : "setQuestBoard",
                description : "Set a text channel to be the quest board",
                syntax : "setQuestBoard {id}"
            },
            {
                name : "postQuest",
                description : "Posts a quest to the quest board",
                syntax : "postQuest {name} | {description} | {dd/mm/yyyy hh/mm} | {max players}"
            }
        ],
        hidden: false
    },

    __cleanup : () => {
        fs.writeFileSync("./data/questBoard", JSON.stringify(module_data.questBoard.data, null, "\t"));
    },

    __iter : () => {
        Object.keys(module_data.questBoard.data).forEach((guildId) => {
            module_data.questBoard.data[guildId].quests.forEach((quest, index) => {
                if ((quest !== null) && (quest.time) && quest.time < Date.now()) {
                    //Evaluate event
                    global.client.channels.fetch(module_data.questBoard.data[guildId].questBoard)
                        .then((c) => {
                            c.messages.fetch(quest.messageId)
                                .then((m) => {
                                    m.delete({timeout: 5000})
                                        .catch(console.error);

                                    let users = [];
                                    let alts = [];
                                    quest.joined.forEach((id) => {
                                        users.push(`<@${id}>`)
                                    });
                                    quest.alts.forEach((id) => {
                                        alts.push(`<@${id}>`)
                                    });
                                    let value = users.join(", ") || "None";
                                    let aValue = alts.join(", ") || "None";

                                    c.send(module_data.meowscular.talk(`Calling: ${value}\nFor: ${quest.embed.title}\nWith Alts: ${aValue}`, "success"))
                                        .then((m) => {
                                            m.delete({timeout: 300000}) //5 min
                                        });
                                    delete module_data.questBoard.data[guildId].quests[index]
                                })
                        })
                }
            })
        })
    },

    ready : () => {
        if (!global.fs) global.fs = require("fs");
        module_data.questBoard.data = {};
        //Localise the configuration data.
        if (global.fs.existsSync("./data/questBoard")) {
            module_data.questBoard.data = JSON.parse(fs.readFileSync("./data/questBoard", "utf8"))
        } else {
            fs.writeFileSync("./data/questBoard", "{}")
        }
        setInterval(module.exports.__iter,1000) //Each second
    },

    message : (msg) => {
        switch (msg.cmd) {
            case "setquestboard":
                if (!msg.guild || !msg.member.hasPermission("ADMINISTRATOR")) {
                    msg.channel.tempSend(module_data.meowscular.talk("You do not have permission to run this command.", "fail"))
                } else {
                    if (msg.arg[0] && msg.guild.channels.cache.has(msg.arg[0]) && msg.guild.channels.cache.get(msg.arg[0]).type === "text") {
                        module_data.questBoard.data[msg.guild.id] = {
                            questBoard: msg.arg[0],
                            quests: []
                        };
                        msg.channel.tempSend(module_data.meowscular.talk("Questboard set up!", "success"))
                    } else {
                        msg.channel.tempSend(module_data.meowscular.talk("Invalid Parameters!", "fail"))
                    }
                }
                break;
            case "postquest":
                /*
                    arg:

                */
                if (!module_data.questBoard.data[msg.guild.id]) {
                    msg.channel.tempSend(module_data.meowscular.talk("There is no Questboard in this guild!", "fail"));
                    return;
                }
                let args = msg.content.split(" ").splice(1).join(" ").split("|");
                let name = args[0] || "Meowscular Chef's epic cooking session";
                let description = args[1] || "Meow! That's hot!";
                let time = new Date(Date.parse(args[2].replace(/([0-9]+)\/([0-9]+)/,'$2,$1')));
                let maxPlayers = Number(args[3] || 5);

                if (isNaN(time)) {
                    msg.channel.tempSend(module_data.meowscular.talk("Invalid Time, meowster! Remember to put it as dd/mm/yyyy hh/mm where the meowurs and minutes are in 24-meowur format", "fail"));
                } else if (isNaN(maxPlayers) || !Number.isInteger(maxPlayers)) {
                    msg.channel.tempSend(module_data.meowscular.talk("Invalid Max Players, hunter! Remember to put it as a integer!", "fail"));
                } else {
                    let data = ({
                        author: msg.member.id,
                        time: time,
                        maxPlayers: maxPlayers,
                        joined: [],
                        alts: [],
                        messageId: NaN,
                        embed: {
                            title: name,
                            description: description,
                            color: msg.member.displayColor,
                            timestamp: time,
                            footer: {
                                icon_url: msg.member.user.displayAvatarURL,
                                text: `Created by ${msg.member.displayName}`
                            },
                            fields: [
                                {
                                    name: "Meowsters Joined:",
                                    value: "None",
                                    inline: true
                                },
                                {
                                    name: "Alternatives:",
                                    value: "None",
                                    inline: true
                                },
                                {
                                    name: `0/${maxPlayers}`,
                                    value: `Time: ${time.toLocaleDateString('en-GB', {hour: "numeric", minute: "numeric"})}`,
                                },
                            ]
                        }
                    });
                    let channel = msg.guild.channels.resolve(module_data.questBoard.data[msg.guild.id].questBoard)
                    channel.send('', {
                        embed: data.embed
                    }).then((message) => {
                        message.react("➕")
                            .catch(console.error);
                        data.messageId = message.id;
                        module_data.questBoard.data[msg.guild.id].quests.push(data)
                    })
                }
                break;
        }
    },

    __updateQuest: (client, guildData, quest, guildID) => {
        let users = [];
        let alts = [];
        let guild = client.guilds.resolve(guildID);
        quest.joined.forEach((id) => {
            users.push(guild.members.resolve(id).displayName)
        });
        quest.alts.forEach((id) => {
            alts.push(guild.members.resolve(id).displayName)
        });

        quest.embed.fields[0].value = users.join(", ") || "None";
        quest.embed.fields[1].value = alts.join(", ") || "None";
        quest.embed.fields[2].name = `${quest.joined.length}/${quest.maxPlayers}`;

        client.channels.fetch(guildData.questBoard)
            .then((c) => {
                if (!c) return;
                    c.messages.fetch(quest.messageId)
                        .then((message) => {
                            message.edit('', {
                                embed: quest.embed
                            })
                                .catch(console.error)
                        })
            })
    },

    messageReactionAdd: (reaction, user) => {
        if (user.bot) return;
        if (module_data.questBoard.data[reaction.message.guild.id] && reaction.emoji.toString() === "➕") {
            let guildData = module_data.questBoard.data[reaction.message.guild.id]
            let quest = guildData.quests.find(element => (element && element.messageId === reaction.message.id));
            if (!quest) return;
            if (quest.maxPlayers === quest.joined.length) {
                //Alternative
                quest.alts.push(user.id);
                module.exports.__updateQuest(reaction.client, guildData, quest, reaction.message.guild.id)
            } else {
                quest.joined.push(user.id);
                module.exports.__updateQuest(reaction.client, guildData, quest, reaction.message.guild.id)
            }
        }
    },

    messageReactionRemove: (reaction, user) => {
        if (user.bot) return;
        if (module_data.questBoard.data[reaction.message.guild.id] && reaction.emoji.toString() === "➕") {
            let guildData = module_data.questBoard.data[reaction.message.guild.id];
            let quest = guildData.quests.find(element => (element && element.messageId === reaction.message.id));
            if (!quest) return;
            if (quest.joined.indexOf(user.id) === -1) {
                quest.alts.splice(quest.alts.indexOf(user.id), 1);
            } else {
                quest.joined.splice(quest.joined.indexOf(user.id), 1);
            }
            module.exports.__updateQuest(reaction.client, guildData, quest, reaction.message.guild.id)
        }
    }
};