var submit = document.getElementsByClassName("btn-primary")[0];
var usuario = document.getElementById("usuario");
var password = document.getElementById("password");
var modal = document.getElementById("exampleModalCenter");
var spinner = document.getElementById("spinner");

const showModal = (text) => {
    console.log(text);
    $("#exampleModalCenter").modal('toggle');
}

const login = (user, pass) => {
    return new Promise((resolve, reject) => {
        spinner.style.display = "inline-table";
        submit.disabled = true;
        let url = '/api/login';
        fetch(url, {
                referrerPolicy: "origin-when-cross-origin",
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                },
                body: JSON.stringify({ 'user': user, 'pass': pass })
            })
            .then(res => {
                if (res.status == 200)
                    return res.text();
                else
                    reject(res.statusText);
            })
            .then(res => resolve(res))
            .catch(err => console.log(err));
    });
}

submit.addEventListener("click", (e) => {
    e.preventDefault();
    login(usuario.value, password.value)
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