const mongoClient = require("mongodb").MongoClient;
const mongoUrl = "mongodb://localhost:27017";
const mongoConfig = { useUnifiedTopology: true };

const getTrack = (originalName, cbResult) => {
  mongoClient.connect(mongoUrl, mongoConfig, (err, client) => {
    if (err) {
      cbResult({
        confirm: false,
      });
    } else {
      const dataBase = client.db("streaming");
      const dataBaseCollection = dataBase.collection("tracks");
      dataBaseCollection.findOne({ track: originalName }, (err, reply) => {
        if (err) {
          cbResult({
            confirm: false,
          });
        } else {
          cbResult({
            confirm: true,
            track: reply,
          });
        }
        client.close();
      });
    }
  });
};

const uploadTrack = (
  newId,
  originalName,
  userName,
  artist,
  genre,
  cbResult
) => {
  mongoClient.connect(mongoUrl, mongoConfig, (err, client) => {
    //error en conexion a base de datos
    if (err) {
      cbResult({
        confirm: false,
      });
    } else {
      const dataBase = client.db("streaming");
      const dataBaseCollection = dataBase.collection("tracks");
      const newTrack = {
        id: newId,
        track: originalName,
        uploadBy: userName,
        artist: artist,
        genre: genre,
      };
      dataBaseCollection.insertOne(newTrack, (err, confirm) => {
        if (err) {
          cbResult({
            confirm: false,
          });
        } else {
          cbResult({
            confirm: true,
          });
        }
        client.close();
      });
    }
  });
};

const buscar = (cancion, callRes) => {
  mongoClient.connect(mongoUrl, mongoConfig, (err, client) => {
    //si hay error de conexion retorna mensaje de errer
    if (err) {
      callRes({
        message: {
          class: "warning",
          text: "No se pudo procesar la busqueda :(",
        },
      });
    } else {
      const dataBase = client.db("streaming");
      const dataBaseCollection = dataBase.collection("tracks");
      dataBaseCollection
        .find({ track: { $regex: cancion, $options: "i" } })
        .limit(12)
        .toArray((err, cancionList) => {
          //si no hay resultados retorna mensaje de error
          if (err) {
            callRes({
              message: {
                class: "warning",
                text: "No se pudo procesar la busqueda :(",
              },
            });
          } else {
            callRes(cancionList);
          }
          client.close();
        });
    }
  });
};
const tracksUser = (trackUser, callRes) => {
  mongoClient.connect(mongoUrl, mongoConfig, (err, client) => {
    if (err) {
      callRes({
        message: {
          class: "warning",
          text: "No se pudo procesar la busqueda :(",
        },
      });
    } else {
      const dataBase = client.db("streaming");
      const dataBaseCollection = dataBase.collection("tracks");
      dataBaseCollection
        .find({ uploadBy: trackUser })
        .limit(12)
        .toArray((err, cancionList) => {
          //si no hay resultados retorna mensaje de error
          if (err) {
            callRes({
              message: {
                class: "warning",
                text: "No se pudo procesar la busqueda :(",
              },
            });
          } else {
            callRes(cancionList);
          }
          client.close();
        });
    }
  });
};

module.exports = {
  getTrack,
  uploadTrack,
  buscar,
  tracksUser,
};
