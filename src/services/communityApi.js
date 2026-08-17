// src/services/communityApi.js
// Placeholder backend contract for groups/communities. Swap BASE paths for
// your real endpoints once they exist — screens/hooks only depend on this
// file's shape, never on raw URLs.
//
// Suggested backend model to build toward:
//   Group { id, name, description, coverImage, isPrivate, memberCount, createdBy }
//   Membership { groupId, customerId, role: 'owner'|'admin'|'member', joinedAt }
//   GroupEvent { id, groupId, title, date, ... }  -- reuses the same event
//   shape as personal events, just scoped to a group instead of a user.
// A full feed/posts/comments layer is future work beyond this scaffold.
// import { apiClient } from './apiClient';

// export const communityApi = {
//   list: (search = '') => apiClient.get(`/groups${search ? `?search=${encodeURIComponent(search)}` : ''}`),
//   getById: (id) => apiClient.get(`/groups/${id}`),
//   create: ({ name, description, isPrivate }) => apiClient.post('/groups', { name, description, is_private: isPrivate }),
//   join: (id) => apiClient.post(`/groups/${id}/join`),
//   leave: (id) => apiClient.post(`/groups/${id}/leave`),
// };

// export default communityApi;


// src/services/communityApi.js
// Placeholder backend contract for groups/communities, backed by dummy
// data for now so the UI is fully testable before a real backend exists.
// Flip USE_MOCK_DATA to false once your endpoints are ready — every
// function's return shape already matches what the real API should send.
//
// Suggested backend model to build toward:
//   Group { id, name, description, coverImage, isPrivate, memberCount, createdBy }
//   Membership { groupId, customerId, role: 'owner'|'admin'|'member', joinedAt }
//   GroupEvent { id, groupId, title, date, ... }  -- reuses the same event
//   shape as personal events, just scoped to a group instead of a user.
// See docs/community-schema.md for full JSON Schema definitions.
import { apiClient } from './apiClient';

const USE_MOCK_DATA = true;
const PAGE_SIZE = 10;

const MOCK_GROUPS = [
  { id: 'g1', name: 'Jagannath Devotees - Bengaluru', description: 'Weekly bhajans & Rath Yatra planning', isPrivate: false, memberCount: 482, isMember: true },
  { id: 'g2', name: 'Biraja Panji Followers', description: 'Odisha calendar & festival discussions', isPrivate: false, memberCount: 231, isMember: false },
  { id: 'g3', name: 'Ekadashi Vrat Circle', description: 'Fasting reminders and recipe sharing', isPrivate: false, memberCount: 918, isMember: false },
  { id: 'g4', name: 'ISKCON Bengaluru Volunteers', description: 'Seva coordination for temple events', isPrivate: true, memberCount: 76, isMember: false },
  { id: 'g5', name: 'Kerala Temple Festivals', description: 'Pooram, Vishu & local utsavam updates', isPrivate: false, memberCount: 354, isMember: false },
  { id: 'g6', name: 'Ganesh Chaturthi Bengaluru', description: 'Pandal locations & visarjan routes', isPrivate: false, memberCount: 1204, isMember: true },
  { id: 'g7', name: 'Tamil Panchangam Readers', description: 'Daily tithi & rahu kalam discussion', isPrivate: false, memberCount: 167, isMember: false },
  { id: 'g8', name: 'Bengali Durga Puja Committee', description: 'Pandal-hopping plans & puja schedule', isPrivate: true, memberCount: 289, isMember: false },
  { id: 'g9', name: 'Gujarat Navratri Garba Group', description: 'Garba nights & dandiya meetups', isPrivate: false, memberCount: 673, isMember: false },
  { id: 'g10', name: 'Maharashtra Ganpati Mandal', description: 'Mandal decoration & aarti timings', isPrivate: false, memberCount: 542, isMember: false },
  { id: 'g11', name: 'Karnataka Temple Trust Volunteers', description: 'Cleanliness drives & annadanam', isPrivate: true, memberCount: 98, isMember: false },
  { id: 'g12', name: 'Jagannath Panji Odisha', description: 'Traditional panji-based festival dates', isPrivate: false, memberCount: 412, isMember: false },
  { id: 'g13', name: 'Shiva Bhakts Unite', description: 'Monday fasting & temple visit planning', isPrivate: false, memberCount: 789, isMember: false },
  { id: 'g14', name: 'Family Puja Planners', description: 'Coordinate home pujas across family members', isPrivate: true, memberCount: 34, isMember: true },
  { id: 'g15', name: 'Krishna Janmashtami Circle', description: 'Dahi handi events & midnight aarti', isPrivate: false, memberCount: 601, isMember: false },
  { id: 'g16', name: 'South Indian Devotees Abroad', description: 'Festival celebrations for the diaspora', isPrivate: false, memberCount: 1523, isMember: false },
  { id: 'g17', name: 'Ayyappa Sabarimala Pilgrims', description: 'Mandala kalam vratam support group', isPrivate: false, memberCount: 445, isMember: false },
  { id: 'g18', name: 'Hanuman Chalisa Daily Readers', description: 'Daily paath reminders & discussion', isPrivate: false, memberCount: 890, isMember: false },
  { id: 'g19', name: 'Temple Kitchen Volunteers', description: 'Prasad preparation coordination', isPrivate: true, memberCount: 52, isMember: false },
  { id: 'g20', name: 'West Bengal Kali Puja Group', description: 'Diwali & Kali Puja celebrations', isPrivate: false, memberCount: 376, isMember: false },
  { id: 'g21', name: 'Vedic Astrology & Panchang', description: 'Muhurat timing discussions', isPrivate: false, memberCount: 267, isMember: false },
  { id: 'g22', name: 'Youth Bhajan Mandali', description: 'Weekly bhajan practice for young devotees', isPrivate: false, memberCount: 143, isMember: false },
  { id: 'g23', name: 'Diaspora Diwali Committee', description: 'Community Diwali event planning', isPrivate: true, memberCount: 61, isMember: false },
  { id: 'g24', name: 'Temple Renovation Fundraisers', description: 'Donation drives & progress updates', isPrivate: false, memberCount: 198, isMember: false },
  { id: 'g25', name: 'Sanskrit Shloka Learners', description: 'Learn and recite shlokas together', isPrivate: false, memberCount: 322, isMember: false },
];

function paginate(list, page, limit) {
  const start = (page - 1) * limit;
  const items = list.slice(start, start + limit);
  return { groups: items, page, hasMore: start + limit < list.length, total: list.length };
}

export const communityApi = {
  /** page: 1-based. Returns { groups, page, hasMore, total }. */
  list: async (search = '', page = 1, limit = PAGE_SIZE) => {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 250)); // simulate network latency
      const filtered = search
        ? MOCK_GROUPS.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
        : MOCK_GROUPS;
      return paginate(filtered, page, limit);
    }
    return apiClient.get(
      `/groups?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`
    );
  },

  getById: (id) => {
    if (USE_MOCK_DATA) return Promise.resolve(MOCK_GROUPS.find((g) => g.id === id) || null);
    return apiClient.get(`/groups/${id}`);
  },

  create: ({ name, description, isPrivate }) => {
    if (USE_MOCK_DATA) {
      const created = { id: `g_${Date.now()}`, name, description, isPrivate, memberCount: 1, isMember: true };
      MOCK_GROUPS.unshift(created);
      return Promise.resolve(created);
    }
    return apiClient.post('/groups', { name, description, is_private: isPrivate });
  },

  join: (id) => (USE_MOCK_DATA ? Promise.resolve({ ok: true }) : apiClient.post(`/groups/${id}/join`)),
  leave: (id) => (USE_MOCK_DATA ? Promise.resolve({ ok: true }) : apiClient.post(`/groups/${id}/leave`)),
};

export default communityApi;
