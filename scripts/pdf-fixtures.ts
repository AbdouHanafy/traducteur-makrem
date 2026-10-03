/** PDF avec texte + « cachet » (image rouge) : l'aperçu client doit garder le texte et retirer l'image. */
export function pdfText(): Buffer {
  const hex = "DC0000".repeat(1600) + ">";
  const content = "BT /F1 16 Tf 40 250 Td (Traduction certifiee) Tj ET q 80 0 0 80 180 120 cm /Im1 Do Q";
  const objs = [
    "<</Type/Catalog/Pages 2 0 R>>",
    "<</Type/Pages/Kids[3 0 R]/Count 1>>",
    "<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 300]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>/XObject<</Im1 6 0 R>>>>>>",
    `<</Length ${content.length}>>\nstream\n${content}\nendstream`,
    "<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>",
    `<</Type/XObject/Subtype/Image/Width 40/Height 40/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/ASCIIHexDecode/Length ${hex.length}>>\nstream\n${hex}\nendstream`,
  ];
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = out.length;
  out +=
    `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` +
    offsets.map((o) => String(o).padStart(10, "0") + " 00000 n \n").join("") +
    `trailer<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%` +
    "EOF";
  return Buffer.from(out);
}
