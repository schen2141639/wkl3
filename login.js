module.exports = function (req, res, next) {
  let sess = req.session;
  console.log(`User Login details: ${sess.username}`);
  if (sess.username) {
    return next();
  } else {
    res.redirect("/login");
  }
};

