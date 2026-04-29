-- Seed data for Restaurant App

-- Tables
INSERT INTO tables (id, name) VALUES ('T-01', 'Table 1');
INSERT INTO tables (id, name) VALUES ('T-02', 'Table 2');
INSERT INTO tables (id, name) VALUES ('T-03', 'Table 3');

-- Categories
INSERT INTO categories (id, name) VALUES ('cat-pizza', 'Pizzas');
INSERT INTO categories (id, name) VALUES ('cat-drinks', 'Drinks');

-- Menus
INSERT INTO menus (id, category_id, name, description, price, image) VALUES 
('m-1', 'cat-pizza', 'Vegetarian Pizza', 'Fresh vegetables and mozzarella', 15.00, '/img/product-1.png'),
('m-2', 'cat-pizza', 'Pepperoni Pizza', 'Spicy pepperoni and mozzarella', 10.00, '/img/product-2.png'),
('m-3', 'cat-pizza', 'Margherita Pizza', 'Tomato sauce and mozzarella', 12.00, '/img/product-3.png'),
('m-4', 'cat-pizza', 'Mushroom Pizza', 'Mushrooms and mozzarella', 17.00, '/img/product-4.png'),
('m-5', 'cat-pizza', 'Italian Pizza', 'Classic italian ingredients', 10.00, '/img/product-5.png');
