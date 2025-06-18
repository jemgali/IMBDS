
import Header  from "./Header";
import Footer  from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* header always on top */}
      <Header />
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* this is the area your Map will live in */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      <Footer />
    </div>
  );
}
