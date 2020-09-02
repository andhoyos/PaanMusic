const mongoClient = require("mongodb").MongoClient;
const mongoUrl =
  "mongodb+srv://andresh:andresh@cluster0.xqgd0.mongodb.net/Streaming?retryWrites=true&w=majority";
const mongoConfig = { useUnifiedTopology: true };

/**
 * funcion que realiza la validacion de los datos de datos de usuario en la db
 * apartir de los parametros recibidos
 * @param {string} user
 * @param {string} password
 * @param {*} cbResult callback que retorna el resultado de la validacion
 */
const validateUser = (user, password, cbResult) => {
  mongoClient.connect(mongoUrl, mongoConfig, (err, client) => {
    // si hay error en la conexion con la base de datos retorna mensaje de error
    if (err) {
      cbResult({
        mesage: {
          class: "failed",
          content: "Ha ocurrido un error de conexion :(",
        },
      });
    } else {
      const dataBase = client.db("Streaming");
      const dataBaseCollection = dataBase.collection("users");

      const consultUser = {
        user: user,
        password: password,
      };

      dataBaseCollection.findOne(consultUser, (err, entry) => {
        //si no se pueden consultar los datos retorna error
        if (err) {
          cbResult({
            mesage: {
              class: "failed",
              content: "Ha ocurrido un error de coexion intentelo nuevamente",
            },
          });
        } else {
          if (!entry) {
            cbResult({
              mesage: {
                class: "failed",
                content: "Por favor verifique los datos",
              },
            });
          } else {
            cbResult({
              user: {
                user: entry.user,
                avatar: entry.avatar,
              },
            });
          }
        }
        client.close();
      });
    }
  });
};

/**
 * funcion que consulta el nombre de usuario en la db
 * apartir del parametro recibido
 * @param {string} user
 * @param {*} cbResult callback que retorna la confirmacion true o false
 * y trae los datos del usuario
 */
const getUser = (user, cbResult) => {
  mongoClient.connect(mongoUrl, mongoConfig, (err, client) => {
    if (err) {
      cbResult({
        confirm: false,
      });
    } else {
      const dataBase = client.db("Streaming");
      const dataBaseCollection = dataBase.collection("users");
      dataBaseCollection.findOne({ user: user }, (err, reply) => {
        if (err) {
          cbResult({
            confirm: false,
          });
        } else {
          cbResult({
            confirm: true,
            user: reply,
          });
        }
        client.close();
      });
    }
  });
};

/**
 * funcion que procesa el registro de un nuevo usuario
 * y lo carga en la db
 * @param {string} user
 * @param {string} password
 * @param {string} avatarName
 * @param {*} cbResult callback que retorna la confirmacion true/false
 */
const registerUser = (user, password, avatarName, cbResult) => {
  mongoClient.connect(mongoUrl, mongoConfig, (err, client) => {
    //si hay error de conexion con la base de datos retorna false
    if (err) {
      cbResult({
        confirm: false,
      });
    } else {
      const dataBase = client.db("Streaming");
      const dataBaseCollection = dataBase.collection("users");
      const newUser = {
        avatar: avatarName,
        user: user,
        password: password,
      };
      dataBaseCollection.insertOne(newUser, (err, UpdateOk) => {
        if (err) {
          cbResult({
            UpdateOk: false,
          });
        } else {
          cbResult({
            UpdateOk: true,
          });
        }
        client.close();
      });
    }
  });
};

/**
 * funcion que procesa el cambio de contraseña y lo actualiza en la db
 * apartir de los parametros recibidos
 * @param {string} user
 * @param {string} newPassword
 * @param {*} cbResult callback que retorna confirmacion true/false
 */
const changePass = (user, newPassword, cbResult) => {
  mongoClient.connect(mongoUrl, mongoConfig, (err, client) => {
    //si hay error de conexion con la base de datos retorna false
    if (err) {
      cbResult({
        confirm: false,
      });
    } else {
      const dataBase = client.db("Streaming");
      const dataBaseCollection = dataBase.collection("users");

      findQuery = { user: user };

      updateQuery = {
        $set: {
          password: newPassword,
        },
      };
      dataBaseCollection.updateOne(findQuery, updateQuery, (err, result) => {
        if (err) {
          cbResult(false);
        } else {
          cbResult(true);
        }
        client.close();
      });
    }
  });
};

/**
 * funcion que realiza el delete el db del usuario
 * apartir del parametro recibido
 * @param {string} user
 * @param {*} cbResult callback que retorna confirmacion true/false
 */
const deleteUser = (user, cbResult) => {
  mongoClient.connect(mongoUrl, mongoConfig, (err, client) => {
    //si hay error de conexion con la base de datos retorna false
    if (err) {
      cbResult({
        confirm: false,
      });
    } else {
      const dataBase = client.db("Streaming");
      const dataBaseCollection = dataBase.collection("users");

      findQuery = { user: user };

      dataBaseCollection.deleteOne(findQuery, (err, result) => {
        if (err) {
          cbResult(false);
        } else {
          cbResult(true);
        }
        client.close();
      });
    }
  });
};

module.exports = {
  validateUser,
  getUser,
  registerUser,
  changePass,
  deleteUser,
};
