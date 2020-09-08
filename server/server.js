const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const exphbs = require("express-handlebars");
const session = require("express-session");

const users = require("./users");
const tracks = require("./tracks");
const apiRouter = require("./router/apiRouter");
const authRouter = require("./router/authRouter");

let originalName;
const uploadStorage = multer.diskStorage({
  destination: (req, file, cbResult) => {
    cbResult(null, "./server/browser/tracks");
  },
  filename: (req, file, cbResult) => {
    let fileOriginalname =
      file.originalname.charAt(0).toUpperCase() + file.originalname.slice(1);
    cbResult(null, fileOriginalname);
    originalName = fileOriginalname;
  },
});

let avatarName;
const uploadAvatar = multer.diskStorage({
  destination: (req, file, cbResult) => {
    cbResult(null, "./server/browser/img/users");
  },
  filename: (req, file, cbResult) => {
    cbResult(null, file.originalname);
    avatarName = file.originalname;
  },
});

const uploadImg = multer({ storage: uploadAvatar });

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

app.get("/changePassword", (req, res) => {
  if (!req.session.loggedUser) {
    res.redirect("/");
    return;
  }
  res.render("changePass", {
    user: req.session.loggedUser,
  });
});

app.get("/recoverPassword", (req, res) => {
  res.render("recoverPass");
});

app.post("/login", uploadImg.single("avatar"), (req, res) => {
  console.log("validacion datos de registro");

  users.getUser(req.body.user, (dataUser) => {
    console.log(req.body.user);
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

    if (!avatarName || avatarName == undefined) {
      avatarName = "user.png";
    }

    console.log("voy registro de usuarios");

    users.registerUser(
      req.body.user,
      req.body.password,
      avatarName,
      (dataUser) => {
        if (dataUser) {
          res.render("login", {
            message: {
              class: "approved",
              content: "Usuario registrado con exito",
            },
          });
        }
      }
    );
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

app.use("/auth", authRouter);
app.use("/api", apiRouter);

app.listen(process.env.PORT || 4000, () => {
  console.log("servidor iniciado en puerto 4000...");
});
