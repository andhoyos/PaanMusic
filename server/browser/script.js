/**
 *
 * @param {number} id
 * funcion que trae el nombre de la cancion y la asigna al reproductor
 * indicando la ruta, el nombre de usuario y da estilos a la etiqueta
 * de la informacion del audio
 *
 */
function fileName(id) {
  const userUp = document.getElementById("up" + id).textContent;
  const name = document.getElementById(id).textContent;
  const repAudio = document.getElementById("audio");
  repAudio.setAttribute("src", `../tracks/${name}`);
  const audioRep = document.getElementById("audioRep");
  audioRep.innerText = name;
  audioRep.style.padding = "10px 10px 0";
  audioRep.style.minWidth = "300px";
  const uploadBy = document.getElementById("userUp");
  uploadBy.innerText = `Subido por: ${userUp}`;
  uploadBy.style.padding = "5px 10px";

  console.log(name);
}

/**
 * funcion que crea el id apartir de la hora para la nueva cancion
 *
 */

function newId(x, n) {
  while (x.length < n) {
    x = "0" + x;
  }
  return x;
}
function addId() {
  let date = new Date();
  let x = document.getElementById("newId");
  let h = newId(date.getHours(), 2);
  let m = newId(date.getMinutes(), 2);
  let s = newId(date.getSeconds(), 2);
  let ms = newId(date.getMilliseconds(), 3);
  x.value = "" + h + m + s + ms + "";
}

const mess = document.getElementById("message");
if (mess) {
  setTimeout(() => {
    mess.style.display = "none";
  }, 3000);
}

/**
 * funcion que cambia el estilo a la etiqueta de configuracion de usuario
 * para que solo sea visible cuando el usuario lo solicite
 */
const configUser = document.getElementById("config");
function config() {
  if (configUser.style.display == "none") {
    configUser.style.display = "inline-block";
  } else {
    configUser.style.display = "none";
  }
}

if (configUser) {
  document.addEventListener(
    "click",
    (event) => {
      if (configUser.style.display == "inline-block") {
        configUser.style.display = "none";
      }
    },
    false
  );
}

const actualPage = document.getElementById("actualPage").textContent;

if (actualPage == 1) {
  const previusPage = document.getElementById("previusPage");
  previusPage.style.display = "none";
}
if (actualPage == "" || actualPage == undefined) {
  const pageContent = document.getElementById("pageContent");
  pageContent.style.display = "none";
}

/**
 * funcion que crea alerta para el usuario que desea eliminar su cuenta
 * y cambia la ruta si la confirmacion es true
 */
const deleteUser = document.getElementById("deleteUser");
function alertUser() {
  let confirmDelete = confirm("desea eliminar el usuario");
  if (confirmDelete) {
    deleteUser.href = "/auth/deleteUser";
  }
}

/**
 * funcion que muestra el nombre de la imagen subida por el usuario
 * en foto de perfil y asigna el texto a la etiqueta label
 */
function labelValue() {
  const avatar = document.getElementById("avatar").value.slice(-25);
  if (avatar) {
    const avatarName = document.getElementById("avatarLabel");
    avatarName.textContent = avatar;
    avatarName.style.display = "contents";
    return;
  }

  console.log(avatar);
}

/**
 *
 * @param {*} menu
 * funcion que cambia la ruta apartir del valor del option
 *
 */
function changeOption(menu) {
  let optionValue = menu.options[menu.selectedIndex].value;

  if (optionValue) {
    if (optionValue == "allTracks") {
      window.location.href = `/api/${optionValue}`;
    } else {
      window.location.href = `/api/filterTracks?genre=${optionValue}`;
    }
  }
}

/**
 * funcion que muestra el menu de opciones cuando el usuario
 * solicita el filtro de los generos
 */
const selectGenre = document.getElementById("genre");
function filter() {
  if (selectGenre.style.display == "none") {
    selectGenre.style.display = "inline-block";
  } else {
    selectGenre.style.display = "none";
  }
}

if (selectGenre) {
  document.addEventListener(
    "click",
    (event) => {
      if (selectGenre.style.display == "inline-block") {
        selectGenre.style.display = "none";
      }
    },
    false
  );
}
