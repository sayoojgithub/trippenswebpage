import React, { useEffect, useMemo, useRef, useState } from "react";
import API from "../../api";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  PencilLine,
  X,
} from "lucide-react";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";

const PAGE_SIZE = 5;

export default function AddCategory() {
  // ---- form state ----
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  // edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [existingCover, setExistingCover] = useState(""); // current image url

  // ---- table/search/pagination state ----
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, totalItems: 0 });
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState(""); // debounced search value
  const [refreshKey, setRefreshKey] = useState(0);

  // debounce search input -> query
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1); // reset page on new search
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setFile(null);
    setPreview("");
    setExistingCover("");
    setIsEditing(false);
    setEditId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openFilePicker = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = ""; // allow re-selecting same file
    fileInputRef.current.click();
  };

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setErrorMsg("");
    if (!f.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const removeFile = () => {
    setFile(null);
    setPreview("");
    // if editing, removing file should clear both chosen file and existing cover
    if (isEditing) setExistingCover("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("Category name is required.");
      return;
    }

    try {
      setSubmitting(true);

      // resolve cover image url:
      // - if user picked a new file -> upload to Cloudinary
      // - else, keep existing cover (when editing)
      let coverImageUrl = existingCover || "";
      if (file) {
        const cloudRes = await uploadImageToCloudinary(file);
        if (!cloudRes?.secure_url) {
          throw new Error(cloudRes?.error?.message || "Image upload failed.");
        }
        coverImageUrl = cloudRes.secure_url;
      }

      if (isEditing && editId) {
        // update
        await API.patch(`/admin/categories/${editId}`, {
          // name is locked while editing (per requirement), but you can enable it by including name here
          description: description.trim(),
          coverImage: coverImageUrl,
        });
        setSuccessMsg("Category updated successfully.");
      } else {
        // create
        await API.post("/admin/categories", {
          name: name.trim(),
          description: description.trim(),
          coverImage: coverImageUrl,
          // activeStatus defaults to true on backend
        });
        setSuccessMsg("Category created successfully.");
      }

      resetForm();
      setRefreshKey((k) => k + 1); // refresh the table
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ---- fetch categories (backend pagination) ----
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/admin/categories", {
        params: { search: query, page, limit: PAGE_SIZE },
      });
      setRows(data.items || []);
      setMeta({
        totalPages: data.totalPages || 1,
        totalItems: data.totalItems || 0,
      });
    } catch (err) {
      console.error("Fetch categories failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query, refreshKey]);

  const pageInfo = useMemo(
    () => ({ page, totalPages: meta.totalPages }),
    [page, meta.totalPages]
  );

  const toggleStatus = async (id, nextVal) => {
    try {
      // optimistic UI
      setRows((prev) =>
        prev.map((r) => (r._id === id ? { ...r, activeStatus: nextVal } : r))
      );
      await API.patch(`/admin/categories/${id}/status`, {
        activeStatus: nextVal,
      });
    } catch (err) {
      console.error("Update status failed:", err);
      // revert on failure
      setRows((prev) =>
        prev.map((r) => (r._id === id ? { ...r, activeStatus: !nextVal } : r))
      );
    }
  };

  const startEdit = async (row) => {
    try {
      // Optional: fetch fresh data from server if needed
      // const { data } = await API.get(`/admin/categories/${row._id}`);
      // const cat = data?.category || row;

      const cat = row; // using current row data is enough here
      setIsEditing(true);
      setEditId(cat._id);
      setName(cat.name);
      setDescription(cat.description || "");
      setExistingCover(cat.coverImage || "");
      setPreview(""); // clear any transient preview
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error("Failed to start edit:", e);
    }
  };

  const cancelEdit = () => {
    resetForm();
  };

  return (
    <>
      {/* --------- FORM --------- */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Category" : "Add Category"}
          </h2>
          {isEditing && (
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>

        {/* Name (locked in edit mode per requirement) */}
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Category Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Summer Collection"
            className="mt-2 w-full rounded-xl bg-gray-900/70 text-gray-100 placeholder:text-gray-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-3 disabled:opacity-60"
            required
            disabled={isEditing}
            title={isEditing ? "Name is locked while editing" : ""}
          />
          {isEditing && (
            <p className="mt-2 text-xs text-gray-400">
              Name is locked in edit mode.
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description for this category…"
            className="mt-2 w-full rounded-xl bg-gray-900/70 text-gray-100 placeholder:text-gray-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-3"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Cover Image
          </label>

          {/* Hidden file input (always mounted) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickFile}
          />

          <div className="mt-2 rounded-2xl bg-gray-950/60 ring-1 ring-white/10 p-4">
            {/* Show existing server image if present, otherwise show chosen preview */}
            {!preview && !existingCover ? (
              <button
                type="button"
                onClick={openFilePicker}
                className="w-full flex flex-col items-center justify-center gap-3 h-40 cursor-pointer rounded-xl bg-gray-900/70 hover:bg-gray-900 ring-1 ring-white/10 transition"
              >
                <div className="flex items-center gap-2 text-gray-300">
                  <Upload className="h-5 w-5" />
                  <span className="text-sm">Click to upload</span>
                </div>
                <span className="text-xs text-gray-500">
                  PNG, JPG up to ~10MB
                </span>
              </button>
            ) : (
              <div className="flex items-start gap-4">
                <div className="relative w-48 h-32 overflow-hidden rounded-xl ring-1 ring-white/10">
                  <img
                    src={preview || existingCover}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent" />
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10"
                  >
                    <ImageIcon className="h-4 w-4" />
                    {preview
                      ? "Change image"
                      : existingCover
                      ? "Replace image"
                      : "Add image"}
                  </button>
                  {(preview || existingCover) && (
                    <button
                      type="button"
                      onClick={removeFile}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-rose-600/80 hover:bg-rose-500 text-white ring-1 ring-white/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
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

        {/* Submit */}
        <div className="flex justify-end gap-3">
          {isEditing && (
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 ring-1 ring-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] disabled:opacity-70"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {submitting
              ? isEditing
                ? "Updating…"
                : "Saving…"
              : isEditing
              ? "Update Category"
              : "Create Category"}
          </button>
        </div>
      </form>

      {/* --------- TABLE (search + pagination + toggle + edit) --------- */}
      <div className="mt-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h3 className="text-lg font-semibold">Categories</h3>

          <div className="relative w-full md:w-80">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name…"
              className="w-full rounded-xl bg-gray-900/70 text-gray-100 placeholder:text-gray-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2 pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-white/10">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-gray-900/70">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Cover
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Name
                </th>
               
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Active
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-gray-950/40">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    <Loader2 className="inline h-5 w-5 animate-spin mr-2" />
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No categories found.
                  </td>
                </tr>
              ) : (
                rows.map((cat) => (
                  <tr key={cat._id}>
                    <td className="px-4 py-3">
                      {cat.coverImage ? (
                        <img
                          src={cat.coverImage}
                          alt={cat.name}
                          className="h-10 w-16 rounded-md object-cover ring-1 ring-white/10"
                        />
                      ) : (
                        <div className="h-10 w-16 rounded-md bg-gray-800/80 ring-1 ring-white/10" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                    
                    <td className="px-4 py-3">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={!!cat.activeStatus}
                          onChange={(e) =>
                            toggleStatus(cat._id, e.target.checked)
                          }
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-600 transition relative">
                          <div className="absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition peer-checked:translate-x-5" />
                        </div>
                      </label>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(cat.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => startEdit(cat)}
                          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10"
                        >
                          <PencilLine className="h-4 w-4" />
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Page {pageInfo.page} of {pageInfo.totalPages}
          </div>
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
              onClick={() =>
                setPage((p) => Math.min(meta.totalPages || 1, p + 1))
              }
              disabled={page >= (meta.totalPages || 1) || loading}
              className="inline-flex items-center gap-1 rounded-xl px-3 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10 disabled:opacity-60"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
