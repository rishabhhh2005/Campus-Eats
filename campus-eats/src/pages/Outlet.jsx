import { useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { OUTLETS } from "../data/outlets";
import { OUTLETS_HIMACHAL } from "../data/outlets_himachal";
import { getCampus } from "../data/campus";
import { useCart } from "../context/CartContext";

export default function Outlet() {
  const { slug } = useParams();
  const campus = getCampus();
  const data = campus === "Himachal" ? OUTLETS_HIMACHAL : OUTLETS;

  const outlet =
    data.find(o => o.slug === slug) ||
    [...OUTLETS, ...OUTLETS_HIMACHAL].find(o => o.slug === slug);

  const { cart, changeItemQty } = useCart();

  const [vegFilter, setVegFilter] = useState(null); // null = all
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    if (!outlet) return [];
    return ["all", ...new Set(outlet.menu.map(i => i.category))];
  }, [outlet]);

  const menu = useMemo(() => {
    if (!outlet) return [];
    return outlet.menu.filter(item => {
      const vegOk =
        vegFilter === null ||
        (vegFilter === true && item.isVeg) ||
        (vegFilter === false && !item.isVeg);

      const catOk = category === "all" || item.category === category;
      return vegOk && catOk;
    });
  }, [outlet, vegFilter, category]);

  if (!outlet) return <div className="p-6">Outlet not found</div>;

  return (
    <section className="max-w-screen-xl mx-auto px-4 pt-3 pb-10 space-y-6">

      <div className="rounded-2xl p-4 space-y-4
        bg-white dark:bg-[#0b1220]
        border border-gray-200 dark:border-white/5
        shadow-sm dark:shadow-none">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div className="flex items-center gap-4">
            <div className="w-28 h-20 bg-white rounded-xl flex items-center justify-center overflow-hidden border">
              <img
                src={outlet.image}
                alt={outlet.name}
                className="object-contain h-full"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {outlet.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {outlet.cuisine} • {outlet.eta}
              </p>
            </div>
          </div>

          {/* Veg / Non Veg */}
          <div className="flex gap-3">
            <button
              onClick={() => setVegFilter(prev => (prev === true ? null : true))}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition
                ${
                  vegFilter === true
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300"
                }`}
            >
              Veg
            </button>

            <button
              onClick={() => setVegFilter(prev => (prev === false ? null : false))}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition
                ${
                  vegFilter === false
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300"
                }`}
            >
              Non-Veg
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition
                ${
                  category === c
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300"
                }`}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {menu.map(item => {
          const qty = cart.items.find(i => i.id === item.id)?.qty || 0;

          return (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden transition hover:scale-[1.02]
                bg-white dark:bg-[#0b1220]
                border border-gray-200 dark:border-white/5
                shadow-md dark:shadow-none"
            >
              <div className="h-44 bg-gray-100 dark:bg-black/30 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <div className="p-4 space-y-2">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {item.name}
                  </h3>

                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                    ${item.isVeg ? "border-green-500" : "border-red-500"}`}>
                    <span className={`w-2 h-2 rounded-full
                      ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {item.desc}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    ₹{item.price}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full
                    bg-gray-100 text-gray-600
                    dark:bg-white/10 dark:text-gray-300">
                    {item.category}
                  </span>
                </div>

                {qty > 0 ? (
  <div className="mt-3 flex items-center justify-between
    bg-blue-600 rounded-xl px-3 py-2 text-white">

    <button
      onClick={() => changeItemQty(item, outlet, -1)}
      className="w-9 h-9 flex items-center justify-center
        rounded-lg bg-white/20 hover:bg-white/30
        text-xl font-bold transition"
    >
      −
    </button>

    <span className="min-w-[24px] text-center font-semibold text-lg">
      {qty}
    </span>

    <button
      onClick={() => changeItemQty(item, outlet, 1)}
      className="w-9 h-9 flex items-center justify-center
        rounded-lg bg-white/20 hover:bg-white/30
        text-xl font-bold transition"
    >
      +
    </button>
  </div>
) : (

                  <button
                    onClick={() => changeItemQty(item, outlet, 1)}
                    className="mt-3 w-full h-11 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
