import type { ReactNode } from "react";

/**
 * Source unique des services affichés (teaser homepage + page /services).
 * Toujours SANS prix en dur (voir ARCHITECTURE.md §1.2/§5) — à partir de la Phase 3,
 * ce fichier sera remplacé par une lecture DB via src/repositories/services.ts.
 */
export interface ServiceItem {
  slug: string;
  title: string;
  description: string;
  documents: string[];
  icon: ReactNode;
}

export const SERVICES: ServiceItem[] = [
  {
    slug: "etat-civil",
    title: "Actes d'état civil",
    description: "Extraits de naissance, mariage, décès, livret de famille.",
    documents: ["Extrait de naissance", "Acte de mariage", "Acte de décès", "Livret de famille"],
    icon: <path d="M12 2l3 6 6 .9-4.5 4.3L18 20l-6-3.2L6 20l1.5-6.8L3 8.9 9 8z" />,
  },
  {
    slug: "diplomes",
    title: "Diplômes & relevés de notes",
    description: "Diplômes, attestations, relevés de notes pour études à l'étranger.",
    documents: ["Diplôme", "Attestation de réussite", "Relevé de notes", "Attestation d'inscription"],
    icon: (
      <>
        <path d="M22 10L12 5 2 10l10 5 10-5z" />
        <path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5" />
      </>
    ),
  },
  {
    slug: "contrats",
    title: "Contrats & actes",
    description: "Contrats commerciaux, statuts, procurations, actes notariés.",
    documents: ["Contrat commercial", "Statuts de société", "Procuration", "Acte notarié"],
    icon: (
      <>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h5" />
      </>
    ),
  },
  {
    slug: "judiciaire",
    title: "Documents judiciaires",
    description: "Jugements, assignations, PV, décisions de tribunaux.",
    documents: ["Jugement", "Assignation", "Procès-verbal", "Décision de justice"],
    icon: <path d="M12 3v18M5 7l7-4 7 4M4 21h16M6 7l-2 6h4zM18 7l-2 6h4z" />,
  },
  {
    slug: "immigration",
    title: "Immigration & visa",
    description: "Dossiers de visa, résidence, casier judiciaire, attestations.",
    documents: ["Dossier de visa", "Titre de séjour", "Casier judiciaire", "Attestation de résidence"],
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
      </>
    ),
  },
  {
    slug: "interpretariat",
    title: "Interprétariat",
    description: "Interprète assermenté : mariages, tribunaux, notaires, rendez-vous.",
    documents: ["Mariage mixte", "Audience au tribunal", "Rendez-vous notarié", "Entretien administratif"],
    icon: <path d="M3 5h12v9H8l-4 4V5zM21 9v11l-4-4h-2" />,
  },
];
