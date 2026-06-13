CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL REFERENCES product_variants(sku) ON DELETE RESTRICT,
    quantity INT NOT NULL DEFAULT 1,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    return_status VARCHAR(100) DEFAULT 'Kept',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
