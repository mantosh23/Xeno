CREATE TABLE IF NOT EXISTS product_variants (
    sku VARCHAR(100) PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color_family VARCHAR(50),
    exact_color_name VARCHAR(100),
    size VARCHAR(20),
    current_price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
