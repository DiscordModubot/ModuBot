module.exports = {
    __help : {
        //This is used by the popular help module
        moduleName: "Meowscular",
        description: "A fun module for fun palicos!",
        commands: [
            {
                name : "Quote",
                description : "Quote",
                syntax : "quote {msg}"
            }
        ],
        hidden: false
    },

    __cleanup : () => {
    },

    ready : () => {
        if (!global.fs) global.fs = require("fs");
        //Localise the configuration data.
        if (global.fs.existsSync("./data/meowscular")) {
            module_data.meowscular = JSON.parse(fs.readFileSync("./data/meowscular", "utf8"))
        } else {
            fs.writeFileSync("./data/getaroom", "{}")
        }

        module_data.meowscular.quote = (category) => {
            if(module_data.meowscular.quotes[category]){
                return module_data.meowscular.quotes[category][Math.floor(Math.random() * module_data.meowscular.quotes[category].length)]
            } else {
                return "meow"
            }
        };
        module_data.meowscular.extras = () => {
            let r = ["",""];
            if (Math.random() < 0.2) {
                r[0] = module_data.meowscular.quote("greeting") + "\n"
            } if (Math.random() < 0.2) {
                r[1] = " " + module_data.meowscular.quote("signature")
            };
            return r
        };
        module_data.meowscular.talk = (msg, state="success") => {
            let extras = module_data.meowscular.extras();
            let result = extras[0] + msg;
            switch (state) {
                case "success":
                    result += "\n" + module_data.meowscular.quote("completed");
                    break;
                case "fail":
                    result += "\n" + module_data.meowscular.quote("failed");
                    break
            }
            return result + extras[1]
        }
    },

    message : (msg) => {
        switch (msg.cmd) {
            case "quote":
                msg.channel.send(module_data.meowscular.talk(msg.content.split(" ").splice(1).join(" ")));
                break;
            case "meow":
                msg.reply("meow.");
                break;
        }
    }
};