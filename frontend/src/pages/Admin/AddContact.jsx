import React, { useEffect, useRef, useState } from "react";
import API from "../../api";
import {
  Plus, Trash2, Loader2, CheckCircle2, AlertCircle, PencilLine, Save, X
} from "lucide-react";

const emptyPair = () => ({ address: "", phone: "" });

export default function AddContact() {
  const [addresses, setAddresses] = useState([emptyPair()]);
  const [landline, setLandline] = useState("");
  const [email, setEmail] = useState("");
  const [contactId, setContactId] = useState(null);

  const [isEditing, setIsEditing] = useState(true); // if nothing exists, we'll stay in editing mode
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ---- fetch existing contact (if any) ----
  const fetchContact = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/admin/contact");
      if (data?.contact) {
        const c = data.contact;
        setContactId(c._id);
        setAddresses(c.addresses?.length ? c.addresses : [emptyPair()]);
        setLandline(c.landline || "");
        setEmail(c.email || "");
        setIsEditing(false); // show read-only view until user hits Edit
      } else {
        // No contact exists yet; allow creating
        setContactId(null);
        setIsEditing(true);
      }
    } catch (err) {
      // If 404, it just means no contact saved yet
      if (err?.response?.status === 404) {
        setContactId(null);
        setIsEditing(true);
      } else {
        console.error("Fetch contact failed:", err);
        setErrorMsg(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load contact."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- handlers for address/phone pairs ----
  const addPair = () => setAddresses((prev) => [...prev, emptyPair()]);
  const removePair = (idx) =>
    setAddresses((prev) => prev.filter((_, i) => i !== idx));
  const updatePair = (idx, key, value) =>
    setAddresses((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [key]: value } : p))
    );

  // ---- submit (upsert) ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Basic validation: at least one non-empty address pair
    const validPairs = addresses.filter(
      (p) => p.address.trim().length > 0 || p.phone.trim().length > 0
    );
    if (validPairs.length === 0) {
      setErrorMsg("Add at least one address or phone pair.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        addresses: validPairs.map((p) => ({
          address: p.address.trim(),
          phone: p.phone.trim(),
        })),
        landline: landline.trim(),
        email: email.trim(),
      };

      // single-record upsert
      const { data } = await API.put("/admin/contact", payload);
      const c = data?.contact;
      if (c) {
        setContactId(c._id);
      }
      setSuccessMsg("Contact saved successfully.");
      setIsEditing(false);
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = () => setIsEditing(true);
  const cancelEdit = () => {
    // revert to server state
    fetchContact();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Contact</h2>
        {!isEditing && (
          <button
            type="button"
            onClick={startEdit}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10"
          >
            <PencilLine className="h-4 w-4" />
            Edit
          </button>
        )}
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-600/20 ring-1 ring-emerald-400/30 px-4 py-3 text-emerald-200">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-600/20 ring-1 ring-rose-400/30 px-4 py-3 text-rose-200">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{errorMsg}</span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-gray-400">
          <Loader2 className="inline h-5 w-5 animate-spin mr-2" />
          Loading…
        </div>
      ) : isEditing ? (
        <>
          {/* --------- FORM (EDIT/CREATE) --------- */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Address & Phone pairs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300">
                  Addresses & Phones
                </label>
                <button
                  type="button"
                  onClick={addPair}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>

              {addresses.map((p, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-xl bg-gray-950/60 ring-1 ring-white/10 p-3"
                >
                  <input
                    value={p.address}
                    onChange={(e) => updatePair(idx, "address", e.target.value)}
                    placeholder="Address (e.g., 123 MG Road, Bengaluru)"
                    className="rounded-xl bg-gray-900/70 text-gray-100 placeholder:text-gray-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-3"
                  />
                  <div className="flex gap-3">
                    <input
                      value={p.phone}
                      onChange={(e) => updatePair(idx, "phone", e.target.value)}
                      placeholder="Phone (e.g., +91 98765 43210)"
                      className="flex-1 rounded-xl bg-gray-900/70 text-gray-100 placeholder:text-gray-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-3"
                    />
                    <button
                      type="button"
                      onClick={() => removePair(idx)}
                      className="inline-flex items-center justify-center rounded-xl px-3 py-2 bg-rose-600/80 hover:bg-rose-500 text-white ring-1 ring-white/10"
                      title="Remove pair"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Landline */}
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Landline
              </label>
              <input
                type="text"
                value={landline}
                onChange={(e) => setLandline(e.target.value)}
                placeholder="e.g., 080-12345678"
                className="mt-2 w-full rounded-xl bg-gray-900/70 text-gray-100 placeholder:text-gray-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-3"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., hello@yourcompany.com"
                className="mt-2 w-full rounded-xl bg-gray-900/70 text-gray-100 placeholder:text-gray-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-3"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 ring-1 ring-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] disabled:opacity-70"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {submitting ? "Saving…" : "Save Contact"}
              </button>
            </div>
          </form>
        </>
      ) : (
        // ---------- READ-ONLY VIEW ----------
        <div className="rounded-2xl bg-gray-950/60 ring-1 ring-white/10 p-4 space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-300 mb-2">
              Addresses & Phones
            </div>
            <div className="space-y-3">
              {addresses.map((p, i) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-xl bg-gray-900/50 ring-1 ring-white/10 p-3"
                >
                  <div className="text-gray-100">{p.address || "—"}</div>
                  <div className="text-gray-300">{p.phone || "—"}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-sm font-medium text-gray-300">Landline</div>
              <div className="mt-1 text-gray-100">{landline || "—"}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-300">Email</div>
              <div className="mt-1 text-gray-100">{email || "—"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
