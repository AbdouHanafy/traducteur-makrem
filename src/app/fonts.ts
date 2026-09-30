import {
  Almarai,
  Amiri,
  Bitter,
  Cairo,
  Cormorant_Garamond,
  Crimson_Pro,
  DM_Sans,
  EB_Garamond,
  El_Messiri,
  IBM_Plex_Sans_Arabic,
  Inter,
  Libre_Baskerville,
  Lora,
  Merriweather,
  Montserrat,
  Noto_Kufi_Arabic,
  Noto_Naskh_Arabic,
  Nunito,
  Open_Sans,
  Playfair_Display,
  Poppins,
  Raleway,
  Readex_Pro,
  Roboto,
  Source_Sans_3,
  Spectral,
  Tajawal,
} from "next/font/google";

/**
 * Polices sélectionnables depuis /admin/theme. Seules Inter et Spectral (défauts) sont
 * préchargées ; les autres ne sont téléchargées par le navigateur que si le thème les utilise.
 * Les options de next/font doivent être des littéraux (pas de spread) : d'où la répétition.
 */
export const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
export const spectral = Spectral({ variable: "--font-spectral", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

// Latin
const playfair = Playfair_Display({ variable: "--font-playfair", weight: ["400", "500", "600", "700"], subsets: ["latin"], preload: false, display: "swap" });
const lora = Lora({ variable: "--font-lora", weight: ["400", "500", "600", "700"], subsets: ["latin"], preload: false, display: "swap" });
const merriweather = Merriweather({ variable: "--font-merriweather", weight: ["400", "700"], subsets: ["latin"], preload: false, display: "swap" });
const libreBaskerville = Libre_Baskerville({ variable: "--font-libre-baskerville", weight: ["400", "700"], subsets: ["latin"], preload: false, display: "swap" });
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", weight: ["400", "500", "600", "700"], subsets: ["latin"], preload: false, display: "swap" });
const ebGaramond = EB_Garamond({ variable: "--font-eb-garamond", subsets: ["latin"], preload: false, display: "swap" });
const crimson = Crimson_Pro({ variable: "--font-crimson", subsets: ["latin"], preload: false, display: "swap" });
const bitter = Bitter({ variable: "--font-bitter", subsets: ["latin"], preload: false, display: "swap" });
const poppins = Poppins({ variable: "--font-poppins", weight: ["400", "500", "600", "700"], subsets: ["latin"], preload: false, display: "swap" });
const montserrat = Montserrat({ variable: "--font-montserrat", weight: ["400", "500", "600", "700"], subsets: ["latin"], preload: false, display: "swap" });
const roboto = Roboto({ variable: "--font-roboto", weight: ["400", "500", "700"], subsets: ["latin"], preload: false, display: "swap" });
const sourceSans = Source_Sans_3({ variable: "--font-source-sans", weight: ["400", "500", "600", "700"], subsets: ["latin"], preload: false, display: "swap" });
const dmSans = DM_Sans({ variable: "--font-dm-sans", weight: ["400", "500", "600", "700"], subsets: ["latin"], preload: false, display: "swap" });
const openSans = Open_Sans({ variable: "--font-open-sans", subsets: ["latin"], preload: false, display: "swap" });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], preload: false, display: "swap" });
const raleway = Raleway({ variable: "--font-raleway", subsets: ["latin"], preload: false, display: "swap" });

// Arabe (avec le latin, pour les mots français/anglais insérés dans un texte arabe)
const cairo = Cairo({ variable: "--font-cairo", subsets: ["arabic", "latin"], preload: false, display: "swap" });
const tajawal = Tajawal({ variable: "--font-tajawal", weight: ["400", "500", "700"], subsets: ["arabic", "latin"], preload: false, display: "swap" });
const naskh = Noto_Naskh_Arabic({ variable: "--font-noto-naskh", subsets: ["arabic", "latin"], preload: false, display: "swap" });
const kufi = Noto_Kufi_Arabic({ variable: "--font-noto-kufi", subsets: ["arabic", "latin"], preload: false, display: "swap" });
const amiri = Amiri({ variable: "--font-amiri", weight: ["400", "700"], subsets: ["arabic", "latin"], preload: false, display: "swap" });
const almarai = Almarai({ variable: "--font-almarai", weight: ["400", "700"], subsets: ["arabic"], preload: false, display: "swap" });
const plexArabic = IBM_Plex_Sans_Arabic({ variable: "--font-plex-arabic", weight: ["400", "500", "600", "700"], subsets: ["arabic", "latin"], preload: false, display: "swap" });
const readex = Readex_Pro({ variable: "--font-readex", subsets: ["arabic", "latin"], preload: false, display: "swap" });
const elMessiri = El_Messiri({ variable: "--font-el-messiri", subsets: ["arabic", "latin"], preload: false, display: "swap" });

/** Classe à poser sur <html> : déclare toutes les variables `--font-*`. */
export const fontVariableClasses = [
  inter, spectral, playfair, lora, merriweather, libreBaskerville, cormorant, ebGaramond, crimson, bitter,
  poppins, montserrat, roboto, sourceSans, dmSans, openSans, nunito, raleway,
  cairo, tajawal, naskh, kufi, amiri, almarai, plexArabic, readex, elMessiri,
]
  .map((font) => font.variable)
  .join(" ");
