const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const supabase = require('../config/supabase');

const BATCH_SIZE = 500;
const CUSTOMER_COUNT = 5000;
const ORDER_COUNT = 20000;
const CATEGORY_COUNT = 20;
const PRODUCT_COUNT = 200;
const VARIANT_COUNT_PER_PRODUCT = 5;

// Utility functions
function chunkArray(array, size) {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
    }
    return chunked;
}

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Pools
const FIRST_NAMES = ["Ananya", "Rohan", "Priya", "Rahul", "Sneha", "Vikram", "Aisha", "Karan", "Pooja", "Arjun", "Neha", "Ravi", "Simran", "Amit", "Ishaan"];
const LAST_NAMES = ["Sharma", "Verma", "Patel", "Singh", "Gupta", "Rao", "Joshi", "Nair", "Reddy", "Das", "Menon", "Kapoor", "Chopra", "Bose"];
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Surat"];
const COLORS = ["Earth Tones", "Pastels", "Monochrome", "Jewel Tones", "Neon"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const BOTTOM_SIZES = ["28", "30", "32", "34", "36", "38", "40"];
const CATEGORY_NAMES = ["Dresses", "Tops", "Outerwear", "Activewear", "Swimwear", "Jeans", "Trousers", "Skirts", "Shoes", "Bags", "Jewelry", "Accessories", "Loungewear", "Intimates", "Suits", "Shorts", "Sweaters", "T-Shirts", "Blouses", "Coats"];
const MATERIALS = ["100% Cotton", "Linen Blend", "Silk", "Polyester", "Wool", "Denim", "Leather", "Vegan Leather", "Cashmere"];
const COUNTRIES = ["India", "USA", "UK", "Australia", "Canada", "Singapore"];

async function seedLargeData() {
    console.log(`\n🌱 Starting MASSIVE database seeding...`);
    console.log(`Target: ${CATEGORY_COUNT} Categories, ${PRODUCT_COUNT} Products, ${CUSTOMER_COUNT} Customers, ${ORDER_COUNT} Orders.\n`);

    try {
        // 1. Categories
        console.log("📦 Creating categories...");
        const categoryData = CATEGORY_NAMES.map(name => ({ name }));
        const { data: insertedCategories, error: catErr } = await supabase.from('categories').insert(categoryData).select('id');
        if (catErr) throw catErr;
        const categoryIds = insertedCategories.map(c => c.id);

        // 2. Products
        console.log(`📦 Creating ${PRODUCT_COUNT} products...`);
        const productsToInsert = [];
        for (let i = 0; i < PRODUCT_COUNT; i++) {
            productsToInsert.push({
                name: `Fashion Item ${i + 1}`,
                description: `A highly sought-after fashion piece. Style #${i+1}`,
                base_category_id: randomChoice(categoryIds),
                material_composition: randomChoice(MATERIALS),
                season_collection: randomChoice(["Spring 2025", "Summer 2025", "Autumn/Winter 2025", "Spring 2026", "Summer 2026"])
            });
        }
        const { data: insertedProducts, error: prodErr } = await supabase.from('products').insert(productsToInsert).select('id');
        if (prodErr) throw prodErr;

        // 3. Product Variants
        console.log(`📦 Creating ${PRODUCT_COUNT * VARIANT_COUNT_PER_PRODUCT} variants...`);
        const variantsData = [];
        for (const prod of insertedProducts) {
            for (let i = 0; i < VARIANT_COUNT_PER_PRODUCT; i++) {
                let colorFam = randomChoice(["Blue", "Red", "Green", "Black", "White", "Pink", "Yellow", "Brown"]);
                let modifiers = ["Midnight", "Vibrant", "Pale", "Deep", "Classic", "Neon", "Matte"];
                
                variantsData.push({
                    sku: `SKU-${prod.id}-VAR-${i}`,
                    product_id: prod.id,
                    color_family: colorFam,
                    exact_color_name: `${randomChoice(modifiers)} ${colorFam}`,
                    size: randomChoice(SIZES),
                    current_price: randomInt(20, 250),
                    stock_quantity: randomInt(10, 500)
                });
            }
        }
        
        let allVariants = [];
        for (const chunk of chunkArray(variantsData, BATCH_SIZE)) {
            const { data, error } = await supabase.from('product_variants').insert(chunk).select('sku');
            if (error) throw error;
            allVariants.push(...data);
        }
        console.log(`✅ Created ${allVariants.length} Variants.\n`);

        // 4. Customers
        console.log(`👥 Generating ${CUSTOMER_COUNT} Customers...`);
        let customersToInsert = [];
        for (let i = 0; i < CUSTOMER_COUNT; i++) {
            customersToInsert.push({
                first_name: randomChoice(FIRST_NAMES),
                last_name: randomChoice(LAST_NAMES),
                email: `user${i}_${Math.random().toString(36).substring(7)}@example.com`,
                phone: `+9198${Math.floor(10000000 + Math.random() * 90000000)}`, // Generates fake Indian phone numbers
                shipping_city: randomChoice(CITIES),
                shipping_country: randomChoice(COUNTRIES),
                date_of_birth: randomDate(new Date(1970, 0, 1), new Date(2005, 0, 1)).toISOString().split('T')[0],
                loyalty_tier: randomChoice(['Standard', 'Standard', 'Gold', 'Platinum']),
                size_preference_top: randomChoice(SIZES),
                size_preference_bottom: randomChoice(BOTTOM_SIZES),
                preferred_color_palette: randomChoice(COLORS)
            });
        }

        let customerIds = [];
        const customerChunks = chunkArray(customersToInsert, BATCH_SIZE);
        let count = 0;
        for (const chunk of customerChunks) {
            const { data, error } = await supabase.from('customers').insert(chunk).select('customer_id');
            if (error) throw error;
            customerIds.push(...data.map(d => d.customer_id));
            count += chunk.length;
            process.stdout.write(`\r   -> Inserted ${count}/${CUSTOMER_COUNT} customers`);
        }
        console.log(`\n✅ Finished creating 5,000 customers.\n`);

        // 5. Orders & Items
        console.log(`🛒 Generating ${ORDER_COUNT} Orders & Items...`);
        let ordersToInsert = [];
        for (let i = 0; i < ORDER_COUNT; i++) {
            ordersToInsert.push({
                customer_id: randomChoice(customerIds),
                subtotal: 0,
                total_amount_paid: randomInt(30, 800),
                status: randomChoice(['Completed', 'Completed', 'Completed', 'Shipped', 'Refunded']),
                order_date: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
                discount_code_used: randomChoice([null, null, "SUMMER10", "WELCOME20", "FLASH50"])
            });
        }

        const orderChunks = chunkArray(ordersToInsert, BATCH_SIZE);
        count = 0;
        for (const chunk of orderChunks) {
            const { data: insertedOrders, error: ordErr } = await supabase.from('orders').insert(chunk).select('order_id');
            if (ordErr) throw ordErr;
            
            let itemsToInsert = insertedOrders.map(o => ({
                order_id: o.order_id,
                sku: randomChoice(allVariants).sku,
                quantity: randomInt(1, 4),
                price_at_purchase: randomInt(20, 250),
                return_status: randomChoice(['Kept', 'Kept', 'Kept', 'Kept', 'Returned - Size Issue', 'Returned - Damaged'])
            }));
            
            const { error: itemErr } = await supabase.from('order_items').insert(itemsToInsert);
            if (itemErr) throw itemErr;

            count += chunk.length;
            process.stdout.write(`\r   -> Inserted ${count}/${ORDER_COUNT} orders`);
        }
        console.log(`\n✅ Finished creating 20,000 orders and their items.\n`);
        console.log("🎉 MASSIVE DATASET SEEDED SUCCESSFULLY! No more NULLs.");

    } catch (err) {
        console.error("\n❌ Seeding failed:", err);
    }
}

seedLargeData();
