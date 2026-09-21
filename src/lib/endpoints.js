import api, { unwrap } from "./api";

// ==========================================
// AUTH
// ==========================================
export const authApi = {
  register: (payload) => unwrap(api.post("/auth/register", payload)),
  login: (email, password) => unwrap(api.post("/auth/login", { email, password })),
  refresh: () => unwrap(api.post("/auth/refresh")),
  logout: () => unwrap(api.post("/auth/logout")),
  me: () => unwrap(api.get("/auth/me")),
  // Addition (see backend-additions/): update basic profile info / avatar
  updateMe: (payload) => unwrap(api.patch("/users/me", payload)),
};

// ==========================================
// ATHLETE PROFILE
// ==========================================
export const athleteProfileApi = {
  create: (payload) => unwrap(api.post("/athletes", payload)),
  getMine: () => unwrap(api.get("/athletes/me")),
  update: (payload) => unwrap(api.patch("/athletes/me", payload)),
  getPublic: (userId) => unwrap(api.get(`/athletes/${userId}`)),
  // Addition: discovery/search
  search: (params) => unwrap(api.get("/athletes", { params })),
};

// ==========================================
// ACHIEVEMENTS
// ==========================================
export const achievementApi = {
  create: (payload) => unwrap(api.post("/achievements", payload)),
  getMine: () => unwrap(api.get("/achievements/mine")),
  update: (id, payload) => unwrap(api.patch(`/achievements/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/achievements/${id}`)),
  getPublic: (userId) => unwrap(api.get(`/achievements/public/${userId}`)),
};

// ==========================================
// CERTIFICATES
// ==========================================
export const certificateApi = {
  create: (payload) => unwrap(api.post("/certificates", payload)),
  getMine: () => unwrap(api.get("/certificates/mine")),
  update: (id, payload) => unwrap(api.patch(`/certificates/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/certificates/${id}`)),
  getPublic: (userId) => unwrap(api.get(`/certificates/public/${userId}`)),
};

// ==========================================
// ATHLETE VIDEOS
// ==========================================
export const videoApi = {
  create: (payload) => unwrap(api.post("/athlete-videos", payload)),
  getMine: () => unwrap(api.get("/athlete-videos/mine")),
  update: (id, payload) => unwrap(api.patch(`/athlete-videos/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/athlete-videos/${id}`)),
  getPublic: (userId) => unwrap(api.get(`/athlete-videos/public/${userId}`)),
  view: (id) => unwrap(api.post(`/athlete-videos/${id}/view`)),
};

// ==========================================
// ORGANIZATIONS
// ==========================================
export const organizationApi = {
  create: (payload) => unwrap(api.post("/organizations", payload)),
  getById: (id) => unwrap(api.get(`/organizations/${id}`)),
  getMine: () => unwrap(api.get("/organizations/mine")),
  update: (id, payload) => unwrap(api.patch(`/organizations/${id}`, payload)),
  addMember: (id, userId, role) => unwrap(api.post(`/organizations/${id}/members`, { userId, role })),
  // Addition: discovery
  search: (params) => unwrap(api.get("/organizations", { params })),
};

// ==========================================
// EVENTS
// ==========================================
export const eventApi = {
  create: (payload) => unwrap(api.post("/events", payload)),
  getById: (id) => unwrap(api.get(`/events/${id}`)),
  getForOrganization: (organizationId) => unwrap(api.get(`/events/organization/${organizationId}`)),
  update: (id, payload) => unwrap(api.patch(`/events/${id}`, payload)),
  publish: (id) => unwrap(api.post(`/events/${id}/publish`)),
  remove: (id) => unwrap(api.delete(`/events/${id}`)),
  // Addition: public discovery feed
  browse: (params) => unwrap(api.get("/events", { params })),
};

// ==========================================
// APPLICATIONS
// ==========================================
export const applicationApi = {
  create: (payload) => unwrap(api.post("/applications", payload)),
  getMine: () => unwrap(api.get("/applications/mine")),
  getById: (id) => unwrap(api.get(`/applications/${id}`)),
  getForEvent: (eventId, status) =>
    unwrap(api.get(`/applications/event/${eventId}`, { params: status ? { status } : {} })),
  updateStatus: (id, status, organizationNote) =>
    unwrap(api.patch(`/applications/${id}/status`, { status, organizationNote })),
  withdraw: (id) => unwrap(api.post(`/applications/${id}/withdraw`)),
};

// ==========================================
// VERIFICATION
// ==========================================
export const verificationApi = {
  submit: (payload) => unwrap(api.post("/verifications", payload)),
  getMine: () => unwrap(api.get("/verifications/mine")),
  getPending: () => unwrap(api.get("/verifications/pending")),
  review: (id, payload) => unwrap(api.patch(`/verifications/${id}/review`, payload)),
};

// ==========================================
// UPLOADS (Addition â€” see backend-additions/)
// ==========================================
export const uploadApi = {
  upload: (file, folder = "general") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    return unwrap(
      api.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },
};
// ==========================================
// CONNECTIONS
// ==========================================

export const connectionApi = {
  mine: () =>
    unwrap(
      api.get("/connections")
    ),

  suggestions: (params) =>
    unwrap(
      api.get(
        "/connections/suggestions",
        { params }
      )
    ),

  request: (userId) =>
    unwrap(
      api.post(
        `/connections/${userId}`
      )
    ),

  accept: (id) =>
    unwrap(
      api.patch(
        `/connections/${id}/accept`
      )
    ),

  reject: (id) =>
    unwrap(
      api.patch(
        `/connections/${id}/reject`
      )
    ),

  remove: (id) =>
    unwrap(
      api.delete(
        `/connections/${id}`
      )
    ),
};

// ==========================================
// MESSAGES
// ==========================================

export const messageApi = {
  createConversation: (
    recipientId
  ) =>
    unwrap(
      api.post(
        "/messages/conversations",
        {
          recipientId,
        }
      )
    ),

  conversations: () =>
    unwrap(
      api.get(
        "/messages/conversations"
      )
    ),

  messages: (conversationId) =>
    unwrap(
      api.get(
        `/messages/conversations/${conversationId}/messages`
      )
    ),

  send: (
    conversationId,
    payload
  ) =>
    unwrap(
      api.post(
        `/messages/conversations/${conversationId}/messages`,
        payload
      )
    ),

  markRead: (
    conversationId
  ) =>
    unwrap(
      api.patch(
        `/messages/conversations/${conversationId}/read`
      )
    ),
};

