module.exports = {
    __help : {
        moduleName: "Commander",
        description: "Basic Framework for managing commands",
        commands: [],
        hidden: true
    },

    message : (msg) => {
        if (msg.content.startsWith(global.CONFIG.PREFIX)) {
            msg.arg = msg.content.split(" ").splice(1) || [];
            msg.cmd = msg.content.replace(CONFIG.PREFIX, "").split(" ")[0].toLowerCase();
            msg.channel.tempSend = (content, options = {}, time = 5000) => {
                return new Promise((resolve, reject) => {
                    msg.channel.send(content, options)
                        .then(() => {
                            msg.delete(time)
                                .then(() => {
                                    resolve(true)
                                })
                                .catch((err) => {
                                    reject(err)
                                })
                        })
                        .catch((err) => {
                            reject(err)
                        })
                })
            }
        }
    }
};