require('dotenv').config({ path: __dirname + '/../.env' });
const { createClient } = require('@supabase/supabase-js');
const { fakerEN_IN: faker } = require('@faker-js/faker');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const CATEGORY_COUNT = 8;
const PRODUCT_COUNT = 50;
const VARIANT_COUNT = 150;
const CUSTOMER_COUNT = 5000;
const ORDER_COUNT = 12000;

// Fashion Cloudinary placeholders
const CLOUDINARY_IMAGES = [
  'https://res.cloudinary.com/demo/image/upload/w_400,h_500,c_fill/docs/models.jpg',
  'https://res.cloudinary.com/demo/image/upload/w_400,h_500,c_fill/sample.jpg',
  'https://res.cloudinary.com/demo/image/upload/w_400,h_500,c_fill/shoe.jpg',
  'https://res.cloudinary.com/demo/image/upload/w_400,h_500,c_fill/docs/camera.jpg', // bag/accessory
  'https://res.cloudinary.com/demo/image/upload/w_400,h_500,c_fill/flower.jpg', // patterned
  'https://res.cloudinary.com/demo/image/upload/w_400,h_500,c_fill/yellow_tulip.jpg', // bright
];

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function seed() {
  console.log('🌱 Starting Supabase Seeding Process...');

  // 1. Truncate Tables
  console.log('Clearing existing data (if allowed by policies)...');
  await supabase.from('order_items').delete().neq('id', 0);
  await supabase.from('orders').delete().neq('order_id', 0);
  await supabase.from('customers').delete().neq('customer_id', 0);
  await supabase.from('price_history').delete().neq('id', 0);
  await supabase.from('product_variants').delete().neq('sku', '0');
  await supabase.from('products').delete().neq('id', 0);
  await supabase.from('categories').delete().neq('id', 0);

  // 2. Categories
  console.log(`Generating ${CATEGORY_COUNT} Categories...`);
  const categories = [
    { name: 'Dresses' }, { name: 'Tops' }, { name: 'Bottoms' }, { name: 'Outerwear' },
    { name: 'Activewear' }, { name: 'Accessories' }, { name: 'Footwear' }, { name: 'Jewelry' }
  ];
  const { data: catData, error: catErr } = await supabase.from('categories').insert(categories).select('id, name');
  if (catErr) { console.error('Category error:', catErr); return; }

  // 3. Products
  console.log(`Generating ${PRODUCT_COUNT} Products...`);
  const products = [];
  
  const categoryProducts = {
    'Dresses': ['Floral Maxi Dress', 'Satin Slip Dress', 'Cotton Wrap Dress', 'Cocktail Midi Dress', 'Summer Sundress', 'Bodycon Knit Dress'],
    'Tops': ['Classic White T-Shirt', 'Silk Button-Down Blouse', 'Linen Crop Top', 'Oversized Graphic Tee', 'Ribbed Tank Top', 'Chunky Knit Sweater'],
    'Bottoms': ['High-Waisted Wide Leg Jeans', 'Tailored Linen Trousers', 'Pleated Midi Skirt', 'Vintage Wash Denim Shorts', 'Seamless Yoga Pants'],
    'Outerwear': ['Classic Denim Jacket', 'Oversized Trench Coat', 'Vegan Leather Biker Jacket', 'Cozy Puffer Vest', 'Wool Blend Peacoat'],
    'Activewear': ['High-Impact Sports Bra', 'Performance Leggings', 'Breathable Running Shorts', 'Zip-Up Track Jacket', 'Moisture-Wicking Tank'],
    'Accessories': ['Leather Crossbody Bag', 'Canvas Tote Bag', 'Silk Printed Scarf', 'Polarized Sunglasses', 'Chunky Knit Beanie'],
    'Footwear': ['Classic White Sneakers', 'Leather Penny Loafers', 'Suede Ankle Boots', 'Strappy Block Sandals', 'Breathable Running Shoes'],
    'Jewelry': ['Gold Hoop Earrings', 'Layered Pendant Necklace', 'Stackable Silver Rings', 'Minimalist Charm Bracelet', 'Rose Gold Watch']
  };

  for (let i = 0; i < PRODUCT_COUNT; i++) {
    const category = faker.helpers.arrayElement(catData);
    const catName = category.name;
    const prodName = faker.helpers.arrayElement(categoryProducts[catName] || ['Fashion Item']);

    products.push({
      name: prodName,
      description: faker.commerce.productDescription(),
      material_composition: faker.helpers.arrayElement(['100% Cotton', 'Polyester Blend', 'Silk', 'Linen', 'Denim', 'Recycled Materials']),
      base_category_id: category.id,
      season_collection: faker.helpers.arrayElement(['Summer 2024', 'Winter 2024', 'Spring 2025', 'Core Classics'])
    });
  }
  const { data: prodData, error: prodErr } = await supabase.from('products').insert(products).select('id, name, base_category_id');
  if (prodErr) { console.error('Product error:', prodErr); return; }

  // 4. Product Variants
  console.log(`Generating ${VARIANT_COUNT} Variants...`);
  const variants = [];
  for (let i = 0; i < VARIANT_COUNT; i++) {
    variants.push({
      sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
      product_id: faker.helpers.arrayElement(prodData).id,
      color_family: faker.color.human(),
      exact_color_name: faker.color.human(),
      size: faker.helpers.arrayElement(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']),
      current_price: parseFloat(faker.commerce.price({ min: 150, max: 1800, dec: 0 })),
      stock_quantity: faker.number.int({ min: 0, max: 500 }),
      image_url: faker.helpers.arrayElement(CLOUDINARY_IMAGES)
    });
  }
  const { data: varData, error: varErr } = await supabase.from('product_variants').insert(variants).select('sku, current_price');
  if (varErr) { console.error('Variant error:', varErr); return; }

  // 5. Customers
  console.log(`Generating ${CUSTOMER_COUNT} Customers...`);
  const indianCities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];
  const customers = [];
  for (let i = 0; i < CUSTOMER_COUNT; i++) {
    customers.push({
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: `user${i}_${faker.internet.email().toLowerCase()}`,
      phone: faker.phone.number({ style: 'national' }),
      shipping_city: faker.helpers.arrayElement(indianCities),
      shipping_country: 'India',
      date_of_birth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      loyalty_tier: faker.helpers.arrayElement(['Standard', 'Standard', 'Standard', 'Silver', 'Silver', 'Gold', 'Platinum']),
      size_preference_top: faker.helpers.arrayElement(['S', 'M', 'L']),
      size_preference_bottom: faker.helpers.arrayElement(['28', '30', '32', '34']),
      preferred_color_palette: faker.helpers.arrayElement(['Neutrals', 'Pastels', 'Brights', 'Dark', 'Earth Tones']),
      created_at: faker.date.past({ years: 2 })
    });
  }
  
  // Insert customers in chunks of 500 to avoid timeout
  let custData = [];
  for (let i = 0; i < customers.length; i += 500) {
    const chunk = customers.slice(i, i + 500);
    const { data: cData, error: cErr } = await supabase.from('customers').insert(chunk).select('customer_id');
    if (cErr) { console.error('Customer error:', cErr); return; }
    custData = custData.concat(cData);
  }

  // 6 & 7. Orders and Order Items
  console.log(`Generating ${ORDER_COUNT} Orders over 2 years...`);
  const orders = [];
  const orderItems = [];
  
  for (let i = 0; i < ORDER_COUNT; i++) {
    const status = faker.helpers.arrayElement(['Completed', 'Completed', 'Completed', 'Completed', 'Shipped', 'Pending', 'Cancelled']);
    
    // Guarantee at least 1 order per customer for the first CUSTOMER_COUNT orders
    const targetCustomerId = i < custData.length 
        ? custData[i].customer_id 
        : faker.helpers.arrayElement(custData).customer_id;

    const numItems = faker.number.int({ min: 1, max: 3 });
    let subtotal = 0;
    
    // Create temporary items for this order
    const currentOrderItems = [];
    for (let j = 0; j < numItems; j++) {
      const variant = faker.helpers.arrayElement(varData);
      const qty = faker.number.int({ min: 1, max: 2 });
      const price = variant.current_price;
      subtotal += (price * qty);

      currentOrderItems.push({
        sku: variant.sku,
        quantity: qty,
        price_at_purchase: price,
        return_status: faker.helpers.arrayElement(['Kept', 'Kept', 'Kept', 'Kept', 'Kept', 'Kept', 'Kept', 'Returned']),
        created_at: faker.date.past({ years: 2 })
      });
    }

    const discountAmount = faker.helpers.arrayElement([0, 0, 0, 50, 100, 200, 500]);
    const totalPaid = Math.max(0, subtotal - discountAmount);

    orders.push({
      customer_id: targetCustomerId,
      order_date: faker.date.past({ years: 2 }),
      subtotal: subtotal,
      total_amount_paid: totalPaid,
      discount_code_used: discountAmount > 0 ? `DISCOUNT${discountAmount}` : null,
      status: status,
      _items: currentOrderItems // Temporary hold
    });
  }

  console.log(`Inserting Orders and mapping Order Items...`);
  for (let i = 0; i < orders.length; i += 500) {
    const chunk = orders.slice(i, i + 500);
    // Strip _items before inserting
    const chunkToInsert = chunk.map(o => {
      const { _items, ...rest } = o;
      return rest;
    });

    const { data: oData, error: oErr } = await supabase.from('orders').insert(chunkToInsert).select('order_id');
    if (oErr) { console.error('Order error:', oErr); return; }
    
    // Re-map items with actual order_id
    for (let j = 0; j < oData.length; j++) {
      const realOrderId = oData[j].order_id;
      const itemsForThisOrder = chunk[j]._items;
      itemsForThisOrder.forEach(item => {
        item.order_id = realOrderId;
        orderItems.push(item);
      });
    }
  }

  console.log(`Inserting ${orderItems.length} Order Items...`);
  for (let i = 0; i < orderItems.length; i += 1000) {
    const chunk = orderItems.slice(i, i + 1000);
    const { error: oiErr } = await supabase.from('order_items').insert(chunk);
    if (oiErr) { console.error('Order Items error:', oiErr); return; }
  }

  console.log('✅ Seeding Complete! Over 2 years of data generated.');
}

seed();
