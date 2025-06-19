import Header from "./Header";
import Footer from "./Footer";

export default function LoginLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#EDF1FA]">
      {/* Optional: Header */}
      <Header />

      {/* Centered content */}
      <main className="flex flex-1 items-center justify-center px-4">
        {children}
      </main>

      {/* Optional: Footer */}
      <Footer />
    </div>
  );
}
