/**
 * Génère une image de couverture "de marque" pour chaque service (navy + or, cohérent avec
 * l'identité du site) et l'assigne via Service.imageUrl — pas de fausses photos de documents
 * réels, juste une illustration générique par catégorie. Script ponctuel, pas une route de
 * l'app : `npx tsx scripts/generate-service-covers.ts`.
 */
import { createCanvas, type SKRSContext2D } from "@napi-rs/canvas";
import { prisma } from "../src/lib/prisma";
import { writePublicMedia } from "../src/lib/storage/publicStorage";

const WIDTH = 800;
const HEIGHT = 500;

type IconDrawer = (ctx: SKRSContext2D, cx: number, cy: number, s: number) => void;

const ICONS: Record<string, IconDrawer> = {
  "etat-civil": (ctx, cx, cy, s) => {
    // Étoile / sceau
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i;
      const r = i % 2 === 0 ? s : s * 0.45;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  },
  "diplomes-releves": (ctx, cx, cy, s) => {
    // Chapeau de diplôme
    ctx.beginPath();
    ctx.moveTo(cx - s, cy);
    ctx.lineTo(cx, cy - s * 0.5);
    ctx.lineTo(cx + s, cy);
    ctx.lineTo(cx, cy + s * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(cx - s * 0.35, cy + s * 0.1, s * 0.7, s * 0.55);
  },
  "contrats-actes": (ctx, cx, cy, s) => {
    // Document avec lignes
    ctx.fillRect(cx - s * 0.7, cy - s, s * 1.4, s * 2);
    ctx.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(cx - s * 0.45, cy - s * 0.55 + i * s * 0.4, s * 0.9, s * 0.12);
    }
    ctx.globalCompositeOperation = "source-over";
  },
  "documents-judiciaires": (ctx, cx, cy, s) => {
    // Balance de la justice
    ctx.fillRect(cx - s * 0.06, cy - s, s * 0.12, s * 1.8);
    ctx.beginPath();
    ctx.moveTo(cx - s, cy - s * 0.5);
    ctx.lineTo(cx + s, cy - s * 0.5);
    ctx.stroke();
    ctx.lineWidth = s * 0.08;
    ctx.beginPath();
    ctx.arc(cx - s, cy - s * 0.1, s * 0.35, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + s, cy - s * 0.1, s * 0.35, 0, Math.PI);
    ctx.stroke();
  },
  interpretariat: (ctx, cx, cy, s) => {
    // Deux bulles de dialogue
    ctx.beginPath();
    ctx.roundRect(cx - s * 1.1, cy - s * 0.6, s * 1.3, s * 0.9, 12);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(cx - s * 0.2, cy - s * 0.1, s * 1.3, s * 0.9, 12);
    ctx.fill();
  },
};

async function main() {
  const services = await prisma.service.findMany();

  for (const service of services) {
    const drawIcon = ICONS[service.slug];
    if (!drawIcon) {
      console.log("Pas d'icône définie pour", service.slug, "— ignoré");
      continue;
    }

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    gradient.addColorStop(0, "#0C1A34");
    gradient.addColorStop(1, "#14284D");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Cercles décoratifs (identité déjà utilisée sur le Hero/Workflow)
    ctx.strokeStyle = "rgba(180,137,78,0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(WIDTH - 60, 60, 140, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(WIDTH - 60, 60, 100, 0, Math.PI * 2);
    ctx.stroke();

    // Icône
    ctx.fillStyle = "#B4894E";
    ctx.strokeStyle = "#B4894E";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    drawIcon(ctx, WIDTH * 0.28, HEIGHT * 0.5, 46);

    // Titre
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 34px Georgia, serif";
    ctx.textBaseline = "middle";
    const words = service.name.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > WIDTH * 0.5 && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    const startY = HEIGHT / 2 - ((lines.length - 1) * 40) / 2;
    lines.forEach((l, i) => ctx.fillText(l, WIDTH * 0.45, startY + i * 40));

    const buffer = await canvas.encode("jpeg", 88);
    const url = await writePublicMedia(buffer, ".jpg");

    await prisma.mediaAsset.create({
      data: {
        url,
        originalName: `${service.slug}-cover.jpg`,
        mimeType: "image/jpeg",
        sizeBytes: buffer.byteLength,
        altText: service.name,
        uploadedById: "system-seed",
      },
    });

    await prisma.service.update({ where: { id: service.id }, data: { imageUrl: url } });
    console.log("✓", service.name, "->", url);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
