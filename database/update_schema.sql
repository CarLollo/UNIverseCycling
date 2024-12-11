-- Create tags table
CREATE TABLE IF NOT EXISTS tag (
    tag_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Create product_tag junction table
CREATE TABLE IF NOT EXISTS product_tag (
    product_id INT,
    tag_id INT,
    PRIMARY KEY (product_id, tag_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tag(tag_id) ON DELETE CASCADE
);

-- Insert basic tags
INSERT INTO tag (name) VALUES 
('newarrivals'),
('featured'),
('bestseller'),
('sale');

-- Add sample products with newarrivals tag
INSERT INTO product (name, description, price, product_tag) VALUES
('Pro Racing Bike 2024', 'Latest professional racing bike model', 2499.99, 'bike_racing'),
('Carbon Fiber Helmet', 'Lightweight protective gear', 199.99, 'helmet_carbon'),
('Smart Cycling Computer', 'Advanced GPS tracking device', 299.99, 'computer_smart');

-- Link products with newarrivals tag
INSERT INTO product_tag (product_id, tag_id)
SELECT p.product_id, t.tag_id
FROM product p, tag t
WHERE t.name = 'newarrivals'
AND p.product_id IN (
    SELECT product_id 
    FROM product 
    WHERE name IN ('Pro Racing Bike 2024', 'Carbon Fiber Helmet', 'Smart Cycling Computer')
);
