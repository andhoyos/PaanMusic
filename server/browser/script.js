/**
 *
 * @param {*} id
 */
function fileName(id) {
  const userUp = document.getElementById("up" + id).textContent;
  const name = document.getElementById(id).textContent;
  const repAudio = document.getElementById("audio");
  repAudio.setAttribute("src", `./tracks/${name}`);
  const audioRep = document.getElementById("audioRep");
  audioRep.innerText = name;
  audioRep.style.padding = "10px 10px 0";
  audioRep.style.minWidth = "300px";
  const uploadBy = document.getElementById("userUp");
  uploadBy.innerText = `Subido por: ${userUp}`;
  uploadBy.style.padding = "5px 10px";

  console.log(name);
}

function newId(x, n) {
  while (x.length < n) {
    x = "0" + x;
  }
  return x;
}

// Añadir value al input del id
function addId() {
  let d = new Date();
  let x = document.getElementById("newId");
  let h = newId(d.getHours(), 2);
  let m = newId(d.getMinutes(), 2);
  let s = newId(d.getSeconds(), 2);
  let ms = newId(d.getMilliseconds(), 3);
  x.value = "" + h + m + s + ms + "";
}

const mess = document.getElementById("message");
if (mess) {
  setTimeout(() => {
    mess.style.display = "none";
  }, 3000);
}

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

const deleteUser = document.getElementById("deleteUser");

function alertUser() {
  let confirmDelete = confirm("desea eliminar el usuario");
  if (confirmDelete) {
    deleteUser.href = "/deleteUser";
  }
}

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
