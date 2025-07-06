const mongoose = require('mongoose');
const Book = require('../models/Book');
const User = require('../models/User');
require('dotenv').config();

const sampleBooks = [
  {
    title: "Introduction to Computer Science",
    author: "John Smith",
    isbn: "978-0123456789",
    category: "Computer Science",
    publisher: "Tech Publications",
    publishedYear: 2023,
    totalCopies: 5,
    description: "A comprehensive guide to computer science fundamentals covering programming, algorithms, and data structures.",
    price: 850,
    language: "English",
    condition: "New",
    location: {
      shelf: "A1",
      section: "CS",
      floor: "Ground Floor"
    },
    tags: ["programming", "algorithms", "computer science", "fundamentals"]
  },
  {
    title: "Data Structures and Algorithms",
    author: "Jane Doe",
    isbn: "978-0987654321",
    category: "Computer Science",
    publisher: "Academic Press",
    publishedYear: 2022,
    totalCopies: 3,
    description: "Advanced concepts in data structures and algorithms with practical implementations.",
    price: 950,
    language: "English",
    condition: "New",
    location: {
      shelf: "A2",
      section: "CS",
      floor: "Ground Floor"
    },
    tags: ["data structures", "algorithms", "programming", "advanced"]
  },
  {
    title: "Engineering Mathematics",
    author: "Dr. Robert Johnson",
    isbn: "978-0456789123",
    category: "Mathematics",
    publisher: "Engineering Books Ltd",
    publishedYear: 2021,
    totalCopies: 8,
    description: "Essential mathematical concepts for engineering students including calculus, linear algebra, and differential equations.",
    price: 750,
    language: "English",
    condition: "New",
    location: {
      shelf: "B1",
      section: "MATH",
      floor: "Ground Floor"
    },
    tags: ["mathematics", "engineering", "calculus", "algebra"]
  },
  {
    title: "Digital Electronics",
    author: "Prof. Sarah Wilson",
    isbn: "978-0789123456",
    category: "Electronics",
    publisher: "Electronics Publications",
    publishedYear: 2023,
    totalCopies: 4,
    description: "Comprehensive coverage of digital electronics including logic gates, flip-flops, and microprocessors.",
    price: 680,
    language: "English",
    condition: "New",
    location: {
      shelf: "C1",
      section: "ECE",
      floor: "First Floor"
    },
    tags: ["electronics", "digital", "logic gates", "microprocessors"]
  },
  {
    title: "Mechanical Engineering Design",
    author: "Michael Brown",
    isbn: "978-0321654987",
    category: "Mechanical",
    publisher: "Mechanical Press",
    publishedYear: 2022,
    totalCopies: 6,
    description: "Principles of mechanical design including materials, stress analysis, and machine elements.",
    price: 920,
    language: "English",
    condition: "New",
    location: {
      shelf: "D1",
      section: "MECH",
      floor: "First Floor"
    },
    tags: ["mechanical", "design", "materials", "stress analysis"]
  },
  {
    title: "Civil Engineering Materials",
    author: "Dr. Emily Davis",
    isbn: "978-0654321987",
    category: "Civil",
    publisher: "Construction Books",
    publishedYear: 2021,
    totalCopies: 5,
    description: "Study of construction materials including concrete, steel, and composite materials.",
    price: 780,
    language: "English",
    condition: "New",
    location: {
      shelf: "E1",
      section: "CIVIL",
      floor: "First Floor"
    },
    tags: ["civil engineering", "materials", "concrete", "steel"]
  },
  {
    title: "Database Management Systems",
    author: "Dr. Alex Thompson",
    isbn: "978-0147258369",
    category: "Information Technology",
    publisher: "IT Publications",
    publishedYear: 2023,
    totalCopies: 7,
    description: "Complete guide to database design, SQL, and database administration.",
    price: 890,
    language: "English",
    condition: "New",
    location: {
      shelf: "A3",
      section: "IT",
      floor: "Second Floor"
    },
    tags: ["database", "SQL", "DBMS", "data management"]
  },
  {
    title: "Network Security",
    author: "Jennifer Lee",
    isbn: "978-0258147369",
    category: "Information Technology",
    publisher: "Security Press",
    publishedYear: 2022,
    totalCopies: 4,
    description: "Comprehensive coverage of network security protocols, encryption, and cybersecurity.",
    price: 1050,
    language: "English",
    condition: "New",
    location: {
      shelf: "A4",
      section: "IT",
      floor: "Second Floor"
    },
    tags: ["security", "networking", "encryption", "cybersecurity"]
  },
  {
    title: "Project Management",
    author: "David Miller",
    isbn: "978-0369147258",
    category: "Management",
    publisher: "Business Books",
    publishedYear: 2023,
    totalCopies: 3,
    description: "Modern project management techniques and methodologies for engineering projects.",
    price: 650,
    language: "English",
    condition: "New",
    location: {
      shelf: "F1",
      section: "MGMT",
      floor: "Second Floor"
    },
    tags: ["project management", "methodology", "planning", "execution"]
  },
  {
    title: "Communication Skills for Engineers",
    author: "Dr. Lisa Anderson",
    isbn: "978-0741852963",
    category: "Communication Skills",
    publisher: "Skill Development Press",
    publishedYear: 2022,
    totalCopies: 10,
    description: "Essential communication skills for technical professionals including presentation and writing skills.",
    price: 450,
    language: "English",
    condition: "New",
    location: {
      shelf: "G1",
      section: "SKILLS",
      floor: "Ground Floor"
    },
    tags: ["communication", "presentation", "writing", "soft skills"]
  },
  {
    title: "Engineering Physics",
    author: "Prof. Mark Taylor",
    isbn: "978-0852963741",
    category: "Science",
    publisher: "Science Publications",
    publishedYear: 2021,
    totalCopies: 6,
    description: "Physics concepts essential for engineering students including mechanics, thermodynamics, and electromagnetism.",
    price: 720,
    language: "English",
    condition: "New",
    location: {
      shelf: "H1",
      section: "PHYSICS",
      floor: "Ground Floor"
    },
    tags: ["physics", "mechanics", "thermodynamics", "electromagnetism"]
  },
  {
    title: "Software Engineering",
    author: "Dr. Kevin White",
    isbn: "978-0963741852",
    category: "Computer Science",
    publisher: "Software Press",
    publishedYear: 2023,
    totalCopies: 5,
    description: "Software development lifecycle, design patterns, and best practices in software engineering.",
    price: 980,
    language: "English",
    condition: "New",
    location: {
      shelf: "A5",
      section: "CS",
      floor: "Ground Floor"
    },
    tags: ["software engineering", "design patterns", "development", "lifecycle"]
  },
  {
    title: "Electrical Machines",
    author: "Prof. Nancy Green",
    isbn: "978-0174185296",
    category: "Electrical",
    publisher: "Electrical Engineering Books",
    publishedYear: 2022,
    totalCopies: 4,
    description: "Comprehensive study of electrical machines including motors, generators, and transformers.",
    price: 850,
    language: "English",
    condition: "New",
    location: {
      shelf: "I1",
      section: "EEE",
      floor: "First Floor"
    },
    tags: ["electrical machines", "motors", "generators", "transformers"]
  },
  {
    title: "Chemical Process Engineering",
    author: "Dr. Paul Martinez",
    isbn: "978-0296185374",
    category: "Chemical",
    publisher: "Chemical Engineering Press",
    publishedYear: 2021,
    totalCopies: 3,
    description: "Principles of chemical process design, mass transfer, and reaction engineering.",
    price: 1100,
    language: "English",
    condition: "New",
    location: {
      shelf: "J1",
      section: "CHEM",
      floor: "Second Floor"
    },
    tags: ["chemical engineering", "process design", "mass transfer", "reactions"]
  },
  {
    title: "Automobile Engineering",
    author: "James Rodriguez",
    isbn: "978-0518629374",
    category: "Automobile",
    publisher: "Auto Engineering Books",
    publishedYear: 2023,
    totalCopies: 4,
    description: "Complete guide to automobile systems including engine, transmission, and vehicle dynamics.",
    price: 950,
    language: "English",
    condition: "New",
    location: {
      shelf: "K1",
      section: "AUTO",
      floor: "Second Floor"
    },
    tags: ["automobile", "engine", "transmission", "vehicle dynamics"]
  }
];

const seedBooks = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a librarian user to assign as the book creator
    const librarian = await User.findOne({ role: 'librarian' });
    if (!librarian) {
      console.error('No librarian found. Please create a librarian user first.');
      process.exit(1);
    }

    // Clear existing books (optional)
    console.log('Clearing existing books...');
    await Book.deleteMany({});

    // Add the librarian ID and availableCopies to each book
    const booksWithLibrarian = sampleBooks.map(book => ({
      ...book,
      addedBy: librarian._id,
      availableCopies: book.totalCopies
    }));

    // Insert sample books
    console.log('Inserting sample books...');
    const insertedBooks = await Book.insertMany(booksWithLibrarian);
    
    console.log(`Successfully inserted ${insertedBooks.length} books:`);
    insertedBooks.forEach((book, index) => {
      console.log(`${index + 1}. ${book.title} by ${book.author}`);
    });

    // Display summary
    const totalCopies = insertedBooks.reduce((sum, book) => sum + book.totalCopies, 0);
    console.log(`\nSummary:`);
    console.log(`Total Books: ${insertedBooks.length}`);
    console.log(`Total Copies: ${totalCopies}`);
    
    // Category breakdown
    const categoryCount = {};
    insertedBooks.forEach(book => {
      categoryCount[book.category] = (categoryCount[book.category] || 0) + 1;
    });
    
    console.log('\nBooks by Category:');
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`${category}: ${count} books`);
    });

    console.log('\nBooks seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding books:', error);
    process.exit(1);
  }
};

// Run the seed function
seedBooks();
