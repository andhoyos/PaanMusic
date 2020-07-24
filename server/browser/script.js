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
  const uploadBy = document.getElementById("userUp");
  uploadBy.innerText = `Subido por: ${userUp}`;

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
