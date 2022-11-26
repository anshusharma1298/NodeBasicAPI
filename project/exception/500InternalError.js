const express = require('express')
const app = express();
/**Handle all 500 Internal server error  */
const internal = app.use((error,req,resp,next)=>{
    resp.status(error.status || 500)
    resp.json({
        error:{
            message:error.message
        }
    })
});

module.exports = internal