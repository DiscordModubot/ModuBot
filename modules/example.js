module.exports = {
    __init : () => {
        console.log("initialization function")
    },
    __custom : () => {
        console.log("this will not be added as a client listener")
    },

    ready : () => {
        console.log("Ready event listener")
    }
};