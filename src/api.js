import axios from "axios";

export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

export const ORIGIN = API_BASE.replace(/\/api\/?$/, "");

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const absoluteStorageURL = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const clean = String(path).replace(/^\/+/, "");
  const finalPath =
    clean.startsWith("storage/") || clean.startsWith("uploads/")
      ? clean
      : `storage/${clean}`;
  return `${ORIGIN}/${finalPath}`;
};

const http = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

const __getCache = new Map();
function makeKey(url, params) {
  const p = params ? stableStringifyParams(params) : "";
  return `${url}?${p}`;
}
function stableStringifyParams(obj) {
  if (obj == null) return "";
  if (typeof obj !== "object") return String(obj);
  if (Array.isArray(obj)) return JSON.stringify(obj.map(stableStringifyParams));
  const keys = Object.keys(obj).sort();
  const res = {};
  for (const k of keys) res[k] = obj[k];
  return JSON.stringify(res);
}
export async function cachedGet(url, { params, ttl = 60000, cfg = {} } = {}) {
  const key = makeKey(url, params);
  const now = Date.now();
  const hit = __getCache.get(key);
  if (hit && now - hit.t <= ttl) return hit.res;
  const res = await http.get(url, { params, ...cfg });
  __getCache.set(key, { t: now, res });
  const MAX_CACHE = 200;
  if (__getCache.size > MAX_CACHE) {
    const firstKey = __getCache.keys().next().value;
    __getCache.delete(firstKey);
  }
  return res;
}

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
    http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete http.defaults.headers.common["Authorization"];
  }
};
export const loadTokenFromStorage = () => {
  const t = localStorage.getItem("token");
  if (t) http.defaults.headers.common["Authorization"] = `Bearer ${t}`;
  return t;
};
loadTokenFromStorage();

http.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  if (!config.headers.Authorization && !config.headers["Authorization"]) {
    const t = localStorage.getItem("token");
    if (t) {
      config.headers.Authorization = `Bearer ${t}`;
      config.headers["Authorization"] = `Bearer ${t}`;
    }
  }
  return config;
});
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) setAuthToken(null);
    return Promise.reject(err);
  }
);

export async function fetchDocumentBlob(pathOrId, cfg = {}) {
  if (!pathOrId) throw new Error("Path dokumen kosong.");

  const candidates = [
    ["/admin/documents/download", { path: pathOrId }],
    ["/public/documents/download", { path: pathOrId }],
  ];
  for (const [endpoint, params] of candidates) {
    try {
      return await http.get(endpoint, {
        ...cfg,
        params,
        responseType: "blob",
      });
    } catch {}
  }

  const token = localStorage.getItem("token");
  const url = absoluteStorageURL(pathOrId);
  return axios.get(url, {
    responseType: "blob",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    ...cfg,
  });
}
export function filenameFromHeaders(resp, fallback = "dokumen") {
  const cd =
    resp?.headers?.["content-disposition"] ||
    resp?.headers?.["Content-Disposition"];
  if (cd) {
    const m = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(cd);
    if (m) return decodeURIComponent(m[1] || m[2]);
  }
  return fallback;
}

//public 
export async function getVisitTypeMap() {
  const res = await getVisitTypes();
  const arr = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
  const map = {};
  arr.forEach((t) => {
    if (t?.id != null)
      map[String(t.id)] = t.name || t.title || t.nama || t.type_name || "-";
  });
  return map;
}
export const getVisitTypes = () => http.get(`/public/visit-types`);
export const getStations = () => http.get(`/public/stations`);
export const submitVisitorCard = (data) => http.post(`/public/visitor-cards`, data);
export const getVisitorCard = (id) => http.get(`/public/visitor-cards/${id}`);
export const checkStatus = (data) => http.post(`/public/check-status`, data);
export const getVisitorCardDetail = (id) => http.get(`/public/visitor-cards/${id}/detail`);
export const getStatusLogs = () => http.get(`/public/status-logs`);


export async function cancelApplication(payload = {}) {
  const ref =
    payload.reference_number ??
    payload.reference ??
    payload.id ??
    payload.nomor ??
    payload.ref;
  const body = { ...(payload || {}) };
  if (ref) body.reference_number = ref;
  return http.post(`/public/cancel-application`, body);
}

export const resubmitApplication = (data) =>
  http.post(`/public/resubmit-application`, data);

// admin
export const adminLogin = (data) => http.post(`/admin/login`, data);
export const adminLogout = () => http.post(`/admin/logout`);
export const getAdminMe = () => http.get(`/admin/me`);

export const getActiveVisitors = () => http.get(`/admin/dashboard/active-visitors`);
export const getPendingCount = () => http.get(`/admin/dashboard/pending-count`);
export const getTodayIssued = () => cachedGet(`/admin/dashboard/today-issued`, { ttl: 60000 });
export const getTodayReturned = () => cachedGet(`/admin/dashboard/today-returned`, { ttl: 60000 });

export const getDamagedCards = (opts = {}) => {
  const ttl = opts.ttl ?? 60000;
  if (typeof cachedGet === "function") {
    return cachedGet(`/admin/dashboard/damaged-cards`, {
      ttl,
      params: { _ts: Date.now() },
      cfg: { headers: { "Cache-Control": "no-cache" } },
    });
  }
  const url = `/admin/dashboard/damaged-cards?_ts=${Date.now()}`;
  return http.get(url, { headers: { "Cache-Control": "no-cache" } }).then((r) => r);
};
export const getLostCards = (opts = {}) => {
  const ttl = opts.ttl ?? 60000;
  if (typeof cachedGet === "function") {
    return cachedGet(`/admin/dashboard/lost-cards`, {
      ttl,
      params: { _ts: Date.now() },
      cfg: { headers: { "Cache-Control": "no-cache" } },
    });
  }
  const url = `/admin/dashboard/lost-cards?_ts=${Date.now()}`;
  return http.get(url, { headers: { "Cache-Control": "no-cache" } }).then((r) => r);
};

export const getApprovedCards = (opts = {}) => {
  const ttl = opts.ttl ?? 60000;
  const params = { _ts: Date.now(), ...(opts.params || {}) };
  if (typeof cachedGet === "function") {
    return cachedGet(`/admin/cards/approved`, {
      ttl,
      params,
      cfg: { headers: { "Cache-Control": "no-cache" } },
    });
  }
  return http.get(`/admin/cards/approved`, {
    params,
    headers: { "Cache-Control": "no-cache" },
  });
};
export const getActiveCards = (opts = {}) => {
  const ttl = opts.ttl ?? 0;
  const params = { _ts: Date.now(), ...(opts.params || {}) };
  if (typeof cachedGet === "function") {
    return cachedGet(`/admin/cards/active`, {
      ttl,
      params,
      cfg: { headers: { "Cache-Control": "no-cache" } },
    });
  }
  return http.get(`/admin/cards/active`, {
    params,
    headers: { "Cache-Control": "no-cache" },
  });
};

export const getVerifications = (params) => http.get(`/admin/verification`, { params });
export const getPendingVerifications = () => http.get(`/admin/verification/pending`);

const _unwrapList = (res) =>
  Array.isArray(res?.data) ? res.data : res?.data?.data || [];

const _pushUnique = (bucket, seen, items) => {
  for (const it of items || []) {
    const key =
      it?.reference_number ||
      it?.reference ||
      it?.ref_no ||
      it?.id ||
      JSON.stringify(it);
    if (!seen.has(key)) {
      seen.add(key);
      bucket.push(it);
    }
  }
};


export const getVerificationsAll = async (extraParams = {}) => {
  // Quick path: try the main combined endpoint first — if backend supports it,
  // this avoids firing many alternative endpoints and speeds up clients.
  try {
    const mainRes = await cachedGet(`/admin/verification`, { params: extraParams, ttl: 60000 });
    const mainList = Array.isArray(mainRes?.data) ? mainRes.data : mainRes?.data?.data || [];
    if (mainList && mainList.length) return { data: mainList };
  } catch (_) {}
  const results = [];
  const seen = new Set();

  const candidates = [
    ["/admin/verification/pending",   {}],
    ["/admin/verification/approved",  {}],
    ["/admin/verification/rejected",  {}],

    ["/admin/verification/cancelled", {}],
    ["/admin/verification/canceled",  {}],
    ["/admin/verification",           { status: "cancelled" }],
    ["/admin/verification",           { status: "canceled"   }],

    ["/admin/verification/all",       {}],
    ["/admin/verification",           {}],
  ];

  const settled = await Promise.allSettled(
    candidates.map(([url, params]) =>
      cachedGet(url, {
        params: { ...extraParams, ...params },
        ttl: 60000,
      })
    )
  );

  for (const s of settled) {
    if (s.status === "fulfilled") {
      _pushUnique(results, seen, _unwrapList(s.value));
    }
  }

  return { data: results };
};

export async function fetchOptionLists() {
  const res = await http.get('/public/options', {
    params: {
      groups:
        'assistance_service,access_door,access_purpose,protokoler_count,need_protokoler_escort',
    },
  });
  return res.data?.data || {};
}

export const getVerificationDetail = (data) => http.post(`/admin/verification/detail`, data);
export const approveVerification = (data) => http.post(`/admin/verification/approve`, data);
export const rejectVerification = (data) => http.post(`/admin/verification/reject`, data);
export const bulkVerificationAction = (data) => http.post(`/admin/verification/bulk-action`, data);

export const getApprovedCardsLegacy = () => http.get(`/admin/cards/approved`);
export const getReturnedCards = (opts = {}) => {
  const ttl = opts.ttl ?? 60000;
  if (typeof cachedGet === 'function') {
    return cachedGet(`/admin/cards/returned`, { ttl, params: { _ts: Date.now() } });
  }
  return http.get(`/admin/cards/returned`);
};
export const issueCard = (data) => http.post(`/admin/cards/issue`, data);
export const returnCard = (data) => http.post(`/admin/cards/return`, data);
export const editCardCondition = (id, data) => http.put(`/admin/cards/${id}/condition`, data);
export const updateVisitorCard = (id, data) => http.put(`/admin/visitor-cards/${id}`, data);

const blobOpts = { responseType: "blob" };
export const exportStationDailyFlow = () => http.get(`/admin/reports/station-daily-flow`, blobOpts);
export const exportAll = () => http.get(`/admin/reports/export-all`, blobOpts);
export const exportDailyFlow = () => http.get(`/admin/reports/daily-flow`, blobOpts);
export const exportWeeklyFlow = () => http.get(`/admin/reports/weekly-flow`, blobOpts);
export const exportMonthlyFlow = () => http.get(`/admin/reports/monthly-flow`, blobOpts);
export const exportYearlyFlow = () => http.get(`/admin/reports/yearly-flow`, blobOpts);
export const exportCardCondition = () => http.get(`/admin/reports/card-condition`, blobOpts);

export const adminVisitorCards = {
  list:   () => http.get(`/admin/visitor-cards`),
  get:    (id) => http.get(`/admin/visitor-cards/${id}`),
  create: (data) => http.post(`/admin/visitor-cards`, data),
  update: (id, data) => http.put(`/admin/visitor-cards/${id}`, data),
  delete: (id) => http.delete(`/admin/visitor-cards/${id}`),
};
export const adminCardTransactions = {
  list:   () => http.get(`/admin/card-transactions`),
  get:    (id) => http.get(`/admin/card-transactions/${id}`),
  create: (data) => http.post(`/admin/card-transactions`, data),
  update: (id, data) => http.put(`/admin/card-transactions/${id}`, data),
  delete: (id) => http.delete(`/admin/card-transactions/${id}`),
};
export const adminStatusLogs = {
  list:   () => http.get(`/admin/status-logs`),
  get:    (id) => http.get(`/admin/status-logs/${id}`),
  create: (data) => http.post(`/admin/status-logs`, data),
  update: (id, data) => http.put(`/admin/status-logs/${id}`, data),
  delete: (id) => http.delete(`/admin/status-logs/${id}`),
};
export const adminStations = {
  list:   () => http.get(`/admin/stations`),
  get:    (id) => http.get(`/admin/stations/${id}`),
  create: (data) => http.post(`/admin/stations`, data),
  update: (id, data) => http.put(`/admin/stations/${id}`, data),
  delete: (id) => http.delete(`/admin/stations/${id}`),
};
export const adminVisitTypes = {
  list:   () => http.get(`/admin/visit-types`),
  get:    (id) => http.get(`/admin/visit-types/${id}`),
  create: (data) => http.post(`/admin/visit-types`, data),
  update: (id, data) => http.put(`/admin/visit-types/${id}`, data),
  delete: (id) => http.delete(`/admin/visit-types/${id}`),
};
export const adminUsers = {
  list:   () => http.get(`/admin/users`),
  get:    (id) => http.get(`/admin/users/${id}`),
  create: (data) => http.post(`/admin/users`, data),
  update: (id, data) => http.put(`/admin/users/${id}`, data),
  delete: (id) => http.delete(`/admin/users/${id}`),
};
export const adminNotifications = {
  list:   () => http.get(`/admin/notifications`),
  get:    (id) => http.get(`/admin/notifications/${id}`),
  create: (data) => http.post(`/admin/notifications`, data),
  update: (id, data) => http.put(`/admin/notifications/${id}`, data),
  delete: (id) => http.delete(`/admin/notifications/${id}`),
};

export const healthCheck = () => http.get(`/health`);

export default http;
