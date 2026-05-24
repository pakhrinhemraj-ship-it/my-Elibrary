import asyncHandler from "express-async-handler";
import { ai } from "../utils/gemini.js";
import Book from "../models/Book.js";
import Member from "../models/Member.js";
import BorrowRecord from "../models/BorrowRecord.js";
import { isMongoConnected, localBooks, localMembers, localRecords } from "../utils/localDb.js";

// @desc    Interact with the AI Librarian
// @route   POST /api/ai/chat
// @access  Public
export const chatWithLibrarian = asyncHandler(async (req, res) => {
  const { prompt, history } = req.body;

  if (!prompt) {
    res.status(400);
    throw new Error("Prompt is required");
  }

  // 1. Fetch current catalog, members, and circulation logs for deep dynamic context
  let catalogSummary = "";
  let circulationSummary = "";
  let memberSummary = "";

  try {
    let books = [];
    let members = [];
    let borrowRecords = [];

    if (!isMongoConnected()) {
      books = localBooks.get();
      members = localMembers.get();
      borrowRecords = localRecords.find(); // find() returns populated books and members locally
    } else {
      books = await Book.find({});
      members = await Member.find({});
      borrowRecords = await BorrowRecord.find({}).populate("book member");
    }

    catalogSummary = books.map((b, idx) => 
      `${idx + 1}. "${b.title}" by ${b.author} [Genre: ${b.genre}] - Copies Available: ${b.availableCopies} out of ${b.totalCopies}. Description: ${b.description || "N/A"}`
    ).join("\n");

    const activeList = borrowRecords.filter(r => r.status === "borrowed" || r.status === "overdue");
    circulationSummary = activeList.map((r, idx) => {
      const bTitle = r.book?.title || "Deleted Book";
      const mName = r.member?.name || "Deleted Member";
      const mId = r.member?.membershipId || "N/A";
      const due = r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "N/A";
      return `${idx + 1}. Book: "${bTitle}" | Issued to: ${mName} (${mId}) | Status: ${r.status.toUpperCase()} | Due Date: ${due} | Fine: Rs. ${r.fine || 0}`;
    }).join("\n") || "No books are currently out on loan.";

    memberSummary = members.map((m, idx) => 
      `${idx + 1}. Name: ${m.name} [Membership ID: ${m.membershipId}] - Type: ${m.membershipType.toUpperCase()} - Status: ${m.isActive !== false ? "Active" : "Deactivated"}`
    ).join("\n");

  } catch (err) {
    catalogSummary = "Catalog currently loading or offline.";
    circulationSummary = "Circulation logs offline.";
    memberSummary = "Subscriber profiles offline.";
  }

  // 2. Define highly capable CyberLibrarian instruction set and persona
  const systemInstruction = `You are a helpful, futuristic, and highly knowledgeable AI Librarian named 'CyberLibrarian' for LibConnect Pro space station library.
Your core objectives are:
- Help users navigate the physical library catalog and search for books.
- Recommend matches based on their interests.
- Provide smart operational insights, track circulation logs, notify of overdue loans, and summarize subscribers directories.
- If users ask for books that are already in the physical catalog, guide them to check out the book directly.

Here are the live, real-time records currently inside our E-Library databases:
=========================================
LATEST PHYSICAL BOOKS STOCK:
${catalogSummary}

ACTIVE CIRCULATION & LOANS LOGS:
${circulationSummary}

REGISTERED MEMBERS DIRECTORY:
${memberSummary}
=========================================

- Whenever a user asks for general recommendations, ALWAYS prioritize recommending titles from the LIVE catalog above. Tell them they are in stock!
- If the requested genre or subject is not well-represented in the live catalog, feel free to suggest external famous books. Suggest they ask the 'Root Admin' to register the new books using the 'Register New Book' button.
- If they ask about active borrowings, overdue penalties, or registered members, parse and analyze the summaries above to give precise, accurate real-time answers.
- Be conversational, elegant, concise, and futuristic in your formatting. Offer direct bullet points and deep genre connections.`;

  try {
    // 3. Query the Gemini 3.5 Flash model
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [{ googleSearch: {} }], // Enable Google Search grounding for trending releases or real-time info
      },
    });

    const textOutput = response.text || "I was unable to retrieve a coherent response. Please retry.";
    
    // Extract search grounding links if present
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingSources = groundingChunks.map(chunk => {
      if (chunk.web) {
        return {
          uri: chunk.web.uri,
          title: chunk.web.title
        };
      }
      return null;
    }).filter(Boolean);

    res.json({
      success: true,
      data: {
        text: textOutput,
        sources: groundingSources
      }
    });
  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500);
    throw new Error(`AI Agent Engine Error: ${err.message || "Failed to compile response"}`);
  }
});

// @desc    Generate tags and key summary points for a book
// @route   POST /api/ai/summarize-book
// @access  Public
export const summarizeBook = asyncHandler(async (req, res) => {
  const { title, author, description } = req.body;

  if (!title) {
    res.status(400);
    throw new Error("Book title is required");
  }

  const prompt = `Develop a futuristic, engaging 1-sentence sales hook and 3 concise, high-impact bulleted summary points for the following book:
Title: "${title}"
Author: "${author || "Unknown"}"
Description: "${description || "No description loaded."}"

Additionally, recommend 3 highly relevant tags (e.g., sci-fi, philosophy, cyberpunk). Return your response formatted clearly in markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.6,
      }
    });

    res.json({
      success: true,
      data: response.text || "No summary available."
    });
  } catch (err) {
    console.error("Gemini Book Summarizer Error:", err);
    res.status(500);
    throw new Error(`Summarizer failed: ${err.message}`);
  }
});
