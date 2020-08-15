const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const exphbs = require("express-handlebars");
const session = require("express-session");
const readable = require("stream").Readable;

const users = require("./users");
const tracks = require("./tracks");

let originalName;
const uploadStorage = multer.diskStorage({
  destination: (req, file, cbResult) => {
    cbResult(null, "./server/browser/tracks");
  },
  filename: (req, file, cbResult) => {
    cbResult(null, file.originalname);
    originalName = file.originalname;
  },
});

const upload = multer({ storage: uploadStorage });

const app = express();

app.use(
  session({
    secret: "streamingKey",
    resave: false,
    saveUninitialized: false,
  })
);

app.set("view engine", "handlebars");

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layout"),
  })
);

app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "/browser")));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/users", (req, res) => {
  res.render("users");
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("login", {
    message: {
      class: "approved",
      content: "El usuario se desconecto correctamente :)",
    },
  });
});

app.get("/changePassword", (req, res) => {
  if (!req.session.loggedUser) {
    res.redirect("/");
    return;
  }
  res.render("changePass", {
    user: req.session.loggedUser,
  });
});

app.get("/canciones", (req, res) => {
  if (!req.session.loggedUser) {
    res.redirect("/");
    return;
  }
  tracks.buscar(req.query.cancion, (cancionList) => {
    if (!req.query.cancion) {
      res.redirect("/allTracks");
      return;
    } else if (cancionList == "" || cancionList == {}) {
      res.render("canciones", {
        message: {
          class: "failed",
          content: `No se encontraron resultados para: ${req.query.cancion}`,
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

app.get("/allTracks", (req, res) => {
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

app.get("/uploadTrack", (req, res) => {
  if (!req.session.loggedUser) {
    res.redirect("/");
    return;
  }
  res.render("tracks", {
    user: req.session.loggedUser,
  });
});

app.get("/tracksUser", (req, res) => {
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

app.post("/login", (req, res) => {
  console.log("validacion datos de registro");

  users.getUser(req.body.user, (dataUser) => {
    if (!dataUser.confirm) {
      res.render("users", {
        message: {
          class: "failed",
          content: "Ha ocurrido un error inesperado :(",
        },
      });
    }
    if (dataUser.user) {
      res.render("users", {
        message: {
          class: "failed",
          content: "El Nombre de Usuario ya esta en uso",
        },
      });

      return;
    }

    if (!req.body.user || !req.body.password) {
      res.render("users", {
        message: {
          class: "failed",
          content: "Debe completar todos los campos",
        },
      });

      return;
    }

    if (req.body.password !== req.body.confirmPassword) {
      res.render("users", {
        message: {
          class: "failed",
          content: "Las contraseñas deben ser iguales",
        },
      });

      return;
    }

    console.log("voy registro de usuarios");

    users.registerUser(req.body.user, req.body.password, (dataUser) => {
      if (dataUser) {
        res.render("login", {
          message: {
            class: "approved",
            content: "Usuario registrado con exito",
          },
        });
      }
    });
  });
});

app.post("/allTracks", (req, res) => {
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

app.post("/tracks", upload.single("track"), (req, res) => {
  console.log("voy a consulta de cancion");

  tracks.getTrack(originalName, (data) => {
    //conexion a base de datos
    if (!data.confirm) {
      console.log("no se procesa registro");
      res.render("tracks", {});
      return;
    }
    if (data.track) {
      console.log(data.track);
      res.render("tracks", {
        user: req.session.loggedUser,
      });
      console.log("ya existe cancion");
      originalName = "";

      return;
    }
    if (originalName == "" || originalName == null) {
      console.log(req.body);
      console.log(originalName);
      res.render("tracks", {
        message: {
          class: "failed",
          content: "Debe adjuntar un archivo",
        },
        user: req.session.loggedUser,
      });

      return;
    }

    if (!req.body.userName || !req.body.artist) {
      res.render("tracks", {
        message: {
          class: "failed",
          content: "Debe completar todos los campos",
        },
        user: req.session.loggedUser,
      });
      originalName = "";

      return;
    }
    console.log("voy a upload de cancion");
    tracks.uploadTrack(
      req.body.newId,
      originalName,
      req.body.userName,
      req.body.artist,
      req.body.genres,
      (data) => {
        if (data) {
          console.log(originalName);
          res.render("tracks", {
            message: {
              class: "approved",
              content: "Cancion registrada con exito",
            },
            user: req.session.loggedUser,
          });
          originalName = "";
        }
      }
    );
  });
});

app.post("/changePass", (req, res) => {
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

app.listen(4000, () => {
  console.log("servidor iniciado en puerto 4000...");
});
