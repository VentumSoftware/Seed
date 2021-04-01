var submit = document.getElementsByClassName("btn-primary")[0];
var usuario = document.getElementById("usuario");
var email = document.getElementById("email");
var password = document.getElementById("password");
var modal = document.getElementById("exampleModalCenter");
var spinner = document.getElementById("spinner");


const showModal = (text) => {
    console.log(text);
    $("#exampleModalCenter").modal('toggle');
}

const login = (pass, confirmPass, dni) => {
    return new Promise((resolve, reject) => {
        spinner.style.display = "inline-table";
        submit.disabled = true;
        let url = '/api/addNewUser';
        if (pass != confirmPass) {
  alert("Las passwords deben de coincidir");
  return false;
} else {
  fetch(url, {
          referrerPolicy: "origin-when-cross-origin",
          credentials: 'include',
          method: 'POST',
          headers: {
              'Content-Type': 'application/json;charset=utf-8',
          },
          body: JSON.stringify({ 'pass': pass , 'dni':dni})
      })
      .then(res => {
          if (res.status == 200)
          window.location.href = "/pages/login";
          else
              reject(res.statusText);
      })
      .then(res => resolve(res))
      .catch(err => console.log(err));
  alert("se envio una Solicitud de ingreso, te avisaremos cuando sea aceptada");
  return true;
}

    });
}


submit.addEventListener("click", (e) => {
    e.preventDefault();

    login(password.value,confirmPassword.value, dni.value)
        .then(res => {
            spinner.style.display = "none";
            submit.disabled = false;
            console.log(res);
            location.reload();
        })
        .catch(err => {
            spinner.style.display = "none";
            submit.disabled = false;
            showModal(err);
        });
})
