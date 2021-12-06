const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
app.engine('hbs', exphbs({defaultLayout: false, extname:'.hbs',}));
const bodyParser = require("body-parser");
const fs = require("fs");
var createError = require("http-errors");
const passport = require("passport");
var path = require("path");
const session = require("express-session");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
//var express = require('express');
//var exphbs = require('express-handlebars');
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("./public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var userLogin = {};

const accounts = require('./accounts.json');
const { response } = require('express');


app.post("/api/login", (req, res) => {
    fs.readFile("./data.json", (err, data) => {
    var arr = [];
    if (err) {
    console.log(err);
    } else {
    if (data.toString()) {
    arr = JSON.parse(data.toString());
    }
    var s = arr.find((item) => {
    if (item.name == req.body.name) {
    return item;
    }
    });
    if (s) {
    if (s.password == req.body.password) {
    userLogin = req.body;
    res.json({
    status: "y",
    meg: "login success",
    data: s.name,
    });
    } else {
    res.json({
    status: "err",
    meg: "wrong password ",
    });
    }
    } else {
    res.json({
    status: "n",
    meg: "no such user ",
    });
    }
    }
    });
});

app.get("/index", (req, res) => {
    if (userLogin.name) res.render("index", { username: userLogin.name, accounts: accounts });
    else res.render("login");
});

app.get("/", (req, res) => {
    res.render("login");
});


app.post("/logout", (req, res) => {
        res.render('login', {});
});

app.post("/bankForm", (req,res) => {
    var accountData = accounts.find(function(account, index) {
        if(account.accountNumber == req.body.accountsList)
            return account;
    });
    if(req.body.select == "balance") {
        res.render('balance', {data: accountData});
    } else if(req.body.select == "deposit") {
        res.render('deposit', {data: accountData});
    } else if(req.body.select == "openAccount") {
        res.render('accountopen');
    } else if(req.body.select == "withdrawal") { 
        res.render('withdraw', {data: accountData});
    }
});

app.post("/deposit", (req,res) => {
    let accountBalance = 0;
    for(var i=0; i<accounts.length; i++) {
        if(accounts[i].accountNumber == req.body.accountNumber){
            accountBalance = parseFloat(accounts[i].accountBalance) + parseFloat(req.body.depositAmount);
            accounts[i].accountBalance = accountBalance;
        }
    };
    console.log(accountBalance);
    fs.writeFileSync('./accounts.json', JSON.stringify(accounts));
    res.render('index', {accounts: accounts });
});

app.post("/withdraw", (req,res) => {
    let accountBalance = 0;
    console.log(req.body.accountNumber);
    for(var i=0; i<accounts.length; i++) {
        if(accounts[i].accountNumber == req.body.accountNumber){
            accountBalance = parseFloat(accounts[i].accountBalance) - parseFloat(req.body.withdrawAmount);
            accounts[i].accountBalance = accountBalance;
        }
    };
    console.log(accountBalance);
    fs.writeFileSync('./accounts.json', JSON.stringify(accounts));
    res.render('index', {accounts: accounts });
});



app.post('/accountOpen', (req, res) => {
    console.log("account open");
    accountType = req.body.accountSelect;
    //accountBalance = parseFloat(req.body.accountBalance);
    accountBalance = 0;
    var account = createAccount(accountType, accountBalance);
    accounts.push(account);

    //fs.writeFileSync('./accounts.json', JSON.stringify(accounts));
    //console.log("This data is being fed into createAccount:  " + accountNumber);

   //console.log("This data is being fed into createAccount:  " + accountNumber);
   res.render('index', {accounts: accounts });
}); 

function  createAccount(accountType, accountBalance) {
    var accountNumber = accountNumbe();

    var account = {
        "accountNumber": accountNumber,
        "accountType" : accountType,
        "accountBalance" : accountBalance
    }
    return account;
}

function accountNumbe() {
    var lastid = 0;
    for(var i=0; i < accounts.length; i++) {
        if(parseInt(accounts[i].accountNumber) > lastid) {
            lastid = parseInt(accounts[i].accountNumber);
        }
    }
    lastid++;
    return lastid;
}
 

app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on:`, port));