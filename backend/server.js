const http = require("http");
const app = require("./app");
require("dotenv").config();
const server = http.createServer(app);
server.listen(PORT,()=>{
    console.log(`App is running on port ${process.env.PORT || 3000}`);
    
})