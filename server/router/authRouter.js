const express = require("express");
const users = require("../users");
const tracks = require("../tracks");

const authRouter = express.Router();

authRouter.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("login", {
    message: {
      class: "approved",
      content: "El usuario se desconecto correctamente :)",
    },
  });
});

authRouter.get("/deleteUser", (req, res) => {
  if (!req.session.loggedUser) {
    res.redirect("/");
    return;
  }
  users.deleteUser(req.session.loggedUser.user, (result) => {
    if (result) {
      res.render("login", {
        message: {
          class: "approved",
          content: "Se elimino el usuario con exito",
        },
      });
    } else {
      res.render("canciones", {
        message: "failed",
        content:
          "No se pudo eliminar el usuario por favor intentelo nuevamente",
      });
    }
  });
});

authRouter.post("/allTracks", (req, res) => {
  console.log("validacion de ingreso");
  console.log(req.body);
  users.validateUser(req.body.user, req.body.password, (dataUser) => {
    if (dataUser.user) {
      req.session.loggedUser = dataUser.user;
      console.log("voy a allTracks");
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
    } else {
      console.log(dataUser);
      res.render("login", {
        message: {
          class: "failed",
          content: "Nombre de Usuario o Contraseña incorrectos",
        },
      });
    }
  });
});

authRouter.post("/recoverPass", (req, res) => {
  users.getUser(req.body.user, (dataUser) => {
    if (!dataUser.user) {
      res.render("recoverPass", {
        message: {
          class: "failed",
          content: `Usuario "${req.body.user}" no se encuentra registrado`,
        },
      });
      return;
    }
    if (
      req.body.newPassword == "" ||
      req.body.newPassword !== req.body.confirmPassword
    ) {
      res.render("recoverPass", {
        message: {
          class: "failed",
          content: "las contraseñas deben ser iguales",
        },
      });
      return;
    }
    users.changePass(req.body.user, req.body.newPassword, (result) => {
      if (result) {
        res.render("login", {
          message: {
            class: "approved",
            content: "Cambio de contraseña realizado con exito",
          },
        });
      } else {
        res.render("changePass", {
          message: {
            class: "failed",
            content: "Ha ocurrido un error por favor intentelo nuevamente",
          },
        });
      }
    });
  });
});

authRouter.post("/changePass", (req, res) => {
  if (!req.session.loggedUser) {
    res.redirect("/");
    return;
  } else {
    if (
      req.body.newPassword == "" ||
      req.body.newPassword !== req.body.confirmPassword
    ) {
      res.render("changePass", {
        message: {
          class: "failed",
          content: "las contraseñas deben ser iguales",
        },
        user: req.session.loggedUser,
      });
      return;
    }
  }

  users.changePass(
    req.session.loggedUser.user,
    req.body.newPassword,
    (result) => {
      if (result) {
        res.render("login", {
          message: {
            class: "approved",
            content: "Cambio de contraseña realizado con exito",
          },
        });
      } else {
        res.render("changePass", {
          message: {
            class: "failed",
            content: "Ha ocurrido un error por favor intentelo nuevamente",
          },
        });
      }
    }
  );
});

module.exports = authRouter;
