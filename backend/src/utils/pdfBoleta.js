import fs from "fs";
import PDFDocument from "pdfkit";

export const generarBoletaPDF = async (idVenta, productos, total) => {
  const doc = new PDFDocument();
  const filePath = `boleta_${idVenta}.pdf`;
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(16).text(`Boleta N° ${idVenta}`);
  doc.moveDown();
  productos.forEach(p => {
    doc.text(`${p.nombre} x${p.cantidad} = $${p.precio * p.cantidad}`);
  });
  doc.moveDown().fontSize(14).text(`TOTAL: $${total}`);
  doc.end();

  return filePath;
};
