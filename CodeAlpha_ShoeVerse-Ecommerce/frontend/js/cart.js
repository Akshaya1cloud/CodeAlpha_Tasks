const BASE_URL = "http://localhost:5000";

async function loadCart() {

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    let output = "";
    let total = 0;

    if (cart.length === 0) {

        document.getElementById("cartItems").innerHTML = `
            <div class="empty-cart">
                <h2>Your Cart is Empty 🛒</h2>
                <p>Add some amazing shoes to continue shopping.</p>
                <a href="products.html" class="checkout-btn">
                    Continue Shopping
                </a>
            </div>
        `;

        document.getElementById("totalPrice").innerText = "0";

        localStorage.setItem("total", 0);

        updateCartCount();

        return;
    }

    for (const item of cart) {

        const response = await fetch(BASE_URL + "/api/products/" + item.id);

        const data = await response.json();

        const product = data.product;

        total += product.price * item.qty;

        output += `

        <div class="cart-card">

            <img src="${BASE_URL}/images/${product.image}" alt="${product.name}">

            <div class="cart-info">

                <h2>${product.name}</h2>

                <p><strong>Category:</strong> ${product.category}</p>

                <p><strong>Size:</strong> ${item.size}</p>

                <div class="cart-quantity">

                    <button onclick="decreaseQty('${item.id}','${item.size}')">-</button>

                    <span>${item.qty}</span>

                    <button onclick="increaseQty('${item.id}','${item.size}')">+</button>

                </div>

                <h3>
                    ₹${(product.price * item.qty).toLocaleString("en-IN")}
                </h3>

                <button class="remove-btn"
                        onclick="removeCart('${item.id}','${item.size}')">

                    Remove

                </button>

            </div>

        </div>

        `;
    }

    document.getElementById("cartItems").innerHTML = output;

    document.getElementById("totalPrice").innerText =
        total.toLocaleString("en-IN");

    localStorage.setItem("total", total);

    updateCartCount();

}

function removeCart(id, size) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart = cart.filter(item => !(item.id === id && item.size === size));

    localStorage.setItem("cart", JSON.stringify(cart));

    loadCart();
}

function increaseQty(id, size) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const item = cart.find(
        p => p.id === id && p.size === size
    );

    if (item) {
        item.qty++;
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    loadCart();
}

function decreaseQty(id, size) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const item = cart.find(
        p => p.id === id && p.size === size
    );

    if (item && item.qty > 1) {
        item.qty--;
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    loadCart();
}

function checkout() {

    if ((JSON.parse(localStorage.getItem("cart")) || []).length === 0) {

        alert("Your cart is empty!");

        return;
    }

    window.location.href = "checkout.html";
}

function updateCartCount() {

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    let totalItems = 0;

    cart.forEach(item => {
        totalItems += item.qty;
    });

    const badge = document.getElementById("cartCount");

    if (badge) {
        badge.innerText = totalItems;
    }
}

window.onload = function () {

    loadCart();

};