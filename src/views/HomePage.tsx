import Topbar from "@/views/components/Topbar";
import Hero from "@/views/components/Hero";
import Stats from "@/views/components/Stats";
import Services, { type ServiceTeaserItem } from "@/views/components/Services";
import Workflow from "@/views/components/Workflow";
import Statement from "@/views/components/Statement";
import FinalCta from "@/views/components/FinalCta";
import Footer from "@/views/components/Footer";

export default function HomePage({ services }: { services: ServiceTeaserItem[] }) {
  return (
    <>
      <Topbar />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Services services={services} />
        <Workflow />
        <Statement />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
