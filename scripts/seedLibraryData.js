const mongoose = require('mongoose');
const Book = require('../models/Book');
const User = require('../models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const realBooksData = [
  // Engineering Books
  {
    title: "Engineering Mechanics: Statics and Dynamics",
    author: "R.C. Hibbeler",
    isbn: "978-0134814971",
    category: "Engineering",
    publisher: "Pearson",
    publishedYear: 2019,
    totalCopies: 15,
    description: "Comprehensive coverage of engineering mechanics principles with practical applications.",
    location: { shelf: "A1", section: "Engineering", floor: "Ground Floor" },
    price: 850,
    language: "English",
    condition: "New",
    tags: ["mechanics", "statics", "dynamics", "engineering"]
  },
  {
    title: "Digital Electronics: Principles and Applications",
    author: "Roger L. Tokheim",
    isbn: "978-0073373775",
    category: "Electronics",
    publisher: "McGraw-Hill",
    publishedYear: 2020,
    totalCopies: 12,
    description: "Modern approach to digital electronics with hands-on applications.",
    location: { shelf: "B2", section: "Electronics", floor: "Ground Floor" },
    price: 750,
    language: "English",
    condition: "New",
    tags: ["digital", "electronics", "circuits", "logic"]
  },
  {
    title: "Data Structures and Algorithms in Java",
    author: "Robert Lafore",
    isbn: "978-0672324536",
    category: "Computer Science",
    publisher: "Sams Publishing",
    publishedYear: 2017,
    totalCopies: 20,
    description: "Complete guide to data structures and algorithms with Java implementations.",
    location: { shelf: "C1", section: "Computer Science", floor: "First Floor" },
    price: 950,
    language: "English",
    condition: "New",
    tags: ["java", "algorithms", "data structures", "programming"]
  },
  {
    title: "Fundamentals of Thermodynamics",
    author: "Claus Borgnakke",
    isbn: "978-1118131992",
    category: "Mechanical",
    publisher: "Wiley",
    publishedYear: 2018,
    totalCopies: 10,
    description: "Essential principles of thermodynamics for mechanical engineers.",
    location: { shelf: "D1", section: "Mechanical", floor: "Ground Floor" },
    price: 800,
    language: "English",
    condition: "Good",
    tags: ["thermodynamics", "mechanical", "energy", "heat"]
  },
  {
    title: "Concrete Technology: Theory and Practice",
    author: "M.S. Shetty",
    isbn: "978-8121926492",
    category: "Civil",
    publisher: "S. Chand",
    publishedYear: 2019,
    totalCopies: 8,
    description: "Comprehensive guide to concrete technology and construction practices.",
    location: { shelf: "E1", section: "Civil", floor: "Ground Floor" },
    price: 650,
    language: "English",
    condition: "New",
    tags: ["concrete", "civil", "construction", "materials"]
  },
  {
    title: "Electric Machinery Fundamentals",
    author: "Stephen J. Chapman",
    isbn: "978-0073529547",
    category: "Electrical",
    publisher: "McGraw-Hill",
    publishedYear: 2020,
    totalCopies: 14,
    description: "Fundamental concepts of electric machinery and power systems.",
    location: { shelf: "F1", section: "Electrical", floor: "First Floor" },
    price: 900,
    language: "English",
    condition: "New",
    tags: ["electrical", "machinery", "motors", "generators"]
  },
  {
    title: "Chemical Process Control: An Introduction",
    author: "George Stephanopoulos",
    isbn: "978-0131291959",
    category: "Chemical",
    publisher: "Prentice Hall",
    publishedYear: 2018,
    totalCopies: 6,
    description: "Introduction to chemical process control and automation.",
    location: { shelf: "G1", section: "Chemical", floor: "First Floor" },
    price: 1200,
    language: "English",
    condition: "New",
    tags: ["chemical", "process", "control", "automation"]
  },
  {
    title: "Automotive Technology: Principles and Service",
    author: "James D. Halderman",
    isbn: "978-0134570891",
    category: "Automobile",
    publisher: "Pearson",
    publishedYear: 2019,
    totalCopies: 10,
    description: "Complete guide to automotive technology and service procedures.",
    location: { shelf: "H1", section: "Automobile", floor: "Ground Floor" },
    price: 1100,
    language: "English",
    condition: "New",
    tags: ["automotive", "technology", "service", "repair"]
  },
  {
    title: "Database System Concepts",
    author: "Abraham Silberschatz",
    isbn: "978-0078022159",
    category: "Information Technology",
    publisher: "McGraw-Hill",
    publishedYear: 2020,
    totalCopies: 18,
    description: "Comprehensive coverage of database concepts and design principles.",
    location: { shelf: "C2", section: "Information Technology", floor: "First Floor" },
    price: 1050,
    language: "English",
    condition: "New",
    tags: ["database", "SQL", "design", "systems"]
  },
  {
    title: "Engineering Mathematics",
    author: "K.A. Stroud",
    isbn: "978-1137031204",
    category: "Mathematics",
    publisher: "Palgrave Macmillan",
    publishedYear: 2017,
    totalCopies: 25,
    description: "Essential mathematics for engineering students with worked examples.",
    location: { shelf: "I1", section: "Mathematics", floor: "Ground Floor" },
    price: 700,
    language: "English",
    condition: "Good",
    tags: ["mathematics", "calculus", "algebra", "engineering"]
  },
  // Science Books
  {
    title: "Physics for Scientists and Engineers",
    author: "Raymond A. Serway",
    isbn: "978-1337553278",
    category: "Science",
    publisher: "Cengage Learning",
    publishedYear: 2018,
    totalCopies: 20,
    description: "Comprehensive physics textbook with modern applications.",
    location: { shelf: "J1", section: "Science", floor: "First Floor" },
    price: 1300,
    language: "English",
    condition: "New",
    tags: ["physics", "science", "mechanics", "electricity"]
  },
  {
    title: "Organic Chemistry",
    author: "Paula Yurkanis Bruice",
    isbn: "978-0134042282",
    category: "Science",
    publisher: "Pearson",
    publishedYear: 2019,
    totalCopies: 15,
    description: "Modern approach to organic chemistry with biological applications.",
    location: { shelf: "J2", section: "Science", floor: "First Floor" },
    price: 1400,
    language: "English",
    condition: "New",
    tags: ["chemistry", "organic", "reactions", "synthesis"]
  },
  // Management Books
  {
    title: "Principles of Management",
    author: "Harold Koontz",
    isbn: "978-0070648514",
    category: "Management",
    publisher: "McGraw-Hill",
    publishedYear: 2018,
    totalCopies: 12,
    description: "Fundamental principles of management theory and practice.",
    location: { shelf: "K1", section: "Management", floor: "Second Floor" },
    price: 600,
    language: "English",
    condition: "Good",
    tags: ["management", "leadership", "organization", "planning"]
  },
  {
    title: "Project Management: A Systems Approach",
    author: "Harold Kerzner",
    isbn: "978-1119165354",
    category: "Management",
    publisher: "Wiley",
    publishedYear: 2020,
    totalCopies: 8,
    description: "Comprehensive guide to project management methodologies.",
    location: { shelf: "K2", section: "Management", floor: "Second Floor" },
    price: 1500,
    language: "English",
    condition: "New",
    tags: ["project", "management", "planning", "execution"]
  },
  // Communication Skills
  {
    title: "Technical Communication Today",
    author: "Richard Johnson-Sheehan",
    isbn: "978-0134118499",
    category: "Communication Skills",
    publisher: "Pearson",
    publishedYear: 2018,
    totalCopies: 15,
    description: "Modern approach to technical writing and communication.",
    location: { shelf: "L1", section: "Communication", floor: "Second Floor" },
    price: 550,
    language: "English",
    condition: "New",
    tags: ["communication", "writing", "technical", "presentation"]
  },
  {
    title: "Business Communication Essentials",
    author: "Courtland L. Bovee",
    isbn: "978-0134729404",
    category: "Communication Skills",
    publisher: "Pearson",
    publishedYear: 2019,
    totalCopies: 10,
    description: "Essential skills for effective business communication.",
    location: { shelf: "L2", section: "Communication", floor: "Second Floor" },
    price: 650,
    language: "English",
    condition: "New",
    tags: ["business", "communication", "writing", "speaking"]
  },
  // Reference Books
  {
    title: "Engineering Handbook",
    author: "Richard C. Dorf",
    isbn: "978-0849385902",
    category: "Reference",
    publisher: "CRC Press",
    publishedYear: 2017,
    totalCopies: 5,
    description: "Comprehensive reference for all engineering disciplines.",
    location: { shelf: "R1", section: "Reference", floor: "Ground Floor" },
    price: 2500,
    language: "English",
    condition: "New",
    tags: ["reference", "engineering", "handbook", "comprehensive"]
  },
  {
    title: "Dictionary of Engineering Terms",
    author: "Engineering Dictionary Committee",
    isbn: "978-0071442107",
    category: "Reference",
    publisher: "McGraw-Hill",
    publishedYear: 2016,
    totalCopies: 3,
    description: "Comprehensive dictionary of engineering terminology.",
    location: { shelf: "R2", section: "Reference", floor: "Ground Floor" },
    price: 800,
    language: "English",
    condition: "Good",
    tags: ["dictionary", "terms", "engineering", "reference"]
  },
  // Soft Skills
  {
    title: "Emotional Intelligence 2.0",
    author: "Travis Bradberry",
    isbn: "978-0974320625",
    category: "Soft Skills",
    publisher: "TalentSmart",
    publishedYear: 2018,
    totalCopies: 12,
    description: "Develop emotional intelligence for personal and professional success.",
    location: { shelf: "S1", section: "Soft Skills", floor: "Second Floor" },
    price: 450,
    language: "English",
    condition: "New",
    tags: ["emotional", "intelligence", "soft skills", "leadership"]
  },
  {
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    isbn: "978-1982137274",
    category: "Soft Skills",
    publisher: "Simon & Schuster",
    publishedYear: 2020,
    totalCopies: 15,
    description: "Timeless principles for personal and professional effectiveness.",
    location: { shelf: "S2", section: "Soft Skills", floor: "Second Floor" },
    price: 500,
    language: "English",
    condition: "New",
    tags: ["habits", "effectiveness", "personal", "development"]
  }
];

const seedLibraryData = async () => {
  try {
    await connectDB();
    
    // Find a librarian user to set as addedBy
    const librarian = await User.findOne({ role: 'librarian' });
    if (!librarian) {
      console.error('No librarian found. Please run the main seed script first.');
      process.exit(1);
    }

    // Clear existing books
    await Book.deleteMany({});
    console.log('Cleared existing books');

    // Add addedBy field to all books
    const booksWithUser = realBooksData.map(book => ({
      ...book,
      addedBy: librarian._id,
      availableCopies: book.totalCopies,
      isActive: true,
      isPopular: Math.random() > 0.7 // 30% chance of being popular
    }));

    // Insert books
    const insertedBooks = await Book.insertMany(booksWithUser);
    console.log(`✅ Successfully seeded ${insertedBooks.length} books`);

    // Display summary
    const categories = [...new Set(realBooksData.map(book => book.category))];
    console.log('\n📚 Library Summary:');
    console.log(`Total Books: ${insertedBooks.length}`);
    console.log(`Categories: ${categories.length}`);
    console.log(`Categories: ${categories.join(', ')}`);
    
    const totalCopies = realBooksData.reduce((sum, book) => sum + book.totalCopies, 0);
    console.log(`Total Copies: ${totalCopies}`);
    
    console.log('\n🏷️ Books by Category:');
    categories.forEach(category => {
      const categoryBooks = realBooksData.filter(book => book.category === category);
      const categoryCopies = categoryBooks.reduce((sum, book) => sum + book.totalCopies, 0);
      console.log(`  ${category}: ${categoryBooks.length} books, ${categoryCopies} copies`);
    });

    mongoose.connection.close();
    console.log('\n✅ Library seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding library data:', error);
    process.exit(1);
  }
};

// Run the seeding
if (require.main === module) {
  seedLibraryData();
}

module.exports = { seedLibraryData, realBooksData };
