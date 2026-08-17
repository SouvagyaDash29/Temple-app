# Community Backend Schema

Reference JSON Schema definitions and the REST contract for the communities /
groups feature. The app's `src/services/communityApi.js` is the single place
that talks to these endpoints — screens and hooks depend only on its shape,
never on raw URLs.

## Conventions

- All IDs are opaque strings (UUID v4 recommended).
- All timestamps are ISO 8601 UTC strings, e.g. `2026-08-17T09:30:00.000Z`.
- List endpoints are paginated. See [Pagination](#pagination).
- Errors use the standard envelope below.

### Error envelope

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Group g_123 does not exist"
  }
}
```

### Pagination

Every list response uses this envelope:

```json
{
  "items": [ ],
  "page": 1,
  "pageSize": 10,
  "total": 482,
  "totalPages": 49,
  "hasMore": true
}
```

Query parameters on list requests:

| Param    | Type    | Default | Notes                          |
|----------|---------|---------|--------------------------------|
| `page`   | integer | 1       | 1-based                        |
| `limit`  | integer | 10      | Max 50                         |
| `search` | string  |         | Case-insensitive substring on `name` |

## Models

### Group

```json
{
  "id": "g_abc123",
  "name": "Jagannath Devotees - Bengaluru",
  "description": "Weekly bhajans & Rath Yatra planning",
  "coverImage": "https://cdn.example.com/covers/abc.jpg",
  "isPrivate": false,
  "memberCount": 482,
  "createdBy": "c_001",
  "createdAt": "2026-01-05T10:00:00.000Z"
}
```

### Membership

Links a customer to a group.

```json
{
  "groupId": "g_abc123",
  "customerId": "c_001",
  "role": "owner",
  "joinedAt": "2026-01-05T10:15:00.000Z"
}
```

`role` is one of `owner | admin | member`.

### GroupEvent

Reuses the same event shape as personal events, scoped to a group instead of
a user. A user joins the group to see its events on their calendar.

```json
{
  "id": "e_xyz789",
  "groupId": "g_abc123",
  "title": "Ratha Yatra road-side puja",
  "type": "group",
  "date": "2026-07-24",
  "startTime": "09:00",
  "location": "MG Road, Bengaluru",
  "createdBy": "c_001",
  "createdAt": "2026-06-01T08:00:00.000Z"
}
```

## Endpoints

### Groups

| Method | Path                  | Description                          |
|--------|-----------------------|--------------------------------------|
| GET    | `/groups`             | List groups (paginated, searchable)  |
| POST   | `/groups`             | Create a group                       |
| GET    | `/groups/{id}`        | Get a single group                   |
| PATCH  | `/groups/{id}`        | Update group (name/description/cover)|
| DELETE | `/groups/{id}`        | Delete group (owner only)            |
| POST   | `/groups/{id}/join`   | Join a group                         |
| POST   | `/groups/{id}/leave`  | Leave a group                        |
| GET    | `/groups/{id}/members`| Member list (paginated)              |
| GET    | `/groups/{id}/events` | Group events (paginated)             |

### Create a group

`POST /groups`

```json
{
  "name": "Krishna Janmashtami Circle",
  "description": "Dahi handi events & midnight aarti",
  "coverImage": null,
  "isPrivate": false
}
```

Response: `201 Created` with the created `Group`, plus a `Membership` record
for the creator with `role: "owner"`.

### Join / leave

`POST /groups/{id}/join` returns `200` with:

```json
{ "membership": { "groupId": "g_abc123", "customerId": "c_001", "role": "member", "joinedAt": "2026-08-17T09:30:00.000Z" } }
```

`POST /groups/{id}/leave` returns `200` with `{ "ok": true }`. Leaving a
group whose `memberCount` reaches zero deletes the membership only; the group
itself persists.

## Access rules

- Public groups are listable and joinable by any authenticated customer.
- Private groups (`isPrivate: true`) are invisible in listings unless the
  requester is already a member.
- Only `owner` / `admin` roles may update the group or manage members.
- Only the `owner` may delete the group.
