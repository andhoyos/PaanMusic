const express = require("express");
const tracks = require("../tracks");

const apiRouter = express.Router();

apiRouter.get("/filterTracks", (req, res) => {
  if (!req.session.loggedUser) {
    res.redirect("/");
    return;
  }
  tracks.query(req.query.cancion, req.query.genre, (cancionList) => {
    if (cancionList == "" || cancionList == {}) {
      res.render("canciones", {
        message: {
          class: "failed",
          content: `No se encontraron resultados para: "${req.query.cancion}"`,
        },
        user: req.session.loggedUser,
      });
    } else {
      res.render("canciones", {
        cancion: cancionList,
        user: req.session.loggedUser,
      });
    }
  });
});

apiRouter.get("/allTracks", (req, res) => {
  if (!req.session.loggedUser) {
    res.redirect("/");
    return;
  }
  tracks.allTracks(req.query.page, (cancionList, results) => {
    if (!cancionList) {
      res.render("canciones", {
        message: {
          class: "failed",
          content: "ha Ocurrido un error por favor intentelo nuevamente",
        },
        user: req.session.loggedUser,
      });
    }
    res.render("canciones", {
      cancion: cancionList,
      user: req.session.loggedUser,
      results,
    });
  });
});

apiRouter.get("/uploadTrack", (req, res) => {
  if (!req.session.loggedUser) {
    res.redirect("/");
    return;
  }
  res.render("tracks", {
    user: req.session.loggedUser,
  });
});

apiRouter.get("/tracksUser", (req, res) => {
  if (!req.session.loggedUser) {
    res.redirect("/");
    return;
  }
  tracks.tracksUser(req.query.trackUser, (cancionList) => {
    if (cancionList == "" || cancionList == {}) {
      res.render("tracks", {
        message: {
          class: "failed",
          content: "Aun no tienes canciones registradas",
        },
        user: req.session.loggedUser,
      });
    } else {
      res.render("canciones", {
        cancion: cancionList,
        user: req.session.loggedUser,
      });
    }
  });
});

module.exports = apiRouter;
