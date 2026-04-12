import * as XLSX from "xlsx";

const normalizeString = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

export const parseExcelFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        const products = rows.map((row, index) => {
          const keys = Object.keys(row);
          const findByKey = (target) => {
            const key = keys.find(
              (candidate) => normalizeString(candidate) === target
            );
            return key ? row[key] : "";
          };

          const nombre = findByKey("nombre") || findByKey("producto");
          const precioRaw = findByKey("precio") || findByKey("price");
          const variantesRaw = findByKey("variantes") || findByKey("opciones");

          return {
            id: `prod-${Date.now()}-${index}`,
            nombre: nombre || `Producto ${index + 1}`,
            precio: Number(precioRaw) || 0,
            variantes: String(variantesRaw || "")
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            imagen: "",
          };
        });

        resolve(products);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsArrayBuffer(file);
  });
