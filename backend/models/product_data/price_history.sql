CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) NOT NULL REFERENCES product_variants(sku) ON DELETE CASCADE,
    old_price DECIMAL(10, 2) NOT NULL,
    new_price DECIMAL(10, 2) NOT NULL,
    effective_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_reason VARCHAR(255) NOT NULL,
    approved_by_user VARCHAR(100)
);
