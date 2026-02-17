import { useState } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !contact.trim() || !message.trim()) {
      setStatus({ type: "error", message: "Please fill in all fields." });
      return;
    }

    setStatus({ type: "success", message: "Message sent successfully!" });
    setName("");
    setContact("");
    setMessage("");
  };

  return (
    <section className="max-w-4xl mx-auto px-4 pt-6 pb-12 space-y-8">

      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Contact Us
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Have a question or feedback? We’d love to hear from you.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6">

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3
                bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-red-600 transition"
              required
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email or Phone
            </label>
            <input
              type="text"
              placeholder="example@email.com / 9876543210"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3
                bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-red-600 transition"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <textarea
              rows={5}
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3
                bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white resize-none
                focus:outline-none focus:ring-2 focus:ring-red-600 transition"
              required
            />
          </div>

          {/* Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white
                font-semibold rounded-lg shadow transition"
            >
              Send Message
            </button>
          </div>
        </form>

        {status && (
          <div
            className={`mt-5 rounded-lg px-4 py-3 text-sm font-medium
              ${
                status.type === "success"
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}
          >
            {status.message}
          </div>
        )}
      </div>
    </section>
  );
}
