import React, { useEffect, useMemo, useRef, useState } from "react";
import API from "../../api";
import Select from "react-select";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  PencilLine,
  X,
  Plus,
} from "lucide-react";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";

// --- CONFIG ---
const PAGE_SIZE = 5;
const LANDSCAPE_OPTIONS = [
  { value: "Mountain", label: "Mountain" },
  { value: "Beaches", label: "Beaches" },
  { value: "Forest", label: "Forest" },
  { value: "Snow", label: "Snow" },
  { value: "Leisure", label: "Leisure" },
  { value: "Cultural", label: "Cultural" },
  { value: "Archaeological", label: "Archaeological" },
  { value: "Rural", label: "Rural" },
  { value: "Volcanic", label: "Volcanic" },
  { value: "Tribal", label: "Tribal" },
  { value: "Cave", label: "Cave" },
  { value: "Mangrove", label: "Mangrove" },
  { value: "Waterfalls", label: "Waterfalls" },
];

export default function AddTour() {
  // ------------ FORM STATE ------------
  const [categoryOption, setCategoryOption] = useState(null); // react-select {value,label}
  const [categories, setCategories] = useState([]);

  const [tourName, setTourName] = useState("");
  const [days, setDays] = useState(0);
  const [nights, setNights] = useState(0);
  const [tripCost, setTripCost] = useState("");
  const [tripStyle, setTripStyle] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [drivingDistance, setDrivingDistance] = useState("");
  const [landscapes, setLandscapes] = useState([]); // react-select multi [{value,label}]
  const [activity, setActivity] = useState("");

  // Images
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainPreview, setMainPreview] = useState("");

  /**
   * Sub images handled INDIVIDUALLY
   * Each item: { file?: File, url?: string, preview: string }
   */
  const [subImages, setSubImages] = useState([]); // max 5

  const [routeMapFile, setRouteMapFile] = useState(null);
  const [routeMapPreview, setRouteMapPreview] = useState("");

  const mainInputRef = useRef(null);
  const addSubInputRef = useRef(null);
  const routeMapInputRef = useRef(null);

  // per-thumb replace inputs tracked by index
  const [replaceIndex, setReplaceIndex] = useState(null);
  const replaceSubInputRef = useRef(null);

  // Upcoming dates (multiple)
  const [upcomingDate, setUpcomingDate] = useState("");
  const [upcomingDates, setUpcomingDates] = useState([]); // [YYYY-MM-DD]

  // Itinerary: auto-create based on days
  const [itinerary, setItinerary] = useState([]); // [{day, title, description, imageUrl?, file?}]

  // FAQ
  const [faqs, setFaqs] = useState([{ q: "", a: "" }]);

  // Alerts
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // ------------ TABLE/SEARCH/PAGINATION ------------
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, totalItems: 0 });
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchCategoriesOptions = async () => {
    try {
      const { data } = await API.get("/admin/categories", {
        params: { page: 1, limit: 1000 },
      });

      const opts = (data.items || [])
        .filter((c) => c.activeStatus === true) // ✅ only active categories
        .map((c) => ({ value: c._id, label: c.name }));

      setCategories(opts);
    } catch (err) {
      console.error("Load categories failed:", err);
    }
  };

  useEffect(() => {
    fetchCategoriesOptions();
  }, []);

  // Auto-create itinerary rows when days change
  useEffect(() => {
    const n = Number(days) || 0;
    setItinerary((prev) => {
      const next = [...prev];
      if (n > next.length) {
        for (let i = next.length; i < n; i++) {
          next.push({
            day: i + 1,
            title: "",
            description: "",
            file: null,
            imageUrl: "",
          });
        }
      } else if (n < next.length) {
        next.length = n;
      }
      // ensure day numbers are correct
      return next.map((d, idx) => ({ ...d, day: idx + 1 }));
    });
  }, [days]);

  // Reset form
  const resetForm = () => {
    setCategoryOption(null);
    setTourName("");
    setDays(0);
    setNights(0);
    setTripCost("");
    setTripStyle("");
    setVehicle("");
    setDrivingDistance("");
    setLandscapes([]);
    setActivity("");
    setUpcomingDate("");
    setUpcomingDates([]);
    setMainImageFile(null);
    setMainPreview("");
    setSubImages([]);
    setRouteMapFile(null);
    setRouteMapPreview("");
    setItinerary([]);
    setFaqs([{ q: "", a: "" }]);
    setIsEditing(false);
    setEditId(null);
    if (mainInputRef.current) mainInputRef.current.value = "";
    if (addSubInputRef.current) addSubInputRef.current.value = "";
    if (replaceSubInputRef.current) replaceSubInputRef.current.value = "";
    if (routeMapInputRef.current) routeMapInputRef.current.value = "";
  };

  // Image pickers
  const onPickMain = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setMainImageFile(f);
    setMainPreview(URL.createObjectURL(f));
  };

  // Add multiple sub images (append, not replace)
  const onAddSubImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSubImages((prev) => {
      const capacity = 5 - prev.length;
      const toAdd = files
        .slice(0, Math.max(0, capacity))
        .map((f) => ({
          file: f,
          url: undefined,
          preview: URL.createObjectURL(f),
        }));
      return [...prev, ...toAdd];
    });
    if (addSubInputRef.current) addSubInputRef.current.value = "";
  };

  // Replace a specific sub image
  const onReplaceSubImage = (e) => {
    const f = e.target.files?.[0];
    if (!f && f !== null) return;
    setSubImages((prev) => {
      if (
        replaceIndex == null ||
        replaceIndex < 0 ||
        replaceIndex >= prev.length
      )
        return prev;
      const next = [...prev];
      if (f) {
        next[replaceIndex] = {
          file: f,
          url: undefined,
          preview: URL.createObjectURL(f),
        };
      }
      return next;
    });
    if (replaceSubInputRef.current) replaceSubInputRef.current.value = "";
    setReplaceIndex(null);
  };

  const removeSubImage = (idx) => {
    setSubImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const onPickRouteMap = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setRouteMapFile(f);
    setRouteMapPreview(URL.createObjectURL(f));
  };

  // Itinerary image picker per day
  const onPickItineraryImage = (dayIdx, file) => {
    setItinerary((prev) => {
      const next = [...prev];
      next[dayIdx] = {
        ...next[dayIdx],
        file,
        imageUrl: file ? URL.createObjectURL(file) : "",
      };
      return next;
    });
  };

  // Upcoming dates add/remove
  const addUpcomingDate = () => {
    if (!upcomingDate) return;
    if (upcomingDates.includes(upcomingDate)) return; // avoid dup
    setUpcomingDates((d) => [...d, upcomingDate]);
    setUpcomingDate("");
  };
  const removeUpcomingDate = (d) =>
    setUpcomingDates((dates) => dates.filter((x) => x !== d));

  // FAQ add/remove
  const addFaq = () => setFaqs((f) => [...f, { q: "", a: "" }]);
  const removeFaq = (idx) => setFaqs((f) => f.filter((_, i) => i !== idx));

  // -------- SUBMIT (create or update) --------
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setErrorMsg("");
  //   setSuccessMsg("");

  //   try {
  //     if (!tourName.trim()) throw new Error("Please enter tour name.");
  //     if (!categoryOption?.value) throw new Error("Please select a category.");
  //     if (!days || days < 1) throw new Error("Please enter number of days (>=1).");
  //     if (subImages.length > 5) throw new Error("Please select up to 5 sub images.");

  //     setSubmitting(true);

  //     // 1) Upload images (main, subs, routeMap, itinerary)
  //     let mainImageUrl = null;
  //     if (mainImageFile && typeof mainImageFile !== "string") {
  //       const res = await uploadImageToCloudinary(mainImageFile);
  //       if (!res?.secure_url) throw new Error(res?.error?.message || "Main image upload failed.");
  //       mainImageUrl = res.secure_url;
  //     }

  //     const subImageUrls = [];
  //     for (const img of subImages) {
  //       if (img.url && typeof img.url === "string") {
  //         subImageUrls.push(img.url);
  //         continue;
  //       }
  //       const up = await uploadImageToCloudinary(img.file);
  //       if (!up?.secure_url) throw new Error(up?.error?.message || "Sub image upload failed.");
  //       subImageUrls.push(up.secure_url);
  //     }

  //     let routeMapUrl = null;
  //     if (routeMapFile && typeof routeMapFile !== "string") {
  //       const rm = await uploadImageToCloudinary(routeMapFile);
  //       if (!rm?.secure_url) throw new Error(rm?.error?.message || "Route map upload failed.");
  //       routeMapUrl = rm.secure_url;
  //     }

  //     const itineraryUploads = [];
  //     for (const step of itinerary) {
  //       if (step.file && typeof step.file !== "string") {
  //         const u = await uploadImageToCloudinary(step.file);
  //         if (!u?.secure_url) throw new Error(u?.error?.message || `Itinerary D${step.day} upload failed.`);
  //         itineraryUploads.push({ ...step, imageUrl: u.secure_url, file: undefined });
  //       } else {
  //         itineraryUploads.push({ ...step, file: undefined });
  //       }
  //     }

  //     // 2) Build payload
  //     const payload = {
  //       tourName: tourName.trim(),
  //       categoryId: categoryOption.value,
  //       days: Number(days),
  //       nights: Number(nights) || 0,
  //       tripCost: Number(tripCost) || 0,
  //       tripStyle: tripStyle.trim(),
  //       vehicle: vehicle.trim(),
  //       drivingDistance: drivingDistance.trim(),
  //       landscapes: landscapes.map((l) => l.value),
  //       activity: activity.trim(),
  //       upcomingDates,
  //       mainImageUrl: mainImageUrl || (typeof mainImageFile === "string" ? mainImageFile : null),
  //       subImageUrls,
  //       routeMapUrl: routeMapUrl || (typeof routeMapFile === "string" ? routeMapFile : null),
  //       itinerary: itineraryUploads.map(({ day, title, description, imageUrl }) => ({ day, title, description, imageUrl })),
  //       faqs: faqs.filter((f) => f.q.trim() || f.a.trim()),
  //     };

  //     // 3) Create or Update
  //     if (isEditing && editId) {
  //       await API.put(`/admin/tours/${editId}`, payload);
  //       setSuccessMsg("Tour updated successfully.");
  //     } else {
  //       await API.post("/admin/tours", payload);
  //       setSuccessMsg("Tour created successfully.");
  //     }

  //     resetForm();
  //     setRefreshKey((k) => k + 1);
  //   } catch (err) {
  //     const msg = err?.response?.data?.message || err?.message || "Something went wrong. Please try again.";
  //     setErrorMsg(msg);
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // helper
    const isNonEmpty = (v) => typeof v === "string" && v.trim().length > 0;

    try {
      // --------- 0) BASIC FORM VALIDATIONS (pre-uploads) ---------
      if (!isNonEmpty(tourName)) throw new Error("Please enter tour name.");
      if (!categoryOption?.value) throw new Error("Please select a category.");

      const d = Number(days);
      if (!Number.isFinite(d) || d < 1) {
        throw new Error("Please enter number of days (≥ 1).");
      }

      const n = Number(nights);
      if (!Number.isFinite(n)) throw new Error("Please enter nights.");
      if (n !== d - 1) throw new Error("Nights must be exactly days - 1.");

      // landscapes: required + allowed values
      const allowedLandscapes = [
        "Mountain",
        "Beaches",
        "Forest",
        "Snow",
        "Leisure",
        "Cultural",
        "Archaeological",
        "Rural",
        "Volcanic",
        "Tribal",
        "Cave",
        "Mangrove",
        "Waterfalls",
      ];
      const selectedLandscapes = (landscapes || []).map((l) => l.value);
      if (
        !Array.isArray(selectedLandscapes) ||
        selectedLandscapes.length === 0
      ) {
        throw new Error("Please select at least one landscape.");
      }
      const badLandscape = selectedLandscapes.find(
        (v) => !allowedLandscapes.includes(String(v))
      );
      if (badLandscape) {
        throw new Error(
          `Invalid landscape "${badLandscape}". Allowed: ${allowedLandscapes.join(
            ", "
          )}`
        );
      }

      // sub images: exactly 5 files/items
      if (!Array.isArray(subImages) || subImages.length !== 5) {
        throw new Error("Please select exactly 5 sub images.");
      }

      // itinerary: validate (title & description required, day ≥ 1)
      if (!Array.isArray(itinerary)) {
        throw new Error("Itinerary must be an array.");
      }
      itinerary.forEach((step, i) => {
        const dayNum = Number(step?.day);
        if (!Number.isFinite(dayNum) || dayNum < 1) {
          throw new Error(`Itinerary day must be ≥ 1 (error at Day ${i + 1}).`);
        }
        if (!isNonEmpty(step?.title)) {
          throw new Error(`Itinerary title is required (Day ${i + 1}).`);
        }
        if (!isNonEmpty(step?.description)) {
          throw new Error(`Itinerary description is required (Day ${i + 1}).`);
        }
      });

      // faqs: if provided, every q must have a (and vice versa)
      if (!Array.isArray(faqs)) {
        throw new Error("FAQs must be an array.");
      }
      faqs.forEach((f, i) => {
        const q = String(f?.q ?? "").trim();
        const a = String(f?.a ?? "").trim();
        if ((q && !a) || (!q && a)) {
          throw new Error(
            `FAQ #${i + 1}: both question and answer are required.`
          );
        }
      });
      const sanitizedFaqs = faqs
        .map((f) => ({
          q: String(f.q || "").trim(),
          a: String(f.a || "").trim(),
        }))
        .filter((f) => f.q && f.a); // keep only complete rows

      setSubmitting(true);

      // --------- 1) UPLOADS (main, subs, routeMap, itinerary) ---------
      // main image (required after resolution)
      let mainImageUrlFinal = null;
      if (mainImageFile && typeof mainImageFile !== "string") {
        const resUp = await uploadImageToCloudinary(mainImageFile);
        if (!resUp?.secure_url)
          throw new Error(resUp?.error?.message || "Main image upload failed.");
        mainImageUrlFinal = resUp.secure_url;
      } else if (
        typeof mainImageFile === "string" &&
        isNonEmpty(mainImageFile)
      ) {
        mainImageUrlFinal = mainImageFile;
      }
      if (!isNonEmpty(mainImageUrlFinal)) {
        throw new Error("Main image is required.");
      }

      // sub images (exactly 5 after resolution)
      const subImageUrls = [];
      for (let idx = 0; idx < subImages.length; idx++) {
        const img = subImages[idx];
        if (img.url && typeof img.url === "string" && isNonEmpty(img.url)) {
          subImageUrls.push(img.url);
        } else {
          const up = await uploadImageToCloudinary(img.file);
          if (!up?.secure_url) {
            throw new Error(
              up?.error?.message || `Sub image #${idx + 1} upload failed.`
            );
          }
          subImageUrls.push(up.secure_url);
        }
      }
      if (
        subImageUrls.length !== 5 ||
        subImageUrls.some((u) => !isNonEmpty(u))
      ) {
        throw new Error("Exactly 5 valid sub images are required.");
      }

      // route map (optional)
      let routeMapUrlFinal = null;
      if (routeMapFile && typeof routeMapFile !== "string") {
        const rm = await uploadImageToCloudinary(routeMapFile);
        if (!rm?.secure_url)
          throw new Error(rm?.error?.message || "Route map upload failed.");
        routeMapUrlFinal = rm.secure_url;
      } else if (typeof routeMapFile === "string") {
        routeMapUrlFinal = routeMapFile;
      }

      // itinerary images (optional per-step), keep title/description/day already validated
      const itineraryUploads = [];
      for (const step of itinerary) {
        if (step.file && typeof step.file !== "string") {
          const u = await uploadImageToCloudinary(step.file);
          if (!u?.secure_url) {
            throw new Error(
              u?.error?.message || `Itinerary D${step.day} image upload failed.`
            );
          }
          itineraryUploads.push({
            ...step,
            imageUrl: u.secure_url,
            file: undefined,
          });
        } else {
          itineraryUploads.push({ ...step, file: undefined });
        }
      }

      // --------- 2) PAYLOAD ---------
      const payload = {
        tourName: tourName.trim(),
        categoryId: categoryOption.value,
        days: d,
        nights: n,
        tripCost: Number(tripCost) || 0,
        tripStyle: String(tripStyle || "").trim(),
        vehicle: String(vehicle || "").trim(),
        drivingDistance: String(drivingDistance || "").trim(),
        landscapes: selectedLandscapes,
        activity: String(activity || "").trim(),
        upcomingDates, // send as-is; backend validates/coerces
        mainImageUrl: mainImageUrlFinal,
        subImageUrls,
        routeMapUrl: routeMapUrlFinal,
        itinerary: itineraryUploads.map(
          ({ day, title, description, imageUrl }) => ({
            day: Number(day),
            title: String(title).trim(),
            description: String(description).trim(),
            imageUrl: String(imageUrl || "").trim(),
          })
        ),
        faqs: sanitizedFaqs,
      };

      // --------- 3) CREATE OR UPDATE ---------
      if (isEditing && editId) {
        await API.put(`/admin/tours/${editId}`, payload);
        setSuccessMsg("Tour updated successfully.");
      } else {
        await API.post("/admin/tours", payload);
        setSuccessMsg("Tour created successfully.");
      }

      resetForm();
      setRefreshKey((k) => k + 1);
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

  // -------- TABLE FETCH/LIST --------
  const fetchTours = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/admin/tours", {
        params: { search: query, page, limit: PAGE_SIZE },
      });
      setRows(data.items || []);
      setMeta({
        totalPages: data.totalPages || 1,
        totalItems: data.totalItems || 0,
      });
    } catch (err) {
      console.error("Fetch tours failed:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTours(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query, refreshKey]);

  const pageInfo = useMemo(
    () => ({ page, totalPages: meta.totalPages }),
    [page, meta.totalPages]
  );

  // Start edit: load full tour
  const startEdit = async (row) => {
    try {
      const { data } = await API.get(`/admin/tours/${row._id}`);
      const t = data?.item || row; // fallback

      setIsEditing(true);
      setEditId(t._id);

      setCategoryOption({
        value: t.category?._id || t.categoryId || t.category,
        label: t.category?.name || t.categoryName || "",
      });
      setTourName(t.tourName || "");
      setDays(Number(t.days) || 0);
      setNights(Number(t.nights) || 0);
      setTripCost(t.tripCost ?? "");
      setTripStyle(t.tripStyle || "");
      setVehicle(t.vehicle || "");
      setDrivingDistance(t.drivingDistance || "");
      setLandscapes(
        (t.landscapes || []).map((v) => ({
          value: v,
          label: LANDSCAPE_OPTIONS.find((o) => o.value === v)?.label || v,
        }))
      );
      setActivity(t.activity || "");
      setUpcomingDates(t.upcomingDates || []);

      setMainImageFile(t.mainImageUrl || null); // keep string URL in state to avoid forcing re-upload
      setMainPreview(typeof t.mainImageUrl === "string" ? t.mainImageUrl : "");

      // Load existing sub images as URL items
      setSubImages(
        (t.subImageUrls || [])
          .slice(0, 5)
          .map((u) => ({ url: u, file: undefined, preview: u }))
      );

      setRouteMapFile(t.routeMapUrl || null);
      setRouteMapPreview(
        typeof t.routeMapUrl === "string" ? t.routeMapUrl : ""
      );

      setItinerary(
        (t.itinerary || []).map((s, idx) => ({
          day: s.day || idx + 1,
          title: s.title || "",
          description: s.description || "",
          imageUrl: s.imageUrl || "",
          file: null,
        }))
      );

      setFaqs((t.faqs || []).length ? t.faqs : [{ q: "", a: "" }]);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Load tour failed:", err);
    }
  };

  const cancelEdit = () => resetForm();

  // Toggle active status
  const toggleStatus = async (id, nextVal) => {
    try {
      setRows((prev) =>
        prev.map((r) => (r._id === id ? { ...r, activeStatus: nextVal } : r))
      );
      await API.patch(`/admin/tours/${id}/status`, { activeStatus: nextVal });
    } catch (err) {
      console.error("Update status failed:", err);
      // revert
      setRows((prev) =>
        prev.map((r) => (r._id === id ? { ...r, activeStatus: !nextVal } : r))
      );
    }
  };

  // ---------- RENDER ----------
  return (
    <>
      {/* hidden inputs for sub image add/replace */}
      <input
        ref={addSubInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onAddSubImages}
      />
      <input
        ref={replaceSubInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onReplaceSubImage}
      />

      {/* ---------------- FORM ---------------- */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Tour" : "Add Tour"}
          </h2>
          {isEditing && (
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>

        {/* Top basics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Tour Name
            </label>
            <input
              value={tourName}
              onChange={(e) => setTourName(e.target.value)}
              placeholder="Type tour name"
              className="w-full rounded-xl bg-gray-900/70 text-gray-100 placeholder:text-gray-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Category
            </label>
            <Select
              value={categoryOption}
              onChange={setCategoryOption}
              options={categories}
              placeholder="Select category"
              classNamePrefix="select"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: "rgba(17,24,39,0.7)",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "0.75rem",
                  minHeight: "44px",
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: "rgb(17,24,39)",
                  color: "#e5e7eb",
                }),
                singleValue: (b) => ({ ...b, color: "#e5e7eb" }),
                input: (b) => ({ ...b, color: "#e5e7eb" }),
                option: (b, s) => ({
                  ...b,
                  backgroundColor: s.isFocused
                    ? "rgb(31,41,55)"
                    : "transparent",
                  color: "#e5e7eb",
                  cursor: "pointer",
                }),
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Days
            </label>
            <input
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full rounded-xl bg-gray-900/70 text-gray-100 ring-1 ring-white/10 px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Nights
            </label>
            <input
              type="number"
              min={0}
              value={nights}
              onChange={(e) => setNights(e.target.value)}
              className="w-full rounded-xl bg-gray-900/70 text-gray-100 ring-1 ring-white/10 px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Trip Cost
            </label>
            <input
              type="number"
              min={0}
              value={tripCost}
              onChange={(e) => setTripCost(e.target.value)}
              className="w-full rounded-xl bg-gray-900/70 text-gray-100 ring-1 ring-white/10 px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Trip Style
            </label>
            <input
              value={tripStyle}
              onChange={(e) => setTripStyle(e.target.value)}
              className="w-full rounded-xl bg-gray-900/70 text-gray-100 ring-1 ring-white/10 px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Vehicle
            </label>
            <input
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              className="w-full rounded-xl bg-gray-900/70 text-gray-100 ring-1 ring-white/10 px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Driving Distance
            </label>
            <input
              value={drivingDistance}
              onChange={(e) => setDrivingDistance(e.target.value)}
              className="w-full rounded-xl bg-gray-900/70 text-gray-100 ring-1 ring-white/10 px-4 py-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300">
              Landscapes
            </label>
            <Select
              isMulti
              value={landscapes}
              onChange={setLandscapes}
              options={LANDSCAPE_OPTIONS}
              placeholder="Select landscapes"
              classNamePrefix="select"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: "rgba(17,24,39,0.7)",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "0.75rem",
                  minHeight: "44px",
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: "rgb(17,24,39)",
                  color: "#e5e7eb",
                }),
                multiValue: (b) => ({ ...b, backgroundColor: "#111827" }),
                multiValueLabel: (b) => ({ ...b, color: "#e5e7eb" }),
                option: (b, s) => ({
                  ...b,
                  backgroundColor: s.isFocused
                    ? "rgb(31,41,55)"
                    : "transparent",
                  color: "#e5e7eb",
                  cursor: "pointer",
                }),
              }}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300">
              Activity
            </label>
            <input
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full rounded-xl bg-gray-900/70 text-gray-100 ring-1 ring-white/10 px-4 py-2"
            />
          </div>
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main image */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Main Image
            </label>
            <input
              ref={mainInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickMain}
            />
            <div className="mt-2 rounded-2xl bg-gray-950/60 ring-1 ring-white/10 p-4">
              {!mainPreview ? (
                <button
                  type="button"
                  onClick={() => mainInputRef.current?.click()}
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
                  <div className="relative w-64 h-36 overflow-hidden rounded-xl ring-1 ring-white/10">
                    <img
                      src={mainPreview}
                      alt="Main"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => mainInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10"
                    >
                      <ImageIcon className="h-4 w-4" /> Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMainImageFile(null);
                        setMainPreview("");
                        if (mainInputRef.current)
                          mainInputRef.current.value = "";
                      }}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-rose-600/80 hover:bg-rose-500 text-white ring-1 ring-white/10"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sub images (individual add/replace/remove) */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Sub Images (should 5)
            </label>
            <div className="mt-2 rounded-2xl bg-gray-950/60 ring-1 ring-white/10 p-4">
              <div className="flex flex-wrap gap-3">
                {subImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="group relative w-28 h-20 overflow-hidden rounded-xl ring-1 ring-white/10"
                  >
                    <img
                      src={img.preview}
                      alt={`sub-${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReplaceIndex(idx);
                          replaceSubInputRef.current?.click();
                        }}
                        className="rounded-lg px-2 py-1 text-xs bg-gray-800/80 ring-1 ring-white/20"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSubImage(idx)}
                        className="rounded-lg px-2 py-1 text-xs bg-rose-600/80 text-white ring-1 ring-white/20"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {subImages.length < 5 && (
                  <button
                    type="button"
                    onClick={() => addSubInputRef.current?.click()}
                    className="w-28 h-20 flex flex-col items-center justify-center gap-2 rounded-xl bg-gray-900/70 hover:bg-gray-900 ring-1 ring-white/10"
                    title="Add another image"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-xs text-gray-300">Add</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Route map */}
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Route Map
          </label>
          <input
            ref={routeMapInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickRouteMap}
          />
          <div className="mt-2 rounded-2xl bg-gray-950/60 ring-1 ring-white/10 p-4">
            {!routeMapPreview ? (
              <button
                type="button"
                onClick={() => routeMapInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-3 h-40 cursor-pointer rounded-xl bg-gray-900/70 hover:bg-gray-900 ring-1 ring-white/10 transition"
              >
                <div className="flex items-center gap-2 text-gray-300">
                  <Upload className="h-5 w-5" />
                  <span className="text-sm">Click to upload map</span>
                </div>
              </button>
            ) : (
              <div className="flex items-start gap-4">
                <div className="relative w-64 h-36 overflow-hidden rounded-xl ring-1 ring-white/10">
                  <img
                    src={routeMapPreview}
                    alt="Route map"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => routeMapInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10"
                  >
                    <ImageIcon className="h-4 w-4" /> Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRouteMapFile("");
                      setRouteMapPreview("");
                      if (routeMapInputRef.current)
                        routeMapInputRef.current.value = "";
                    }}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-rose-600/80 hover:bg-rose-500 text-white ring-1 ring-white/10"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming dates */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Upcoming Dates
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="date"
              value={upcomingDate}
              onChange={(e) => setUpcomingDate(e.target.value)}
              className="rounded-xl bg-gray-900/70 text-gray-100 ring-1 ring-white/10 px-4 py-2"
            />
            <button
              type="button"
              onClick={addUpcomingDate}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          {upcomingDates.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900/70 ring-1 ring-white/10 px-3 py-1 text-sm"
            >
              {new Date(d).toLocaleDateString("en-GB")}
              <button
                type="button"
                onClick={() => removeUpcomingDate(d)}
                className="text-rose-400 hover:text-rose-300"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>

        {/* Itinerary */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Itinerary (auto Day 1 … Day {days || 0})
            </h3>
          </div>
          <div className="mt-3 space-y-4">
            {itinerary.map((step, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-gray-950/60 ring-1 ring-white/10 p-4"
              >
                <div className="font-medium text-gray-300 mb-3">
                  Day {step.day}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    value={step.title}
                    onChange={(e) =>
                      setItinerary((prev) => {
                        const next = [...prev];
                        next[idx] = { ...next[idx], title: e.target.value };
                        return next;
                      })
                    }
                    placeholder="Trip name for this day"
                    className="w-full rounded-xl bg-gray-900/70 text-gray-100 ring-1 ring-white/10 px-4 py-2"
                  />
                  <input
                    value={step.description}
                    onChange={(e) =>
                      setItinerary((prev) => {
                        const next = [...prev];
                        next[idx] = {
                          ...next[idx],
                          description: e.target.value,
                        };
                        return next;
                      })
                    }
                    placeholder="Trip description"
                    className="w-full rounded-xl bg-gray-900/70 text-gray-100 ring-1 ring-white/10 px-4 py-2"
                  />
                </div>
                <div className="mt-3">
                  <input
                    id={`it-img-${idx}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      onPickItineraryImage(idx, e.target.files?.[0])
                    }
                  />
                  {step.imageUrl ? (
                    <div className="flex items-start gap-4">
                      <div className="relative w-48 h-28 overflow-hidden rounded-xl ring-1 ring-white/10">
                        <img
                          src={step.imageUrl}
                          alt={`it-${idx}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById(`it-img-${idx}`)?.click()
                          }
                          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10"
                        >
                          <ImageIcon className="h-4 w-4" /> Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => onPickItineraryImage(idx, null)}
                          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-rose-600/80 hover:bg-rose-500 text-white ring-1 ring-white/10"
                        >
                          <Trash2 className="h-4 w-4" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById(`it-img-${idx}`)?.click()
                      }
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10"
                    >
                      <Upload className="h-4 w-4" /> Add image for Day{" "}
                      {step.day}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">FAQ</h3>
            <button
              type="button"
              onClick={addFaq}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10"
            >
              <Plus className="h-4 w-4" /> Add Question
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {faqs.map((f, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  value={f.q}
                  onChange={(e) =>
                    setFaqs((prev) => {
                      const next = [...prev];
                      next[idx] = { ...next[idx], q: e.target.value };
                      return next;
                    })
                  }
                  placeholder={`Question #${idx + 1}`}
                  className="w-full rounded-xl bg-gray-900/70 text-gray-100 ring-1 ring-white/10 px-4 py-2"
                />
                <div className="flex gap-2">
                  <input
                    value={f.a}
                    onChange={(e) =>
                      setFaqs((prev) => {
                        const next = [...prev];
                        next[idx] = { ...next[idx], a: e.target.value };
                        return next;
                      })
                    }
                    placeholder="Answer"
                    className="flex-1 rounded-xl bg-gray-900/70 text-gray-100 ring-1 ring-white/10 px-4 py-2"
                  />
                  {faqs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFaq(idx)}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-rose-600/80 hover:bg-rose-500 text-white ring-1 ring-white/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
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
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10"
            >
              <X className="h-4 w-4" /> Cancel
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
              ? "Update Tour"
              : "Create Tour"}
          </button>
        </div>
      </form>

      {/* ---------------- TABLE ---------------- */}
      <div className="mt-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h3 className="text-lg font-semibold">Tours</h3>
          <div className="relative w-full md:w-80">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tour/category…"
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
                  Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Tour
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Days
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
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    <Loader2 className="inline h-5 w-5 animate-spin mr-2" />{" "}
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No tours found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row._id}>
                    <td className="px-4 py-3">
                      {row.mainImageUrl ? (
                        <img
                          src={row.mainImageUrl}
                          alt={row.tourName || "Tour"}
                          className="h-12 w-20 rounded-md object-cover ring-1 ring-white/10"
                        />
                      ) : (
                        <div className="h-12 w-20 rounded-md bg-gray-800/80 ring-1 ring-white/10" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {row.tourName || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {row.category?.name || row.categoryName || "—"}
                    </td>
                    <td className="px-4 py-3">{row.days ?? "—"}</td>
                    <td className="px-4 py-3">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={!!row.activeStatus}
                          onChange={(e) =>
                            toggleStatus(row._id, e.target.checked)
                          }
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-600 transition relative">
                          <div className="absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition peer-checked:translate-x-5" />
                        </div>
                      </label>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(row.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => startEdit(row)}
                          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10"
                        >
                          <PencilLine className="h-4 w-4" /> Edit
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
