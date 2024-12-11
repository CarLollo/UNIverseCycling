CREATE DATABASE IF NOT EXISTS universe_cycling;
USE universe_cycling;

-- CATEGORY table
CREATE TABLE category (
    name VARCHAR(50) PRIMARY KEY
);

-- PRODUCT table
CREATE TABLE product (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    product_tag VARCHAR(100)
);

-- USER table
CREATE TABLE user (
    email VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    type ENUM('seller', 'buyer') NOT NULL
);

-- CART table
CREATE TABLE cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255),
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES user(email)
);

-- ORDER table
CREATE TABLE `order` (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    address VARCHAR(255) NOT NULL,
    street VARCHAR(255) NOT NULL,
    street_number VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    status ENUM('processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'processing',
    email VARCHAR(255),
    FOREIGN KEY (email) REFERENCES user(email)
);

-- NOTIFICATION table
CREATE TABLE notification (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    notification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email VARCHAR(255),
    FOREIGN KEY (email) REFERENCES user(email)
);

-- Relation table between PRODUCT and CATEGORY (normalized)
CREATE TABLE product_category (
    product_id INT,
    category_name VARCHAR(50),
    PRIMARY KEY (product_id, category_name),
    FOREIGN KEY (product_id) REFERENCES product(product_id),
    FOREIGN KEY (category_name) REFERENCES category(name)
);

-- Relation table between CART and PRODUCT (normalized)
CREATE TABLE cart_product (
    cart_id INT,
    product_id INT,
    quantity INT DEFAULT 1,
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cart_id, product_id),
    FOREIGN KEY (cart_id) REFERENCES cart(cart_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);

-- Relation table between ORDER and PRODUCT (normalized)
CREATE TABLE order_product (
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES `order`(order_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);

-- Sample data insertion
INSERT INTO category (name) VALUES 
('Road Bikes'),
('Mountain Bikes'),
('Accessories'),
('Clothing');

INSERT INTO product (name, description, color, price, stock, product_tag) VALUES
('Trek Émonda SL 6', 'Professional road bike', 'Red', 3499.99, 5, 'road-bike'),
('Specialized Epic EVO', 'Full suspension mountain bike', 'Green', 4299.99, 3, 'mtb'),
('Giro Syntax Helmet', 'Aerodynamic helmet', 'Black', 89.99, 20, 'accessories'),
('Castelli Jersey', 'Summer technical jersey', 'Blue', 79.99, 30, 'clothing');

INSERT INTO user (email, first_name, last_name, password, type) VALUES
('john.doe@email.com', 'John', 'Doe', 'password123', 'buyer'),
('bike.shop@email.com', 'Bike', 'Shop', 'shop123', 'seller'),
('jane.smith@email.com', 'Jane', 'Smith', 'jane123', 'buyer');

INSERT INTO cart (email) VALUES
('john.doe@email.com'),
('jane.smith@email.com');

INSERT INTO `order` (date, address, street, street_number, city, postal_code, status, email) VALUES
('2024-12-11 10:00:00', 'Home', 'Main Street', '123', 'New York', '10001', 'shipped', 'john.doe@email.com'),
('2024-12-11 11:30:00', 'Office', 'Park Avenue', '45', 'Boston', '02108', 'processing', 'jane.smith@email.com');

INSERT INTO notification (title, description, type, email) VALUES
('Order confirmed', 'Your order #1 has been confirmed', 'order', 'john.doe@email.com'),
('New product', 'New bike available', 'marketing', 'jane.smith@email.com');

INSERT INTO product_category (product_id, category_name) VALUES
(1, 'Road Bikes'),
(2, 'Mountain Bikes'),
(3, 'Accessories'),
(4, 'Clothing');

INSERT INTO cart_product (cart_id, product_id, quantity) VALUES
(1, 3, 1),
(1, 4, 2),
(2, 1, 1);

INSERT INTO order_product (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 3499.99),
(1, 3, 1, 89.99),
(2, 2, 1, 4299.99);
