const mongoClient = require("mongodb").MongoClient;
const mongoUrl = "mongodb://localhost:27017";
const mongoConfig = { useUnifiedTopology: true };

const validateUser = (user, password, cbResult) => {
  mongoClient.connect(mongoUrl, mongoConfig, (err, client) => {
    // si hay error en la conexion con la base de datos retorna mensaje de error
    if (err) {
      cbResult({
        confirm: false,
        mesage: {
          class: "failed",
          content: "Ha ocurrido un error de conexion :(",
        },
      });
    } else {
      const dataBase = client.db("streaming");
      const dataBaseCollection = dataBase.collection("user");

      const consultUser = {
        user: user,
        password: password,
      };

      dataBaseCollection.findOne(consultUser, (err, entry) => {
        //si no se pueden consultar los datos retorna error
        if (err) {
          cbResult({
            confirm: false,
            mesage: {
              class: "failed",
              content: "Ha ocurrido un error de coexion intentelo nuevamente",
            },
          });
        } else {
          if (!entry) {
            cbResult({
              confirm: false,
              mesage: {
                class: "failed",
                content: "Por favor verifique los datos",
              },
            });
          } else {
            cbResult({
              confirm: true,
            });
          }
        }
        client.close();
      });
    }
  });
};

const getUser = (user, cbResult) => {
  mongoClient.connect(mongoUrl, mongoConfig, (err, client) => {
    if (err) {
      cbResult({
        confirm: false,
      });
    } else {
      const dataBase = client.db("streaming");
      const dataBaseCollection = dataBase.collection("user");
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

const registerUser = (user, password, cbResult) => {
  mongoClient.connect(mongoUrl, mongoConfig, (err, client) => {
    //si hay error de conexion con la base de datos retorna false
    if (err) {
      cbResult({
        confirm: false,
      });
    } else {
      const dataBase = client.db("streaming");
      const dataBaseCollection = dataBase.collection("user");
      const newUser = {
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

module.exports = {
  validateUser,
  getUser,
  registerUser,
};
