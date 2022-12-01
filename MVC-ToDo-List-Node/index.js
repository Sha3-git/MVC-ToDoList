const { json } = require("express");
const express = require ( "express" );
const fs = require( "fs" );
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
require("dotenv").config();
console.log(process.env.DB_HOST);
// Bring in mongoose
const mongoose = require( 'mongoose' );

// connects to the "test" database (ensure mongod is running!)
// the later arguments fix some deprecation warnings
mongoose.connect( 'mongodb://localhost:27017/test', 
                  { useNewUrlParser: true, useUnifiedTopology: true });

// this is a canonical alias to make your life easier, like jQuery to $.
const app = express(); 
app.set("view engine", "ejs");


app.use(express.static("public"));
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use (passport.initialize());
app.use (passport.session());

// a common localhost test port
const port = 3000; 

//Simple server operation
app.listen (port, () => {
    //template literal
   console.log (`Server is running on http://localhost:${port}`);
});

//create mongoose schemas
const userSchema = new mongoose.Schema ({
    username: String,
    password: String
});
// plugins extend Schema functionality
userSchema.plugin(passportLocalMongoose);

const tasks = new mongoose.Schema ({
    _id: Number,
    text: String,
    state: String,
    Creator: String,
    isTaskClaimed: Boolean,
    claimingUser: String,
    isTaskDone: Boolean,
    isTaskCleared: Boolean,
    
});
// create collections users and tasks
const Users = mongoose.model("User", userSchema);
const Tasks = mongoose.model("Tasks", tasks);

passport.use(Users.createStrategy());

passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

//initialize user table
/*
Users.register({ username: "Zweyna@gmail.com" },  "1111")
Users.register({ username: "Morenikeji@gmail.com" }, "2222");
*/

//initialize tasks table
/*
const task1 = new Tasks(
    {_id: 1, text: "Present an official document explaining the project idea", state: "unclaimed", Creator: "Zweyna@gmail.com", isTaskClaimed: false, claimingUser: null, isTaskDone: false, isTaskCleared: false},
);
task1.save();

const task2 = new Tasks(
    {_id: 2, text: "Create a low fi prototype", state: "claimed", Creator: "Zweyna", isTaskClaimed: true, claimingUser: "Zweyna@gmail.com", isTaskDone: false, isTaskCleared: false},
);
task2.save();

const task3 = new Tasks(
    {_id: 3, text: "Create a hi fi prototype", state: "claimed", Creator: "Morenikeji@gmail.com", isTaskClaimed: true, claimingUser: "Morenikeji@gmail.com", isTaskDone: false, isTaskCleared: false},
);
task3.save();

const task4 = new Tasks(
    {_id: 4, text: "Implement a view for website", state: "claimed", Creator: "Zweyna@gmail.com", isTaskClaimed: true, claimingUser: "Zweyna@gmail.com", isTaskDone: true, isTaskCleared: true},
);
task4.save();

const task5 = new Tasks(
    {_id: 5, text: "Implement a model for the website", state: "claimed", Creator: "Morenikeji@gmail.com", isTaskClaimed: true, claimingUser: "Morenikeji@gmail.com", isTaskDone: true, isTaskCleared: true},
);
task5.save();*/

//read from Json after loading it first

var loggedInUser;


//reder the to-do page using the mongo db
app.get("/todo", async (req, res)=>{
    console.log("user logged into todo: " + loggedInUser);
    if ( req.isAuthenticated() ){
        try {
            console.log( "was authorized and found:" );
            const results = await Tasks.find();
            console.log( results );
            res.render( "Todo-List", {username: req.user.username, input : results });
        } catch ( error ) {
            console.log( error );
        }
    }
    else{
         res.redirect( "/");
    }
   
    //res.render("Todo-List", {username: req.user.username, input: task});
});
app.get("/", (req, res) => {
    res.sendFile(__dirname +"/multi-user-todolist-login.html");
    console.log("A user requested the root route");
});

app.post( "/register", (req, res) => {
    var auth = req.body["InputAuth1"];
    if(auth === "todo2022")
    {
        console.log("User " + req.body.username + " is attempting to register");
        Users.register({ username: req.body.username },
            req.body.password,
            (err, user) => {
                if (err) {
                    console.log(err);
                    res.redirect("/");
                } else {
                    passport.authenticate("local")(req, res, () => {
                        loggedInUser = req.user.username;
                        res.redirect("/todo");
                    });
                }
            });
    }
    else{
        res.redirect("/");
    }
   
});

app.post( "/login", ( req, res ) => {
    console.log( "User " + req.body.username + " is attempting to log in" );
    const user = new Users ({
        username: req.body.username,
        password: req.body.password
    });
    req.login ( user, ( err ) => {
        if ( err ) {
            console.log( err );
            res.redirect( "/" );
        } else {
            passport.authenticate( "local", {failureRedirect: '/'})( req, res, () => {
                loggedInUser = req.user.username;
                res.redirect( "/todo" ); 
            });
        }
       
    });
});

app.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) { 
            return next(err); 
        }
        res.redirect('/');
      });
});

app.post("/claimed", (req, res) => {
    //res.send("failed to claim task");
    console.log(req.body.username)
    //loggedInUser = req.body.username;
    if ( req.isAuthenticated() )
    {
        async function findInDatabase() {
            try {
                await Tasks.updateOne({ _id: req.body.id },
                    { $set: { isTaskClaimed: true } });
                await Tasks.updateOne({ _id: req.body.id },
                    { $set: { claimingUser: req.user.username } });
                await Tasks.updateOne({ _id: req.body.id },
                    { $set: { state: "claimed" } });

                res.redirect("/todo");
            } catch (error) {
                console.log(error);
            }
        }
        findInDatabase();
}
});

app.post("/addTask", (req, res) => {
    //loggedInUser = req.body.id;
    
    var userText = req.body["addTask"];
    var checkInput = userText.trim();
    console.log(req.body.addTask);
    
    //condition for empty task input
    if(checkInput.length > 0)
    {
        async function findInDatabase() {
            try {
                const results = await Tasks.find();
                console.log(results.length);
                var num =   results.length + 1;
                const task = new Tasks(
                    {_id: num, text: userText, state: "unclaimed", Creator: req.user.username, isTaskClaimed: false, claimingUser: null, isTaskDone: false, isTaskCleared: false}
                );
                task.save();
                res.redirect("/todo");
            } catch (error) {
                console.log(error);
            }
        }
        findInDatabase();
        
    }
    else{
        res.redirect("/todo");  
    }
   
});

app.post("/abandonorcomplete", (req, res) =>{
    console.log("if hits check is: " + req.body.check);
    console.log("if hits abandon is: " + req.body.abandon);
    console.log(typeof(req.body.check));
    //loggedInUser = req.body.username;
    if(req.isAuthenticated)
    {
        if (req.body.check === "on") {
            console.log("check condition is met");
            async function findInDatabase() {
                try {
                    await Tasks.updateOne({ _id: req.body.id },
                        { $set: { isTaskDone: true } });
                    await Tasks.updateOne({ _id: req.body.id },
                        { $set: { isTaskCleared: false } });
                    res.redirect("/todo");
                } catch (error) {
                    console.log(error);
                }
            }
            findInDatabase();
        }
        if (req.body.abandon === "on") {
            console.log("abandon condition is met");
            async function findInDatabase() {
                try {
                    await Tasks.updateOne({ _id: req.body.id },
                        { $set: { isTaskClaimed: false } });
                    await Tasks.updateOne({ _id: req.body.id },
                        { $set: { isTaskDone: false } });
                    await Tasks.updateOne({ _id: req.body.id },
                        { $set: { state: "unclaimed" } });

                    res.redirect("/todo");
                } catch (error) {
                    console.log(error);
                }
            }
            findInDatabase();
        }
}
    
});

app.post("/unfinish", (req, res) => {
    //loggedInUser = req.body.username;
    if ( req.isAuthenticated() )
    {
        async function findInDatabase() {
            try {
                await Tasks.updateOne({ _id: req.body.id },
                    { $set: { isTaskClaimed: true } });
                await Tasks.updateOne({ _id: req.body.id },
                    { $set: { isTaskDone: false } });
                await Tasks.updateOne({ _id: req.body.id },
                    { $set: { isTaskCleared: false } });

                res.redirect("/todo");
            } catch (error) {
                console.log(error);
            }
        }
        findInDatabase();
}
});

app.post("/purge", (req, res) => {
    //loggedInUser = req.body.id;
    if (req.isAuthenticated()) {
        async function findInDatabase() {
            try {
                await Tasks.updateMany({ isTaskDone: true },
                    { $set: { isTaskCleared: true } });

                res.redirect("/todo");
            } catch (error) {
                console.log(error);
            }
        }
        findInDatabase();
    }

})
