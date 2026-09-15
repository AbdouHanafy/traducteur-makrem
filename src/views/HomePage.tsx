import Topbar from "@/views/components/Topbar";
import Hero from "@/views/components/Hero";
import Services from "@/views/components/Services";
import Workflow from "@/views/components/Workflow";
import Footer from "@/views/components/Footer";

export default function HomePage() {
  return (
    <>
      <Topbar />
      <main className="flex-1">
        <Hero />
        <Services />
        <Workflow />
      </main>
      <Footer />
    </>
  );
}
