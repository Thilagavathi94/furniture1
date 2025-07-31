document.addEventListener('DOMContentLoaded', () => {
    const cartItemCountElement = document.getElementById('cart-item-count');
    const cartItemsContainer = document.getElementById('cart-items-container'); // This ID should be present in your cart.html where cart items are listed
    const cartTotalElement = document.getElementById('cart-total'); // This ID should be present in your cart.html for the total price

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Function to update cart item count in the header
    function updateCartItemCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartItemCountElement) {
            cartItemCountElement.textContent = totalItems;
        }
    }

    // Function to save cart to localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartItemCount();
        renderCartItems(); // Re-render cart items after any change
    }

    // Function to add an item to the cart
    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product,
                quantity: 1
            });
        }
        saveCart();
        alert(`${product.name} has been added to your cart!`);
    }

    // Function to remove an item from the cart
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
    }

    // Function to update item quantity in cart
    function updateQuantity(productId, newQuantity) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = parseInt(newQuantity);
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                saveCart();
            }
        }
    }

    // Function to render cart items on the cart page
    function renderCartItems() {
        if (!cartItemsContainer) return; // Exit if not on the cart page

        cartItemsContainer.innerHTML = ''; // Clear existing items
        let totalCartPrice = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            if (cartTotalElement) {
                cartTotalElement.textContent = '0.00';
            }
            return;
        }

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalCartPrice += itemTotal;

            const cartItemHtml = `
                <div class="col-12 mb-3 cart-item" data-product-id="${item.id}">
                    <div class="d-flex align-items-center border p-3">
                        <div class="flex-shrink-0">
                            <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover;">
                        </div>
                        <div class="flex-grow-1 ms-3">
                            <h5>${item.name}</h5>
                            <p class="mb-0">Price: $${item.price.toFixed(2)}</p>
                            <div class="d-flex align-items-center mt-2">
                                <label for="quantity-${item.id}" class="me-2">Quantity:</label>
                                <input type="number" id="quantity-${item.id}" class="form-control quantity-input" value="${item.quantity}" min="1" style="width: 70px;">
                                <button class="btn btn-danger btn-sm ms-3 remove-item">Remove</button>
                            </div>
                        </div>
                        <div class="text-end">
                            <h6>Subtotal: $${itemTotal.toFixed(2)}</h6>
                        </div>
                    </div>
                </div>
            `;
            cartItemsContainer.innerHTML += cartItemHtml;
        });

        if (cartTotalElement) {
            cartTotalElement.textContent = totalCartPrice.toFixed(2);
        }

        // Add event listeners for quantity changes and remove buttons after rendering
        cartItemsContainer.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (event) => {
                const productId = event.target.closest('.cart-item').getAttribute('data-product-id');
                const newQuantity = event.target.value;
                updateQuantity(productId, newQuantity);
            });
        });

        cartItemsContainer.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.closest('.cart-item').getAttribute('data-product-id');
                removeFromCart(productId);
            });
        });
    }


    // Event listener for "Add to Cart" buttons on product pages (like index.html)
    document.querySelectorAll('.product-card .btn-primary').forEach(button => {
        if (button.textContent.trim() === 'Add to Cart') {
            button.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent default link behavior if it's an anchor tag
                const productCard = event.target.closest('.product-card');
                if (productCard) {
                    const productId = productCard.getAttribute('data-product-id') || Date.now(); // Unique ID for the product
                    const productName = productCard.querySelector('.card-title a').textContent.trim();
                    const productPriceText = productCard.querySelector('.sell-price').textContent.replace(/[^0-9.-]+/g, "");
                    const productPrice = parseFloat(productPriceText);
                    const productImage = productCard.querySelector('.image-first').src;

                    const product = {
                        id: productId,
                        name: productName,
                        price: productPrice,
                        image: productImage
                    };
                    addToCart(product);
                }
            });
        }
    });

    // Initial load: update cart count and render items if on cart page
    updateCartItemCount();
    renderCartItems();
});