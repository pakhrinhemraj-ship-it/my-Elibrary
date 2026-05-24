import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Book from "./models/Book.js";
import Member from "./models/Member.js";
import BorrowRecord from "./models/BorrowRecord.js";
import { localBooks, localMembers, localRecords } from "./utils/localDb.js";

dotenv.config();

const booksData = [
  {
    title: "The Odyssey",
    author: "Homer",
    isbn: "9780140268867",
    genre: "Classics",
    description: "An ancient Greek epic poem following Odysseus, king of Ithaca, on his ten-year journey home after the fall of Troy.",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
    totalCopies: 5,
    availableCopies: 5,
    publishedYear: -800,
    publisher: "Penguin Classics",
    language: "Greek",
    pages: 416,
    tags: ["Epic", "Mythology", "Adventure"]
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    isbn: "9780441172719",
    genre: "Sci-Fi",
    description: "Set in the far future amidst a feudal interstellar society, Dune tells the story of young Paul Atreides, whose family accepts the stewardship of the desert planet Arrakis.",
    coverImage: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400",
    totalCopies: 4,
    availableCopies: 3,
    publishedYear: 1965,
    publisher: "Chilton Books",
    language: "English",
    pages: 612,
    tags: ["Interstellar", "Desert", "Empire"]
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    genre: "Sci-Fi",
    description: "A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism, government monitoring and control.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
    totalCopies: 6,
    availableCopies: 5,
    publishedYear: 1949,
    publisher: "Secker & Warburg",
    language: "English",
    pages: 328,
    tags: ["Dystopian", "Political", "Rebellion"]
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780061120084",
    genre: "Classics",
    description: "A novel of warmth and humor despite dealing with serious issues of rape, racial discrimination and injustice.",
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400",
    totalCopies: 3,
    availableCopies: 2,
    publishedYear: 1960,
    publisher: "J. B. Lippincott & Co.",
    language: "English",
    pages: 281,
    tags: ["Justice", "Southern", "Childhood"]
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    genre: "Classics",
    description: "The novel explores themes of decadence, idealism, resistance to change, social upheaval, and excess, creating a portrait of the Jazz Age.",
    coverImage: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=400",
    totalCopies: 4,
    availableCopies: 4,
    publishedYear: 1925,
    publisher: "Charles Scribner's Sons",
    language: "English",
    pages: 180,
    tags: ["Wealth", "Romance", "Tragedy"]
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "9780547928227",
    genre: "Fantasy",
    description: "A children's fantasy novel about the quest of home-loving hobbit Bilbo Baggins to win a share of the treasure guarded by Smaug the dragon.",
    coverImage: "https://images.unsplash.com/photo-1629019725048-776517c7c641?auto=format&fit=crop&q=80&w=400",
    totalCopies: 5,
    availableCopies: 4,
    publishedYear: 1937,
    publisher: "Allen & Unwin",
    language: "English",
    pages: 310,
    tags: ["Adventure", "Dragon", "Elves"]
  },
  {
    title: "Brave New World",
    author: "Aldous Huxley",
    isbn: "9780060850524",
    genre: "Sci-Fi",
    description: "Largely set in a futuristic World State, inhabited by genetically modified citizens organized in an intelligence-based social hierarchy.",
    coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=400",
    totalCopies: 4,
    availableCopies: 4,
    publishedYear: 1932,
    publisher: "Chatto & Windus",
    language: "English",
    pages: 268,
    tags: ["Clones", "Technology", "Control"]
  },
  {
    title: "Neuromancer",
    author: "William Gibson",
    isbn: "9780441569595",
    genre: "Sci-Fi",
    description: "Henry Case is a low-level hustler in Chiba City. He was once a brilliant computer hacker until his nervous system was poisoned as punishment for theft.",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400",
    totalCopies: 3,
    availableCopies: 3,
    publishedYear: 1984,
    publisher: "Ace Books",
    language: "English",
    pages: 271,
    tags: ["Cyberpunk", "Hacking", "AI"]
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    isbn: "9780735211292",
    genre: "Self-Help",
    description: "No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies.",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
    totalCopies: 7,
    availableCopies: 6,
    publishedYear: 2018,
    publisher: "Avery",
    language: "English",
    pages: 320,
    tags: ["Productivity", "Mindfulness", "Success"]
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    isbn: "9780062316097",
    genre: "History",
    description: "Sapiens: A Brief History of Humankind is a book by Yuval Noah Harari, first published in Hebrew in Israel in 2011 based on a series of lectures Harari taught at The Hebrew University of Jerusalem.",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400",
    totalCopies: 5,
    availableCopies: 5,
    publishedYear: 2011,
    publisher: "Harper",
    language: "English",
    pages: 512,
    tags: ["Evolution", "Humanity", "Society"]
  }
];

const membersData = [
  {
    _id: "60c72b2f9b1d8e12d4567890", // Explicit ID for reliable reference
    name: "Alice Vance",
    email: "alice@example.com",
    phone: "+1234567890",
    membershipId: "LIB-1001",
    membershipType: "premium",
    isActive: true
  },
  {
    _id: "60c72b2f9b1d8e12d4567891",
    name: "Bob Smith",
    email: "bob@example.com",
    phone: "+1987654321",
    membershipId: "LIB-1002",
    membershipType: "student",
    isActive: true
  },
  {
    _id: "60c72b2f9b1d8e12d4567892",
    name: "Charlie Dixon",
    email: "charlie@example.com",
    phone: "+1122334455",
    membershipId: "LIB-1003",
    membershipType: "basic",
    isActive: true
  }
];

const seedData = async () => {
  try {
    console.log("Starting seed sequence...");
    
    // --- Phase A: Create Local file-based seed ---
    // Clear books
    localBooks.save([]);
    const localBooksList = booksData.map(b => localBooks.create(b));
    console.log(`Seeded ${localBooksList.length} books locally.`);

    // Set custom IDs matching MongoDB seeds to ensure join compatibility
    const localMembersList = membersData.map(m => {
      const list = localMembers.get();
      const newMember = {
        _id: m._id,
        name: m.name,
        email: m.email.toLowerCase(),
        phone: m.phone,
        membershipId: m.membershipId,
        membershipType: m.membershipType,
        joinDate: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      list.push(newMember);
      localMembers.save(list);
      return newMember;
    });
    console.log(`Seeded ${localMembersList.length} members locally.`);

    // Map record seeds
    const duneBookLocal = localBooksList.find(b => b.title === "Dune");
    const nineteenBookLocal = localBooksList.find(b => b.title === "1984");
    const mockingbirdBookLocal = localBooksList.find(b => b.title === "To Kill a Mockingbird");
    const hobbitBookLocal = localBooksList.find(b => b.title === "The Hobbit");
    const habitBookLocal = localBooksList.find(b => b.title === "Atomic Habits");

    const localRecs = [
      {
        book: duneBookLocal._id,
        member: localMembersList[1]._id, // Bob
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days out
        status: "borrowed"
      },
      {
        book: nineteenBookLocal._id,
        member: localMembersList[0]._id, // Alice
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        returnDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // returned
        status: "returned",
        fine: 0
      },
      {
        book: mockingbirdBookLocal._id,
        member: localMembersList[0]._id, // Alice
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: "borrowed"
      },
      {
        book: hobbitBookLocal._id,
        member: localMembersList[1]._id, // Bob
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // overdue
        status: "overdue",
        fine: 50
      },
      {
        book: habitBookLocal._id,
        member: localMembersList[2]._id, // Charlie
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        status: "borrowed"
      }
    ];

    // Clear and create local records
    localRecords.save([]);
    localRecs.forEach(r => {
      const list = localRecords.get();
      const rec = {
        _id: new mongoose.Types.ObjectId().toString(),
        book: r.book,
        member: r.member,
        borrowDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: r.dueDate,
        returnDate: r.returnDate || null,
        status: r.status,
        fine: r.fine || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      list.push(rec);
      localRecords.save(list);
    });
    console.log("Seeded 5 borrow records locally.");

    // Update available copies locally reflecting current active borrowings
    localBooks.update(duneBookLocal._id, { availableCopies: duneBookLocal.totalCopies - 1 });
    localBooks.update(mockingbirdBookLocal._id, { availableCopies: mockingbirdBookLocal.totalCopies - 1 });
    localBooks.update(hobbitBookLocal._id, { availableCopies: hobbitBookLocal.totalCopies - 1 });
    localBooks.update(habitBookLocal._id, { availableCopies: habitBookLocal.totalCopies - 1 });

    // --- Phase B: Populate MongoDB if connected ---
    const connected = await connectDB();
    if (connected && mongoose.connection.readyState === 1) {
      console.log("Wiping existing MongoDB collections...");
      await Book.deleteMany();
      await Member.deleteMany();
      await BorrowRecord.deleteMany();

      console.log("Inserting books into MongoDB...");
      const seededBooks = await Book.insertMany(booksData);

      console.log("Inserting members into MongoDB...");
      const seededMembers = await Member.insertMany(membersData);

      const findBookId = (title) => seededBooks.find(b => b.title === title)._id;
      const findMemberId = (name) => seededMembers.find(m => m.name === name)._id;

      const mongoRecs = [
        {
          book: findBookId("Dune"),
          member: findMemberId("Bob Smith"),
          borrowDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          status: "borrowed"
        },
        {
          book: findBookId("1984"),
          member: findMemberId("Alice Vance"),
          borrowDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          returnDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          status: "returned"
        },
        {
          book: findBookId("To Kill a Mockingbird"),
          member: findMemberId("Alice Vance"),
          borrowDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          status: "borrowed"
        },
        {
          book: findBookId("The Hobbit"),
          member: findMemberId("Bob Smith"),
          borrowDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          status: "overdue",
          fine: 50
        },
        {
          book: findBookId("Atomic Habits"),
          member: findMemberId("Charlie Dixon"),
          borrowDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
          status: "borrowed"
        }
      ];

      await BorrowRecord.insertMany(mongoRecs);
      
      // Update mongo available copies
      await Book.findByIdAndUpdate(findBookId("Dune"), { $inc: { availableCopies: -1 } });
      await Book.findByIdAndUpdate(findBookId("To Kill a Mockingbird"), { $inc: { availableCopies: -1 } });
      await Book.findByIdAndUpdate(findBookId("The Hobbit"), { $inc: { availableCopies: -1 } });
      await Book.findByIdAndUpdate(findBookId("Atomic Habits"), { $inc: { availableCopies: -1 } });

      console.log("Successfully seeded MongoDB database!");
    } else {
      console.warn("MongoDB not connected during seed, database emulation fully primed.");
    }
    
    console.log("Seeding complete. Ready to serve!");
    process.exit(0);
  } catch (error) {
    console.error("Critical seeding error:", error);
    process.exit(1);
  }
};

seedData();
