import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function VendorModal({ isOpen, onClose }) {
  const [vendorCode, setVendorCode] = useState("V001");
  const [university, setUniversity] = useState("Chitkara University");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) setError("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignIn = (e) => {
    e?.preventDefault();
    const codeOk = (vendorCode || "").trim().toUpperCase() === "V001";
    const uniOk = (university || "").toLowerCase().includes("chitkara");
    if (codeOk && uniOk) {
      localStorage.setItem("vendorAuth", "true");
      localStorage.setItem("vendorCode", vendorCode.trim().toUpperCase());
      localStorage.setItem("vendorUniversity", university);
      onClose();
      navigate("/vendor");
    } else {
      setError("Invalid vendor credentials");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-4">Vendor Sign In</h2>

        <form onSubmit={handleSignIn} className="space-y-3">
          <div>
            <label className="text-sm">University</label>
            <input value={university} onChange={(e) => setUniversity(e.target.value)} className="w-full border px-3 py-2 rounded mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>

          <div>
            <label className="text-sm">Vendor Code</label>
            <input value={vendorCode} onChange={(e) => setVendorCode(e.target.value)} className="w-full border px-3 py-2 rounded mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Sign In</button>
          </div>
        </form>
      </div>
    </div>
  );
}
