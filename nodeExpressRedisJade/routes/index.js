const express = require("express");
const router = express.Router();

const myDB = require("../db/myDB.js");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.redirect("/registration");
});

router.get("/registration", async (req, res) => {
  const page = 1;
  console.log("/registration", page);

  try {
    const songs = await myDB.getRegistrations(page);

    // Save the session messages for display, then delete them
    const err = req.session.err;
    const msg = req.session.msg;
    req.session.err = "";
    req.session.msg = "";

    res.render("songs", {
      songs: songs,
      err: err,
      msg: msg,
    });
  } catch (err) {
    console.log("got error", err);
    res.render("songs", { err: err.message, songs: [] });
  }
});

router.post("/registration/delete", async (req, res) => {
  try {
    const song = req.body;
    const result = await myDB.deleteRegistration(song);

    console.log(result);
    if (result !== 1) {
      req.session.err = `Couldn't delete the object ${song.Name}`;
      res.redirect("/registration");
      return;
    }

    req.session.msg = "Deleted";
    res.redirect("/registration");
    return;
  } catch (err) {
    console.log("got error delete");
    req.session.err = err.message;
    res.redirect("/registration");
    return;
  }
});

router.post("/registration/update", async (req, res) => {
  try {
    const song = req.body;
    const result = await myDB.updateRegistration(song);
    console.log("update", result);

    if (result === "OK") {
      req.session.msg = "Updated";
      res.redirect("/registration");
    } else {
      req.session.err = "Error updating";
      res.redirect("/registration");
    }
    return;
  } catch (err) {
    console.log("got error update", err);
    req.session.err = err.message;
    res.redirect("/registration");
  }
});

router.post("/registration/create", async (req, res) => {
  const song = req.body;

  try {
    console.log("Create registration", song);
    const result = await myDB.createRegistration(song, res);
    if (result === 1) {
      req.session.msg = "Created";
      res.redirect("/registration");
    } else {
      req.session.err = "Error when creating";
      res.redirect("/registration");
    }
    return;
  } catch (err) {
    console.log("Got error create", err);
    req.session.err = err.message;
    res.redirect("/registration");
  }
});

module.exports = router;
