import { useEffect, useMemo, useRef, useState } from "react";
import Cart from "../components/Cart.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { buildDiamondGamesMessage, openWhatsApp } from "../services/whatsapp.js";
import logo from "../images/logo.png";
import juegoAImg from "../images/PINTURAS JUEGO A.png";
import juegoBImg from "../images/PINTURAS JUEGO B.png";
import juegoCImg from "../images/PINTURAS JUEGO C.png";

const PHONE_NUMBER = "51994220535";
const CART_STORAGE_KEY = "mce_cart_v1";

const PACK_PRICE = 68;
const PACK_SIZE_LABEL = "40x30 cm";
const ORDER_ID_PREFIX = "MCE-";

const createOrderId = () => {
  const nowPart = Date.now().toString(36).toUpperCase();
  const randPart = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `${ORDER_ID_PREFIX}${nowPart.slice(-4)}${randPart}`;
};

const hardcodedProducts = [
  {
    id: "design-1",
    nombre: "Juego A: Naturaleza Majestuosa 🌄",
    precio: PACK_PRICE,
    allowQuantity: false,
    badge: PACK_SIZE_LABEL,
    badges: [
      { icon: "diamond", label: "5D" },
      { icon: "ruler", label: `3 pinturas · ${PACK_SIZE_LABEL}` },
    ],
    imagen: juegoAImg,
  },
  {
    id: "design-2",
    nombre: "Juego B: Paraísos del Mundo 🌴",
    precio: PACK_PRICE,
    allowQuantity: false,
    badge: PACK_SIZE_LABEL,
    badges: [
      { icon: "diamond", label: "5D" },
      { icon: "ruler", label: `3 pinturas · ${PACK_SIZE_LABEL}` },
    ],
    imagen: juegoBImg,
  },
  {
    id: "design-3",
    nombre: "Juego C: Estaciones del Alma 🍂",
    precio: PACK_PRICE,
    allowQuantity: false,
    agotado: true,
    badge: PACK_SIZE_LABEL,
    badges: [
      { icon: "diamond", label: "5D" },
      { icon: "ruler", label: `3 pinturas · ${PACK_SIZE_LABEL}` },
    ],
    imagen: juegoCImg,
  },
];

const PRODUCT_IDS = new Set(hardcodedProducts.map((product) => product.id));

export default function Catalogo() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [flyingItems, setFlyingItems] = useState([]);
  const [isCartBumpActive, setIsCartBumpActive] = useState(false);
  const [notice, setNotice] = useState("");
  const cartButtonRef = useRef(null);
  const desktopCartRef = useRef(null);
  const desktopSummaryRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const now = Date.now();
      const extractItems = () => {
        // Soportar formato antiguo (array directo).
        if (Array.isArray(parsed)) return parsed;

        if (
          parsed &&
          Array.isArray(parsed.items) &&
          typeof parsed.expiresAt === "number"
        ) {
          if (now < parsed.expiresAt) return parsed.items;
          localStorage.removeItem(CART_STORAGE_KEY);
        }

        return [];
      };

      const storedItems = extractItems();
      if (!storedItems.length) return;

      const normalized = storedItems
        .map((item) => {
          const id = item?.id || item?.key;
          if (!id || !PRODUCT_IDS.has(id)) return null;
          const product = hardcodedProducts.find((p) => p.id === id);
          if (!product || product.agotado) return null;
          return {
            key: product.id,
            id: product.id,
            nombre: product.nombre,
            precio: PACK_PRICE,
            variante: `Incluye 3 pinturas ${PACK_SIZE_LABEL}`,
            allowQuantity: false,
            cantidad: 1,
            subtotal: PACK_PRICE,
          };
        })
        .filter(Boolean);

      const unique = Array.from(
        new Map(normalized.map((item) => [item.key, item])).values()
      );

      setCart(unique);
    } catch {
      // Si falla, seguimos con carrito vacio.
    }
  }, []);

  useEffect(() => {
    try {
      const payload = {
        items: cart,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Silenciar errores de almacenamiento.
    }
  }, [cart]);

  useEffect(() => {
    if (!isCartBumpActive) return;
    const timeoutId = window.setTimeout(() => {
      setIsCartBumpActive(false);
    }, 420);
    return () => window.clearTimeout(timeoutId);
  }, [isCartBumpActive]);

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const hasSelection = cart.length > 0;
  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + (item.subtotal || 0), 0),
    [cart]
  );
  const cartItemsCount = useMemo(() => cart.length, [cart.length]);
  const hasCartItems = cartItemsCount > 0;
  const selectionLabel = cart.length === 1 ? "juego seleccionado" : "juegos seleccionados";

  const addFlyingPreview = (flyData) => {
    if (!flyData?.imageSrc || !flyData?.imageRect) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const targetEl = isMobile
      ? cartButtonRef.current
      : desktopSummaryRef.current || desktopCartRef.current;

    if (!targetEl) return;

    const sourceRect = flyData.imageRect;
    const targetRect = targetEl.getBoundingClientRect();
    if (
      sourceRect.width === 0 ||
      sourceRect.height === 0 ||
      targetRect.width === 0 ||
      targetRect.height === 0
    ) {
      return;
    }

    const fromCenterX = sourceRect.left + sourceRect.width / 2;
    const fromCenterY = sourceRect.top + sourceRect.height / 2;
    const toCenterX = targetRect.left + targetRect.width / 2;
    const toCenterY = targetRect.top + targetRect.height / 2;
    const id = `fly-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setFlyingItems((prev) => [
      ...prev,
      {
        id,
        src: flyData.imageSrc,
        left: sourceRect.left,
        top: sourceRect.top,
        width: sourceRect.width,
        height: sourceRect.height,
        dx: toCenterX - fromCenterX,
        dy: toCenterY - fromCenterY,
        arc: isMobile ? -74 : 118,
      },
    ]);
  };

  const toggleDesign = (
    product,
    _variant,
    _quantity,
    _priceOverride,
    flyData
  ) => {
    const alreadySelected = cart.some((item) => item.key === product.id);
    if (alreadySelected) {
      setCart((prev) => prev.filter((item) => item.key !== product.id));
      setIsCartBumpActive(true);
      return;
    }

    setCart((prev) => [
      ...prev,
      {
        key: product.id,
        id: product.id,
        nombre: product.nombre,
        precio: PACK_PRICE,
        variante: `Incluye 3 pinturas ${PACK_SIZE_LABEL}`,
        allowQuantity: false,
        cantidad: 1,
        subtotal: PACK_PRICE,
      },
    ]);
    addFlyingPreview(flyData);
    setIsCartBumpActive(true);
  };

  const handleFlyAnimationEnd = (id) => {
    setFlyingItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateCartItem = (key, nextQty) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.key === key
            ? {
                ...item,
                cantidad: nextQty,
                subtotal: nextQty * item.precio,
              }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const clearCart = () => setCart([]);

  const removeCartItem = (key) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const handleCheckout = () => {
    if (!hasSelection) {
      setNotice("Elige al menos 1 juego para continuar.");
      setCartOpen(true);
      setIsCartBumpActive(true);
      return;
    }

    const message = buildDiamondGamesMessage(cart, cartTotal, {
      pedidoId: createOrderId(),
    });
    openWhatsApp(PHONE_NUMBER, message);
    clearCart();
    setCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-mesh">
      {notice ? (
        <div className="fixed left-1/2 top-4 z-[80] w-[min(92vw,520px)] -translate-x-1/2 rounded-full border border-primary/20 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-[0_18px_50px_rgba(15,23,42,0.15)]">
          {notice}
        </div>
      ) : null}
      <div className="mx-auto max-w-[1400px] px-3 pb-12 pt-4">
      <div
        className={`sticky top-0 z-40 pt-0 ${
          cartOpen ? "hidden md:block" : ""
        }`}
      >
        <header className="sticky top-0 z-50 mb-4 flex items-center justify-between gap-3 bg-white/90 px-4 py-2 shadow-sm md:mx-0 md:mb-6 md:rounded-[20px] md:border md:border-slate-100 md:px-6 md:py-4 md:shadow-card backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img
            className="h-12 w-12 rounded-full border-2 border-primary bg-white object-cover"
            src={logo}
            alt="Mercado Central Express"
          />
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Mercado Central Express
            </h1>
            <p className="text-sm font-medium text-slate-600">
              Relájate, brilla y decora tu hogar
            </p>
          </div>
        </div>
        <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
          <button
            ref={cartButtonRef}
            className={`inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-primary transition hover:border-primary ${
              hasCartItems ? "ring-2 ring-primary/30" : ""
            }`}
            onClick={() => {
              if (window.matchMedia("(max-width: 767px)").matches) {
                setCartOpen(true);
              }
            }}
            aria-label="Abrir carrito"
          >
            <svg
              className={`h-6 w-6 ${hasCartItems ? "cart-pop" : ""} ${
                isCartBumpActive ? "cart-bump" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
              <span
                className={`ml-3 inline-flex min-w-[32px] items-center justify-center rounded-full bg-primary-soft px-2 py-1 text-sm font-semibold text-primary ${
                  hasCartItems ? "badge-pulse" : ""
                } ${isCartBumpActive ? "cart-bump" : ""}`}
              >
                {cart.length}
              </span>
            </button>
        </div>
        </header>
      </div>

      {hardcodedProducts.length === 0 ? (
        <section className="empty-state">
          <h2>No hay productos cargados</h2>
          <p>Sube productos desde el panel administrador.</p>
        </section>
      ) : (
        <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="col-span-full mb-4 grid gap-5">
            {/* Headline section: Premium Badge style - Optimized for PC/Mobile */}
            <div className="px-1 md:rounded-[20px] md:border md:border-white/50 md:bg-white/40 md:p-5 md:shadow-sm md:backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left Side: Title & Badge - Above the sliding chips */}
                <div className="flex flex-col items-start gap-1.5 relative z-10 bg-white/10 md:bg-transparent backdrop-blur-[2px] md:backdrop-blur-0 pr-2">
                  <div className="flex flex-row items-center flex-wrap gap-2.5 md:gap-4">
                    <h2 className="text-[20px] font-bold tracking-tight text-slate-900 md:text-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Pinturas con diamante 5D
                    </h2>
                    <span className="headline-chip-red">
                      Kit Completo 🎨
                    </span>
                  </div>
                </div>

                {/* Right Side: Desktop chips (integrated marquee) - Slides behind title */}
                <div className="hidden md:block flex-1 max-w-[950px] desktop-marquee-wrapper ml-[-180px] relative z-0">
                  <div className="marquee-container flex gap-10 w-max">
                    {[1, 2].map((loop) => (
                      <div key={loop} className="flex gap-4">
                        <span className="desktop-benefit-chip border-primary/20 text-slate-600">
                          <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.435-4.5.5-5 1.488 1.442 3.5 3.242 3.5 5.5s-1.5 4.5-3.5 4.5c-1.25 0-1.5-1-1.5-1Z"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
                          </svg>
                          Oferta limitada
                        </span>
                        <span className="desktop-benefit-chip border-slate-200 text-slate-600">
                          <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="3" width="15" height="13"/><polyline points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                          </svg>
                          Delivery GRATIS
                        </span>
                        <span className="desktop-benefit-chip border-slate-200 text-slate-600">
                          <svg className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
                          </svg>
                          Calidad Premium
                        </span>
                        <span className="desktop-benefit-chip border-slate-200 text-slate-600">
                          <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
                          </svg>
                          Pago Contraentrega
                        </span>
                        <span className="desktop-benefit-chip border-slate-200 text-slate-600">
                          <svg className="w-4 h-4 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
                          </svg>
                          Relajación Total
                        </span>
                        <span className="desktop-benefit-chip border-slate-200 text-slate-600">
                          <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          </svg>
                          Garantía MCE
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Infinite Marquee for mobile */}
            <div className="md:hidden marquee-wrapper -mx-3 py-1">
              <div className="marquee-container px-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <span className="mobile-chip-colored mobile-chip-green">
                      <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13"/><polyline points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                      </svg>
                      Delivery GRATIS
                    </span>
                    <span className="mobile-chip-colored mobile-chip-blue">
                      <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
                      </svg>
                      Pago Contraentrega
                    </span>
                    <span className="mobile-chip-colored mobile-chip-orange text-slate-600">
                      <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.435-4.5.5-5 1.488 1.442 3.5 3.242 3.5 5.5s-1.5 4.5-3.5 4.5c-1.25 0-1.5-1-1.5-1Z"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
                      </svg>
                      Oferta limitada
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <section className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {hardcodedProducts.map((product) => (
              <div key={product.id} className="animate-fade-up">
                <ProductCard
                  key={product.id}
                  product={product}
                  selected={cart.some((item) => item.key === product.id)}
                  ctaLabel="Elegir juego"
                  ctaLabelSelected="Quitar"
                  onAddToCart={toggleDesign}
                />
              </div>
            ))}
          </section>
          <div className="hidden md:block md:sticky md:top-28 md:z-10 md:self-start">
            <Cart
              cart={cart}
              total={cartTotal}
              onUpdateItem={updateCartItem}
              onCheckout={handleCheckout}
              onClose={() => setCartOpen(false)}
              onRemoveItem={removeCartItem}
              headerTitle="Tus juegos"
              headerSubtitle={`${cart.length} ${selectionLabel}`}
              checkoutLabel={
                hasSelection
                  ? "Pedir por WhatsApp"
                  : "Elige al menos 1 juego"
              }
              checkoutDisabled={!hasSelection}
              variant="desktop"
              containerRef={desktopCartRef}
              summaryRef={desktopSummaryRef}
            />
          </div>
          {cartOpen && (
            <Cart
              cart={cart}
              total={cartTotal}
              onUpdateItem={updateCartItem}
              onCheckout={handleCheckout}
              isOpen
              onClose={() => setCartOpen(false)}
              onRemoveItem={removeCartItem}
              headerTitle="Tus juegos"
              headerSubtitle={`${cart.length} ${selectionLabel}`}
              checkoutLabel={
                hasSelection
                  ? "Pedir por WhatsApp"
                  : "Elige al menos 1 juego"
              }
              checkoutDisabled={!hasSelection}
              variant="mobile"
            />
          )}
          <div
            className={`fixed inset-0 z-20 bg-slate-900/30 transition ${
              cartOpen ? "opacity-100" : "pointer-events-none opacity-0"
            } md:hidden`}
            onClick={() => setCartOpen(false)}
          />
        </div>
      )}
      <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
        {flyingItems.map((item) => (
          <img
            key={item.id}
            src={item.src}
            alt=""
            aria-hidden="true"
            className="fly-to-cart-image"
            style={{
              left: `${item.left}px`,
              top: `${item.top}px`,
              width: `${item.width}px`,
              height: `${item.height}px`,
              "--dx": `${item.dx}px`,
              "--dy": `${item.dy}px`,
              "--arc": `${item.arc}px`,
            }}
            onAnimationEnd={() => handleFlyAnimationEnd(item.id)}
          />
        ))}
      </div>
    </div>
    </div>
  );
}
