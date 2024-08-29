const express=require('express');
const app=express();
require('dotenv').config();

app.use('/',(req,res)=>{
    res.send({message:"serving on local"})
})

const port=process.env.PORT || 4000;

app.listen(port,()=>{
    console.log('listening on port',port);
})

