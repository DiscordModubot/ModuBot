module.exports = {
    __help : {
        //This is used by the popular help module
        moduleName: "Example",
        description: "A basic module showing how modules work",
        commands: [
            {
                name : "ping",
                description : "Play a really short game of ping pong!",
                syntax : "ping"
            }
        ],
        hidden: false
    },

    __init : () => {
        console.verbose("This is run as soon as the bot has logged in")
    },
    __cleanup : () => {
        console.log("This is run when the bot is about to exit")
    },
    __custom : () => {
        console.log("this will not be added as a client listener")
    },

    ready : () => {
        console.log("Ready event listener")
    },

    message : (msg) => {
        if (msg.content === "ping") {
            msg.reply("pong!")
        }
    }
};