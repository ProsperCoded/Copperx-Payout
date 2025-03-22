const {handleMessage, sendMessage} = require("./telegram");
const errorHandler = require("./helper");

async function handler(req, method){
    try{
    const { body } = req;
    if (body && body.message){
        console.log("Message Received");
        const messageObj = body.message;
        await handleMessage(messageObj);
    }

    
} catch(err){
    errorHandler(err, "handler");   
}

}

module.exports = handler;