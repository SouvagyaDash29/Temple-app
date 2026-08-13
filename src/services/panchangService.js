// src/services/panchangService.js
// Reads panchang/festival data from the public GitHub repo. No auth needed.
//
// Repo layout observed:
//   {state}/{year}/{month}.json                     e.g. gujarat/2025/june.json
//   {state}/{panji}/{year}/{month}.json              e.g. odisha/biraja_panji/2025/june.json
//   {state}/calender/{year}/{month}.json             odisha's plain-calendar fallback
//
// A state either has years directly under it (no panji choice) or has one
// or more named panji folders + a "calender" folder for "no panji" users.
export const GITHUB_PANCHANG_BASE_URL =
    'https://raw.githubusercontent.com/AtomwalkCodeBase/Blogs/main/hindu-panchang-data';

const MONTH_FILENAMES = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
];

// No-panji states use "calender" as the implicit folder name inside a
// panji-style state (matches the odisha/calender/2026 example). States
// without any panji concept at all just skip straight to /{year}/{month}.
const DEFAULT_CALENDAR_FOLDER = 'calender';

function monthFileName(monthIndex /* 0-11 */) {
    return `${MONTH_FILENAMES[monthIndex]}.json`;
}

function buildUrl(parts) {
    return `${GITHUB_PANCHANG_BASE_URL}/${parts.filter(Boolean).join('/')}`;
}

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        const err = new Error(`Not found: ${url}`);
        err.status = response.status;
        throw err;
    }
    return response.json();
}

/**
 * Fetches one month of panchang data for the given preference.
 * preference: { state: 'odisha', panji: 'jagannath_panji' | null }
 * year: e.g. 2026, monthIndex: 0-11
 *
 * Resolution order:
 *   1. {state}/{panji}/{year}/{month}.json   — if a panji is chosen
 *   2. {state}/{year}/{month}.json           — state has no panji layer
 *   3. {state}/calender/{year}/{month}.json  — state has panji layer but
 *                                               user wants the plain calendar
 * Returns {} (empty map) if nothing is found, so the UI can fall back to a
 * plain date grid with no festival data rather than erroring out.
 */
export async function fetchMonthPanchang({ state, panji }, year, monthIndex) {
    if (!state) return {};
    const file = monthFileName(monthIndex);

    const candidates = panji
        ? [buildUrl([state, panji, String(year), file])]
        : [
            buildUrl([state, String(year), file]),
            buildUrl([state, DEFAULT_CALENDAR_FOLDER, String(year), file]),
        ];

    for (const url of candidates) {
        try {
            return await fetchJson(url);
        } catch (err) {
            if (err.status && err.status !== 404) throw err; // real error, don't swallow
            // 404 -> try next candidate
        }
    }
    return {};
}

/**
 * Lists available states. There's no index endpoint in the repo, so this is
 * maintained here — update as new state folders are added to the repo.
 * If you'd rather not hardcode this, replace with a call to the GitHub
 * Contents API (api.github.com/repos/.../contents/hindu-panchang-data).
 */
export const AVAILABLE_STATES = [
    { key: 'gujarat', label: 'Gujarat', panjis: [] },
    { key: 'karnataka', label: 'Karnataka', panjis: [] },
    { key: 'kerala', label: 'Kerala', panjis: [] },
    { key: 'maharashtra', label: 'Maharashtra', panjis: [] },
    { key: 'westbengal', label: 'West Bengal', panjis: [] },
    { key: 'tamilnadu', label: 'Tamil Nadu', panjis: [] },
    {
        key: 'odisha',
        label: 'Odisha',
        panjis: [
            { key: 'biraja_panji', label: 'Biraja Panji' },
            { key: 'jagannath_panji', label: 'Jagannath Panji' },
        ],
    },
];

export async function listStatesFromGithub() {
    // Optional dynamic alternative to AVAILABLE_STATES using GitHub's API
    // (rate-limited to 60 req/hr unauthenticated — fine for occasional use,
    // not for calling on every screen open).
    const url =
        'https://api.github.com/repos/AtomwalkCodeBase/Blogs/contents/hindu-panchang-data';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Could not load the list of states.');
    const entries = await response.json();
    return entries.filter((e) => e.type === 'dir').map((e) => e.name);
}

export default { GITHUB_PANCHANG_BASE_URL, fetchMonthPanchang, AVAILABLE_STATES, listStatesFromGithub };