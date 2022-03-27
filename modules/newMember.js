module.exports = {
    __help : {
        //This is used by the popular help module
        moduleName: "New Member",
        description: "Gives a role to all new members.",
        commands: [
            {
                name : "setNewRole",
                description : "Sets/Adds the new role to be added",
                syntax : "setNewRole {role id}"
            },
            {
                name : "removeNewRoles",
                description : "Removes all automatic new roles for the guild",
                syntax : "removeNewRoles"
            }
        ],
        hidden: false
    },

    __cleanup : () => {
        fs.writeFileSync("./data/newMember", JSON.stringify(module_data.newMember.data, null, "\t"));
    },

    ready : () => {
        if (!global.fs) global.fs = require("fs");
        module_data.newMember.data = {};
        //Localise the configuration data.
        if (global.fs.existsSync("./data/newMember")) {
            module_data.newMember.data = JSON.parse(fs.readFileSync("./data/newMember", "utf8"))
        } else {
            fs.writeFileSync("./data/newMember", "{}")
        }
    },

    message : (msg) => {
        switch (msg.cmd) {
            case "setnewrole":
                if (!msg.guild || !msg.member.hasPermission("ADMINISTRATOR")) {
                    msg.channel.tempSend("You do not have permission to run this command.")
                } else {
                    if (msg.guild.roles.cache.has(msg.arg[0])) {
                        if (!module_data.newMember.data[msg.guild.id]) module_data.newMember.data[msg.guild.id] = [];

                        module_data.newMember.data[msg.guild.id].push(msg.arg[0]);
                        msg.reply("done!")
                    } else {
                        msg.channel.tempSend("Invalid Argument")
                    }
                }
                break;
            case "removenewroles":
                if (!msg.guild || !msg.member.hasPermission("ADMINISTRATOR")) {
                    msg.channel.tempSend("You do not have permission to run this command.")
                } else {
                    if (module_data.newMember.data[msg.guild.id]) delete module_data.newMember.data[msg.guild.id];
                    msg.channel.tempSend("Done!")
                }
        }
    },

    guildMemberAdd : (member) => {
        if (!module_data.newMember.data[member.guild.id]) return;
        member.roles.add(module_data.newMember.data[member.guild.id], "New Meowster needed roles!")
    }
};