import QuantitySelector from "./QuantitySelector.jsx";
import { formatPrice } from "../services/whatsapp.js";

export default function Cart({
  cart,
  total,
  onUpdateItem,
  onCheckout,
  isOpen,
  onClose,
  onRemoveItem,
  headerTitle = "Resumen",
  headerSubtitle = "",
  checkoutLabel = "Realizar pedido por WhatsApp",
  checkoutDisabled = false,
  variant = "desktop",
  containerRef,
  summaryRef,
}) {
  const isMobile = variant === "mobile";
  return (
    <aside
      ref={containerRef}
      className={
        isMobile
          ? "fixed inset-0 z-30 h-screen w-screen overflow-auto bg-white shadow-card"
          : "rounded-[22px] border border-slate-100 bg-white/95 p-6 shadow-[0_18px_36px_rgba(15,23,42,0.1)] backdrop-blur"
      }
    >
      <div
        className={
          isMobile
            ? "sticky top-0 z-10 bg-white px-6 pb-3 pt-5 shadow-[0_10px_20px_rgba(0,0,0,0.04)]"
            : "pb-2"
        }
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid">
              <h2
                ref={summaryRef}
                className="text-xl font-semibold text-slate-900"
              >
                {headerTitle}
              </h2>
              {headerSubtitle ? (
                <span className="text-xs font-medium text-slate-400">
                  {headerSubtitle}
                </span>
              ) : null}
            </div>
          </div>
          {isMobile && (
            <button
              className="text-2xl text-slate-400 hover:text-slate-600"
              type="button"
              onClick={onClose}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {cart.length === 0 ? (
        <p
          className={
            isMobile ? "px-6 pt-4 text-sm text-slate-400" : "pt-2 text-sm text-slate-400"
          }
        >
          Tu carrito está vacío.
        </p>
      ) : (
        <div
          className={isMobile ? "grid gap-3 px-6 pt-4" : "grid gap-3 pt-3"}
        >
          {cart.map((item) => (
            <div
              key={item.key}
              className="grid items-center gap-3 rounded-[16px] border border-slate-100 bg-white px-4 py-3 md:grid-cols-[1fr_auto_auto]"
            >
              <div className="grid gap-1">
                <strong className="text-sm font-semibold text-slate-900">
                  {item.nombre}
                </strong>
                <span className="text-xs text-slate-400">{item.variante}</span>
                {item.precio > 0 ? (
                  <span className="text-sm text-slate-500">
                    {formatPrice(item.precio)}
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-primary">
                    Incluido en el pack
                  </span>
                )}
              </div>
              {item.allowQuantity === true ? (
                <QuantitySelector
                  value={item.cantidad}
                  onChange={(value) => onUpdateItem(item.key, value)}
                  min={1}
                />
              ) : null}
              <span className="text-sm font-semibold text-slate-900">
                {formatPrice(item.subtotal)}
              </span>
            </div>
          ))}
        </div>
      )}
      <div
        className={
          isMobile
            ? "sticky bottom-0 grid gap-4 border-t border-slate-100 bg-white px-6 pb-6 pt-4"
            : "sticky bottom-0 grid gap-4 border-t border-slate-100 bg-white/95 pt-3"
        }
      >
        <div className="flex items-center justify-between text-base">
          <span>Total</span>
          <strong>{formatPrice(total)}</strong>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-dark px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(124,58,237,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(124,58,237,0.3)] active:translate-y-0"
          type="button"
          onClick={onCheckout}
          disabled={checkoutDisabled || cart.length === 0}
        >
          {checkoutLabel}
        </button>
      </div>
    </aside>
  );
}
