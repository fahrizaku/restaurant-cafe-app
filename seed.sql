-- Seed data for Restaurant App

-- Clean up existing data
DELETE FROM order_items;
DELETE FROM order_batches;
DELETE FROM table_sessions;
DELETE FROM menus;
DELETE FROM categories;
DELETE FROM tables;

-- Tables
INSERT INTO tables (id, name) VALUES ('T-01', 'Meja 1');
INSERT INTO tables (id, name) VALUES ('T-02', 'Meja 2');
INSERT INTO tables (id, name) VALUES ('T-03', 'Meja 3');
INSERT INTO tables (id, name) VALUES ('T-04', 'Meja 4');
INSERT INTO tables (id, name) VALUES ('T-05', 'Meja 5');

-- Categories
INSERT INTO categories (id, name, "order") VALUES ('cat-pizza', 'Pizzas', 1);
INSERT INTO categories (id, name, "order") VALUES ('cat-drinks', 'Minuman', 2);
INSERT INTO categories (id, name, "order") VALUES ('cat-desserts', 'Desserts', 3);

-- Menus
-- Pizzas
INSERT INTO menus (id, category_id, name, description, price, image) VALUES 
('m-1', 'cat-pizza', 'Vegetarian Pizza', 'Sayuran segar dengan keju mozzarella premium', 45000, '/img/product-1.png'),
('m-2', 'cat-pizza', 'Pepperoni Pizza', 'Pepperoni sapi pedas dengan lelehan keju mozzarella', 55000, '/img/product-2.png'),
('m-3', 'cat-pizza', 'Margherita Pizza', 'Saus tomat klasik, basil segar, dan mozzarella', 40000, '/img/product-3.png'),
('m-4', 'cat-pizza', 'Mushroom Pizza', 'Jamur pilihan dengan saus krim dan mozzarella', 48000, '/img/product-4.png'),
('m-5', 'cat-pizza', 'Italian Pizza', 'Resep klasik Italia dengan bumbu herba autentik', 52000, '/img/product-5.png'),
('m-6', 'cat-pizza', 'Meat Lovers Pizza', 'Kombinasi berbagai daging sapi dan ayam berkualitas', 65000, '/img/product-1.png');

-- Drinks
INSERT INTO menus (id, category_id, name, description, price, image) VALUES 
('m-10', 'cat-drinks', 'Iced Lemon Tea', 'Teh segar dengan perasan lemon asli', 15000, '/img/popular-1.png'),
('m-11', 'cat-drinks', 'Strawberry Mojito', 'Perpaduan strawberry, mint, dan soda segar', 25000, '/img/popular-2.png'),
('m-12', 'cat-drinks', 'Coffee Latte', 'Espresso dengan susu creamy pilihan', 22000, '/img/popular-3.png'),
('m-13', 'cat-drinks', 'Matcha Green Tea', 'Bubuk matcha murni dengan susu segar', 24000, '/img/popular-dish.png'),
('m-14', 'cat-drinks', 'Mineral Water', 'Air mineral pegunungan 600ml', 5000, '/img/popular-1.png');

-- Desserts
INSERT INTO menus (id, category_id, name, description, price, image) VALUES 
('m-20', 'cat-desserts', 'Chocolate Lava Cake', 'Kue cokelat hangat dengan lelehan di tengahnya', 30000, '/img/popular-2.png'),
('m-21', 'cat-desserts', 'Vanilla Ice Cream', '3 scoop es krim vanilla lembut dengan topping', 18000, '/img/popular-3.png'),
('m-22', 'cat-desserts', 'Cheese Cake', 'Kue keju lembut dengan selai strawberry', 35000, '/img/popular-dish.png');
