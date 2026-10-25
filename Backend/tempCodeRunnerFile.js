const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("CodeLens Backend is running!");
});
app.get("/api/users",(req,res)=>{
    res.json({
        message:"Users API Working"
    })
});
app.post("/api/signup",(req,res)=>{
    const {name,email,password}=req.body;
    console.log(name);
    console.log(email);
    console.log(password);
    res.json({
        message:"signup Api Working",
        user:{
            name,
            email
        }
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});