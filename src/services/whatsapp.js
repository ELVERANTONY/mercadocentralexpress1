const formatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

export const formatPrice = (value) => formatter.format(value);

const stripEmojis = (value) =>
  // Remover la mayoría de emojis (pares sustitutos) + variación.
  String(value ?? "")
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
    .replace(/\uFE0F/g, "");

const normalizeWhatsappText = (value) =>
  stripEmojis(value)
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const buildDiamondGamesMessage = (cart, total) => {
  const lines = [
    "*Pedido · Pinturas con Diamantes 5D*",
    "",
    "Hola, *he elegido:*",
    "",
    ...cart.map(
      (item) =>
        `• ${normalizeWhatsappText(item.nombre)}${
          item.variante ? ` (${normalizeWhatsappText(item.variante)})` : ""
        }`
    ),
    "",
    `Total: *${normalizeWhatsappText(formatPrice(total))}*`,
    "",
    "*¿Disponible para entrega?*",
  ].filter((line) => line !== null && line !== undefined);
  return lines.join("\n");
};

export const buildWhatsAppMessage = (cart, total, options = {}) => {
  const {
    itemCount = 0,
    title = "Pedido nuevo",
    introLines = [],
    footerLines = [],
    hideItemPrices = false,
  } = options;
  const separator = "--------------------";
  const lines = [
    `*${title}*`,
    ...introLines,
    separator,
    `Items: ${itemCount}`,
    "",
    ...cart.map((item, index) => {
      const base = `${index + 1}. ${item.nombre}${
        item.variante ? ` (${item.variante})` : ""
      } x${item.cantidad}`;
      return hideItemPrices ? base : `${base} - *${formatPrice(item.subtotal)}*`;
    }),
    separator,
    `Total: *${formatPrice(total)}*`,
    ...footerLines,
  ].filter(Boolean);
  return lines.join("\n");
};

export const openWhatsApp = (phoneNumber, message) => {
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${phoneNumber}?text=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
};
