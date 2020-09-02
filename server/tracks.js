const mongoClient = require("mongodb").MongoClient;
const mongoUrl =
  "mongodb+srv://andresh:andresh@cluster0.xqgd0.mongodb.net/Streaming?retryWrites=true&w=majority";
const mongoConfig = { useUnifiedTopology: true };

/**
 * funcion que consulta en la DB el nombre de la cancion apartir del paramatro que recibe
 * @param {string} originalName
 * @param {*} cbResult callback de resultados que devuleve el nombre de la cancion
 * si no se puede conectar retorna mensaje de error
 */
const getTrack = (originalName, cbResult) => {
  mongoClient.connect(mongoUrl, mongoConfig, (err, client) => {
    if (err) {
      cbResult({
        confirm: false,
      });
    } else {
      const dataBase = client.db("Streaming");
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

/**
 * funcion que registra la nueva cancion en la base de datos
 * @param {string} newId
 * @param {string} originalName
 * @param {string} userName
 * @param {string} artist
 * @param {string} genre
 * @param {*} cbResult callback que retorna confirmacion true o false
 * de la operacion si no se puede conectar retorna mensaje de error
 */
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
      const dataBase = client.db("Streaming");
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

/**
 * funcion que procesa la busqueda apartir del parametro recibido y lo filtra
 * @param {string} cancion
 * @param {string} genreFilter
 * @param {*} callRes  callback que retorna lista de canciones
 * si no hay conexion retorna mensaje de error
 */
const query = (cancion, genreFilter, callRes) => {
  mongoClient.connect(mongoUrl, mongoConfig, (err, client) => {
    //si hay error de conexion retorna mensaje de error
    if (err) {
      callRes({
        message: {
          class: "warning",
          text: "No se pudo procesar la busqueda :(",
        },
      });
    } else {
      const dataBase = client.db("Streaming");
      const dataBaseCollection = dataBase.collection("tracks");

      let queryFilter;
      if (cancion) {
        queryFilter = { track: { $regex: cancion, $options: "i" } };
      }
      if (genreFilter) {
        queryFilter = { genre: { $regex: genreFilter, $options: "i" } };
      }

      dataBaseCollection
        .find(queryFilter)
        .sort({ track: 1 })
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

/**
 * funcion que trae todas las canciones de la db
 * realiza el ordenamiento y paginacion de las mismas
 * @param {*} pageNumber
 * @param {*} callRes callback que retorna la lista de todas la canciones
 * si no hay conexion retorna mensaje de error
 *
 */
const allTracks = (pageNumber, callRes) => {
  mongoClient.connect(mongoUrl, mongoConfig, (err, client) => {
    if (err) {
      callRes({
        message: {
          class: "warning",
          text: "No se pudo procesar la busqueda :(",
        },
      });
    } else {
      const dataBase = client.db("Streaming");
      const dataBaseCollection = dataBase.collection("tracks");

      if (pageNumber == undefined || pageNumber == 0) {
        pageNumber = 1;
      }
      let page = pageNumber;

      const results = {};

      results.actual = {
        page: parseInt(page),
      };

      results.next = {
        page: parseInt(page) + 1,
      };
      results.previous = {
        page: parseInt(page) - 1,
      };

      dataBaseCollection
        .find()
        .sort({ track: 1 })
        .skip(20 * (page - 1))
        .limit(20)
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
            callRes(cancionList, results);
          }
          client.close();
        });
    }
  });
};

/**
 * funcion que consulta las canciones subidas por un usuario
 * apartir del parametro recibido
 * @param {string} trackUser
 * @param {*} callRes callback retorna las lista de canciones usbidas por el usuario
 *
 */
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
      const dataBase = client.db("Streaming");
      const dataBaseCollection = dataBase.collection("tracks");
      dataBaseCollection
        .find({ uploadBy: trackUser })
        .sort({ track: 1 })
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
  query,
  tracksUser,
  allTracks,
};
