const mongoose = require('mongoose');
// const functions = require('firebase-functions');
// const config = functions.config()

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true, 
    useCreateIndex: true
})
.then(() => {
    console.log("You're connected to mongodb")
}).catch((e) => {
    console.log("error connecting to db", e);
})