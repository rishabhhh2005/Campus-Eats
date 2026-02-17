// src/components/OutletCard.jsx
import { Link } from "react-router-dom";

export default function OutletCard({ outlet }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md dark:shadow-lg overflow-hidden group flex flex-col">
      <div className="h-36 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
        {outlet.image ? (
          <img
            src={outlet.image}
            alt={outlet.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-200">
            {outlet.short}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {outlet.name}
          </h3>
          <div className="flex items-center gap-1 text-xs">
            <span className="inline-flex items-center rounded-md bg-green-600 text-white px-2 py-0.5 font-semibold">
              {outlet.rating.toFixed(1)}
            </span>
            <span className="text-neutral-500 dark:text-neutral-400">• {outlet.eta}</span>
          </div>
        </div>

        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{outlet.cuisine}</p>

        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {outlet.orders.toLocaleString()} ordered from here
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <Link
            to={`/outlet/${outlet.slug}`}
            className="btn btn-primary px-4 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            Order Now
          </Link>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Min ₹{outlet.min}</span>
        </div>
      </div>
    </div>
  );
}
