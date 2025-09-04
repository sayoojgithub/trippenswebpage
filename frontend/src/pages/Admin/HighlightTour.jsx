import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";
import Select from "react-select";
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 10;

export default function HighlightTour() {
  // filters/search
  const [categories, setCategories] = useState([]); // [{value,label}]
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [onlyHighlighted, setOnlyHighlighted] = useState(false);
  const [search, setSearch] = useState("");     // tour name search
  const [query, setQuery] = useState("");

  // table state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, totalItems: 0 });

  // alerts
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // debounce text search
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // load active categories for filtering
  const fetchCategoriesOptions = async () => {
    try {
      const { data } = await API.get("/admin/categories", {
        params: { page: 1, limit: 1000 },
      });
      const opts = (data.items || [])
        .filter((c) => c.activeStatus === true)
        .map((c) => ({ value: c._id, label: c.name }));
      setCategories(opts);
    } catch (err) {
      console.error("Load categories failed:", err);
    }
  };
  useEffect(() => { fetchCategoriesOptions(); }, []);

  // fetch tours with filters + pagination
  const fetchTours = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        search: query || undefined,               // tour name contains
        categoryId: categoryFilter?.value || undefined,
        highlighted: onlyHighlighted ? true : undefined, // when true: only highlighted
        sort: "-createdAt",
      };
      const { data } = await API.get("/admin/toursinhighlight", { params });
      setRows(data.items || []);
      setMeta({
        totalPages: data.totalPages || 1,
        totalItems: data.totalItems || 0,
      });
    } catch (err) {
      console.error("Fetch tours failed:", err);
      setErrorMsg("Failed to load tours.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchTours(); /* eslint-disable-next-line */ }, [page, query, onlyHighlighted, categoryFilter]);

  const pageInfo = useMemo(
    () => ({ page, totalPages: meta.totalPages }),
    [page, meta.totalPages]
  );

  // toggle highlight with server rule (max 3 per category)
  const toggleHighlight = async (row, nextVal) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      // Do not optimistic update because server may reject (max 3)
      const { data } = await API.patch(`/admin/toursinhighlight/${row._id}/highlight`, {
        highlightStatus: nextVal,
      });

      // Update row in table with server’s item
      setRows((prev) =>
        prev.map((r) => (r._id === row._id ? { ...r, ...data.item } : r))
      );

      setSuccessMsg(nextVal ? "Tour highlighted." : "Highlight removed.");
    } catch (err) {
      const resp = err?.response?.data;
      // If server sent list of already highlighted tours, show nice message
      if (resp?.highlightedTours?.length) {
        const names = resp.highlightedTours.map((t) => t.tourName).join(", ");
        setErrorMsg(`${resp.message} (${names})`);
      } else {
        setErrorMsg(resp?.message || "Failed to update highlight status.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Highlight Tours</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-300">Category</label>
          <Select
            value={categoryFilter}
            onChange={(v) => { setCategoryFilter(v); setPage(1); }}
            options={categories}
            isClearable
            placeholder="All categories"
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

        <div>
          <label className="block text-sm font-medium text-gray-300">Search (Tour name)</label>
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g., Bali Explorer"
              className="w-full rounded-xl bg-gray-900/70 text-gray-100 placeholder:text-gray-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2 pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
        </div>

       <div>
  <label className="block text-sm font-medium text-gray-300">
    Only highlighted
  </label>
  <div className="mt-2">
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={onlyHighlighted}
        onChange={(e) => { setOnlyHighlighted(e.target.checked); setPage(1); }}
      />
      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-emerald-600 transition relative">
        <div className="absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition peer-checked:translate-x-5" />
      </div>
    </label>
  </div>
</div>

      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="rounded-xl bg-emerald-600/20 ring-1 ring-emerald-400/30 px-4 py-3 text-emerald-200">
          {successMsg}
        </div>
      )}
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tour</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Days</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nights</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Active</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Category Active</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Highlighted</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-gray-950/40">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                  <Loader2 className="inline h-5 w-5 animate-spin mr-2" /> Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">No tours found.</td>
              </tr>
            ) : (
              rows.map((t) => (
                <tr key={t._id}>
                  <td className="px-4 py-3 font-medium">{t.tourName}</td>
                  <td className="px-4 py-3">{t.category?.name || "—"}</td>
                  <td className="px-4 py-3">{t.days}</td>
                  <td className="px-4 py-3">{t.nights}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${t.activeStatus ? "bg-emerald-600/20 text-emerald-200" : "bg-gray-600/20 text-gray-300"}`}>
                      {t.activeStatus ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${t.categoryStatus ? "bg-emerald-600/20 text-emerald-200" : "bg-gray-600/20 text-gray-300"}`}>
                      {t.categoryStatus ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={!!t.highlightStatus}
                        onChange={(e) => toggleHighlight(t, e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-emerald-600 transition relative">
                        <div className="absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition peer-checked:translate-x-5" />
                      </div>
                    </label>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-GB") : "—"}
                  </td>
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
