async function register() {

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch(BASE_URL + "/api/users/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            email,
            password
        })
    });

    const data = await response.json();

    alert(data.message);

    if (data.success) {
        window.location.href = "login.html";
    }

}

async function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch(BASE_URL + "/api/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });

    const data = await response.json();

    if (data.success) {

        localStorage.setItem("token", data.token);

        alert("Login Successful!");

        window.location.href = "index.html";

    } else {

        alert(data.message);

    }

}

function checkLogin() {

    console.log("checkLogin executed");

    const token = localStorage.getItem("token");
    console.log("Token:", token);

    const loginNav = document.getElementById("loginNav");
    const registerNav = document.getElementById("registerNav");
    const logoutNav = document.getElementById("logoutNav");

    console.log(loginNav, registerNav, logoutNav);

    if (token) {
        loginNav.style.display = "none";
        registerNav.style.display = "none";
        logoutNav.style.display = "list-item";
    } else {
        loginNav.style.display = "list-item";
        registerNav.style.display = "list-item";
        logoutNav.style.display = "none";
    }
}

window.addEventListener("DOMContentLoaded", checkLogin);

function logout() {

    localStorage.removeItem("token");

    alert("Logged out successfully!");

    window.location.href = "login.html";
}

window.addEventListener("load", checkLogin);