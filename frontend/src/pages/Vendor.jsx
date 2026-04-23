import { useEffect, useMemo, useState } from "react";
import { getAllOrders, updateOrderStatus, acceptByCode } from "../utils/api";
import jsQR from "jsqr";

const isMobile =
  typeof window !== "undefined" &&
  (window.innerWidth < 768 ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

export default function Vendor() {
  const [code, setCode] = useState("");
  const [university, setUniversity] = useState("Chitkara University");
  const [vendorCode, setVendorCode] = useState(() => localStorage.getItem("vendorCode") || "V001");
  const [vendorAuth, setVendorAuth] = useState(() => !!localStorage.getItem("vendorAuth"));
  const [mode, setMode] = useState("paste");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [fileObj, setFileObj] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await getAllOrders();
        setOrders(list);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const u = localStorage.getItem("vendorUniversity");
    const c = localStorage.getItem("vendorCode");
    const a = localStorage.getItem("vendorAuth");
    if (u) setUniversity(u);
    if (c) setVendorCode(c);
    if (a) setVendorAuth(true);
  }, []);

  const filtered = useMemo(() => {
    if (filter === "All") return orders;
    return orders.filter(o => (o.status || "").toLowerCase() === filter.toLowerCase());
  }, [orders, filter]);

  async function decodeQrFromFile(file) {
  return new Promise(resolve => {
    const reader = new FileReader();

    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");

        const maxSize = 800;
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          const scale = Math.min(maxSize / width, maxSize / height);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, width, height);

        let imageData = ctx.getImageData(0, 0, width, height);

        for (let i = 0; i < imageData.data.length; i += 4) {
  const avg =
    imageData.data[i] * 0.299 +
    imageData.data[i + 1] * 0.587 +
    imageData.data[i + 2] * 0.114;
  imageData.data[i] =
    imageData.data[i + 1] =
    imageData.data[i + 2] =
      avg;
}


       const qr = jsQR(imageData.data, width, height, {
  inversionAttempts: "attemptBoth",
  canOverwriteImage: true,
});


        resolve(qr ? qr.data.toUpperCase() : null);
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}


  const handleSubmit = async e => {
    e.preventDefault();
    let value = "";

    if (mode === "paste") {
      value = code.trim();
    } else {
      if (!fileObj) return;
      const decoded = await decodeQrFromFile(fileObj);
    if (!decoded) {
  return alert(
    "QR not readable. Please:\n• Keep phone steady\n• Good lighting\n• Avoid glare\n• Move camera closer"
  );
}

      value = decoded.trim();
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await acceptByCode(value);
      setResult({ ok: true, order: res.order });
      setOrders(prev => prev.map(o => (o.id === res.order.id ? res.order : o)));
      setCode("");
      setFileObj(null);
    } catch (e) {
      setResult({ ok: false, message: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAdvance = async (id, next) => {
    const res = await updateOrderStatus(id, next);
    setOrders(prev => prev.map(o => (o.id === id ? res.order : o)));
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div>
          <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
          <p className="text-sm opacity-90">{university} • {vendorCode}</p>
        </div>
        <button
          onClick={() => {
            setVendorAuth(false);
            localStorage.clear();
          }}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg"
        >
          Sign Out
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
            <h2 className="font-semibold mb-4">Accept Order</h2>

            <div className="flex gap-2 mb-4">
              {["paste", "file"].map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    mode === m
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {m === "paste" ? "Paste Code" : "Scan QR"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "paste" ? (
                <input
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX"
                  className="
                    w-full text-center tracking-widest text-lg font-mono
                    px-4 py-3 rounded-lg border
                    bg-white dark:bg-gray-900
                    text-gray-900 dark:text-white
                    placeholder-gray-400 dark:placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-blue-600
                  "
                />
              ) : (
              <input
  type="file"
  accept="image/png,image/jpeg,image/jpg"
  capture="environment"
  inputMode="none"
  onChange={e => setFileObj(e.target.files?.[0] || null)}
  className="w-full text-sm"
/>


              )}

              <button
                disabled={loading}
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold"
              >
                {loading ? "Accepting…" : "Accept Order"}
              </button>
            </form>

            {result && (
              <div
                className={`mt-4 p-3 rounded-lg text-sm ${
                  result.ok
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {result.ok
                  ? `Order ${result.order.id} accepted`
                  : result.message}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Live Orders</h2>
            <div className="flex gap-2 flex-wrap">
              {["All","Pending","Accepted","Preparing","Ready","Picked"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filter === f
                      ? "bg-gray-300 dark:bg-gray-700"
                      : "bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y dark:divide-gray-800">
            {filtered.map(o => (
              <div key={o.id} className="py-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">#{o.id}</div>
                  <div className="text-sm text-gray-500">
                    {o.outlet} • ₹{o.total}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs bg-gray-200 dark:bg-gray-800">
                    {o.status}
                  </span>

                  {o.status === "Pending" && (
                    <Action color="emerald" onClick={() => handleAdvance(o.id, "Accepted")}>Accept</Action>
                  )}
                  {o.status === "Accepted" && (
                    <Action color="indigo" onClick={() => handleAdvance(o.id, "Preparing")}>Prepare</Action>
                  )}
                  {o.status === "Preparing" && (
                    <Action color="amber" onClick={() => handleAdvance(o.id, "Ready")}>Ready</Action>
                  )}
                  {o.status === "Ready" && (
                    <Action color="blue" onClick={() => handleAdvance(o.id, "Picked")}>Picked</Action>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Action({ children, onClick, color }) {
  const colors = {
    emerald: "bg-emerald-600 hover:bg-emerald-700",
    indigo: "bg-indigo-600 hover:bg-indigo-700",
    amber: "bg-amber-600 hover:bg-amber-700",
    blue: "bg-blue-600 hover:bg-blue-700",
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded text-xs font-medium text-white transition ${colors[color]}`}
    >
      {children}
    </button>
  );
}
