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

app.post("/login", (req, res) => {
  console.log("validacion datos de registro");

  users.getUser(req.body.user, (dataUser) => {
    if (!dataUser.confirm) {
      res.render("users", {
        message: {
          class: "failed",
          content: "Ha ocurrido un erro inesperdo :(",
        },
      });
    }
    if (dataUser.user) {
      res.render("users", {
        message: {
          class: "failed",
          content: "ya existe un usuario registrado con ese nombre",
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

app.post("/uploadTrack", (req, res) => {
  console.log("validacion de ingreso");
  console.log(req.body);
  users.validateUser(req.body.user, req.body.password, (dataUser) => {
    if (dataUser.user) {
      req.session.loggedUser = dataUser.user;
      console.log("voy a uploadTrack");
      res.render("tracks", {
        user: req.session.loggedUser,
      });
    } else {
      console.log(dataUser);
      res.render("login", {
        message: {
          class: "failed",
          content: "Por favor verifique los datos",
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

app.post("/canciones", (req, res) => {
  tracks.buscar(req.body.cancion, (cancionList) => {
    if (cancionList == "" || cancionList == {}) {
      res.render("canciones", {
        message: {
          class: "failed",
          content: `No se encontraron resultados para: ${req.body.cancion}`,
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

app.post("/tracksUser", (req, res) => {
  tracks.tracksUser(req.body.trackUser, (cancionList) => {
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

app.listen(3100, () => {
  console.log("servidor iniciado en puerto 3100...");
});
