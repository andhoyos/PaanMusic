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
  }, 5000);
}

const configUser = document.getElementById("config");
function config() {
  if (configUser.style.display == "none") {
    configUser.style.display = "inline-block";
  } else {
    configUser.style.display = "none";
  }
}

document.addEventListener(
  "click",
  (event) => {
    if (configUser.style.display == "inline-block") {
      configUser.style.display = "none";
    }
  },
  false
);
