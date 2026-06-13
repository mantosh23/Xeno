CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    shipping_city VARCHAR(100),
    shipping_country VARCHAR(100),
    date_of_birth DATE,
    loyalty_tier VARCHAR(50) DEFAULT 'Standard',
    size_preference_top VARCHAR(20),
    size_preference_bottom VARCHAR(20),
    preferred_color_palette VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
