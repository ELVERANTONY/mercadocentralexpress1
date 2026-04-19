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
    const qty = allowQuantity ? quantity : 1;
    const imageRect = imageRef.current?.getBoundingClientRect();
    onAddToCart(product, variant, qty, variantPrice, {
      imageSrc: selectedImage,
      imageRect,
    });
    setQuantity(1);
  };

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-[22px] border bg-white shadow-[0_16px_34px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(15,23,42,0.12)] ${
        selected ? "border-primary/40 ring-2 ring-primary/15" : "border-slate-100"
      }`}
    >
      <div className={`relative aspect-square w-full overflow-hidden border-b border-slate-100 bg-white`}>
        {selectedImage ? (
          <img
            ref={imageRef}
            src={selectedImage}
            alt={product.nombre}
            className="h-full w-full object-contain object-center transition duration-500 group-hover:scale-[1.01]"
          />
        ) : (
          <div className="font-medium text-slate-400">Sin imagen</div>
        )}
        {selected ? (
          <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            Seleccionado
          </div>
        ) : null}
        {isAgotado ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="rounded-xl bg-slate-900/90 px-4 py-2 text-sm font-bold uppercase tracking-widest text-white shadow-2xl ring-1 ring-white/20">
              Agotado
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 md:gap-3.5 md:p-6">
        <h3 className="text-[1.26rem] font-semibold leading-tight text-slate-900 md:text-[1.28rem]">
          {product.nombre}
        </h3>
        <div className="flex flex-wrap items-end gap-2 pt-0.5">
          {shouldShowDiscountInfo && (
            <p className="text-base font-semibold text-slate-400 line-through md:text-[0.95rem]">
              {formatPrice(compareAtPrice)}
            </p>
          )}
          <p className="text-[1.72rem] font-extrabold tracking-wide text-primary md:text-[1.72rem]">
            {formatPrice(displayPrice)}
          </p>
        </div>
        {badges.length ? (
          <div className="flex w-full flex-wrap items-center justify-center gap-2 pt-0.5">
            {badges.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
              >
                {item.icon ? renderBadgeIcon(item.icon) : null}
                <span>{item.label}</span>
              </span>
            ))}
          </div>
        ) : null}
        {(shouldShowDiscountInfo || variantOfferLabel) && (
          <div className="flex flex-wrap items-center gap-2">
            {shouldShowDiscountInfo && (
              <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[0.85rem] font-semibold text-primary md:text-[0.74rem]">
                Ahorra {formatPrice(discountAmount)}
              </span>
            )}
            {variantOfferLabel && (
              <span className="w-fit rounded-full border border-primary/30 bg-primary-soft px-2.5 py-1 text-[0.85rem] font-semibold text-primary md:text-[0.74rem]">
                {variantQty >= 12 ? "🔥 " : "⭐ "}
                {variantOfferLabel}
              </span>
            )}
          </div>
        )}
        {hasVariants && (
          <div
            className={`grid content-start gap-1.5 text-sm text-slate-500 ${
              placeQuantityNextToVariantOnDesktop
                ? "md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-3"
                : ""
            }`}
          >
            <div className="grid content-start gap-1.5">
              <span className="text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-slate-400 md:text-[0.72rem]">
                Variante
              </span>
              <div className="flex flex-wrap gap-2">
                {product.variantes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`rounded-full border px-4 py-2 text-[0.9rem] font-semibold transition md:px-3.5 md:py-1.5 md:text-[0.82rem] ${
                      variant === item
                        ? "border-primary/40 bg-primary-soft text-primary"
                        : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:text-primary"
                    }`}
                    onClick={() => setVariant(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            {placeQuantityNextToVariantOnDesktop && (
              <div className="hidden md:block">
                <QuantitySelector value={quantity} onChange={setQuantity} />
              </div>
            )}
          </div>
        )}
        <div className="mt-auto grid gap-2.5 pt-0.5">
          {allowQuantity && (
            <div
              className={`flex justify-center ${
                placeQuantityNextToVariantOnDesktop
                  ? "md:hidden"
                  : "md:justify-start"
              }`}
            >
              <QuantitySelector value={quantity} onChange={setQuantity} />
            </div>
          )}
          <button
            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[0.95rem] font-semibold text-white shadow-[0_10px_20px_rgba(171,38,34,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(171,38,34,0.3)] active:translate-y-0 md:py-2.5 md:text-[0.9rem] ${
              isAgotado
                ? "cursor-not-allowed bg-slate-300 shadow-none hover:translate-y-0"
                : selected
                  ? "bg-slate-900 hover:bg-slate-800"
                  : "bg-gradient-to-r from-primary to-primary-dark"
            }`}
            type="button"
            onClick={handleAdd}
            disabled={isAgotado}
          >
            {isAgotado ? "Agotado" : selected ? ctaLabelSelected : ctaLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
