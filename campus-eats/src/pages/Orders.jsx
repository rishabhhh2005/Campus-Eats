import { useState, useEffect, useMemo } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import { getOrders, getPickupCode } from "../utils/api";
import { OUTLETS } from "../data/outlets.js";
import { useAuth } from "../context/AuthContext.jsx";
import 'boxicons/css/boxicons.min.css';


export default function Orders({ openAuthModal }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrForOrder, setQrForOrder] = useState(null);
  const [pickupInfo, setPickupInfo] = useState({ id: null, code: null });
  const [trackingOrder, setTrackingOrder] = useState(null);
  const stages = ["Pending", "Accepted", "Preparing", "Ready", "Picked"];
  const [downloadingId, setDownloadingId] = useState(null);
const [downloadedId, setDownloadedId] = useState(null);



  // Build a reliable name->logo map from source of truth OUTLETS
  const outletLogosByName = useMemo(() => {
    const map = {};
    OUTLETS.forEach((o) => {
      if (o?.name && o?.image) {
        map[o.name] = o.image;
      }
    });
    // Common aliases to avoid missing logos due to slight name diffs
    map["Haldiram's"] = map["Haldirams"] ?? map["Haldiram's"];
    map["La Pinoz"] = map["La Pino'z"] ?? map["La Pinoz"];
    return map;
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        const deletedOrderIds = JSON.parse(localStorage.getItem('deletedOrderIds') || '[]');
        const valid = (data || []).filter(
          (o) => o?.items?.length > 0 && (o.payable ?? o.total ?? 0) > 0 && !deletedOrderIds.includes(o.id)
        );
        const sorted = [...valid].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setOrders(sorted);
      } catch (err) {
        setError("Failed to load orders");
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const openQr = async (orderId) => {
    try {
      const { pickupCode } = await getPickupCode(orderId);
      setPickupInfo({ id: orderId, code: pickupCode });
      // Use public QR API to avoid new deps
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        pickupCode
      )}`;
      setQrForOrder(url);
    } catch (e) {
      alert("Failed to load pickup QR");
    }
  };

  const closeQr = () => {
    setQrForOrder(null);
    setPickupInfo({ id: null, code: null });
  };

  const openTracking = (order) => {
    setTrackingOrder(order);
  };

  const closeTracking = () => setTrackingOrder(null);

  function formatDateTime(dateInput) {
    const dateObj = new Date(dateInput);

    if (isNaN(dateObj.getTime())) return "Invalid Date";

    const optionsDate = { year: "numeric", month: "short", day: "numeric" };
    const optionsTime = { hour: "2-digit", minute: "2-digit", hour12: true };

    const formattedDate = dateObj.toLocaleDateString(undefined, optionsDate);
    const formattedTime = dateObj.toLocaleTimeString(undefined, optionsTime);

    return `${formattedDate} at ${formattedTime}`;
  }

  const handleDelete = (id) => {
    setConfirm({ open: true, id });
  };

  const [confirm, setConfirm] = useState({ open: false, id: null });

  const doDelete = async (id) => {
    try {
      // Remove from frontend only, without deleting from backend
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
      
      // Store deleted order ID in localStorage to persist across reloads
      const deletedOrderIds = JSON.parse(localStorage.getItem('deletedOrderIds') || '[]');
      if (!deletedOrderIds.includes(id)) {
        deletedOrderIds.push(id);
        localStorage.setItem('deletedOrderIds', JSON.stringify(deletedOrderIds));
      }
    } catch (err) {
      console.error('Failed to delete order:', err);
      alert(err?.message || 'Failed to delete order');
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  const cancelDelete = () => setConfirm({ open: false, id: null });

 const downloadReceipt = (order) => {
  if (downloadingId === order.id) return;

  setDownloadingId(order.id);
  setDownloadedId(null);

  const html = `
    <html>
    <head>
      <title>Receipt - ${order.id}</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; padding: 20px; }
        .h { font-weight: 700; }
      </style>
    </head>
    <body>
      <h2>Chitkara Eats — Receipt</h2>
      <div>Order ID: ${order.id}</div>
      <div>Date: ${new Date(order.timestamp).toLocaleString()}</div>
      <div>Outlet: ${order.outlet}</div>
      <div>Campus: ${order.campus || ""}</div>
      <hr />
      ${(order.items || [])
        .map(
          (i) =>
            `<div>${i.qty} x ${i.name} — ₹${i.price} = ₹${
              i.qty * i.price
            }</div>`
        )
        .join("")}
      <hr />
      <div class="h">Total: ₹${order.payable ?? order.total ?? 0}</div>
      <div>Payment: ${order.paymentType || "Unknown"}</div>
      <hr />
      <div>Thank you for ordering!</div>
    </body>
    </html>
  `;

  // ✅ create iframe immediately (USER ACTION CONTEXT)
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  document.body.appendChild(iframe);

  iframe.onload = () => {
    // ⏳ UI delay only
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      URL.revokeObjectURL(url);
      document.body.removeChild(iframe);

      setDownloadingId(null);
      setDownloadedId(order.id);
    }, 800); // smooth UX delay
  };
};





  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
          Your Orders
        </h1>

        {!user ? (
          <div className="relative">
            <div className="filter blur-sm pointer-events-none">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-200 dark:bg-gray-800 rounded-xl p-5 h-64"
                  ></div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  Sign In to View Orders
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Please sign in to access your order history and track your
                  orders.
                </p>
                <button
                  onClick={openAuthModal}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Sign In Now
                </button>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-300 text-lg">
              Loading orders...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-300 text-lg">
            You haven't placed any orders yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md flex flex-col justify-between transition hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      {order.outlet && outletLogosByName[order.outlet] && (
                        <img
                          src={outletLogosByName[order.outlet]}
                          alt=""
                          className="w-8 h-8 object-contain rounded"
                        />
                      )}
                      <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {order.outlet || "Outlet"}
                      </h2>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-400">
                      {formatDateTime(order.timestamp)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                      Order ID: <span className="font-mono">{order.id}</span>
                      <span className="ml-2 inline-block px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 align-middle">
                        {order.campus || "Punjab"}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="text-red-500 hover:text-red-700 transition text-sm"
                    title="Delete order"
                  >
                    🗑️
                  </button>
                </div>

               <div className="mb-4 flex items-center justify-between">
  <span className="inline-block text-xs uppercase tracking-wide bg-green-200 text-green-800 px-3 py-1 rounded-full font-semibold">
    {order.status || "Pending"}
  </span>

  {/* Download icon — only for Pending */}
{(order.status || "Pending") === "Pending" && (
  <button
    onClick={() => downloadReceipt(order)}
    title="Download Receipt"
    className="transition text-gray-500 hover:text-gray-900 dark:hover:text-white"
  >
    {downloadingId === order.id ? (
      <i className="bx bx-loader-alt bx-spin text-xl text-blue-600"></i>
    ) : downloadedId === order.id ? (
      <i className="bx bx-check-circle text-xl text-green-600"></i>
    ) : (
      <i className="bx bx-download text-xl"></i>
    )}
  </button>
)}


</div>


                <div className="space-y-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                  {(order.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span>
                        {item.qty}x {item.name}
                      </span>
                      <span className="font-medium">
                        ₹{item.qty * item.price}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total Amount
                  </span>
                  <span className="font-semibold text-lg text-gray-900 dark:text-white">
                    ₹{order.payable ?? order.total ?? 0}
                  </span>
                </div>

                <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">Payment: <span className="font-medium">{order.paymentType || 'Unknown'}</span></div>

                <button
                  onClick={() => openQr(order.id)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                >
                  Show Pickup QR
                </button>
                
                <button
                  onClick={() => openTracking(order)}
                  className="mt-2 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  Track My Order
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {qrForOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl w-[320px] text-center">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Pickup QR
            </h3>
            <img
              src={qrForOrder}
              alt="Pickup QR"
              className="mx-auto mb-3 rounded"
            />
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Code:{" "}
              <span className="font-mono font-semibold">{pickupInfo.code}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Show this at the counter. Vendor scans or enters the code to hand
              over.
            </p>
            <button
              onClick={closeQr}
              className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {trackingOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl w-[380px]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Order Status
              </h3>
              <button
                onClick={closeTracking}
                className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-4 bottom-4 w-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="space-y-4">
                {stages.map((s, idx) => {
                  const activeIdx = stages.indexOf(
                    trackingOrder.status || "Pending"
                  );
                  const isDone = idx <= activeIdx;
                  const isActive = idx === activeIdx;
                  return (
                    <div key={s} className="flex items-start gap-4">
                      <div
                        className={`relative z-10 mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          isDone
                            ? "bg-blue-600 text-white"
                            : "bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
                        }`}
                      >
                        {isDone ? "✓" : idx + 1}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`text-sm ${
                            isActive
                              ? "font-semibold text-gray-900 dark:text-white"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {s}
                        </div>
                        {isActive && (
                          <div className="mt-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-xs text-blue-700 dark:text-blue-200">
                            Your order is currently {s.toLowerCase()}.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 text-xs text-gray-500 dark:text-gray-400">
              <div>
                Order ID: <span className="font-mono">{trackingOrder.id}</span>
              </div>
              {trackingOrder.outlet && (
                <div>Outlet: {trackingOrder.outlet}</div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirm.open}
        title="Delete Order"
        message="Permanently delete this order? This cannot be undone."
        onCancel={cancelDelete}
        onConfirm={() => doDelete(confirm.id)}
        confirmLabel="Delete"
      />
    </>
  );
}
