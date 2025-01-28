<div class="container py-4">
    <div class="row">
        <div class="col-md-8">
            <h2 class="mb-4">Checkout</h2>
            <form id="checkout-form">
                <!-- User Information -->
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title mb-4">User Information</h5>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="firstName" class="form-label">First Name</label>
                                <input type="text" class="form-control" id="firstName" name="firstName" readonly>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="lastName" class="form-label">Last Name</label>
                                <input type="text" class="form-control" id="lastName" name="lastName" readonly>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Shipping Information -->
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title mb-4">Shipping Information</h5>
                        <div class="mb-3">
                            <label class="form-label">Address</label>
                            <p class="form-control-plaintext">Via dell'Università, 50</p>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">City</label>
                                <p class="form-control-plaintext">Cesena (FC)</p>
                            </div>
                            <div class="col-md-3 mb-3">
                                <label class="form-label">ZIP Code</label>
                                <p class="form-control-plaintext">47521</p>
                            </div>
                            <div class="col-md-3 mb-3">
                                <label class="form-label">Country</label>
                                <p class="form-control-plaintext">Italia</p>
                            </div>
                        </div>
                        <input type="hidden" name="address" value="Via dell'Università, 50">
                        <input type="hidden" name="city" value="Cesena">
                        <input type="hidden" name="zip" value="47521">
                        <input type="hidden" name="country" value="IT">
                    </div>
                </div>

                <!-- Payment Information -->
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title mb-4">Payment Information</h5>
                        
                        <!-- Credit Card Display -->
                        <div class="credit-card mb-4">
                            <div class="credit-card-inner">
                                <!-- Front of card -->
                                <div class="credit-card-front">
                                    <div class="credit-card-logo">
                                        <i class="bi bi-credit-card"></i>
                                    </div>
                                    <div class="credit-card-number" id="card-number-display">
                                        •••• •••• •••• ••••
                                    </div>
                                    <div class="credit-card-name" id="card-name-display">
                                        YOUR NAME HERE
                                    </div>
                                    <div class="credit-card-expiry" id="card-expiry-display">
                                        MM/YY
                                    </div>
                                </div>
                                <!-- Back of card -->
                                <div class="credit-card-back">
                                    <div class="credit-card-strip"></div>
                                    <div class="credit-card-signature"></div>
                                    <div class="credit-card-cvv" id="card-cvv-display">
                                        •••
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Card Input Fields -->
                        <div class="mb-3">
                            <label for="cardName" class="form-label">Name on Card</label>
                            <input type="text" class="form-control" id="cardName" name="cardName" required>
                        </div>
                        <div class="mb-3">
                            <label for="cardNumber" class="form-label">Card Number</label>
                            <input type="text" class="form-control" id="cardNumber" name="cardNumber" 
                                   maxlength="19" required>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="expiryDate" class="form-label">Expiry Date</label>
                                <input type="text" class="form-control" id="expiryDate" name="expiryDate" 
                                       placeholder="MM/YY" maxlength="5" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="cvv" class="form-label">CVV</label>
                                <input type="text" class="form-control" id="cvv" name="cvv" 
                                       maxlength="4" required>
                            </div>
                        </div>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary w-100">Complete Order</button>
            </form>
        </div>

        <!-- Order Summary -->
        <div class="col-md-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title mb-4">Order Summary</h5>
                    <div id="order-items">
                        <!-- Order items will be loaded dynamically -->
                    </div>
                    <hr>
                    <div class="d-flex justify-content-between mb-3">
                        <span>Subtotal</span>
                        <span id="subtotal">€0.00</span>
                    </div>
                    <div class="d-flex justify-content-between mb-3">
                        <span>Shipping</span>
                        <span id="shipping">€0.00</span>
                    </div>
                    <div class="d-flex justify-content-between mb-3">
                        <strong>Total</strong>
                        <strong id="total">€0.00</strong>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
