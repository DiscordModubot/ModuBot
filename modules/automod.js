/*
The format of scripts in ./data/automod is as follows:

{
    "000000000000000000": [ //The guild ID
        {
            description: "Test Script",
            priority: 1, //Only used for defining. Put desired order in array order.
            execute_on: "message",  //execute on the "message" client event.
            type: "DEFAULT",  //check that the message is this type.
            executions: [
                {
                    data_set: "body",  //the data set to check by.
                    comparisons: [
                        "case-sensitive", //indentifiers of the type of comparison
                        "includes"
                    ],
                    values: [
                        "John Snow" //values to check the data_set to, based on the comparisons.
                    ]
                }
            ],
            actions: [
                "react" //the actions to execute if one of the executions is successful.
            ],
            chance: 1, //100%
            reactions: [
                "✅", //The reaction(s) to be used for the 'react' action
            ],
            response: "You can use placeholders here, {{username}}", //The content response used for the 'reply' and 'dm_reply' action.
            log: true //Boolean stating whether the event should be logged
        }
    ]
};
*/

module.exports = {
    ready: () => {
        if (!global.Text_diff) global.Text_diff = require("text-diff");
        global.module_data.automod = {
            api: {
                check: (pure_data, comparisons, values) => {
                    let data = pure_data.toLowerCase();
                    let regex = false;
                    let case_s = false;
                    let exe = false;
                    let temp = undefined;
                    let temp2 = undefined;
                    comparisons.forEach((comparison) => {
                        if (comparison === "regex") regex = true;
                        if (comparison === "case-sensitive") {case_s = true; data = pure_data;}
                        if (comparison !== "regex" || comparison !== "case-sensitive") {
                            values.forEach((value) => {
                                if (!case_s) value = value.toLowerCase();
                                switch (comparison) {
                                    case "includes-word":
                                        if (!regex && data.split(/[a-z]+\s*/).indexOf(value) !== -1) exe = true;
                                        if (regex && data.search(`(${value})|([a-z]+\s*)`) !== -1) exe = true;
                                        break;
                                    case "includes":
                                        if (!regex && data.includes(value)) exe = true;
                                        if (regex && data.search(value) !== -1) exe = true;
                                        break;
                                    case "starts-with":
                                        if (!regex && data.startsWith(value)) exe = true;
                                        if (regex && data.search(`^${value}`) !== -1) exe = true;
                                        break;
                                    case "ends-with":
                                        if (!regex && data.endsWith(value)) exe = true;
                                        if (regex && data.search(`${value}$`) !== -1) exe = true;
                                        break;
                                    case "full-exact":
                                        if (!regex && data === value) exe = true;
                                        if (regex && data.replace(value, "") === "") exe = true;
                                        break;
                                    case "larger":
                                        temp = (isNaN(data)) ? data:parseFloat(data);
                                        temp2 = (isNaN(value)) ? data:parseFloat(value);
                                        console.log(temp, temp2);
                                        if (temp > value) exe = true;
                                        break;
                                    case "smaller":
                                        temp = (isNaN(data)) ? data:parseFloat(data);
                                        temp2 = (isNaN(value)) ? data:parseFloat(value);
                                        if (temp < value) exe = true;
                                        break;
                                }
                            })
                        }
                    });
                    return exe
                },
                message: {
                    resp_placeholder: (values, msg) => {
                        if (typeof values !== "object") values = [values];
                        return values.map((v) => {
                            return v
                                .replace("{{user-id}}",         msg.author.id)
                                .replace("{{username}}",        msg.author.username)
                                .replace("{{nickname}}",        msg.member.nickname)
                                .replace("{{discriminator}}",   msg.author.username)
                                .replace("{{type}}",            msg.type)
                                .replace("{{body}}",            msg.content)
                                .replace("{{id}}",              msg.id)
                                .replace("{{guild-name}}",      msg.guild.name)
                                .replace("{{guild-id}}",        msg.guild.id)
                                .replace("{{guild-acronym}}",   msg.guild.nameAcronym)
                                .replace("{{guild-owner-user}}",msg.guild.owner.user.username)
                                .replace("{{guild-owner-nick}}",msg.guild.owner.nickname)
                                .replace("{{guild-owner-id}}",  msg.guild.owner.id)
                        })
                    },
                    data_placeholder: (value, msg) => {
                        return module_data.automod.api.message.resp_placeholder(`{{${value}}}`, msg)[0]
                    },
                    execute: (script, msg) => {
                        script.actions.forEach((v) => {
                            switch (v) {
                                case "delete":
                                    msg.delete();
                                    break;
                                case "pin":
                                    msg.pin();
                                    break;
                                case "react":
                                    script.reactions.forEach((reaction) => [
                                        msg.react(reaction)
                                    ]);
                                    break;
                                case "log":
                                    if (!script.log) module_data.automod.api.message.log(script, msg);
                                    break;
                                case "reply":
                                    msg.channel.send(module_data.automod.api.message.resp_placeholder(script.response, msg));
                                    break;
                                case "dm_reply":
                                    msg.author.dmChannel.send(module_data.automod.api.message.resp_placeholder(script.response, msg));
                                    break;
                            }
                        });
                        if (script.log) module_data.automod.api.message.log(script, msg);
                    },
                    log: (script, msg) => {
                        let title   = `Action: ${script.actions.map((v => {return v[0].toUpperCase()+v.slice(1)})).join("; ")}`;
                        let body    = `\n${msg.content}`;
                        let footer  = `${msg.member.nickname || msg.author.username}#${msg.author.discriminator} • <@${msg.id}>\nScript: ${script.description}`;
                        module_data.logger.api.log(`**__${title}__**\n\`\`\`${body}\`\`\`\n*${footer}*`, msg.guild.id)
                    }
                },
                messageUpdate: {
                    resp_placeholder: (values, oldmsg, newmsg) => {
                        if (typeof values !== "object") values = [values];
                        let diff = new Text_diff();
                        let diffval = diff.main(oldmsg.content, newmsg.content);
                        let charcng = 0;
                        diffval.forEach((d) => {
                            charcng += Math.abs(d[0]) * d[1].length
                        });
                        charcng /= oldmsg.content.length;
                        return values.map((v) => {
                            return v
                                .replace("{{user-id}}",         newmsg.author.id)
                                .replace("{{username}}",        newmsg.author.username)
                                .replace("{{nickname}}",        newmsg.member.nickname)
                                .replace("{{discriminator}}",   newmsg.author.username)
                                .replace("{{type}}",            newmsg.type)
                                .replace("{{new-body}}",        newmsg.content)
                                .replace("{{new-id}}",          newmsg.id)
                                .replace("{{old-body}}",        oldmsg.content)
                                .replace("{{old-id}}",          oldmsg.id)
                                .replace("{{guild-name}}",      newmsg.guild.name)
                                .replace("{{guild-id}}",        newmsg.guild.id)
                                .replace("{{guild-acronym}}",   newmsg.guild.nameAcronym)
                                .replace("{{guild-owner-user}}",newmsg.guild.owner.user.username)
                                .replace("{{guild-owner-nick}}",newmsg.guild.owner.nickname)
                                .replace("{{guild-owner-id}}",  newmsg.guild.owner.id)
                                .replace("{{percent-change}}",  charcng.toString())
                        })
                    },
                    data_placeholder: (value, oldmsg, newmsg) => {
                        return module_data.automod.api.messageUpdate.resp_placeholder(`{{${value}}}`, oldmsg, newmsg)[0]
                    },
                    execute: (script, oldmsg, newmsg) => {
                        script.actions.forEach((v) => {
                            switch (v) {
                                case "delete":
                                    newmsg.delete();
                                    break;
                                case "pin":
                                    newmsg.pin();
                                    break;
                                case "react":
                                    script.reactions.forEach((reaction) => [
                                        newmsg.react(reaction)
                                    ]);
                                    break;
                                case "log":
                                    if (!script.log) module_data.automod.api.messageUpdate.log(script, oldmsg, newmsg);
                                    break;
                                case "reply":
                                    newmsg.channel.send(module_data.automod.api.messageUpdate.resp_placeholder(script.response, oldmsg, newmsg));
                                    break;
                                case "dm_reply":
                                    newmsg.author.dmChannel.send(module_data.automod.api.messageUpdate.resp_placeholder(script.response, oldmsg, msg));
                                    break;
                            }
                        });
                        if (script.log) module_data.automod.api.messageUpdate.log(script, oldmsg, newmsg);
                    },
                    log: (script, oldmsg, newmsg) => {
                        let title   = `Action: ${script.actions.map((v => {return v[0].toUpperCase()+v.slice(1)})).join("; ")}`;
                        let body    = `\n${oldmsg.content}\n--\n${newmsg.content}`;
                        let footer  = `${newmsg.member.nickname || newmsg.author.username}#${newmsg.author.discriminator} • <@${newmsg.id}>\nScript: ${script.description}`;
                        module_data.logger.api.log(`**__${title}__**\n\`\`\`${body}\`\`\`\n*${footer}*`, newmsg.guild.id)
                    }
                }
            }
        };
        if (!global.module_data.logger) {
            console.warn("Automod could not find 'logger'. Please ensure that the 'logger' module is enabled before 'automod'.")
        }
        if (fs.existsSync("./data/automod")) {
            module_data.automod.scripts = JSON.parse(fs.readFileSync("./data/automod", "utf8"))
        } else {
            fs.writeFileSync("./data/automod", "{}");
            module_data.automod.scripts = {}
        }
    },

    message: (msg) => {
        if (msg.author.bot) return;
        let scripts = module_data.automod.scripts[msg.guild.id];
        if (scripts) {
            console.verbose("Testing message on automod scripts");
            //For each script that exists for the guild
            scripts.forEach((v) => {
                //Execute the script
                console.verbose(`Testing message on "${v.description}"`);
                //Check that the execute_on, type and chance fields are fulfilled.
                if (v.execute_on === "message" && v.type === msg.type && v.chance > Math.random()) {
                    //Check each execution
                    v.executions.forEach((value) => {
                        let data_set = global.module_data.automod.api.message.data_placeholder(value.data_set, msg);
                        //Check each comparison to each value
                        if (global.module_data.automod.api.check(data_set, value.comparisons, value.values)) {
                            //On success
                            console.verbose("Executing script actions");
                            global.module_data.automod.api.message.execute(v, msg)
                        }
                    })
                }
            })
        }
    },

    messageUpdate: (oldmsg, newmsg) => {
        if (newmsg.author.bot) return;
        let scripts = module_data.automod.scripts[newmsg.guild.id];
        if (scripts) {
            console.verbose("Testing message on automod scripts");
            //For each script that exists for the guild
            scripts.forEach((v) => {
                //Execute the script
                console.verbose(`Testing message on "${v.description}"`);
                //Check that the execute_on, type and chance fields are fulfilled.
                if (v.execute_on === "messageUpdate" && v.type === oldmsg.type && v.chance > Math.random()) {
                    //Check each execution
                    v.executions.forEach((value) => {
                        let data_set = global.module_data.automod.api.messageUpdate.data_placeholder(value.data_set, oldmsg, newmsg);
                        //Check each comparison to each value
                        if (global.module_data.automod.api.check(data_set, value.comparisons, value.values)) {
                            //On success
                            console.verbose("Executing script actions");
                            global.module_data.automod.api.messageUpdate.execute(v, oldmsg, newmsg)
                        }
                    })
                }
            })
        }
    }
};