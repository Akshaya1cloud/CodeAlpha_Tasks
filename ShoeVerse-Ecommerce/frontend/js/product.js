const BASE_URL = "http://localhost:5000";

async function getSingleProduct() {

    const id = localStorage.getItem("productId");

    const response = await fetch(BASE_URL + "/api/products/" + id);
    const data = await response.json();

    const product = data.product;

    document.getElementById("product").innerHTML = `

    <div class="details-container">

        <div class="left">
            <img src="${BASE_URL}/images/${product.image}" alt="${product.name}">
        </div>

        <div class="right">

            <h1>${product.name}</h1>

            <h2>₹${product.price.toLocaleString("en-IN")}</h2>

            <p>${product.description}</p>

            <p><b>Category:</b> ${product.category}</p>

            <p><b>Stock:</b> ${product.stock}</p>

            <p class="available">✓ In Stock</p>

            <div class="sizes">

                <h3>Select Size</h3>

                <div class="size-buttons">

                    <button type="button" class="size active">6</button>
                    <button type="button" class="size">7</button>
                    <button type="button" class="size">8</button>
                    <button type="button" class="size">9</button>
                    <button type="button" class="size">10</button>

                </div>

            </div>

            <button class="cart-btn" onclick="addToCart()">
                Add To Cart
            </button>

        </div>

    </div>

    `;

    document.querySelectorAll(".size").forEach(btn => {

        btn.onclick = function () {

            document.querySelectorAll(".size").forEach(b => b.classList.remove("active"));

            this.classList.add("active");

        };

    });

}

function addToCart() {

    const productId = localStorage.getItem("productId");

    const selectedSize =
        document.querySelector(".size.active").innerText;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const alreadyExists = cart.find(item =>
        item.id === productId && item.size === selectedSize
    );

    if (alreadyExists) {

        alreadyExists.qty++;

    } else {

        cart.push({
            id: productId,
            qty: 1,
            size: selectedSize
        });

    }

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();

    alert("Product added to cart!");

    window.location.href = "cart.html";

}

function updateCartCount() {

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    let total = 0;

    cart.forEach(item => total += item.qty);

    const badge = document.getElementById("cartCount");

    if (badge) {

        badge.innerText = total;

    }

}

window.onload = () => {

    getSingleProduct();

    updateCartCount();

};