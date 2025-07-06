const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Book = require('../models/Book');
const StoreItem = require('../models/StoreItem');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    const users = [
      {
        name: 'System Administrator',
        email: 'admin@nsti.edu',
        password: 'admin123',
        role: 'admin',
        phone: '9876543210',
        address: 'NSTI Campus, Admin Block',
      },
      {
        name: 'Library Manager',
        email: 'librarian@nsti.edu',
        password: 'lib123',
        role: 'librarian',
        phone: '9876543211',
        address: 'NSTI Campus, Library Block',
      },
      {
        name: 'Store Manager',
        email: 'store@nsti.edu',
        password: 'store123',
        role: 'store',
        phone: '9876543212',
        address: 'NSTI Campus, Store Block',
      },
      {
        name: 'Training Officer',
        email: 'to@nsti.edu',
        password: 'to123456',
        role: 'to',
        phone: '9876543213',
        address: 'NSTI Campus, Training Block',
      },
      {
        name: 'Prof. Rajesh Kumar',
        email: 'teacher@nsti.edu',
        password: 'teacher123',
        role: 'teacher',
        department: 'Computer Science',
        phone: '9876543214',
        address: 'NSTI Campus, Faculty Block',
      },
      {
        name: 'Aditya Sharma',
        email: 'student@nsti.edu',
        password: 'student123',
        role: 'student',
        department: 'Computer Science',
        course: 'Diploma in Computer Engineering',
        semester: 4,
        phone: '9876543215',
        address: 'NSTI Campus, Hostel Block A',
      },
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${user.name} (${user.role})`);
    }

    console.log('🎉 Users seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
};

const seedBooks = async () => {
  try {
    // Clear existing books
    await Book.deleteMany({});
    console.log('🗑️  Cleared existing books');

    // Get librarian user
    const librarian = await User.findOne({ role: 'librarian' });
    if (!librarian) {
      console.error('❌ Librarian not found');
      return;
    }

    const books = [
      {
        title: 'Introduction to Computer Science',
        author: 'Thomas H. Cormen',
        isbn: '978-0262033848',
        category: 'Computer Science',
        publisher: 'MIT Press',
        publishedYear: 2020,
        totalCopies: 10,
        availableCopies: 10,
        description: 'Comprehensive introduction to computer science fundamentals',
        location: { shelf: 'A1', section: 'CS' },
        addedBy: librarian._id,
      },
      {
        title: 'Digital Electronics',
        author: 'Morris Mano',
        isbn: '978-0132543262',
        category: 'Electronics',
        publisher: 'Pearson',
        publishedYear: 2019,
        totalCopies: 8,
        availableCopies: 8,
        description: 'Digital logic design and computer organization',
        location: { shelf: 'B2', section: 'EC' },
        addedBy: librarian._id,
      },
      {
        title: 'Engineering Mathematics',
        author: 'B.S. Grewal',
        isbn: '978-8173716581',
        category: 'Mathematics',
        publisher: 'Khanna Publishers',
        publishedYear: 2021,
        totalCopies: 15,
        availableCopies: 15,
        description: 'Higher engineering mathematics for technical students',
        location: { shelf: 'C3', section: 'MATH' },
        addedBy: librarian._id,
      },
      {
        title: 'Mechanical Engineering Design',
        author: 'Joseph Shigley',
        isbn: '978-0073398204',
        category: 'Mechanical',
        publisher: 'McGraw-Hill',
        publishedYear: 2018,
        totalCopies: 6,
        availableCopies: 6,
        description: 'Mechanical component design and analysis',
        location: { shelf: 'D4', section: 'MECH' },
        addedBy: librarian._id,
      },
      {
        title: 'Data Structures and Algorithms',
        author: 'Robert Sedgewick',
        isbn: '978-0321573513',
        category: 'Computer Science',
        publisher: 'Addison-Wesley',
        publishedYear: 2020,
        totalCopies: 12,
        availableCopies: 12,
        description: 'Comprehensive guide to data structures and algorithms',
        location: { shelf: 'A2', section: 'CS' },
        addedBy: librarian._id,
      },
    ];

    for (const bookData of books) {
      const book = new Book(bookData);
      await book.save();
      console.log(`✅ Created book: ${book.title}`);
    }

    console.log('📚 Books seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding books:', error);
  }
};

const seedStoreItems = async () => {
  try {
    // Clear existing store items
    await StoreItem.deleteMany({});
    console.log('🗑️  Cleared existing store items');

    // Get store manager user
    const storeManager = await User.findOne({ role: 'store' });
    if (!storeManager) {
      console.error('❌ Store manager not found');
      return;
    }

    const storeItems = [
      // Cleaning Items
      {
        name: 'Floor Cleaner',
        category: 'cleaning',
        description: 'Multi-surface floor cleaning solution',
        quantity: 50,
        unit: 'bottle',
        price: 150,
        supplier: 'CleanMax Supplies',
        minimumStock: 10,
        addedBy: storeManager._id,
      },
      {
        name: 'Toilet Paper',
        category: 'cleaning',
        description: 'Soft 2-ply toilet tissue',
        quantity: 100,
        unit: 'packet',
        price: 80,
        supplier: 'Hygiene Plus',
        minimumStock: 20,
        addedBy: storeManager._id,
      },
      {
        name: 'Hand Sanitizer',
        category: 'cleaning',
        description: '70% alcohol-based hand sanitizer',
        quantity: 30,
        unit: 'bottle',
        price: 120,
        supplier: 'SafeGuard Products',
        minimumStock: 5,
        addedBy: storeManager._id,
      },
      {
        name: 'Disinfectant Spray',
        category: 'cleaning',
        description: 'Surface disinfectant spray',
        quantity: 25,
        unit: 'bottle',
        price: 200,
        supplier: 'CleanMax Supplies',
        minimumStock: 5,
        addedBy: storeManager._id,
      },
      // Stationary Items
      {
        name: 'A4 Paper',
        category: 'stationary',
        description: 'White A4 size printing paper',
        quantity: 200,
        unit: 'packet',
        price: 300,
        supplier: 'Paper World',
        minimumStock: 50,
        addedBy: storeManager._id,
      },
      {
        name: 'Blue Pen',
        category: 'stationary',
        description: 'Ball point pen - blue ink',
        quantity: 500,
        unit: 'piece',
        price: 10,
        supplier: 'Write Right',
        minimumStock: 100,
        addedBy: storeManager._id,
      },
      {
        name: 'Whiteboard Marker',
        category: 'stationary',
        description: 'Dry erase markers - assorted colors',
        quantity: 80,
        unit: 'piece',
        price: 50,
        supplier: 'Board Masters',
        minimumStock: 20,
        addedBy: storeManager._id,
      },
      {
        name: 'Stapler',
        category: 'stationary',
        description: 'Heavy duty office stapler',
        quantity: 15,
        unit: 'piece',
        price: 250,
        supplier: 'Office Essentials',
        minimumStock: 3,
        addedBy: storeManager._id,
      },
    ];

    for (const itemData of storeItems) {
      const item = new StoreItem(itemData);
      await item.save();
      console.log(`✅ Created store item: ${item.name}`);
    }

    console.log('🏪 Store items seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding store items:', error);
  }
};

const seedData = async () => {
  await connectDB();
  
  console.log('🌱 Starting data seeding...');
  
  await seedUsers();
  await seedBooks();
  await seedStoreItems();
  
  console.log('🎉 Data seeding completed!');
  console.log('\n📋 Demo Login Credentials:');
  console.log('Admin: admin@nsti.edu / admin123');
  console.log('Librarian: librarian@nsti.edu / lib123');
  console.log('Store Manager: store@nsti.edu / store123');
  console.log('Training Officer: to@nsti.edu / to123456');
  console.log('Teacher: teacher@nsti.edu / teacher123');
  console.log('Student: student@nsti.edu / student123');
  
  process.exit(0);
};

seedData();
