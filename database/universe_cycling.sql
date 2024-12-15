-- Drop existing tables if they exist
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS product_category;
DROP TABLE IF EXISTS product_tag;
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS tag;
DROP TABLE IF EXISTS `user`;

-- Create tags table
CREATE TABLE tag (
    tag_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL
);

-- Create categories table
CREATE TABLE category (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

-- Create users table
CREATE TABLE `user` (
    email VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    type ENUM('admin', 'buyer') NOT NULL DEFAULT 'buyer'
);

-- Create products table
CREATE TABLE product (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    image_path VARCHAR(255)
);

-- Create cart table
CREATE TABLE cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255),
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES `user`(email),
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);

-- Create product_category junction table
CREATE TABLE product_category (
    product_id INT,
    category_id INT,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id),
    FOREIGN KEY (category_id) REFERENCES category(category_id)
);

-- Create product_tag junction table
CREATE TABLE product_tag (
    product_id INT,
    tag_id INT,
    PRIMARY KEY (product_id, tag_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id),
    FOREIGN KEY (tag_id) REFERENCES tag(tag_id)
);

-- Insert sample categories
INSERT INTO category (name, description) VALUES
('Bikes', 'All types of bicycles'),
('Accessories', 'Bike accessories and gear'),
('Clothing', 'Cycling apparel'),
('Parts', 'Bicycle parts and components');

-- Insert sample tags
INSERT INTO tag (name) VALUES
('new'),
('featured'),
('bestseller'),
('sale');

-- Insert test user
INSERT INTO `user` (email, first_name, last_name, password, type) 
VALUES ('test@example.com', 'Test', 'User', 'password123', 'buyer');

-- Insert sample products
INSERT INTO product (name, description, color, price, stock, image_path) VALUES
-- Clothes
('Pro Cycling Jersey', 'High-performance cycling jersey', 'Blue', 79.99, 50, 'assets/products/jersey-blue.jpg'),
('Cycling Shorts', 'Padded cycling shorts', 'Black', 59.99, 30, 'assets/products/shorts-black.jpg'),
('Winter Cycling Jacket', 'Warm winter cycling jacket', 'Red', 129.99, 20, 'assets/products/jacket-red.jpg'),
-- Accessories
('Cycling Helmet', 'Safety certified cycling helmet', 'White', 89.99, 40, 'assets/products/helmet-white.jpg'),
('Bike Light Set', 'Front and rear LED lights', 'Black', 29.99, 100, 'assets/products/lights.jpg'),
('Cycling Gloves', 'Padded cycling gloves', 'Black', 24.99, 60, 'assets/products/gloves-black.jpg'),
-- Parts
('Road Bike Tires', 'High-grip road bike tires', 'Black', 49.99, 80, 'assets/products/tires.jpg'),
('Bike Pedals', 'Aluminum alloy pedals', 'Silver', 39.99, 45, 'assets/products/pedals.jpg'),
('Bike Chain', 'Durable bike chain', 'Silver', 19.99, 70, 'assets/products/chain.jpg');

-- Link products to categories
INSERT INTO product_category (product_id, category_id) VALUES
(1, 3), -- Jersey -> Clothing
(2, 3), -- Shorts -> Clothing
(3, 3), -- Jacket -> Clothing
(4, 2), -- Helmet -> Accessories
(5, 2), -- Lights -> Accessories
(6, 2), -- Gloves -> Accessories
(7, 4), -- Tires -> Parts
(8, 4), -- Pedals -> Parts
(9, 4); -- Chain -> Parts

-- Add some tags to products
INSERT INTO product_tag (product_id, tag_id) VALUES
(1, 1), -- Jersey -> new
(1, 2), -- Jersey -> featured
(4, 2), -- Helmet -> featured
(4, 3), -- Helmet -> bestseller
(7, 4); -- Tires -> sale
