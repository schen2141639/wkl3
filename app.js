const acmodel = require("./accounts_model");
const express = require("express");
const session = require("express-session");
const exphbs = require("express-handlebars");
const app = express();
app.engine("hbs", exphbs({ defaultLayout: false, extname: ".hbs" }));
const bodyParser = require("body-parser");
const fs = require("fs");
var createError = require("http-errors");
const passport = require("passport");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//var userLogin = {};

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

var sess;

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

app.get("/", (req, res) => {
  res.render("login");
});

app.post("/logout", (req, res) => {
  //  res.render("login", {});
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect("/");
  });
});

const login = require("./login");

app.get("/index", async (req, res) => {
  if (userLogin.name) {
    const account = await acmodel.getAccount({ username: userLogin.name });
    //console.log(account);
    res.render("index", { username: userLogin.name, account: account });
  } else {
    res.render("login");
  }
});

app.post("/bankForm", async (req, res) => {
  const account = req.body.accountsList.split("-");
  const accountNumber = Number(account[0]);
  const accountType = account[1];
  let accountInfo = {};
  if (accountType === "Chequing") {
    let accountData = await acmodel.getAccount({ chequing: accountNumber });
    accountInfo.accountType = "Chequing";
    accountInfo.accountNumber = accountNumber;
    accountInfo.accountBalance = accountData.chequingbalance;
  } else if (accountType === "Saving") {
    let accountData = await acmodel.getAccount({ saving: accountNumber });
    accountInfo.accountType = "Saving";
    accountInfo.accountNumber = accountNumber;
    accountInfo.accountBalance = accountData.savingbalance;
  }
  //console.log(accountInfo);
  if (req.body.select == "balance") {
    res.render("balance", { data: accountInfo });
  } else if (req.body.select == "deposit") {
    res.render("deposit", { data: accountInfo });
  } else if (req.body.select == "openAccount") {
    res.render("accountopen", { message: "" });
  } else if (req.body.select == "withdrawal") {
    res.render("withdraw", { data: accountInfo, message: "" });
  }
});

app.post("/deposit", async (req, res) => {
  let accountType = req.body.accountType;
  let accountNumber = req.body.accountNumber;
  let accountBalance = Number(req.body.accountBalance);
  let depositAmount = Number(req.body.depositAmount);
  let newBalance = accountBalance + depositAmount;

  console.log(newBalance);

  const filter = { username: userLogin.name };
  let update = {};
  if (accountType === "Chequing") {
    update = { $set: { chequingbalance: newBalance } };
  } else if (accountType === "Saving") {
    update = { $set: { savingbalance: newBalance } };
  }

  let doc = await acmodel.updateAccount(filter, update);

  const account = await acmodel.getAccount({ username: userLogin.name });
  res.render("index", { username: userLogin.name, account: account });
});

app.post("/withdraw", async (req, res) => {
  let accountType = req.body.accountType;
  let accountNumber = req.body.accountNumber;
  let accountBalance = Number(req.body.accountBalance);
  let withdrawAmount = Number(req.body.withdrawAmount);
  let newBalance = accountBalance - withdrawAmount;

  console.log(newBalance);

  if (newBalance < 0) {
    balanceinfo = {
      number: accountNumber,
      type: accountType,
      amount: accountBalance,
      text: "money not enough",
    };
    res.render("withdraw", { data: req.body, message: "money not enough" });
  } else {
    const filter = { username: userLogin.name };
    let update = {};
    if (accountType === "Chequing") {
      update = { $set: { chequingbalance: newBalance } };
    } else if (accountType === "Saving") {
      update = { $set: { savingbalance: newBalance } };
    }

    let doc = acmodel.updateAccount(filter, update);

    const account = await acmodel.getAccount({ username: userLogin.name });
    res.render("index", { username: userLogin.name, account: account });
  }
});

app.post("/accountOpen", async (req, res) => {
  const username = userLogin.name;
  const accountType = req.body.accountSelection;
  const accountBalance = 0;
  const result = await acmodel.createAccount(
    username,
    accountType,
    accountBalance
  );
  res.render("accountopen", { message: result });
});

//app.set("views", path.join(__dirname, "views"));

//app.use(express.static(path.join(__dirname, "public")));

// var userDataDB = {};
// var userAccountscontrol = {};
// var userAccountType;
// const maxaccount = 2; //account have only 2 in 1 user

// function maxcrAccount(userDataDB) {
//   if (maxcrChequing(userDataDB) || maxcrSavings(userDataDB)) {
//     //max create savings
//     if (checkNumAccounts(userDataDB) < maxaccount) {
//       return true;
//     }
//   } else {
//     return false;
//   }
// }

// function maxcrChequing(userDataDB) {
//   //max cr ....
//   if (userDataDB["Chequing"]) {
//     return false;
//   } else {
//     return true;
//   }
// }
// function maxcrSavings(userDataDB) {
//   if (userDataDB["Savings"]) {
//     return false;
//   } else {
//     return true;
//   }
// }

// var user;

// var userinfo = {
//   user: "",
//   account: "",
//   cheque: "",
//   savings: "",
//   both: false,
//   chequecreate: false,
//   savingscreate: false,
//   none: false,
//   text: "",
// };

const port = process.env.PORT || 3100;
app.listen(port, () => console.log(`listening on:`, port));
