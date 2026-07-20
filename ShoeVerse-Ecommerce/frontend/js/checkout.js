const total = localStorage.getItem("total") || 0;

document.getElementById("totalPrice").innerText =
    "₹" + Number(total).toLocaleString("en-IN");

function placeOrder() {

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const pincode = document.getElementById("pincode").value;

    if (
        !name ||
        !phone ||
        !email ||
        !address ||
        !city ||
        !pincode
    ) {
        alert("Please fill all details.");
        return;
    }

    alert("Order Placed Successfully!");

    localStorage.removeItem("cart");
    localStorage.removeItem("total");

    window.location.href = "success.html";
}