<body>
    <div class="container-fluid py-4">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <h2 class="mb-4">Settings</h2>

                        <!-- General Section -->
                        <div class="mb-4">
                            <h3 class="mb-3">General</h3>

                            <!-- Edit Profile -->
                            <a href="#" class="d-flex align-items-center text-decoration-none text-dark p-3 rounded hover-bg mb-2" data-action="edit-profile">
                                <em class="bi bi-person me-3"></em>
                                <div class="flex-grow-1">Edit Profile</div>
                                <em class="bi bi-chevron-right"></em>
                            </a>

                            <!-- Change Password -->
                            <a href="#" class="d-flex align-items-center text-decoration-none text-dark p-3 rounded hover-bg mb-2" data-action="change-password">
                                <em class="bi bi-lock me-3"></em>
                                <div class="flex-grow-1">Change Password</div>
                                <em class="bi bi-chevron-right"></em>
                            </a>

                            <!-- Notification Settings -->
                            <a href="#" class="d-flex align-items-center text-decoration-none text-dark p-3 rounded hover-bg mb-2" data-action="notification-settings">
                                <em class="bi bi-bell me-3"></em>
                                <div class="flex-grow-1">Notifications</div>
                                <em class="bi bi-chevron-right"></em>
                            </a>

                            <!-- Order History -->
                            <a href="#" class="d-flex align-items-center text-decoration-none text-dark p-3 rounded hover-bg mb-2" data-action="order-history">
                                <em class="bi bi-clock-history me-3"></em>
                                <div class="flex-grow-1">Order History</div>
                                <em class="bi bi-chevron-right"></em>
                            </a>

                            <a href="#" class="d-flex align-items-center text-decoration-none text-dark p-3 rounded hover-bg mb-2 admin-only" data-action="adminProductModal">
                                <em class="bi bi-box-seam me-3"></em>
                                <div class="flex-grow-1">Product Management</div>
                                <em class="bi bi-chevron-right"></em>
                            </a>
                        </div>

                        <!-- Logout Button -->
                        <div class="pt-3 border-top">
                            <button class="btn btn-outline-danger w-100" id="logout-btn">
                                <em class="bi bi-box-arrow-right me-2"></em>Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Profile Modal -->
    <div class="modal fade" id="editProfileModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">Edit Profile</h4>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="edit-profile-form">
                        <div class="mb-3">
                            <label class="form-label" for="firstName">First Name</label>
                            <input type="text" class="form-control" id="firstName" name="firstName" required />
                        </div>
                        <div class="mb-3">
                            <label class="form-label" for="lastName">Last Name</label>
                            <input type="text" class="form-control" id="lastName" name="lastName" required />
                        </div>
                        <div class="mb-3">
                            <label class="form-label" for="email">Email</label>
                            <input type="email" class="form-control" id="email" name="email" required />
                        </div>
                        <div class="mb-3">
                            <label class="form-label" for="phone">Phone</label>
                            <input type="tel" class="form-control" id="phone" name="phone" required />
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="save-profile">Save Changes</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Change Password Modal -->
    <div class="modal fade" id="changePasswordModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">Change Password</h4>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="change-password-form">
                        <div class="mb-3">
                            <label class="form-label" for="pass">Current Password</label>
                            <input type="password" class="form-control" id="pass" name="currentPassword" required />
                        </div>
                        <div class="mb-3">
                            <label class="form-label" for="newpass">New Password</label>
                            <input type="password" class="form-control" id="newpass" name="newPassword" required />
                        </div>
                        <div class="mb-3">
                            <label class="form-label" for="confnewpass">Confirm New Password</label>
                            <input type="password" class="form-control" id="confnewpass" name="confirmPassword" required />
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="save-password">Save Changes</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Notification Settings Modal -->
    <div class="modal fade" id="notificationSettingsModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">Notification Settings</h4>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="notification-settings-form">
                        <div class="mb-3">
                            <label class="form-label">Notification Types</label>
                            <div class="form-check form-switch mb-2">
                                <input class="form-check-input" type="checkbox" id="success-notifications" checked />
                                <label class="form-check-label" for="success-notifications">
                                    <em class="bi bi-check-circle text-success me-2"></em>
                                    Success Notifications
                                </label>
                            </div>
                            <div class="form-check form-switch mb-2">
                                <input class="form-check-input" type="checkbox" id="info-notifications" checked />
                                <label class="form-check-label" for="info-notifications">
                                    <em class="bi bi-info-circle text-info me-2"></em>
                                    Info Notifications
                                </label>
                            </div>
                            <div class="form-check form-switch mb-2">
                                <input class="form-check-input" type="checkbox" id="warning-notifications" checked />
                                <label class="form-check-label" for="warning-notifications">
                                    <em class="bi bi-exclamation-triangle text-warning me-2"></em>
                                    Warning Notifications
                                </label>
                            </div>
                            <div class="form-check form-switch mb-2">
                                <input class="form-check-input" type="checkbox" id="error-notifications" checked />
                                <label class="form-check-label" for="error-notifications">
                                    <em class="bi bi-exclamation-circle text-danger me-2"></em>
                                    Error Notifications
                                </label>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Save Settings</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Order History Modal -->
    <div class="modal fade" id="orderHistoryModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">Order History</h4>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div id="orders-list" class="list-group">
                        <!-- Orders will be loaded here -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Admin Product Modal -->
    <div class="modal fade admin-only" id="adminProductModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">Add New Product</h4>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="addProductForm">
                        <div class="mb-3">
                            <label for="productName" class="form-label">Product Name</label>
                            <input type="text" class="form-control" id="productName" required />
                        </div>
                        <div class="mb-3">
                            <label for="productDescription" class="form-label">Description</label>
                            <textarea class="form-control" id="productDescription" rows="3" required></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="productPrice" class="form-label">Price (€)</label>
                            <input type="number" class="form-control" id="productPrice" step="0.01" required />
                        </div>
                        <div class="mb-3">
                            <label for="productStock" class="form-label">Stock</label>
                            <input type="number" class="form-control" id="productStock" required />
                        </div>
                        <div class="mb-3">
                            <label for="productColor" class="form-label">Color</label>
                            <input type="text" class="form-control" id="productColor" required />
                        </div>
                        <div class="mb-3">
                            <label for="productImage" class="form-label">Product Image</label>
                            <input type="file" class="form-control" id="productImage" accept="image/*" required />
                        </div>
                        <div class="mb-3">
                            <label for="productCategories" class="form-label">Categories</label>
                            <select class="form-select" id="productCategories" multiple required>
                                <!-- Categories will be loaded dynamically -->
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="saveProductBtn">Save Product</button>
                </div>
            </div>
        </div>
    </div>

</body>
