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
  res.render("login", {
    layout: "main",
  });
});

app.get("/users", (req, res) => {
  res.render("users", {
    layout: "main",
  });
});

app.post("/login", (req, res) => {
  console.log("validacion datos de registro");

  users.getUser(req.body.user, (dataUser) => {
    if (!dataUser.confirm) {
      res.render("users", {
        layout: "main",
        message: {
          class: "failed",
          content: "Ha ocurrido un erro inesperdo :(",
        },
      });
    }
    if (dataUser.user) {
      res.render("users", {
        layout: "main",
        message: {
          class: "failed",
          content: "ya existe un usuario registrado con ese nombre",
        },
      });

      return;
    }

    if (!req.body.user || !req.body.password) {
      res.render("users", {
        layout: "main",
        message: {
          class: "failed",
          content: "Debe completar todos los campos",
        },
      });

      return;
    }

    if (req.body.password !== req.body.confirmPassword) {
      res.render("users", {
        layout: "main",
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
          layout: "main",
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
    if (dataUser.confirm) {
      console.log("voy a uploadTrack");
      res.render("tracks", {
        layout: "main",
      });
    } else {
      console.log(dataUser);
      res.render("login", {
        layout: "main",
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
      res.render("tracks", {
        layout: "main",
      });
      return;
    }
    if (data.track) {
      console.log(data.track);
      res.render("tracks", {
        layout: "main",
      });
      console.log("ya existe cancion");
      originalName = "";

      return;
    }
    if (originalName == "" || originalName == null) {
      console.log(req.body);
      console.log(originalName);
      res.render("tracks", {
        layout: "main",
        message: {
          class: "failed",
          content: "Debe adjuntar un archivo",
        },
      });

      return;
    }

    if (!req.body.trackName || !req.body.artist) {
      res.render("tracks", {
        layout: "main",
        message: {
          class: "failed",
          content: "Debe completar todos los campos",
        },
      });
      originalName = "";

      return;
    }
    console.log("voy a upload de cancion");
    tracks.uploadTrack(
      req.body.newId,
      originalName,
      req.body.trackName,
      req.body.artist,
      req.body.genres,
      (data) => {
        if (data) {
          console.log(originalName);
          res.render("tracks", {
            layout: "main",
            message: {
              class: "approved",
              content: "Cancion registrada con exito",
            },
          });
          originalName = "";
        }
      }
    );
  });
});

app.post("/canciones", (req, res) => {
  tracks.buscar((cancionList) => {
    res.render("canciones", {
      cancion: cancionList,
    });
  });
});

app.listen(3100, () => {
  console.log("servidor iniciado en puerto 3100...");
});
