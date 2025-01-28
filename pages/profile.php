<div class="container-fluid py-4">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card border-0 shadow-sm">
                <div class="card-body p-4">
                    <h2 class="mb-4">Settings</h2>
                    
                    <!-- General Section -->
                    <div class="mb-4">
                        <h5 class="mb-3">General</h5>
                        
                        <!-- Edit Profile -->
                        <a href="#" class="d-flex align-items-center text-decoration-none text-dark p-3 rounded hover-bg mb-2" data-action="edit-profile">
                            <i class="bi bi-person me-3"></i>
                            <div class="flex-grow-1">Edit Profile</div>
                            <i class="bi bi-chevron-right"></i>
                        </a>

                        <!-- Change Password -->
                        <a href="#" class="d-flex align-items-center text-decoration-none text-dark p-3 rounded hover-bg mb-2" data-action="change-password">
                            <i class="bi bi-lock me-3"></i>
                            <div class="flex-grow-1">Change Password</div>
                            <i class="bi bi-chevron-right"></i>
                        </a>

                        <!-- Notification Settings -->
                        <a href="#" class="d-flex align-items-center text-decoration-none text-dark p-3 rounded hover-bg mb-2" data-action="notification-settings">
                            <i class="bi bi-bell me-3"></i>
                            <div class="flex-grow-1">Notifications</div>
                            <i class="bi bi-chevron-right"></i>
                        </a>

                        <!-- Order History -->
                        <a href="#" class="d-flex align-items-center text-decoration-none text-dark p-3 rounded hover-bg mb-2" data-action="order-history">
                            <i class="bi bi-clock-history me-3"></i>
                            <div class="flex-grow-1">Order History</div>
                            <i class="bi bi-chevron-right"></i>
                        </a>
                    </div>

                    <!-- Logout Button -->
                    <div class="pt-3 border-top">
                        <button class="btn btn-outline-danger w-100" id="logout-btn">
                            <i class="bi bi-box-arrow-right me-2"></i>Logout
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
                <h5 class="modal-title">Edit Profile</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="edit-profile-form">
                    <div class="mb-3">
                        <label class="form-label">First Name</label>
                        <input type="text" class="form-control" name="firstName" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Last Name</label>
                        <input type="text" class="form-control" name="lastName" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" name="email" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Phone</label>
                        <input type="tel" class="form-control" name="phone" required>
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
                <h5 class="modal-title">Change Password</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="change-password-form">
                    <div class="mb-3">
                        <label class="form-label">Current Password</label>
                        <input type="password" class="form-control" name="currentPassword" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">New Password</label>
                        <input type="password" class="form-control" name="newPassword" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Confirm New Password</label>
                        <input type="password" class="form-control" name="confirmPassword" required>
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
                <h5 class="modal-title">Notification Settings</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="notification-settings-form">
                    <div class="mb-3">
                        <label class="form-label">Notification Types</label>
                        <div class="form-check form-switch mb-2">
                            <input class="form-check-input" type="checkbox" id="success-notifications" checked>
                            <label class="form-check-label" for="success-notifications">
                                <i class="bi bi-check-circle text-success me-2"></i>
                                Success Notifications
                            </label>
                        </div>
                        <div class="form-check form-switch mb-2">
                            <input class="form-check-input" type="checkbox" id="info-notifications" checked>
                            <label class="form-check-label" for="info-notifications">
                                <i class="bi bi-info-circle text-info me-2"></i>
                                Info Notifications
                            </label>
                        </div>
                        <div class="form-check form-switch mb-2">
                            <input class="form-check-input" type="checkbox" id="warning-notifications" checked>
                            <label class="form-check-label" for="warning-notifications">
                                <i class="bi bi-exclamation-triangle text-warning me-2"></i>
                                Warning Notifications
                            </label>
                        </div>
                        <div class="form-check form-switch mb-2">
                            <input class="form-check-input" type="checkbox" id="error-notifications" checked>
                            <label class="form-check-label" for="error-notifications">
                                <i class="bi bi-exclamation-circle text-danger me-2"></i>
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
                <h5 class="modal-title">Order History</h5>
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
