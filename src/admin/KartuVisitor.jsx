import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import kaiLogo from "../assets/KAI-logo.png";

import {
  getApprovedCards,
  getActiveCards,
  issueCard,
  returnCard,
  editCardCondition,
  reportDamagedCard,
  reportLostCard,
  exportDailyFlow,
  downloadBlob,
  adminLogout,
} from "../api";

const namaPetugas =
  localStorage.getItem("namaPetugas") ||
  localStorage.getItem("adminName") ||
  "Admin";

function notifyDirtyCards() {
  try {
    localStorage.setItem("dirty:cards", String(Date.now()));
  } catch (_) {}
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const ch = new BroadcastChannel("cards-channel");
      ch.postMessage({ type: "dirty:cards", at: Date.now() });
      ch.close();
    }
  } catch (_) {}
}

const PATCH_KEY = "riwayat:patches";

function saveRiwayatPatch(reference, kondisi) {
  if (!reference || !kondisi) return;
  try {
    const raw = localStorage.getItem(PATCH_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[String(reference)] = kondisi; 
    localStorage.setItem(PATCH_KEY, JSON.stringify(map));
  } catch {}
}

function broadcastRiwayatPatch(reference, kondisi) {
  try {
    window.dispatchEvent(
      new CustomEvent("riwayat:patch", { detail: { reference, kondisi, at: Date.now() } })
    );
  } catch {}
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const ch = new BroadcastChannel("riwayat-channel");
      ch.postMessage({ type: "patch", reference, kondisi, at: Date.now() });
      ch.close();
    }
  } catch {}
}

const IDMAP_KEY = "cards:lastIssuedIDs";
function loadIdMap() {
  try { return JSON.parse(localStorage.getItem(IDMAP_KEY) || "{}"); } catch { return {}; }
}
function saveIdMap(map) {
  localStorage.setItem(IDMAP_KEY, JSON.stringify(map));
}
function setIdsForReference(reference, ids) {
  if (!reference) return;
  const map = loadIdMap();
  map[String(reference)] = {
    visitor_card_id: ids?.visitor_card_id || ids?.visitorCardId || null,
    transaction_id: ids?.transaction_id || ids?.card_transaction_id || ids?.transactionId || null,
  };
  saveIdMap(map);
}
function getIdsForReference(reference) {
  const map = loadIdMap();
  return reference ? map[String(reference)] || {} : {};
}

function normalizeConditionLabel(s) {
  const v = (s || "").toString().trim().toLowerCase();
  if (["rusak", "damage", "damaged", "broken"].includes(v)) return "Rusak";
  if (["hilang", "lost", "missing"].includes(v)) return "Hilang";
  return "Baik";
}

function getStatusKartu(tanggalKembali, opts = {}) {
  const today = new Date();
  const kembali = tanggalKembali ? new Date(tanggalKembali) : null;
  if (opts?.aksi === "Belum diambil") return "Belum diambil";
  if (opts?.isActive === false && kembali && kembali >= today) return "Belum diambil";
  if (!kembali || isNaN(kembali)) return opts?.isActive ? "Aktif" : "Tidak Aktif";
  return kembali < today ? "Tidak Aktif" : "Aktif";
}

const statusColor = {
  Aktif: "#25BF23",
  "Tidak Aktif": "#E53A3D",
  "Belum diambil": "#6C757D",
};

const kondisiColor = {
  Baik: "#28A745",
  Hilang: "#DC3545",
  Rusak: "#FFC107",
};

const aksiColor = {
  "Terima Kartu": "#007BFF",
  "Serahkan Kartu": "#ED8126",
  "Belum diambil": "#6C757D",
};

function mapConditionToAPI(k) {
  const v = (k || "").toString().toLowerCase();
  if (v.includes("hilang")) return "lost";
  if (v.includes("rusak")) return "damaged";
  return "good";
}

function mapApiConditionToLabel(raw) {
  const v = (raw ?? "").toString().trim().toLowerCase();
  if (!v) return undefined;
  if (["good", "baik", "ok", "normal"].includes(v)) return "Baik";
  if (["damaged", "rusak", "broken"].includes(v)) return "Rusak";
  if (["lost", "hilang", "missing"].includes(v)) return "Hilang";
  return undefined;
}

function findVisitorCardId(x) {
  return (
    x?.visitorCardId ||
    x?.visitor_card_id ||
    x?.card_id ||
    x?.visitor_card?.id ||
    x?.card?.id ||
    x?.card?.card_id ||
    null
  );
}

const META_CACHE_KEY = "visitorCardMetaCache";

function loadMetaCache() {
  try {
    return JSON.parse(localStorage.getItem(META_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveMetaCache(cache) {
  localStorage.setItem(META_CACHE_KEY, JSON.stringify(cache));
}
function keyForRow(r) {
  return String(
    r?.referenceNumber || r?.nomorPengajuan || r?.transactionId || r?.visitorCardId || r?.id || ""
  );
}
function applyMetaCache(list) {
  const cache = loadMetaCache();
  return list.map((r) => {
    const k = keyForRow(r);
    const cached = k ? cache[k] : null;
    if (!cached) return r;

    const apiK = (r.kondisi || "").toLowerCase();
    const shouldUseCachedKondisi = !apiK || apiK === "baik";

    const alasan = r.alasan || (cached.alasan ?? "");
    const penanganan = r.penanganan || (cached.penanganan ?? "");

    return {
      ...r,
      kondisi: shouldUseCachedKondisi ? (cached.kondisi || r.kondisi) : r.kondisi,
      alasan,
      penanganan,
    };
  });
}
function cacheMeta(rowOrKey, meta) {
  const cache = loadMetaCache();
  const k = typeof rowOrKey === "string" ? rowOrKey : keyForRow(rowOrKey);
  if (!k) return;
  const prev = cache[k] || {};
  cache[k] = {
    kondisi: meta.kondisi ?? prev.kondisi,
    alasan: meta.alasan ?? prev.alasan,
    penanganan: meta.penanganan ?? prev.penanganan,
  };
  saveMetaCache(cache);
}

async function resolveVisitorCardIdFromActives(hints = {}) {
  const { transactionId, refNo, cardNo } = hints;
  try {
    const res = await getActiveCards({ ttl: 0 }); 
    const arr = Array.isArray(res?.data) ? res.data : res?.data?.data || [];

    const getRef = (x) => x?.reference_number || x?.reference || x?.ref_no || x?.ref || null;

    let found = null;
    if (transactionId) {
      found = arr.find(
        (x) =>
          String(x?.card_transaction_id || x?.transaction_id || x?.id) === String(transactionId)
      );
    }
    if (!found && refNo) {
      found = arr.find((x) => String(getRef(x)) === String(refNo));
    }
    if (!found && cardNo) {
      found = arr.find((x) => String(x?.card_number || x?.card_no) === String(cardNo));
    }

    if (found) {
      return (
        found?.visitor_card_id ||
        found?.card_id ||
        found?.visitor_card?.id ||
        found?.card?.id ||
        null
      );
    }
    return null;
  } catch (e) {
    console.warn("resolveVisitorCardIdFromActives gagal:", e?.message || e);
    return null;
  }
}

function Popup({ show, onClose, children, title }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-20">
      <div className="bg-white rounded-[14px] p-0 min-w-[400px] max-w-[520px] w-[97%] shadow-lg relative">
        <div
          className="flex items-center justify-between px-6 py-4 rounded-t-[14px]"
          style={{ background: "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
              <Icon icon="material-symbols:id-card-rounded" width={22} color="#fff" />
            </div>
            <span className="font-poppins font-semibold text-white text-[18px]">{title}</span>
          </div>
          <button
            onClick={onClose}
            className="ml-2 text-white text-[22px] font-bold hover:opacity-80 transition"
          >
            ×
          </button>
        </div>
        <div className="px-7 py-7">{children}</div>
      </div>
    </div>
  );
}

function DataSection({ title, thick = 2, children }) {
  return (
    <div
      className="rounded-[10px] overflow-hidden mb-4"
      style={{ background: "rgba(100,115,175,0.07)", border: "1px solid rgba(208,205,205,0.56)" }}
    >
      <div className="px-4 pt-3 pb-2">
        <div className="font-poppins font-medium text-[#919090] text-[14px]">{title}</div>
      </div>
      <div style={{ height: thick, background: "rgba(208,205,205,0.56)" }} />
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div
      className="py-2 flex gap-2 text-[14.5px]"
      style={{ borderBottom: "1px solid rgba(208,205,205,0.56)" }}
    >
      <div className="min-w-[150px] text-[#474646] font-poppins font-medium">{label}</div>
      <div className="text-[#474646] font-poppins font-medium">: {value}</div>
    </div>
  );
}

function BoxPetugas({ label, value }) {
  return (
    <div
      className="rounded-[10px] px-4 py-3 mb-2"
      style={{ border: "1px solid rgba(208,205,205,0.56)", background: "#FFFFFF" }}
    >
      <span className="font-poppins font-medium text-[#474646]">
        {label} : {value}
      </span>
    </div>
  );
}

export default function KartuVisitor() {
  const [dummyData, setDummyData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState("");
  const [selectedKey, setSelectedKey] = useState(null);

  const [laporanKondisi, setLaporanKondisi] = useState("");
  const [laporanAlasan, setLaporanAlasan] = useState("");
  const [laporanPenanganan, setLaporanPenanganan] = useState("");
  const [readonlyLaporan, setReadonlyLaporan] = useState(false);

  const [submittingSerah, setSubmittingSerah] = useState(false);
  const [submittingTerima, setSubmittingTerima] = useState(false);
  const [submittingLaporan, setSubmittingLaporan] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await adminLogout?.();
    } catch (_) {
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("adminName");
      localStorage.removeItem("namaPetugas");
      try {
        localStorage.removeItem(META_CACHE_KEY);
      } catch {}
      window.location.href = "/admin";
    }
  };

  const formatISO = (v) => (v ? new Date(v).toISOString().slice(0, 10) : "");
  function formatTanggal(str) {
    const months = [
      "Januari","Februari","Maret","April","Mei","Juni",
      "Juli","Agustus","September","Oktober","November","Desember",
    ];
    const d = new Date(str);
    if (isNaN(d)) return str || "-";
    return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  const mapApproved = (x) => {
    const nama =
      x.applicant_name || x.full_name || x.name || x.user_name || x.visitor_name || "-";
    const instansi = x.company || x.organization || x.institution || x.agency || "-";
    const nomorPengajuan = x.reference_number || x.reference || x.ref_no || x.ref || "-";
    const email = x.email || x.applicant_email || x.user_email || "-";
    const visitStart = x.visit_date || x.visit_start_date || x.date || x.approved_at || "";
    const visitEnd = x.visit_end_date || x.expected_return_date || x.return_date || "";

    const apiCond = mapApiConditionToLabel(
      x.condition || x.card_condition || x.status_condition || x.kondisi
    );

    return {
      id: x.id,
      transactionId: null,
      visitorCardId: findVisitorCardId(x),
      referenceNumber: nomorPengajuan,
      nama,
      instansi,
      nomorPengajuan,
      kunjungan: formatTanggal(visitStart || new Date()),
      email,
      tanggalPinjam: formatISO(visitStart) || "",
      tanggalKembali: formatISO(visitEnd) || "",
      kondisi: apiCond ?? "Baik", 
      aksi: "Belum diambil",
      petugasSerah:
        x.performed_by_name ||
        x.issued_by_name ||
        x.petugas_serah ||
        x.petugasPenyerah ||
        "",
      petugas_penyerah:
        x.performed_by_name || x.issued_by_name || x.petugas_serah || "",
      petugasPenerima:
        x.returned_by_name || x.received_by_name || x.petugas_penerima || "",
      petugas_penerima:
        x.returned_by_name || x.received_by_name || x.petugas_penerima || "",
      alasan: x.reason || x.alasan || "",
      penanganan: x.handling || x.penanganan || "",
      isActive: false,
    };
  };

  const mapActive = (x) => {
    const nama =
      x.applicant_name || x.full_name || x.name || x.user_name || x.visitor_name || "-";
    const instansi = x.company || x.organization || x.institution || x.agency || "-";
    const nomorPengajuan = x.reference_number || x.reference || x.ref_no || x.ref || "-";
    const email = x.email || x.applicant_email || x.user_email || "-";
    const issuedAt = x.issued_at || x.start_date || x.created_at || "";
    const due = x.expected_return_date || x.due_date || x.return_date || "";

    const apiCond = mapApiConditionToLabel(
      x.condition || x.card_condition || x.kondisi
    );

    const issuer = x.performed_by_name || x.issued_by_name || x.performed_by || "";

    return {
      id: x.id,
      transactionId: x.card_transaction_id || x.transaction_id || x.id,
      visitorCardId: findVisitorCardId(x),
      referenceNumber: nomorPengajuan,
      nama,
      instansi,
      nomorPengajuan,
      kunjungan: formatTanggal(issuedAt || new Date()),
      email,
      tanggalPinjam: formatISO(issuedAt) || "",
      tanggalKembali: formatISO(due) || "",
      kondisi: apiCond ?? "Baik", 
      aksi: "Serahkan Kartu",
      petugasSerah: issuer || namaPetugas,
      petugasPenyerah: issuer || namaPetugas,
      petugas_serah: issuer || namaPetugas,
      petugasPenerima: x.returned_by_name || x.received_by_name || "",
      petugas_penerima: x.returned_by_name || x.received_by_name || "",
      alasan: x.reason || x.alasan || "",
      penanganan: x.handling || x.penanganan || "",
      isActive: true,
    };
  };

  function rowKey(r) {
    return (
      r.transactionId ||
      r.referenceNumber ||
      r.nomorPengajuan ||
      r.visitorCardId ||
      r.id
    );
  }

  function pickRowByKey(key) {
    if (!key) return null;
    return (dummyData || []).find((r) => String(rowKey(r)) === String(key)) || null;
  }

  function reconcileKeepLocalKondisi(prevList, nextList) {
    const mapPrev = new Map();
    (prevList || []).forEach((p) => {
      const k = rowKey(p);
      if (k) mapPrev.set(String(k), p);
    });

    return nextList.map((n) => {
      const k = rowKey(n);
      if (!k) return n;
      const old = mapPrev.get(String(k));
      if (!old) return n;

      const oldK = (old.kondisi || "").toLowerCase();
      const newK = (n.kondisi || "").toLowerCase();

      const isOldSpecific = oldK === "rusak" || oldK === "hilang";
      const isNewBlankOrBaik = !newK || newK === "baik";

      if (isOldSpecific && isNewBlankOrBaik) {
        return {
          ...n,
          kondisi: old.kondisi,
          alasan: old.alasan,
          penanganan: old.penanganan,
        };
      }
      return n;
    });
  }

  async function reloadData(opts = {}) {
    setLoading(true);
    try {
      const ttl = opts.ttl ?? 60000;
      const [approvedRes, activeRes] = await Promise.all([
        getApprovedCards({ ttl }),
        getActiveCards({ ttl }),
      ]);

      const approvedRaw = Array.isArray(approvedRes?.data)
        ? approvedRes.data
        : approvedRes?.data?.data || [];
      const activeRaw = Array.isArray(activeRes?.data)
        ? activeRes.data
        : activeRes?.data?.data || [];

      const approved = approvedRaw.map(mapApproved);
      const active = activeRaw.map(mapActive);

      const merged = [...active, ...approved];
      const reconciled = reconcileKeepLocalKondisi(dummyData, merged);
      const withCache = applyMetaCache(reconciled);

      setDummyData(withCache);
      setLoading(false);
    } catch (err) {
      console.error("reloadData gagal:", err);
      setDummyData(applyMetaCache([]));
      setLoading(false);
    }
  }

  useEffect(() => {
    reloadData();
  }, []);

  const exportLaporan = async () => {
    try {
      const resp = await exportDailyFlow();
      const filename = `laporan_kartu_visitor_harian_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      downloadBlob(resp.data, filename);
    } catch (e) {
      const header = [
        "Nama Pemohon",
        "Instansi",
        "Nomor Pengajuan",
        "Tanggal Pinjam",
        "Tanggal Kembali",
        "Kondisi Kartu",
        "Status",
        "Petugas",
      ].join(",");
      const rows = dummyData.map((d) => {
        const status = getStatusKartu(d.tanggalKembali, {
          isActive: d.isActive,
          aksi: d.aksi,
        });
        return [
          d.nama,
          d.instansi,
          d.nomorPengajuan,
          d.tanggalPinjam || "-",
          d.tanggalKembali || "-",
          d.kondisi || "-",
          status,
          d.petugasSerah || d.petugas_serah || "-",
        ].join(",");
      });
      const csv = [header, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "laporan_kartu_visitor.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const openSerahPopup = (idx) => {
    setSelectedKey(rowKey(dummyData[idx]));
    setPopupType("serah");
    setShowPopup(true);
  };
  const openTerimaPopup = (idx) => {
    setSelectedKey(rowKey(dummyData[idx]));
    setPopupType("terima");
    setShowPopup(true);
  };
  const openTerimaPopupRead = (idx) => {
    setSelectedKey(rowKey(dummyData[idx]));
    setPopupType("terima-read");
    setShowPopup(true);
  };
  const openLaporanPopup = (idx, readonly = false) => {
    const r = dummyData[idx];
    setSelectedKey(rowKey(r));
    setLaporanKondisi(r.kondisi || "Baik");
    setLaporanAlasan(r.alasan || "");
    setLaporanPenanganan(r.penanganan || "");
    setReadonlyLaporan(readonly);
    setPopupType("laporan");
    setShowPopup(true);
  };

  const handleKonfirmasiSerah = async () => {
    const row = pickRowByKey(selectedKey);
    if (!row) return;

    let visitorCardId = findVisitorCardId(row);

    try {
      setSubmittingSerah(true);

      const condApi = mapConditionToAPI(row.kondisi || "Baik");

      const payload = {
        card_condition: condApi,
        condition: condApi,
        performed_by_name: namaPetugas,
      };
      if (visitorCardId) payload.visitor_card_id = visitorCardId;
      else if (row?.referenceNumber || row?.nomorPengajuan) {
        payload.reference_number = row?.referenceNumber || row?.nomorPengajuan;
      }

      const resp = await issueCard(payload);

      const tx = resp?.data?.data || resp?.data || {};
      const newTransactionId =
        tx.card_transaction_id ||
        tx.transaction_id ||
        tx.id ||
        tx?.transaction?.id ||
        null;

      const newVisitorCardId =
        tx.visitor_card_id ||
        tx.card_id ||
        tx.card?.id ||
        tx.visitor_card?.id ||
        tx.card?.visitor_card_id ||
        tx?.transaction?.visitor_card_id ||
        null;

      let resolvedVisitorCardId = newVisitorCardId || visitorCardId;
      if (!resolvedVisitorCardId && (newTransactionId || payload.reference_number)) {
        const fallbackId = await resolveVisitorCardIdFromActives({
          transactionId: newTransactionId,
          refNo: payload.reference_number,
        });
        if (fallbackId) resolvedVisitorCardId = fallbackId;
      }

      const refForIdMap = row?.referenceNumber || row?.nomorPengajuan;
      setIdsForReference(refForIdMap, {
        visitor_card_id: resolvedVisitorCardId || null,
        transaction_id: newTransactionId || null,
      });

      setDummyData((prev) =>
        prev.map((r) =>
          String(rowKey(r)) === String(selectedKey)
            ? {
                ...r,
                transactionId: newTransactionId ?? r.transactionId,
                aksi: "Serahkan Kartu",
                petugasSerah: namaPetugas,
                petugasPenyerah: namaPetugas,
                petugas_serah: namaPetugas,
                isActive: true,
                tanggalPinjam: new Date().toISOString().slice(0, 10),
                visitorCardId: resolvedVisitorCardId || r.visitorCardId || null,
                kondisi: r.kondisi || "Baik",
              }
            : r
        )
      );
      setShowPopup(false);

      cacheMeta(
        { ...row, visitorCardId: resolvedVisitorCardId || row.visitorCardId },
        {
          kondisi: row.kondisi,
          alasan: row.alasan,
          penanganan: row.penanganan,
        }
      );

      try {
        window.dispatchEvent(
          new CustomEvent("dashboard:changed", { detail: { type: "issued" } })
        );

        window.dispatchEvent(
          new CustomEvent("dashboard:increment", {
            detail: { field: "keluarHariIni", delta: 1 },
          })
        );
        window.dispatchEvent(new CustomEvent("riwayat:refresh"));
        notifyDirtyCards();
      } catch {}
      try {
        await reloadData({ ttl: 0 });
      } catch (_e) {}
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Gagal menyerahkan kartu.";
      if (
        e?.response?.status === 422 ||
        (e?.response?.data && typeof e.response.data === "object")
      ) {
        alert(
          msg +
            "\nPastikan backend menerima reference_number atau mengembalikan visitor_card_id pada respons issueCard."
        );
      } else {
        alert(msg);
      }
    } finally {
      setSubmittingSerah(false);
    }
  };

  const handleKonfirmasiTerima = async () => {
    const row = pickRowByKey(selectedKey);
    if (!row) return;

    let transactionId = row?.transactionId || row?.id || null;
    const refNo = row?.referenceNumber || row?.nomorPengajuan || null;
    const cardNo = row?.card_number || row?.cardNo || null;

    let visitorCardId = findVisitorCardId(row);

    const idFromMap = getIdsForReference(refNo);
    if (!visitorCardId && idFromMap?.visitor_card_id) visitorCardId = idFromMap.visitor_card_id;
    if (!transactionId && idFromMap?.transaction_id) transactionId = idFromMap.transaction_id;

    const buildPayload = (withVisitorId) => ({
      ...(withVisitorId && visitorCardId
        ? { visitor_card_id: visitorCardId }
        : {}),
      ...(transactionId
        ? {
            card_transaction_id: transactionId,
            transaction_id: transactionId,
          }
        : {}),
      ...(refNo ? { reference_number: refNo } : {}),
      card_condition: mapConditionToAPI(row.kondisi || "Baik"),
      condition: mapConditionToAPI(row.kondisi || "Baik"),
      notes: row.alasan || row.penanganan || "",
      returned_by_name: namaPetugas,
    });

    try {
      setSubmittingTerima(true);

      try {
        await returnCard(buildPayload(!!visitorCardId));
      } catch (err1) {
        const msg = err1?.response?.data?.message || "";
        const needsVisitorId =
          err1?.response?.status === 422 ||
          /visitor[_ ]?card[_ ]?id/i.test(msg);

        if (needsVisitorId && !visitorCardId) {
          visitorCardId = await resolveVisitorCardIdFromActives({
            transactionId,
            refNo,
            cardNo,
          });
          if (!visitorCardId) {
            alert(
              "Visitor Card ID tidak ditemukan.\n" +
                "Pastikan kartu sudah DISERAHKAN sebelumnya.\n" +
                "Jika backend memerlukan visitor_card_id, pastikan endpoint issueCard mengembalikannya."
            );
            setSubmittingTerima(false);
            return;
          }
          await returnCard(buildPayload(true));
        } else {
          throw err1;
        }
      }

      const normalized = normalizeConditionLabel(row.kondisi);
      const referenceForPatch =
        refNo || row?.nomorPengajuan || row?.referenceNumber;
      saveRiwayatPatch(referenceForPatch, normalized);
      broadcastRiwayatPatch(referenceForPatch, normalized);

      window.dispatchEvent(
        new CustomEvent("dashboard:changed", { detail: { type: "returned" } })
      );
      window.dispatchEvent(
        new CustomEvent("dashboard:increment", {
          detail: { field: "masukHariIni", delta: 1 },
        })
      );

      if (normalized === "Rusak") {
        window.dispatchEvent(
          new CustomEvent("dashboard:changed", { detail: { type: "damaged" } })
        );
        window.dispatchEvent(
          new CustomEvent("dashboard:increment", {
            detail: { field: "rusak", delta: 1 },
          })
        );
      } else if (normalized === "Hilang") {
        window.dispatchEvent(
          new CustomEvent("dashboard:changed", { detail: { type: "lost" } })
        );
        window.dispatchEvent(
          new CustomEvent("dashboard:increment", {
            detail: { field: "hilang", delta: 1 },
          })
        );
      }

      const todayISO = new Date().toISOString().slice(0, 10);
      const updatedRow = {
        ...row,
        aksi: "Terima Kartu",
        isActive: false,
        tanggalKembali: row.tanggalKembali || todayISO,
        visitorCardId: visitorCardId || row.visitorCardId || null,
        petugasPenerima: namaPetugas,
        petugas_penerima: namaPetugas,
        kondisi: row.kondisi || "Baik",
      };
      cacheMeta(updatedRow, {
        kondisi: updatedRow.kondisi,
        alasan: updatedRow.alasan,
        penanganan: updatedRow.penanganan,
      });

      setDummyData((prev) => prev.filter((r) => String(rowKey(r)) !== String(selectedKey)));
      setShowPopup(false);

      try {
        window.dispatchEvent(new CustomEvent("riwayat:refresh"));
        notifyDirtyCards();
      } catch {}

      try {
        if (refNo) {
          const map = loadIdMap();
          if (map[refNo]) {
            delete map[refNo];
            saveIdMap(map);
          }
        }
      } catch {}

      navigate("/admin/riwayat");
    } catch (e) {
      alert(
        e?.response?.data?.message || e?.message || "Gagal menerima kartu."
      );
    } finally {
      setSubmittingTerima(false);
    }
  };

  const handleSimpanLaporan = async () => {
    const row = pickRowByKey(selectedKey);
    if (!row) return;

    // Cari visitor_card_id
    let visitorCardId = findVisitorCardId(row);
    const refNo = row.referenceNumber || row.nomorPengajuan || null;

    if (!visitorCardId && refNo) {
      const idFromMap = getIdsForReference(refNo);
      visitorCardId = idFromMap?.visitor_card_id || null;
    }

    if (!visitorCardId && refNo) {
      try {
        visitorCardId = await resolveVisitorCardIdFromActives({
          refNo: refNo,
          transactionId: row.transactionId,
        });
      } catch (e) {
        console.warn("Gagal resolve visitor_card_id:", e);
      }
    }

    if (!visitorCardId) {
      alert(
        "Tidak dapat menemukan ID kartu visitor.\n\n" +
        "Pastikan kartu sudah DISERAHKAN terlebih dahulu sebelum melaporkan kondisi.\n\n" +
        "Jika masalah berlanjut, hubungi administrator."
      );
      return;
    }

    try {
      setSubmittingLaporan(true);

      const payload = {
        visitor_card_id: visitorCardId,
        notes: `${laporanAlasan}\n\nPenanganan: ${laporanPenanganan}`,
      };

      const normalized = normalizeConditionLabel(laporanKondisi);
      
      // Panggil API
      if (normalized === "Rusak") {
        await reportDamagedCard(payload);
        
        window.dispatchEvent(
          new CustomEvent("dashboard:changed", { detail: { type: "damaged" } })
        );
        window.dispatchEvent(
          new CustomEvent("dashboard:increment", { detail: { field: "rusak", delta: 1 } })
        );
        
      } else if (normalized === "Hilang") {
        await reportLostCard(payload);
        
        window.dispatchEvent(
          new CustomEvent("dashboard:changed", { detail: { type: "lost" } })
        );
        window.dispatchEvent(
          new CustomEvent("dashboard:increment", { detail: { field: "hilang", delta: 1 } })
        );
      }

      // ✅ PERBAIKAN: Update data LANGSUNG tanpa reload dari server
      const cacheKey = keyForRow(row);
      cacheMeta(cacheKey, {
        kondisi: laporanKondisi,
        alasan: laporanAlasan,
        penanganan: laporanPenanganan,
      });

      const refForPatch = refNo || row?.nomorPengajuan || row?.referenceNumber;
      saveRiwayatPatch(refForPatch, normalized);
      broadcastRiwayatPatch(refForPatch, normalized);

      // ✅ Update tampilan LANGSUNG (tidak tunggu server)
      setDummyData((prev) =>
        prev.map((r) =>
          String(rowKey(r)) === String(selectedKey)
            ? { 
                ...r, 
                kondisi: laporanKondisi, 
                alasan: laporanAlasan, 
                penanganan: laporanPenanganan,
                visitorCardId: visitorCardId
              }
            : r
        )
      );
      if (normalized === "Baik") {
        await reloadData({ ttl: 0 });
      }
      
      setShowPopup(false);
      alert("Laporan berhasil disimpan!");
      
    } catch (e) {
      const errorMsg = e?.response?.data?.message || e?.message || "Gagal menyimpan laporan kondisi.";
      console.error("Error saat menyimpan laporan:", e);
  
      if (errorMsg.includes("visitor card id")) {
        alert(
          "Gagal menyimpan laporan: ID kartu visitor tidak ditemukan.\n\n" +
          "Kemungkinan penyebab:\n" +
          "1. Kartu belum diserahkan ke pengunjung\n" +
          "2. Data kartu belum tersimpan di database\n\n" +
          "Silakan serahkan kartu terlebih dahulu, lalu coba lagi."
        );
      } else {
        alert(errorMsg);
      }
    } finally {
      setSubmittingLaporan(false);
    }
  };

  const selectedRow = pickRowByKey(selectedKey);

  return (
    <div className="min-h-screen flex bg-[#6A8BB0] font-poppins">
      {/* Sidebar */}
    <aside
      className="bg-[#E6E6E6] flex flex-col py-8 px-7 border-r border-[#eaeaea] h-screen fixed top-0 left-0 z-20"
      style={{ width: 360 }}
    >
      <img src={kaiLogo} alt="KAI Logo" className="w-[120px] mb-6 mx-auto" />

      <div className="text-[18px] font-poppins font-medium text-[#242424] text-center mb-7 leading-[20px]">
        Admin Panel Kartu Visitor
      </div>
      
      <div className="w-full flex justify-center mb-12">
        <div style={{ width: "100%", height: 2, background: "#C4C4C4", borderRadius: 2, margin: "0 auto" }} />
      </div>

      <nav className="flex flex-col gap-4 mt-2">
        {[
          { label: "Dashboard", icon: "streamline-plump:user-pin-remix", path: "/admin/dashboard" },
          { label: "Verifikasi & Persetujuan", icon: "streamline-sharp:time-lapse-solid", path: "/admin/verifikasi" },
          { label: "Kartu Visitor", icon: "solar:card-recive-outline", path: "/admin/kartu-visitor" },
          { label: "Riwayat Pengembalian", icon: "solar:card-search-broken", path: "/admin/riwayat" },
        ].map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-4 px-4 py-2 text-left transition-all hover:opacity-80
                ${
                  isActive
                    ? "bg-gradient-to-r from-[#6A8BB0] to-[#5E5BAD] text-white font-semibold rounded-[15px]"
                    : "bg-transparent text-[#474646] font-semibold hover:bg-gray-100 rounded-[15px]"
                } text-[17px]`}
              style={isActive ? { boxShadow: "0 2px 8px rgba(90,90,140,0.07)" } : {}}
            >
              <span className="flex items-center">
                <Icon icon={item.icon} width={32} height={32} />
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>

      <main
        className="flex-1 flex flex-col px-2 md:px-12 py-10 transition-all"
        style={{ marginLeft: 360, minHeight: "100vh", width: "100%" }}
      >
        <div className="flex gap-8 mb-10 flex-wrap">
          <div
            className="w-full max-w-[900px] flex items-center bg-white rounded-[20px] shadow-md px-8 py-4 relative mx-auto"
            style={{ minHeight: 70 }}
          >
            <span className="font-poppins font-semibold text-[24px] text-[#474646]">
              Kartu Visitor
            </span>
            <div
              className="relative ml-auto"
              style={{ minWidth: 200 }}
              ref={dropdownRef}
            >
              <div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  background: "rgba(106,139,176,0.13)",
                  borderRadius: 15,
                  zIndex: 0,
                }}
              />
              <button
                className="relative flex items-center gap-2 px-5 py-2 cursor-pointer z-10 hover:opacity-80 transition-opacity"
                style={{ borderRadius: 15, background: "transparent" }}
                onClick={() => setShowDropdown((p) => !p)}
              >
                <span className="w-[38px] h-[38px] rounded-full bg-[#6A8BB0] flex items-center justify-center text-white text-[24px] font-poppins font-semibold mr-2">
                  {(namaPetugas?.[0] || "A").toUpperCase()}
                </span>
                <span className="font-poppins font-medium text-[18px] leading-[36px] text-[#474646]">
                  {namaPetugas}
                </span>
              </button>

              {showDropdown && (
                <div className="absolute top-[62px] right-0 bg-white rounded-[12px] shadow-lg px-6 py-3 z-20 border min-w-[146px] flex items-center gap-3">
                  <Icon icon="ic:round-logout" width={34} color="#d61d1d" />
                  <button
                    className="w-full text-left text-[#474646] font-poppins font-medium text-[18px] py-2 hover:bg-[#F1F2F6] rounded-md transition-colors"
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full max-w-[900px] mx-auto">
          <div className="bg-white rounded-[20px] shadow-md px-0 py-0">
            <div className="flex items-center justify-between px-8 pt-8 pb-3">
              <span className="font-poppins font-medium text-[18px] text-[#474646]">
                Laporan Penyerahan & Pengembalian Kartu Harian
              </span>
              <button
                className="px-5 py-2 rounded-[8px] font-poppins font-medium text-white"
                style={{
                  background:
                    "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)",
                  fontWeight: 500,
                }}
                onClick={exportLaporan}
              >
                Export Laporan
              </button>
            </div>

            <div className="overflow-x-auto pb-8">
              <table className="w-full min-w-[730px]">
                <thead>
                  <tr style={{ background: "#F4F4F4" }}>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">
                      Nama<br />Pemohon
                    </th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">
                      Tanggal<br />Pinjam
                    </th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">
                      Tanggal<br />Kembali
                    </th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">
                      Kondisi<br />Kartu
                    </th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">
                      Keterangan
                    </th>
                    <th className="py-3 px-2 text-center font-poppins font-semibold text-[#474646] text-[16px]">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="py-6 text-center text-[#6b7280]">Memuat…</td></tr>
                  ) : dummyData.map((row, idx) => {
                    const statusAuto = getStatusKartu(row.tanggalKembali, {
                      isActive: row.isActive,
                      aksi: row.aksi,
                    });

                    const kondisiBtn = (
                      <button
                        className="font-poppins font-medium rounded-[7px]"
                        style={{
                          background:
                            (kondisiColor[row.kondisi] || "#ACB3BB") + "99",
                          color: "#212529",
                          fontWeight: 600,
                          minWidth: 90,
                          width: 110,
                          height: 36,
                          display: "inline-block",
                          whiteSpace: "nowrap",
                        }}
                        onClick={() =>
                          row.kondisi === "Baik"
                            ? openLaporanPopup(idx, false)
                            : openLaporanPopup(idx, true)
                        }
                        title={
                          row.kondisi === "Baik"
                            ? "Klik untuk ubah/laporkan kondisi"
                            : "Hanya baca (sudah dilaporkan)"
                        }
                      >
                        {row.kondisi}
                      </button>
                    );

                    const statusBtn = (
                      <span
                        className="font-poppins font-medium rounded-[7px] flex items-center justify-center"
                        style={{
                          background: statusColor[statusAuto],
                          color: "#fff",
                          fontWeight: 500,
                          minWidth: 90,
                          width: 120,
                          height: 36,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          whiteSpace: "nowrap",
                          fontSize:
                            statusAuto === "Belum diambil" ? 12.5 : 15,
                        }}
                        title={statusAuto}
                      >
                        {statusAuto}
                      </span>
                    );

                    let aksiBtn = null;
                    if (row.aksi === "Belum diambil") {
                      aksiBtn = (
                        <button
                          className="font-poppins font-medium rounded-[7px] flex items-center justify-center disabled:opacity-60"
                          style={{
                            background: aksiColor["Belum diambil"],
                            color: "#fff",
                            minWidth: 130,
                            height: 36,
                            fontSize: 15,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => openSerahPopup(idx)}
                          disabled={submittingSerah}
                        >
                          Serahkan Kartu
                        </button>
                      );
                    } else if (row.aksi === "Serahkan Kartu") {
                      aksiBtn = (
                        <button
                          className="font-poppins font-medium rounded-[7px] flex items-center justify-center disabled:opacity-60"
                          style={{
                            background: aksiColor["Serahkan Kartu"],
                            color: "#fff",
                            minWidth: 130,
                            height: 36,
                            fontSize: 15,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => openTerimaPopup(idx)}
                          disabled={submittingTerima}
                        >
                          Terima Kartu
                        </button>
                      );
                    } else if (row.aksi === "Terima Kartu") {
                      aksiBtn = (
                        <button
                          className="font-poppins font-medium rounded-[7px] flex items-center justify-center"
                          style={{
                            background: aksiColor["Terima Kartu"],
                            color: "#fff",
                            minWidth: 130,
                            height: 36,
                            fontSize: 15,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => openTerimaPopupRead(idx)}
                        >
                          Selesai
                        </button>
                      );
                    }

                    return (
                      <tr
                        key={row.id ?? idx}
                        className={idx % 2 === 0 ? "" : "bg-[#F8F8F8]"}
                      >
                        <td className="py-2 px-2 text-center font-poppins font-semibold text-[15px] text-[#474646]">
                          {row.nama}
                        </td>
                        <td className="py-2 px-2 text-center font-poppins font-medium text-[15px] text-[#474646]">
                          {row.tanggalPinjam
                            ? formatTanggal(row.tanggalPinjam)
                            : "-"}
                        </td>
                        <td className="py-2 px-2 text-center font-poppins font-medium text-[15px] text-[#474646]">
                          {row.tanggalKembali
                            ? formatTanggal(row.tanggalKembali)
                            : "-"}
                        </td>
                        <td className="py-2 px-2 text-center">{kondisiBtn}</td>
                        <td className="py-2 px-2 text-center">{statusBtn}</td>
                        <td className="py-2 px-2 text-center">{aksiBtn}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Popup
          show={showPopup && popupType === "serah"}
          title="Konfirmasi Penyerahan Kartu Visitor"
          onClose={() => setShowPopup(false)}
        >
          {selectedRow && (
            <>
              <DataSection title="Data Penerima Kartu" thick={2}>
                <Row label="Nama Lengkap" value={selectedRow.nama} />
                <Row label="Nomor Pengajuan" value={selectedRow.nomorPengajuan || "-"} />
                <Row label="Instansi" value={selectedRow.instansi || "-"} />
                <Row label="Tanggal Kunjungan" value={selectedRow.kunjungan || "-"} />
                <Row label="Email" value={selectedRow.email || "-"} />
              </DataSection>

              <BoxPetugas label="Petugas" value={namaPetugas} />

              <div className="flex justify-end gap-3 mt-5">
                <button
                  className="px-7 py-2 rounded-[7px] font-poppins font-medium text-white"
                  style={{ background: "#ACB3BB" }}
                  onClick={() => setShowPopup(false)}
                >
                  Kembali
                </button>
                <button
                  className="px-7 py-2 rounded-[7px] font-poppins font-medium text-white disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)",
                  }}
                  onClick={handleKonfirmasiSerah}
                  disabled={submittingSerah}
                >
                  {submittingSerah ? "Memproses..." : "Konfirmasi"}
                </button>
              </div>
            </>
          )}
        </Popup>

        <Popup
          show={showPopup && popupType === "terima"}
          title="Konfirmasi Penerimaan Kartu Visitor"
          onClose={() => setShowPopup(false)}
        >
          {selectedRow && (
            <>
              <DataSection title="Data Penerima Kartu" thick={2}>
                <Row label="Nama Lengkap" value={selectedRow.nama} />
                <Row label="Nomor Pengajuan" value={selectedRow.nomorPengajuan || "-"} />
                <Row label="Instansi" value={selectedRow.instansi || "-"} />
                <Row label="Tanggal Kunjungan" value={selectedRow.kunjungan || "-"} />
                <Row label="Email" value={selectedRow.email || "-"} />
              </DataSection>

              <BoxPetugas
                label="Petugas Penyerah"
                value={selectedRow.petugasSerah || selectedRow.petugas_serah || namaPetugas}
              />
              <BoxPetugas label="Petugas Penerima" value={namaPetugas} />

              <div className="flex justify-end gap-3 mt-5">
                <button
                  className="px-7 py-2 rounded-[7px] font-poppins font-medium text-white"
                  style={{ background: "#ACB3BB" }}
                  onClick={() => setShowPopup(false)}
                >
                  Kembali
                </button>
                <button
                  className="px-7 py-2 rounded-[7px] font-poppins font-medium text-white disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)",
                  }}
                  onClick={handleKonfirmasiTerima}
                  disabled={submittingTerima}
                >
                  {submittingTerima ? "Memproses..." : "Konfirmasi"}
                </button>
              </div>
            </>
          )}
        </Popup>

        <Popup
          show={showPopup && popupType === "terima-read"}
          title="Konfirmasi Penerimaan Kartu Visitor"
          onClose={() => setShowPopup(false)}
        >
          {selectedRow && (
            <>
              <DataSection title="Data Penerima Kartu" thick={2}>
                <Row label="Nama Lengkap" value={selectedRow.nama} />
                <Row label="Nomor Pengajuan" value={selectedRow.nomorPengajuan || "-"} />
                <Row label="Instansi" value={selectedRow.instansi || "-"} />
                <Row label="Tanggal Kunjungan" value={selectedRow.kunjungan || "-"} />
                <Row label="Email" value={selectedRow.email || "-"} />
              </DataSection>

              <BoxPetugas
                label="Petugas Penyerah"
                value={selectedRow.petugasSerah || selectedRow.petugas_serah || namaPetugas}
              />
              <BoxPetugas label="Petugas Penerima" value={namaPetugas} />

              <div className="flex justify-end gap-3 mt-5">
                <button
                  className="px-7 py-2 rounded-[7px] font-poppins font-medium text-white"
                  style={{ background: "#ACB3BB" }}
                  onClick={() => setShowPopup(false)}
                >
                  Kembali
                </button>
              </div>
            </>
          )}
        </Popup>

        <Popup
          show={showPopup && popupType === "laporan"}
          title="Laporan Kartu Rusak/Hilang"
          onClose={() => setShowPopup(false)}
        >
          {selectedRow && (
            <>
              <DataSection title="Laporan Kartu" thick={3}>
                <Row label="Nama Lengkap" value={selectedRow.nama} />
                <Row label="Instansi" value={selectedRow.instansi || "-"} />
                <Row label="Tanggal Kunjungan" value={formatTanggal(selectedRow.tanggalPinjam)} />
                <div
                  className="py-2 flex gap-2 text-[14.5px]"
                  style={{
                    borderBottom: "1px solid rgba(208,205,205,0.56)",
                  }}
                >
                  <div className="min-w-[150px] text-[#474646] font-poppins font-medium">
                    Kondisi Kartu
                  </div>
                  <div className="text-[#474646] font-poppins font-medium">
                    :{" "}
                    {readonlyLaporan ? (
                      <span>{selectedRow.kondisi}</span>
                    ) : (
                      <select
                        className="rounded-[7px] px-3 py-2 font-poppins"
                        style={{
                          minWidth: 110,
                          background: "#F7F7F7",
                          border:
                            "1px solid rgba(208,205,205,0.56)",
                        }}
                        value={laporanKondisi}
                        onChange={(e) =>
                          setLaporanKondisi(e.target.value)
                        }
                      >
                        <option value="Baik">Baik</option>
                        <option value="Hilang">Hilang</option>
                        <option value="Rusak">Rusak</option>
                      </select>
                    )}
                  </div>
                </div>
                <Row label="Petugas" value={namaPetugas} />
              </DataSection>

              <div
                className="mb-2 font-poppins font-medium"
                style={{ color: "#474646" }}
              >
                Alasan :
              </div>
              <textarea
                className="w-full rounded-[7px] px-3 py-2 font-poppins mb-3"
                style={{
                  minHeight: 70,
                  background: "#F7F7F7",
                  border: "1px solid rgba(208,205,205,0.56)",
                }}
                value={laporanAlasan}
                onChange={(e) => setLaporanAlasan(e.target.value)}
                disabled={readonlyLaporan}
              />
                            <div
                className="mb-2 font-poppins font-medium"
                style={{ color: "#474646" }}
              >
                Penanganan :
              </div>
              <textarea
                className="w-full rounded-[7px] px-3 py-2 font-poppins mb-4"
                style={{
                  minHeight: 70,
                  background: "#F7F7F7",
                  border: "1px solid rgba(208,205,205,0.56)",
                }}
                value={laporanPenanganan}
                onChange={(e) => setLaporanPenanganan(e.target.value)}
                disabled={readonlyLaporan}
              />

              <div className="flex justify-end gap-3 mt-3">
                <button
                  className="px-7 py-2 rounded-[7px] font-poppins font-medium text-white"
                  style={{ background: "#ACB3BB" }}
                  onClick={() => setShowPopup(false)}
                >
                  Kembali
                </button>
                {!readonlyLaporan && (
                  <button
                    className="px-7 py-2 rounded-[7px] font-poppins font-medium text-white disabled:opacity-60"
                    style={{
                      background:
                        "linear-gradient(90deg, #6A8BB0 0%, #5E5BAD 100%)",
                    }}
                    onClick={handleSimpanLaporan}
                    disabled={submittingLaporan}
                  >
                    {submittingLaporan ? "Menyimpan..." : "Simpan"}
                  </button>
                )}
              </div>
            </>
          )}
        </Popup>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;900&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
        th, td { vertical-align: middle !important; }
      `}</style>
    </div>
  );
}