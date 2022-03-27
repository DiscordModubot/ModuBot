module.exports = {
    __active : [],

    __help : {
        //This is used by the popular help module
        moduleName: "Get A Room!",
        description: "A basic module showing how modules work",
        commands: [
            {
                name : "makeHostel",
                description : "Make a voice channel a hostel",
                syntax : "makeHostel {id}"
            },
            {
                name : "removeHostel",
                description : "Remove all hostels in the guild",
                syntax : "removeHostel"
            }
        ],
        hidden: false
    },

    __cleanup: () => {
        fs.writeFileSync("./data/getaroom", JSON.stringify(module_data.getaroom.data, null, "\t"));
    },

    ready : () => {
        if (!global.fs) global.fs = require("fs");
        module_data.getaroom.data = {};
        //Localise the configuration data.
        if (global.fs.existsSync("./data/getaroom")) {
            module_data.getaroom.data = JSON.parse(fs.readFileSync("./data/getaroom", "utf8"))
        } else {
            fs.writeFileSync("./data/getaroom", "{}")
        }
    },

    message : (msg) => {
        if (msg.cmd === "makehostel") {
            if (!msg.guild || !msg.member.hasPermission("ADMINISTRATOR")) {
                msg.channel.tempSend(module_data.meowscular.talk("You do not have permission to run this command.", "fail"))
            } else {
                if (msg.guild.channels.cache.has(msg.arg[0]) && msg.guild.channels.cache.get(msg.arg[0]).type === "voice") {
                    module_data.getaroom.data[msg.guild.id] = msg.arg[0];
                    msg.channel.tempSend(module_data.meowscular.talk("Canteen Made!", "success"))
                        .then(console.error)
                } else {
                    msg.channel.tempSend(module_data.meowscular.talk("Invalid argument!", "fail"))
                        .then(console.error)
                }
            }
        } else if (msg.cmd === "removehostel") {
            if (!msg.guild || !msg.member.hasPermission("ADMINISTRATOR")) {
                msg.channel.tempSend("You do not have permission to run this command.")
            } else {
                delete module_data.getaroom.data[msg.guild.id];
                msg.channel.tempSend("All Gone!")
            }
        }
    },

    voiceStateUpdate : (oldstate, newstate) => {
        if (!module_data.getaroom.data[oldstate.guild.id]) {return;}
        if (newstate.channel && newstate.channel.id === module_data.getaroom.data[oldstate.guild.id]) {
            //Joined hostel
            newstate.guild.channels.create(`${newstate.member.displayName}'s table`, {
                type: "voice",
                position: newstate.channel.position - 1,
                parent: newstate.channel.parent,
                permissionOverwrites: [{
                    id: newstate.member.id,
                    allow: "MANAGE_CHANNELS"
                }],
                reason: "These meowsters be needing their meal meow!"
            })
                .then((channel) => {
                    newstate.setChannel(channel, "Here is your table Meowster!")
                        .catch(console.error);
                    module.exports.__active.push(channel.id);
                })
                .catch(console.error)
        } else if (oldstate.channel) {
            let index = module.exports.__active.indexOf(oldstate.channel.id);
            if (index !== -1 && oldstate.channel.members.size === 0) {
                oldstate.channel.delete("All Meowsters have left the channel!");
                module.exports.__active.splice(module.exports.__active.indexOf(oldstate.channel), 1)
            }
        }
    }
};