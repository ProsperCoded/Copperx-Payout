const express = require("express");
const handler = require("./lib/index");
const {handleCallBack} = require("./lib/commands/handleCallBack");

const PORT = 5000;

const app = express();
app.use(express.json());

app.post("*", async(req, res) => {
    console.log(req.body);
    handler(req, "POST");
    if (req.body.callback_query){
        await handleCallBack(req.body.callback_query.data, req.body.callback_query.from.id)
        return res.send("Transfer initiated");
    }
})

app.get("*", async(req, res) => {
})

app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log(`Listening on port ${PORT}`);
});


