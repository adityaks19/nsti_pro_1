const mongoose = require('mongoose');
const StoreItem = require('../models/StoreItem');
const User = require('../models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const storeItems = [
  // Cleaning Items
  {
    name: 'Floor Cleaner',
    category: 'cleaning',
    description: 'Multi-surface floor cleaning solution',
    quantity: 50,
    unit: 'bottle',
    price: 120,
    supplier: 'CleanMax Supplies',
    minimumStock: 10,
  },
  {
    name: 'Toilet Paper',
    category: 'cleaning',
    description: 'Soft 2-ply toilet tissue rolls',
    quantity: 100,
    unit: 'piece',
    price: 25,
    supplier: 'Hygiene Plus',
    minimumStock: 20,
  },
  {
    name: 'Hand Sanitizer',
    category: 'cleaning',
    description: '70% alcohol-based hand sanitizer',
    quantity: 30,
    unit: 'bottle',
    price: 80,
    supplier: 'SafeGuard Products',
    minimumStock: 5,
  },
  {
    name: 'Disinfectant Spray',
    category: 'cleaning',
    description: 'Multi-purpose disinfectant spray',
    quantity: 25,
    unit: 'bottle',
    price: 150,
    supplier: 'CleanMax Supplies',
    minimumStock: 5,
  },
  {
    name: 'Mop',
    category: 'cleaning',
    description: 'Cotton string mop with handle',
    quantity: 15,
    unit: 'piece',
    price: 200,
    supplier: 'Cleaning Tools Co.',
    minimumStock: 3,
  },
  {
    name: 'Broom',
    category: 'cleaning',
    description: 'Soft bristle broom for indoor use',
    quantity: 20,
    unit: 'piece',
    price: 180,
    supplier: 'Cleaning Tools Co.',
    minimumStock: 5,
  },
  {
    name: 'Dustbin Bags',
    category: 'cleaning',
    description: 'Heavy duty garbage bags - 30L capacity',
    quantity: 200,
    unit: 'piece',
    price: 5,
    supplier: 'Eco Packaging',
    minimumStock: 50,
  },
  {
    name: 'Glass Cleaner',
    category: 'cleaning',
    description: 'Streak-free glass and window cleaner',
    quantity: 20,
    unit: 'bottle',
    price: 90,
    supplier: 'CleanMax Supplies',
    minimumStock: 5,
  },

  // Stationary Items
  {
    name: 'A4 Paper',
    category: 'stationary',
    description: 'White A4 size printing paper - 500 sheets',
    quantity: 100,
    unit: 'packet',
    price: 250,
    supplier: 'Paper World',
    minimumStock: 20,
  },
  {
    name: 'Blue Pen',
    category: 'stationary',
    description: 'Ball point pen with blue ink',
    quantity: 500,
    unit: 'piece',
    price: 10,
    supplier: 'Write Right Stationers',
    minimumStock: 100,
  },
  {
    name: 'Black Pen',
    category: 'stationary',
    description: 'Ball point pen with black ink',
    quantity: 500,
    unit: 'piece',
    price: 10,
    supplier: 'Write Right Stationers',
    minimumStock: 100,
  },
  {
    name: 'Red Pen',
    category: 'stationary',
    description: 'Ball point pen with red ink',
    quantity: 200,
    unit: 'piece',
    price: 10,
    supplier: 'Write Right Stationers',
    minimumStock: 50,
  },
  {
    name: 'Pencil',
    category: 'stationary',
    description: 'HB grade wooden pencils',
    quantity: 300,
    unit: 'piece',
    price: 5,
    supplier: 'Write Right Stationers',
    minimumStock: 100,
  },
  {
    name: 'Eraser',
    category: 'stationary',
    description: 'White rubber eraser',
    quantity: 150,
    unit: 'piece',
    price: 8,
    supplier: 'Write Right Stationers',
    minimumStock: 50,
  },
  {
    name: 'Ruler',
    category: 'stationary',
    description: '30cm plastic ruler',
    quantity: 80,
    unit: 'piece',
    price: 15,
    supplier: 'Geometry Tools',
    minimumStock: 20,
  },
  {
    name: 'Stapler',
    category: 'stationary',
    description: 'Desktop stapler with staples',
    quantity: 25,
    unit: 'piece',
    price: 120,
    supplier: 'Office Essentials',
    minimumStock: 5,
  },
  {
    name: 'Stapler Pins',
    category: 'stationary',
    description: 'Standard stapler pins - 1000 pieces',
    quantity: 50,
    unit: 'box',
    price: 20,
    supplier: 'Office Essentials',
    minimumStock: 10,
  },
  {
    name: 'Paper Clips',
    category: 'stationary',
    description: 'Metal paper clips - assorted sizes',
    quantity: 100,
    unit: 'box',
    price: 25,
    supplier: 'Office Essentials',
    minimumStock: 20,
  },
  {
    name: 'Notebook',
    category: 'stationary',
    description: 'A4 size ruled notebook - 200 pages',
    quantity: 75,
    unit: 'piece',
    price: 45,
    supplier: 'Paper World',
    minimumStock: 20,
  },
  {
    name: 'Marker Pen',
    category: 'stationary',
    description: 'Permanent marker - black',
    quantity: 60,
    unit: 'piece',
    price: 30,
    supplier: 'Write Right Stationers',
    minimumStock: 15,
  },
  {
    name: 'Highlighter',
    category: 'stationary',
    description: 'Fluorescent highlighter - yellow',
    quantity: 40,
    unit: 'piece',
    price: 25,
    supplier: 'Write Right Stationers',
    minimumStock: 10,
  },
  {
    name: 'File Folder',
    category: 'stationary',
    description: 'A4 size plastic file folder',
    quantity: 50,
    unit: 'piece',
    price: 35,
    supplier: 'Office Essentials',
    minimumStock: 15,
  },
  {
    name: 'Whiteboard Marker',
    category: 'stationary',
    description: 'Dry erase marker for whiteboards',
    quantity: 30,
    unit: 'piece',
    price: 40,
    supplier: 'Board Supplies Co.',
    minimumStock: 10,
  }
];

const seedStoreItems = async () => {
  try {
    await connectDB();

    // Find a store manager or admin to assign as addedBy
    const storeManager = await User.findOne({ 
      role: { $in: ['store', 'admin'] } 
    });

    if (!storeManager) {
      console.log('No store manager or admin found. Creating default admin...');
      // You might want to create a default admin here or handle this case
      return;
    }

    // Clear existing store items
    await StoreItem.deleteMany({});
    console.log('Cleared existing store items');

    // Add addedBy field to all items
    const itemsWithUser = storeItems.map(item => ({
      ...item,
      addedBy: storeManager._id
    }));

    // Insert new items
    const createdItems = await StoreItem.insertMany(itemsWithUser);
    console.log(`✅ Successfully seeded ${createdItems.length} store items`);

    // Display summary
    const cleaningCount = createdItems.filter(item => item.category === 'cleaning').length;
    const stationaryCount = createdItems.filter(item => item.category === 'stationary').length;
    
    console.log(`\n📊 Summary:`);
    console.log(`   🧽 Cleaning items: ${cleaningCount}`);
    console.log(`   ✏️  Stationary items: ${stationaryCount}`);
    console.log(`   📦 Total items: ${createdItems.length}`);

    console.log('\n🎉 Store items seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding store items:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding function
if (require.main === module) {
  seedStoreItems();
}

module.exports = seedStoreItems;
