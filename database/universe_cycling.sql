-- Create tags table
CREATE TABLE tag (
    tag_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Create category table
CREATE TABLE category (
    name VARCHAR(50) PRIMARY KEY
);

-- Create product table with image field
CREATE TABLE product (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    image_path VARCHAR(255),
    is_new BOOLEAN DEFAULT FALSE
);

-- Create user table
CREATE TABLE `user` (
    email VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    type ENUM('seller', 'buyer') NOT NULL
);

-- Create cart table
CREATE TABLE cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255),
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES `user`(email)
);

-- Create order table
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
    FOREIGN KEY (email) REFERENCES `user`(email)
);

-- Create notification table
CREATE TABLE notification (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    notification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email VARCHAR(255),
    FOREIGN KEY (email) REFERENCES `user`(email)
);

-- Create product_category junction table
CREATE TABLE product_category (
    product_id INT,
    category_name VARCHAR(50),
    PRIMARY KEY (product_id, category_name),
    FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE,
    FOREIGN KEY (category_name) REFERENCES category(name) ON DELETE CASCADE
);

-- Create product_tag junction table
CREATE TABLE product_tag (
    product_id INT,
    tag_id INT,
    PRIMARY KEY (product_id, tag_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tag(tag_id) ON DELETE CASCADE
);

-- Create cart_product junction table
CREATE TABLE cart_product (
    cart_id INT,
    product_id INT,
    quantity INT DEFAULT 1,
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cart_id, product_id),
    FOREIGN KEY (cart_id) REFERENCES cart(cart_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);

-- Create order_product junction table
CREATE TABLE order_product (
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES `order`(order_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);

-- Insert categories based on actual image folders
INSERT INTO category (name) VALUES 
('Clothes'),
('Gears'),
('Helmets'),
('Saddles'),
('Shoes');

-- Insert tags
INSERT INTO tag (name) VALUES 
('newarrivals'),
('featured'),
('bestseller'),
('sale');

-- Insert sample products with actual categories and images
INSERT INTO product (name, description, color, price, stock, image_path, is_new) VALUES
-- Clothes
('Pro Cycling Jersey', 'High-performance cycling jersey with moisture-wicking fabric', 'Blue', 89.99, 20, 'img/clothes/jersey_blue.jpg', true),
('Winter Cycling Jacket', 'Warm and waterproof cycling jacket for cold weather', 'Black', 149.99, 15, 'img/clothes/jacket_black.jpg', false),

-- Gears
('Shimano Ultegra R8000', 'Professional grade gear shifter set', 'Silver', 299.99, 10, 'img/gears/ultegra_r8000.jpg', true),
('SRAM X01 Eagle', 'High-end mountain bike derailleur', 'Black', 259.99, 8, 'img/gears/sram_eagle.jpg', false),

-- Helmets
('Aero Pro Helmet', 'Aerodynamic racing helmet with excellent ventilation', 'White', 179.99, 12, 'img/helmets/aero_pro.jpg', true),
('Mountain Bike Helmet', 'Durable helmet with extended coverage', 'Green', 129.99, 18, 'img/helmets/mtb_green.jpg', false),

-- Saddles
('Carbon Racing Saddle', 'Lightweight carbon fiber racing saddle', 'Black', 159.99, 15, 'img/saddles/carbon_race.jpg', true),
('Comfort Gel Saddle', 'Ergonomic gel saddle for comfortable rides', 'Brown', 89.99, 20, 'img/saddles/gel_comfort.jpg', false),

-- Shoes
('Pro Race Shoes', 'Carbon-soled professional racing shoes', 'Red', 249.99, 10, 'img/shoes/race_red.jpg', true),
('MTB Trail Shoes', 'Durable mountain biking shoes with grip', 'Black', 189.99, 14, 'img/shoes/mtb_trail.jpg', false);

-- Link products with categories
INSERT INTO product_category (product_id, category_name)
SELECT p.product_id, c.name
FROM product p
CROSS JOIN category c
WHERE 
    (c.name = 'Clothes' AND p.image_path LIKE '%clothes%') OR
    (c.name = 'Gears' AND p.image_path LIKE '%gears%') OR
    (c.name = 'Helmets' AND p.image_path LIKE '%helmets%') OR
    (c.name = 'Saddles' AND p.image_path LIKE '%saddles%') OR
    (c.name = 'Shoes' AND p.image_path LIKE '%shoes%');

-- Link new products with 'newarrivals' tag
INSERT INTO product_tag (product_id, tag_id)
SELECT p.product_id, t.tag_id
FROM product p, tag t
WHERE t.name = 'newarrivals' AND p.is_new = true;
