/**
 * seed_multi_category.js
 *
 * Faithfully reproduces the original seedMultiCategoryProducts.js logic from
 * commit e94a477 (backend-node/src/scripts/seedMultiCategoryProducts.js).
 *
 * Adaptations (minimal, no new logic):
 *  - Uses mongodb driver directly instead of Mongoose (no backend-node/config)
 *  - MongoDB URI points to the running Docker container (localhost:27017)
 *  - Populates BOTH field-name pairs so the .NET backend works correctly:
 *      department  / subcategory   (lowercase  — used by .NET hierarchy pipeline)
 *      primaryCategory / subCategory  (camelCase — used by .NET list filters)
 *
 * Steps (identical to original):
 *  1. Re-categorize existing Fashion products (add primaryCategory + subCategory)
 *  2. Fetch Electronics from https://dummyjson.com/products?limit=100
 *  3. Generate Beauty  products (hardcoded brands/titles, same arrays as original)
 *  4. Generate Home    products (hardcoded brands/titles, same arrays as original)
 */

'use strict';

const { MongoClient } = require('mongodb');

const MONGO_URI  = 'mongodb://localhost:27017/ecommerce?replicaSet=rs0&directConnection=true';
const DB_NAME    = 'ecommerce';
const COLLECTION = 'products';

// ─── Step 1: Fashion keyword mapping (identical to original) ────────────────
const fashionMappings = {
  Tops:        ['top', 'shirt', 'blouse', 'sweater', 'hoodie', 'tank', 'tee', 't-shirt', 'crop', 'vest'],
  Dresses:     ['dress', 'gown', 'midi'],
  Jeans:       ['jeans', 'denim'],
  Shoes:       ['shoe', 'sneaker', 'boot', 'heel', 'loafer', 'sandal', 'slipper', 'trainer'],
  Accessories: ['accessories', 'scarf', 'belt', 'hat', 'bag', 'purse', 'wallet', 'watch'],
  Trousers:    ['trouser', 'pant', 'slack', 'jogger', 'legging', 'flare'],
  Coats:       ['coat', 'jacket', 'blazer', 'cardigan', 'parka'],
};

function categorizeProduct(title) {
  const lower = title.toLowerCase();
  for (const [subCat, keywords] of Object.entries(fashionMappings)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) return subCat;
    }
  }
  return 'Accessories';
}

async function categorizeFashionProducts(col) {
  console.log('\n📦 Step 1: Re-categorizing existing Fashion products...');
  const fashionProducts = await col.find({ active: true, department: 'Fashion' }).toArray();
  console.log(`  Found ${fashionProducts.length} Fashion products`);

  const counts = {};
  for (const product of fashionProducts) {
    const subCat = categorizeProduct(product.title);
    counts[subCat] = (counts[subCat] || 0) + 1;
    await col.updateOne(
      { _id: product._id },
      { $set: { primaryCategory: 'Fashion', subCategory: subCat } }
    );
  }
  console.log(`  ✓ Updated ${fashionProducts.length} products`);
  console.log('  Fashion subcategory distribution:');
  Object.entries(counts).forEach(([c, n]) => console.log(`    ${c}: ${n}`));
  return fashionProducts.length;
}

// ─── Step 2: Electronics from DummyJSON (identical logic to original) ────────
async function fetchElectronicsProducts() {
  console.log('\n📦 Step 2: Fetching Electronics products from DummyJSON...');
  const response = await fetch('https://dummyjson.com/products?limit=100');
  const data     = await response.json();
  const raw      = data.products || [];
  console.log(`  ✓ Fetched ${raw.length} products from DummyJSON`);

  const now = new Date();
  const processed = raw.map((p, idx) => {
    // Subcategory mapping — identical to original
    let subCategory = 'Accessories';
    const cat = (p.category || '').toLowerCase();
    if (cat.includes('phone') || cat.includes('mobile'))          subCategory = 'Smartphones';
    else if (cat.includes('laptop') || cat.includes('computer'))  subCategory = 'Laptops';
    else if (cat.includes('headphone') || cat.includes('audio'))  subCategory = 'Headphones';
    else if (cat.includes('watch') || cat.includes('wearable'))   subCategory = 'Smart Watches';
    else if (cat.includes('camera') || cat.includes('photo'))     subCategory = 'Cameras';

    return {
      sku:             `ELEC-${Date.now()}-${idx}`,
      title:           p.title,
      description:     p.description || JSON.stringify([{ 'Product Details': p.description || '' }]),
      category:        p.category,
      // Both field-name conventions so .NET reads them correctly
      primaryCategory: 'Electronics',
      subCategory:     subCategory,
      department:      'Electronics',
      subcategory:     subCategory,
      brand:           p.brand || 'Generic',
      price_minor:     Math.round((p.price || 0) * 100),
      currency:        'USD',
      stock:           Math.floor(Math.random() * 100) + 10,
      active:          true,
      images:          [p.thumbnail || 'https://via.placeholder.com/400'],
      rating:          p.rating || parseFloat((Math.random() * 2 + 3).toFixed(1)),
      reviewsCount:    p.reviews?.length || Math.floor(Math.random() * 200),
      created_at:      now,
      updated_at:      now,
    };
  });
  return processed;
}

// ─── Step 3: Beauty (identical hardcoded data from original) ─────────────────
function generateBeautyProducts() {
  console.log('\n📦 Step 3: Generating Beauty products...');
  const beautyBrands   = ['Maybelline', 'MAC', 'Sephora', 'Charlotte Tilbury', 'Urban Decay'];
  const skincareTitles = ['Hydrating Face Cream', 'Anti-Aging Serum', 'Gentle Cleanser', 'Night Moisturizer', 'Eye Contour'];
  const makeupTitles   = ['Matte Lipstick', 'HD Foundation', 'Eyeshadow Palette', 'Mascara Black', 'Contour Kit'];
  const haircareTitles = ['Volumizing Shampoo', 'Repair Conditioner', 'Hair Oil', 'Styling Gel', 'Deep Mask'];

  const beautyCategories = {
    Skincare: skincareTitles,
    Makeup:   makeupTitles,
    Haircare: haircareTitles,
  };

  const now = new Date();
  const products = [];
  let idx = 0;

  for (const [subCat, titles] of Object.entries(beautyCategories)) {
    for (let i = 0; i < 5; i++) {
      const title = titles[i % titles.length];
      const brand = beautyBrands[i % beautyBrands.length];
      products.push({
        sku:             `BEAUTY-${Date.now()}-${idx}`,
        title:           `${brand} ${title}`,
        description:     JSON.stringify([{ 'Product Details': `Premium ${subCat.toLowerCase()} product by ${brand}` }]),
        category:        'Beauty',
        primaryCategory: 'Beauty',
        subCategory:     subCat,
        department:      'Beauty',
        subcategory:     subCat,
        brand:           brand,
        price_minor:     Math.round(Math.random() * 5000) + 1500,
        currency:        'USD',
        stock:           Math.floor(Math.random() * 80) + 20,
        active:          true,
        images:          ['https://via.placeholder.com/400?text=Beauty'],
        rating:          parseFloat((Math.random() * 2 + 3.5).toFixed(1)),
        reviewsCount:    Math.floor(Math.random() * 300),
        created_at:      now,
        updated_at:      now,
      });
      idx++;
    }
  }
  console.log(`  ✓ Generated ${products.length} Beauty products`);
  return products;
}

// ─── Step 4: Home (identical hardcoded data from original) ───────────────────
function generateHomeProducts() {
  console.log('\n📦 Step 4: Generating Home products...');
  const homeBrands = ['IKEA', 'West Elm', 'Restoration Hardware', 'Article', 'Room & Board'];
  const categories = {
    Furniture: ['Modern Sofa', 'Dining Table', 'Bookshelf', 'Bed Frame', 'Office Chair'],
    Decor:     ['Wall Art', 'Throw Pillow', 'Mirror', 'Rug', 'Lamp'],
    Kitchen:   ['Cookware Set', 'Coffee Maker', 'Blender', 'Knife Set', 'Baking Pan'],
    Bedding:   ['Sheet Set', 'Comforter', 'Pillowcase', 'Duvet Cover', 'Mattress Pad'],
    Lighting:  ['Ceiling Lamp', 'Table Light', 'Desk Lamp', 'Wall Sconce', 'Floor Light'],
  };

  const now = new Date();
  const products = [];
  let idx = 0;

  for (const [subCat, titles] of Object.entries(categories)) {
    for (let i = 0; i < 4; i++) {
      const title = titles[i % titles.length];
      const brand = homeBrands[i % homeBrands.length];
      products.push({
        sku:             `HOME-${Date.now()}-${idx}`,
        title:           `${brand} ${title}`,
        description:     JSON.stringify([{ 'Product Details': `Quality ${subCat.toLowerCase()} for your home by ${brand}` }]),
        category:        'Home',
        primaryCategory: 'Home',
        subCategory:     subCat,
        department:      'Home',
        subcategory:     subCat,
        brand:           brand,
        price_minor:     Math.round(Math.random() * 50000) + 5000,
        currency:        'USD',
        stock:           Math.floor(Math.random() * 60) + 15,
        active:          true,
        images:          ['https://via.placeholder.com/400?text=Home'],
        rating:          parseFloat((Math.random() * 2 + 3.5).toFixed(1)),
        reviewsCount:    Math.floor(Math.random() * 400),
        created_at:      now,
        updated_at:      now,
      });
      idx++;
    }
  }
  console.log(`  ✓ Generated ${products.length} Home products`);
  return products;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function seedMultipleCategories() {
  const client = new MongoClient(MONGO_URI);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    const col = client.db(DB_NAME).collection(COLLECTION);
    console.log('  ✓ Connected');

    console.log('\n=== MULTI-CATEGORY SEEDING ===');

    // Step 1: Re-categorize Fashion
    await categorizeFashionProducts(col);

    // Step 2: Electronics
    const electronics = await fetchElectronicsProducts();
    if (electronics.length > 0) {
      // Remove any previously-seeded Electronics first (idempotent re-run)
      const delE = await col.deleteMany({ department: 'Electronics' });
      if (delE.deletedCount > 0) console.log(`  ℹ️  Removed ${delE.deletedCount} existing Electronics products`);
      await col.insertMany(electronics);
      console.log(`  ✓ Inserted ${electronics.length} Electronics products`);
    }

    // Step 3: Beauty
    const beauty = generateBeautyProducts();
    if (beauty.length > 0) {
      const delB = await col.deleteMany({ department: 'Beauty' });
      if (delB.deletedCount > 0) console.log(`  ℹ️  Removed ${delB.deletedCount} existing Beauty products`);
      await col.insertMany(beauty);
      console.log(`  ✓ Inserted ${beauty.length} Beauty products`);
    }

    // Step 4: Home
    const home = generateHomeProducts();
    if (home.length > 0) {
      const delH = await col.deleteMany({ department: 'Home' });
      if (delH.deletedCount > 0) console.log(`  ℹ️  Removed ${delH.deletedCount} existing Home products`);
      await col.insertMany(home);
      console.log(`  ✓ Inserted ${home.length} Home products`);
    }

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log('\n=== SEEDING COMPLETE ===');
    const total = await col.countDocuments({ active: true });
    console.log(`\nTotal active products: ${total}`);

    const stats = await col.aggregate([
      { $match:  { active: true } },
      { $group:  { _id: '$department', count: { $sum: 1 }, subcats: { $addToSet: '$subcategory' } } },
      { $sort:   { _id: 1 } },
    ]).toArray();

    console.log('\nFinal category distribution:');
    stats.forEach(s => {
      const subs = (s.subcats || []).filter(Boolean).sort().join(', ');
      console.log(`  ${s._id}: ${s.count} products  (${subs})`);
    });

    console.log('\n✓ All categories seeded successfully!');
  } catch (err) {
    console.error('\n✗ Error:', err.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Disconnected');
  }
}

seedMultipleCategories();
