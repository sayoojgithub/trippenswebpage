import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";
import Select from "react-select";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;
const CHANNEL_OPTS = [
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
];

export default function EnquiredClients() {
  // filters
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState(""); // YYYY-MM-DD
  const [to, setTo] = useState("");     // YYYY-MM-DD
  const [channel, setChannel] = useState(null);

  // table state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, totalItems: 0 });

  // alerts
  const [errorMsg, setErrorMsg] = useState("");

  // debounce search text
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchEnquiries = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        search: query || undefined,
        from: from || undefined,
        to: to || undefined,
        channel: channel?.value || undefined,
        sort: "-createdAt",
      };
      const { data } = await API.get("/admin/enquiries", { params });
      setRows(data.items || []);
      setMeta({
        totalPages: data.totalPages || 1,
        totalItems: data.totalItems || 0,
      });
    } catch (err) {
      console.error("Fetch enquiries failed:", err);
      setErrorMsg("Failed to load enquiries.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchEnquiries(); // eslint-disable-next-line
  }, [page, query, from, to, channel]);

  const pageInfo = useMemo(
    () => ({ page, totalPages: meta.totalPages }),
    [page, meta.totalPages]
  );

  const clearDates = () => {
    setFrom("");
    setTo("");
    setPage(1);
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-GB"); // dd/mm/yyyy

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Enquired Clients</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-300">Search (Name / Phone / Email / Message)</label>
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g., arjun, +91, gmail.com, honeymoon…"
              className="w-full rounded-xl bg-gray-900/70 text-gray-100 placeholder:text-gray-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2 pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Channel */}
        <div>
          <label className="block text-sm font-medium text-gray-300">Channel</label>
          <Select
            value={channel}
            onChange={(v) => { setChannel(v); setPage(1); }}
            options={CHANNEL_OPTS}
            isClearable
            placeholder="All"
            classNamePrefix="select"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "rgba(17,24,39,0.7)",
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: "0.75rem",
                minHeight: "44px",
              }),
              menu: (base) => ({ ...base, backgroundColor: "rgb(17,24,39)", color: "#e5e7eb" }),
              singleValue: (b) => ({ ...b, color: "#e5e7eb" }),
              input: (b) => ({ ...b, color: "#e5e7eb" }),
              option: (b, s) => ({ ...b, backgroundColor: s.isFocused ? "rgb(31,41,55)" : "transparent", color: "#e5e7eb", cursor: "pointer" }),
            }}
          />
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-300">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setPage(1); }}
              className="w-full rounded-xl bg-gray-900/70 text-gray-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => { setTo(e.target.value); setPage(1); }}
              className="w-full rounded-xl bg-gray-900/70 text-gray-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3 py-2"
            />
          </div>
          <button
            type="button"
            onClick={clearDates}
            className="col-span-2 mt-1 w-full rounded-xl px-3 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10 text-sm"
          >
            Clear dates
          </button>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="rounded-xl bg-rose-600/20 ring-1 ring-rose-400/30 px-4 py-3 text-rose-200">
          {errorMsg}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-gray-900/70">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Message</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Channel</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-gray-950/40">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                  <Loader2 className="inline h-5 w-5 animate-spin mr-2" /> Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No enquiries found.</td>
              </tr>
            ) : (
              rows.map((e) => (
                <tr key={e._id}>
                  <td className="px-4 py-3 font-medium">{e.fullName || "—"}</td>
                  <td className="px-4 py-3">{e.phone || "—"}</td>
                  <td className="px-4 py-3">{e.email || "—"}</td>
                  <td className="px-4 py-3 max-w-[28rem]">
                    <span title={e.message}>{e.message?.length > 90 ? e.message.slice(0, 90) + "…" : (e.message || "—")}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      e.channel === "email"
                        ? "bg-indigo-600/20 text-indigo-200"
                        : "bg-emerald-600/20 text-emerald-200"
                    }`}>
                      {e.channel || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{e.createdAt ? formatDate(e.createdAt) : "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{e.createdAt ? formatTime(e.createdAt) : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">Page {pageInfo.page} of {pageInfo.totalPages}</div>
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10 disabled:opacity-60"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(meta.totalPages || 1, p + 1))}
            disabled={page >= (meta.totalPages || 1) || loading}
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10 disabled:opacity-60"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
