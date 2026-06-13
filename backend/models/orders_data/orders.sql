CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10, 2) NOT NULL,
    total_amount_paid DECIMAL(10, 2) NOT NULL,
    discount_code_used VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Completed'
);
