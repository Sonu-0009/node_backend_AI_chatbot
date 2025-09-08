# Curl examples

All commands assume server at `http://localhost:8000`. JWT-only: send `Authorization: Bearer <token>`.

```bash
# Health
curl -i http://localhost:8000/health

# Auth
curl -i -X POST http://localhost:8000/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"pass","mobile":"123","gender":"M"}'

TOKEN=$(curl -sS -X POST http://localhost:8000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"pass"}' | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{console.log(JSON.parse(s).token)})")
echo "JWT: ${TOKEN:0:20}..."

curl -i -X POST http://localhost:8000/auth/create-admin \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"pass","mobile":"123","gender":"M"}'

curl -i -X POST http://localhost:8000/auth/logout

# Protected
curl -i http://localhost:8000/protected-jwt/me -H "Authorization: Bearer $TOKEN"
curl -i http://localhost:8000/protected-jwt/admin-stats -H "Authorization: Bearer $TOKEN"
curl -i http://localhost:8000/protected-jwt/super-admin-data -H "Authorization: Bearer $TOKEN"
curl -i http://localhost:8000/protected-jwt/all-users -H "Authorization: Bearer $TOKEN"

# Users chat
curl -i -X POST http://localhost:8000/users_chat/message \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"text":"Hello"}'

curl -i http://localhost:8000/users_chat/history -H "Authorization: Bearer $TOKEN"

# Guest chat
curl -i -X POST http://localhost:8000/guest_chat/message/guest123 \
  -H 'Content-Type: application/json' \
  -d '{"text":"Hi"}'

curl -i http://localhost:8000/guest_chat/history/guest123

# Forms
curl -i -X POST http://localhost:8000/forms/create \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Survey","description":"desc","fields":[{"type":"text","label":"Name","id":"q1"}]}'

curl -i http://localhost:8000/forms/all

curl -i 'http://localhost:8000/forms?page=1&page_size=10&search=Sur' -H "Authorization: Bearer $TOKEN"

curl -i http://localhost:8000/forms/<FORM_ID> -H "Authorization: Bearer $TOKEN"

curl -i http://localhost:8000/forms/<FORM_ID>/summary -H "Authorization: Bearer $TOKEN"

curl -i -X DELETE http://localhost:8000/forms/<FORM_ID> -H "Authorization: Bearer $TOKEN"

# Form responses
curl -i -X POST http://localhost:8000/form_responses/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"form_id":"<FORM_ID>","answers":{"q1":"John"}}'

curl -i -X POST http://localhost:8000/form_responses/submit_public \
  -H 'Content-Type: application/json' \
  -d '{"form_id":"<FORM_ID>","answers":[{"id":"q1","answer":"Jane"}]}'

curl -i http://localhost:8000/form_responses/<FORM_ID>/my -H "Authorization: Bearer $TOKEN"
```

## JWT auth flow

```bash
# 1) Login to get JWT (bcrypt-protected password)
TOKEN=$(curl -sS -X POST http://localhost:8000/auth/login-jwt \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"p"}' \
  | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{console.log(JSON.parse(s).token)})")
echo "JWT: ${TOKEN:0:20}..."

# 2) Access JWT-protected route (/protected-jwt/me)
curl -i http://localhost:8000/protected-jwt/me \
  -H "Authorization: Bearer $TOKEN"

# 3) Role-gated (example): super admin only (JWT)
# Requires a token issued for a user with role=super_admin
curl -i http://localhost:8000/protected-jwt/super-admin-data \
  -H "Authorization: Bearer $TOKEN"
```

## Admin session → short-lived API token

```bash
# 1) Admin logs in (session cookie)
curl -i -X POST http://localhost:8000/auth/login -c admin.txt -b admin.txt \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"p"}'

# 2) Mint a 30m JWT from session
ADMIN_TOKEN=$(curl -sS -X POST http://localhost:8000/auth/token -c admin.txt -b admin.txt \
  -H 'Content-Type: application/json' \
  | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{console.log(JSON.parse(s).token)})")
echo "Admin JWT: ${ADMIN_TOKEN:0:20}..."

# 3) Call JWT-protected admin route (example)
curl -i http://localhost:8000/protected-jwt/me \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```


