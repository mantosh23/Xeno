// Load environment variables at the very beginning
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const supabase = require('../config/supabase');

async function seedDatabase() {
    console.log("🌱 Starting database seeding...");

    try {
        // 1. Seed Categories
        console.log("Inserting Category...");
        const { data: category, error: catErr } = await supabase
            .from('categories')
            .insert([{ name: 'Dresses' }])
            .select()
            .single();
        if (catErr) throw catErr;

        // 2. Seed Products
        console.log("Inserting Product...");
        const { data: product, error: prodErr } = await supabase
            .from('products')
            .insert([{
                name: 'Summer Breeze Wrap Dress',
                description: 'A beautiful and light wrap dress perfect for summer.',
                base_category_id: category.id,
                material_composition: '80% Cotton, 20% Linen',
                season_collection: 'Spring/Summer 2026'
            }])
            .select()
            .single();
        if (prodErr) throw prodErr;

        // 3. Seed Product Variant
        console.log("Inserting Product Variant...");
        const { data: variant, error: varErr } = await supabase
            .from('product_variants')
            .insert([{
                sku: 'DRS-SUM-BLU-M',
                product_id: product.id,
                color_family: 'Blue',
                exact_color_name: 'Navy Blue',
                size: 'M',
                current_price: 120.00,
                stock_quantity: 50
            }])
            .select()
            .single();
        if (varErr) throw varErr;

        // 4. Seed Price History
        console.log("Inserting Price History...");
        const { error: priceErr } = await supabase
            .from('price_history')
            .insert([{
                sku: variant.sku,
                old_price: 120.00,
                new_price: 85.00,
                change_reason: 'End of Season Sale',
                approved_by_user: 'Admin'
            }]);
        if (priceErr) throw priceErr;

        // 5. Seed Customer
        console.log("Inserting Customer...");
        const { data: customer, error: custErr } = await supabase
            .from('customers')
            .insert([{
                first_name: 'Ananya',
                last_name: 'Sharma',
                email: 'ananya@example.com',
                shipping_city: 'Mumbai',
                shipping_country: 'India',
                date_of_birth: '2002-05-15',
                loyalty_tier: 'Platinum',
                size_preference_top: 'M',
                size_preference_bottom: '30',
                preferred_color_palette: 'Earth Tones'
            }])
            .select()
            .single();
        if (custErr) throw custErr;

        // 6. Seed Order
        console.log("Inserting Order...");
        const { data: order, error: orderErr } = await supabase
            .from('orders')
            .insert([{
                customer_id: customer.customer_id,
                subtotal: 85.00,
                total_amount_paid: 85.00,
                status: 'Completed'
            }])
            .select()
            .single();
        if (orderErr) throw orderErr;

        // 7. Seed Order Items
        console.log("Inserting Order Items...");
        const { error: itemErr } = await supabase
            .from('order_items')
            .insert([{
                order_id: order.order_id,
                sku: variant.sku,
                quantity: 1,
                price_at_purchase: 85.00,
                return_status: 'Kept'
            }]);
        if (itemErr) throw itemErr;

        console.log("✅ Database seeded successfully!");

    } catch (err) {
        console.error("❌ Seeding failed:", err);
    }
}

seedDatabase();
