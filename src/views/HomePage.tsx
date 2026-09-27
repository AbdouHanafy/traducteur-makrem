import Topbar from "@/views/components/Topbar";
import Hero from "@/views/components/Hero";
import Stats from "@/views/components/Stats";
import Services, { type ServiceTeaserItem } from "@/views/components/Services";
import Workflow from "@/views/components/Workflow";
import Statement from "@/views/components/Statement";
import FinalCta from "@/views/components/FinalCta";
import CustomSection, { type CustomSectionData } from "@/views/components/CustomSection";
import Footer from "@/views/components/Footer";
import type { HomeSectionType } from "@prisma/client";

export interface HomeSectionData {
  id: string;
  type: HomeSectionType;
  eyebrow: string | null;
  title: string | null;
  body: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
}

export default function HomePage({
  sections,
  services,
}: {
  sections: HomeSectionData[];
  services: ServiceTeaserItem[];
}) {
  return (
    <>
      <Topbar />
      <main className="flex-1">
        {sections.map((section) => {
          switch (section.type) {
            case "HERO":
              return <Hero key={section.id} />;
            case "STATS":
              return <Stats key={section.id} />;
            case "SERVICES":
              return <Services key={section.id} services={services} />;
            case "WORKFLOW":
              return <Workflow key={section.id} />;
            case "STATEMENT":
              return <Statement key={section.id} />;
            case "FINAL_CTA":
              return <FinalCta key={section.id} />;
            case "CUSTOM":
              return <CustomSection key={section.id} data={section as CustomSectionData} />;
            default:
              return null;
          }
        })}
      </main>
      <Footer />
    </>
  );
}
