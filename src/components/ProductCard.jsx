import { useRef, useState } from "react";
import QuantitySelector from "./QuantitySelector.jsx";
import { formatPrice } from "../services/whatsapp.js";

export default function ProductCard({
  product,
  onAddToCart,
  selected = false,
  ctaLabel = "Agregar al carrito",
  ctaLabelSelected = "Quitar",
}) {
  const isAgotado = product.agotado;
  const imageRef = useRef(null);
  const discountEnabled = product.disableDiscount !== true;
  const hasVariants = product.variantes && product.variantes.length > 0;
  const allowQuantity = product.allowQuantity !== false;
  const [variant, setVariant] = useState(
    hasVariants ? product.variantes[0] : "Único"
  );
  const [quantity, setQuantity] = useState(1);
  const variantPrice =
    product.variantPrices && variant in product.variantPrices
      ? product.variantPrices[variant]
      : product.precio;
  const compareAtPrice = allowQuantity
    ? (product.compareAtPrice ?? product.precio) * quantity
    : product.variantCompareAtPrices &&
        variant in product.variantCompareAtPrices
      ? product.variantCompareAtPrices[variant]
      : product.precio;
  const displayPrice = allowQuantity ? product.precio * quantity : variantPrice;
  const selectedImage =
    product.variantImages && variant in product.variantImages
      ? product.variantImages[variant]
      : product.imagen;
  const variantQty =
    product.variantQuantities && variant in product.variantQuantities
      ? product.variantQuantities[variant]
      : null;
  const discountAmount = discountEnabled
    ? Math.max(compareAtPrice - displayPrice, 0)
    : 0;
  const shouldShowDiscountInfo = allowQuantity
    ? discountEnabled && discountAmount > 0
    : typeof variantQty === "number" && variantQty > 3 && discountAmount > 0;
  const variantOfferLabel =
    !allowQuantity && typeof variantQty === "number"
      ? variantQty >= 12
        ? "Mejor precio"
        : variantQty >= 6
          ? "Mas vendido"
          : null
      : null;
  const placeQuantityNextToVariantOnDesktop =
    allowQuantity && hasVariants && product.variantes.length === 1;

  const renderBadgeIcon = (icon) => {
    if (icon === "diamond") {
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10.5 3h3l4.5 6-6 12-6-12 4.5-6Z" />
          <path d="M6 9h12" />
        </svg>
      );
    }

    if (icon === "ruler") {
      return (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 21l18-18" />
          <path d="M8 16l-2-2" />
          <path d="M11 13l-2-2" />
          <path d="M14 10l-2-2" />
          <path d="M17 7l-2-2" />
        </svg>
      );
    }

    return null;
  };

  const badges = Array.isArray(product.badges)
    ? product.badges
    : product.badge
      ? [{ label: product.badge }]
      : [];

  const handleAdd = () => {
    if (isAgotado) return;
    const qty = allowQuantity ? quantity : 1;
    const imageRect = imageRef.current?.getBoundingClientRect();
    onAddToCart(product, variant, qty, variantPrice, {
      imageSrc: selectedImage,
      imageRect,
    });
    setQuantity(1);
  };

  const renderPremiumPrice = (priceVal) => {
    const formatted = formatPrice(priceVal).replace("S/", "").trim();
    const [integer, decimals] = formatted.split(".");
    return (
      <span className="flex items-start">
        <span className="price-symbol">S/</span>
        <span className="leading-none">{integer}</span>
        {decimals && <span className="price-cents">.{decimals}</span>}
      </span>
    );
  };

  return (
    <article 
      className={`group flex h-full flex-col overflow-hidden rounded-[24px] border bg-white transition-all duration-500 hover:-translate-y-2 ${
        selected 
          ? "border-primary/40 shadow-glow ring-1 ring-primary/20" 
          : "border-slate-100 shadow-premium hover:shadow-premium-hover hover:border-primary/20"
      }`}
    >
      {/* Premium Image Header */}
      <div className="relative h-[70vw] min-h-[250px] max-h-[320px] overflow-hidden md:h-[19rem]">
        {selectedImage ? (
          <img
            ref={imageRef}
            src={selectedImage}
            alt={product.nombre}
            className={`h-full w-full object-cover object-center transition duration-700 ease-out group-hover:scale-[1.1] ${
              isAgotado ? "" : ""
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 font-medium text-slate-300">Sin imagen</div>
        )}

        {/* Selected Pulse Badge */}
        {selected && (
          <div className="absolute top-4 right-4 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </div>
        )}
        
        {/* Dynamic Offer Badge (Premium Floating Seal) - Pinturas Logic */}
        {(variantOfferLabel || shouldShowDiscountInfo) && (
          <div className="absolute top-3 left-3 md:top-4 md:left-4 flex items-center gap-2.5 rounded-full bg-white/95 px-3 py-1.5 md:px-3.5 md:py-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-900 shadow-xl backdrop-blur-lg border border-white/20 animate-chip-pop-in">
            <span className={`flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full text-white shadow-sm ${
              variantQty >= 12 ? "bg-cyan-500" : variantQty >= 6 ? "bg-orange-500" : "bg-indigo-500"
            }`}>
              {variantQty >= 12 ? (
                <svg className="w-3 md:w-3.5 h-3 md:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>
              ) : variantQty >= 6 ? (
                <svg className="w-3 md:w-3.5 h-3 md:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
              ) : (
                <svg className="w-3 md:w-3.5 h-3 md:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              )}
            </span>
            <span>
              {variantOfferLabel || (shouldShowDiscountInfo ? "Pinturas 5D" : "")}
            </span>
          </div>
        )}

        {/* Agotado Overlay */}
        {isAgotado && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-slate-900/90 text-white px-6 py-2 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl">
              Agotado
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        {/* Product Title */}
        <div className="mb-2">
          <h3 className="text-[20px] font-black leading-tight text-slate-900 md:text-[22px] tracking-tighter text-left">
            {product.nombre}
          </h3>
        </div>

        {/* Dynamic Pricing */}
        <div className="flex items-baseline justify-start gap-2 mb-4">
          <div className="text-[34px] md:text-[40px] font-black tracking-tighter text-primary leading-none">
            {renderPremiumPrice(displayPrice)}
          </div>
          {shouldShowDiscountInfo && (
            <p className="text-[15px] md:text-[18px] font-bold text-slate-300 line-through decoration-slate-200 opacity-60">
              {formatPrice(compareAtPrice)}
            </p>
          )}
        </div>

        {/* Functional Badges (5D & Specs) */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {badges.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#ab2622]/5 px-3 py-1 text-[11px] font-bold text-[#ab2622] border border-[#ab2622]/10"
              >
                {item.icon === "diamond" ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>
                  </svg>
                ) : item.icon === "ruler" ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21l18-18" /><path d="M8 16l-2-2" /><path d="M11 13l-2-2" /><path d="M14 10l-2-2" /><path d="M17 7l-2-2" />
                  </svg>
                ) : null}
                <span>{item.label}</span>
              </span>
            ))}
          </div>
        )}

        {/* Refined Variant Selection */}
        {hasVariants && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {product.variantes.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`rounded-full px-5 py-2 md:px-4 md:py-1.5 text-[12px] md:text-[13px] font-black transition-all duration-300 ${
                    variant === item
                      ? "bg-slate-900 text-white shadow-xl scale-105"
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100/50"
                  }`}
                  onClick={() => setVariant(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sophisticated CTA Section */}
        <div className="mt-auto pt-2">
          <div className={`flex gap-3 ${allowQuantity ? "flex-col md:flex-row md:items-center" : "items-center"}`}>
            {allowQuantity && (
              <div className="flex justify-center md:flex-shrink-0">
                <QuantitySelector value={quantity} onChange={setQuantity} />
              </div>
            )}
            <button
              className={`shimmer-btn relative flex-1 overflow-hidden inline-flex items-center justify-center gap-2 rounded-full px-4 py-4 text-[14px] md:text-[15px] font-black text-white transition-all duration-500 active:scale-95 whitespace-nowrap w-full ${
                isAgotado 
                  ? "bg-slate-300 cursor-not-allowed" 
                  : selected
                    ? "bg-slate-900 shadow-xl"
                    : "bg-gradient-to-r from-primary via-primary to-primary-dark shadow-[0_12px_24px_-8px_rgba(171,38,34,0.4)] hover:-translate-y-1 hover:shadow-[0_20px_35px_-10px_rgba(171,38,34,0.5)]"
              }`}
              type="button"
              onClick={handleAdd}
              disabled={isAgotado}
            >
              <span>{isAgotado ? "Agotado" : selected ? ctaLabelSelected : ctaLabel}</span>
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {selected ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <>
                    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.56-7.43H5.12"/>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
