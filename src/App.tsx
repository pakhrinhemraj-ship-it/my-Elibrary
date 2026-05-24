import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { LibraryProvider } from "./context/LibraryContext.jsx";
import ThreeBackground from "./components/ThreeBackground.jsx";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";

// Lazy-loaded views/pages for robust performance
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Books = lazy(() => import("./pages/Books.jsx"));
const AddBook = lazy(() => import("./pages/AddBook.jsx"));
const EditBook = lazy(() => import("./pages/EditBook.jsx"));
const BorrowedBooks = lazy(() => import("./pages/BorrowedBooks.jsx"));
const Members = lazy(() => import("./pages/Members.jsx"));
const AiAssistant = lazy(() => import("./pages/AiAssistant.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

// Loader skeleton during component chunk loading
const PageLoader = () => (
  <div className="flex h-[80vh] items-center justify-center">
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-cyan text-cyan animate-spin"></div>
      <div className="absolute inset-0 m-auto h-8 w-8 rounded-full border-r-2 border-l-2 border-violet text-violet animate-spin-slow"></div>
    </div>
  </div>
);

export default function App() {
  return (
    <LibraryProvider>
      <BrowserRouter>
        <div className="relative min-h-screen bg-base text-text selection:bg-cyan/30 selection:text-white">
          {/* Neon Starfield Interactive Background */}
          <ThreeBackground />

          <div className="flex min-h-screen">
            {/* Sidebar navigation */}
            <Sidebar />

            {/* Main content viewport */}
            <div className="flex flex-1 flex-col">
              <Navbar />

              <main id="app-viewport" className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto pb-24">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/books" element={<Books />} />
                    <Route path="/books/add" element={<AddBook />} />
                    <Route path="/books/edit/:id" element={<EditBook />} />
                    <Route path="/borrowed" element={<BorrowedBooks />} />
                    <Route path="/members" element={<Members />} />
                    <Route path="/ai-assistant" element={<AiAssistant />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
            </div>
          </div>

          {/* Master feedback toast notifications handler */}
          <Toaster
            position="top-right"
            toastOptions={{
              className: "glass-card border-cyan/30 text-text",
              style: {
                background: "rgba(13, 13, 26, 0.8)",
                border: "1px solid rgba(0, 245, 255, 0.2)",
                color: "#e2e8f0",
                backdropFilter: "blur(12px)",
              },
              success: {
                duration: 4000,
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#0d0d1a",
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#0d0d1a",
                },
              },
            }}
          />
        </div>
      </BrowserRouter>
    </LibraryProvider>
  );
}
