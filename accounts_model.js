// Import the MongoClient
const { MongoClient } = require("mongodb");

const url = "mongodb+srv://dbadmin:dbadmin@cluster0.k6rv9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";


const getAccountList = async () => {
  // Connect to the MongoDB server.
  const client = await MongoClient.connect(url, { useNewUrlParser: true });

  // Choose the database to use
  const db = client.db("data2");

  // Choose the collection.
  const accounts = db.collection("dd2");

  const accountList = await accounts.find().toArray();

  //console.log(accountList);

  return accountList;
};

const getAccount = async (condition) => {
  // Connect to the MongoDB server.
  const client = await MongoClient.connect(url, { useNewUrlParser: true });

  // Choose the database to use
  const db = client.db("data2");

  // Choose the collection.
  const accounts = db.collection("dd2");

  //console.log(condition);

  const account = await accounts.findOne(condition);

  //console.log(account);

  return account;
};

const getAccountNumber = async () => {
  // Connect to the MongoDB server.
  const client = await MongoClient.connect(url, { useNewUrlParser: true });

  // Choose the database to use
  const db = client.db("data2");

  // Choose the collection.
  const accounts = db.collection("dd2");

  const chequingac = await accounts
    .find()
    .sort({ chequing: -1 })
    .limit(1)
    .toArray();
  const savingac = await accounts
    .find()
    .sort({ saving: -1 })
    .limit(1)
    .toArray();

  // console.log(chequingac);
  // console.log(savingac);
  const chequingmax = chequingac[0].chequing;
  const savingmax = savingac[0].saving;

  console.log(chequingmax, savingmax);

  return chequingmax > savingmax ? chequingmax + 1 : savingmax + 1;
};

const createAccount = async (username, accountType, accountBalance) => {
  var userInfo = await getAccount({ username: username });
  console.log(userInfo);
  let result = {};
  if (accountType === "Chequing") {
    if (userInfo.chequing) {
      result = `${accountType} account already exists. Account No. ${userInfo.chequing}`;
    } else {
      var accountNumber = await getAccountNumber();

      console.log(accountNumber);

      const filter = { username: username };
      let update = {};
      update = {
        $set: { chequing: accountNumber, chequingbalance: accountBalance },
      };
      await updateAccount(filter, update);
      result = `New ${accountType} account created. Account No. ${accountNumber}`;
    }
  } else if (accountType === "Saving") {
    if (userInfo.saving) {
      result = `${accountType} account already exists. Account No. ${userInfo.saving}`;
    } else {
      var accountNumber = await getAccountNumber();

      console.log(accountNumber);

      const filter = { username: username };
      let update = {};
      update = {
        $set: { saving: accountNumber, savingbalance: accountBalance },
      };
      await updateAccount(filter, update);
      result = `New ${accountType} account created. Account No. ${accountNumber}`;
    }
  }
  return result;
};

const updateAccount = async (filter, update) => {
  // Connect to the MongoDB server.
  const client = await MongoClient.connect(url, { useNewUrlParser: true });

  // Choose the database to use
  const db = client.db("data2");

  // Choose the collection.
  const accounts = db.collection("dd2");

  //console.log(filter);
  //console.log(update);
  accounts.findOneAndUpdate(filter, update);
};

module.exports = {
  getAccountList,
  getAccount,
  getAccountNumber,
  createAccount,
  updateAccount,
};

