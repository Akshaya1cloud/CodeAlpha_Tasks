const BASE_URL = "http://localhost:5000";

let allProducts = [];

async function getProducts() {
    try {
        const response = await fetch(BASE_URL + "/api/products");
        const data = await response.json();

        allProducts = data.products;

        displayProducts(allProducts);

        updateCartCount();
    } catch (error) {
        console.log(error);
    }
}

function displayProducts(products) {

    const container = document.getElementById("products");

    container.innerHTML = "";

    products.forEach(product => {

        container.innerHTML += `
        <div class="product-card">

            <img src="${BASE_URL}/images/${product.image}" alt="${product.name}">

            <h3>${product.name}</h3>

            <p>₹${product.price.toLocaleString("en-IN")}</p>

            <button onclick="viewProduct('${product._id}')">
                View Details
            </button>

        </div>
        `;
    });

}

function searchProducts() {

    const search = document.getElementById("search").value.toLowerCase();

    const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(search)
    );

    displayProducts(filtered);

}

function viewProduct(id) {

    localStorage.setItem("productId", id);

    window.location.href = "product.html";

}

function updateCartCount() {

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    let total = 0;

    cart.forEach(item => total += item.qty);

    const badge = document.getElementById("cartCount");

    if (badge) badge.innerText = total;

}