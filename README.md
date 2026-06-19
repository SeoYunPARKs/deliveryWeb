# 🛵 맛나배달 (Matna Delivery)

컴퓨터과학개론(111873-101) 기말 프로젝트 — **Next.js 풀스택 + PostgreSQL** 로 만든 배달 주문 웹.

회원가입 → 로그인 → 식당·메뉴 → 장바구니 → 주문 → 주문내역 → 로그아웃까지 한 바퀴가 동작합니다.

## ✨ 필수 기능
- 회원가입 / 로그인 / 로그아웃 (이메일·비밀번호)
- 식당·메뉴 목록 (DB 조회) + **카테고리 필터**
- 장바구니 담기 (수량 조절·삭제)
- 주문하기 (DB 저장, 트랜잭션)
- 내 주문 내역 보기 + **주문 상태**(접수/배달중/완료) 표시

## ➕ 추가 기능
- **회원 역할**: 가입 시 손님/사장님 선택 (`users.role`)
- **입력 검증**: 이메일 형식, 비밀번호 강도(8자+대소문자+특수문자), 연락처 형식 + 자동 하이픈
- **사장님 페이지**: 가게 등록(주소·배달지역 포함) + 메뉴 등록/삭제 (`/owner`)
- **동(洞)별 배달지역**: 우리 동네에 배달 가능한 가게만 노출
- **리뷰**: 주문한 손님만 별점(1~5)+내용 작성, 본인 리뷰 수정/삭제
- **배달/포장 선택**: 포장 시 주소 면제·배달비 0
- **장바구니 옵션**: 항목별 옵션/요청 편집, "메뉴 더 담기"

## 🧰 기술 스택
| 구분 | 사용 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, TypeScript) 풀스택 |
| 스타일 | Tailwind CSS v4 |
| DB | PostgreSQL — 로컬 Docker / 운영 Neon |
| DB 드라이버 | `pg` (node-postgres) |
| 인증 | `bcryptjs`(해시) + `jose`(JWT, httpOnly 쿠키) |
| 로컬 실행 | Docker (`make up`/`make down` 또는 npm 스크립트) |
| 배포 | Vercel |

## 📁 폴더 구조
```
.
├─ app/                     # Next.js 앱 (= Vercel 배포 대상)
│  ├─ page.tsx              # 식당 목록(홈)
│  ├─ login/ , signup/      # 인증 페이지
│  ├─ restaurants/[id]/     # 식당 상세 + 메뉴 + 리뷰
│  ├─ cart/                 # 장바구니 + 주문(배달/포장)
│  ├─ orders/               # 내 주문 내역
│  ├─ owner/                # 사장님: 대시보드/가게등록/메뉴관리
│  ├─ api/                  # 백엔드 (Route Handlers)
│  │  ├─ auth/{signup,login,logout,me}/
│  │  ├─ restaurants/ , restaurants/[id]/menus/ , menus/[id]/
│  │  ├─ restaurants/[id]/reviews/
│  │  └─ orders/            # 주문 생성 (POST)
│  ├─ lib/                  # db, auth, validation, types, format
│  └─ components/           # Header, Providers, Cart/Auth Provider, MenuList, ReviewSection, OwnerMenuManager
├─ db/                      # 데이터베이스
│  ├─ schema.sql            # 테이블 정의
│  ├─ seed.sql              # 샘플 식당·메뉴
│  ├─ docker-compose.yml    # 로컬 Postgres
│  ├─ init-db.mjs           # 스키마+시드 적용 스크립트
│  └─ ERD.md                # ★ DB 구조도 + "왜 이렇게 나눴나"
├─ docs/bug-log.md          # 막혔던 버그 3개 + 해결
├─ Makefile                 # make up / down / init / setup
└─ .env.example
```

## 🏗️ 아키텍처 메모 (영상 설명용)
- **읽기(목록·상세·주문내역)** → **서버 컴포넌트**가 `app/lib/db.ts` 로 DB를 직접 조회 (SSR).
- **쓰기·인증(회원가입/로그인/주문)** → **API Route Handler** 에서 처리.
- **인증**: 로그인 시 사용자 정보를 JWT로 서명해 **httpOnly 쿠키**에 저장(stateless). 서버리스(Vercel)는 인스턴스 간 메모리를 공유하지 않으므로 세션을 서버 메모리가 아닌 쿠키에 둔다.
- **주문 가격**: 클라이언트가 보낸 금액을 믿지 않고 **DB에서 다시 조회·계산**한 뒤, `orders`+`order_items`를 **하나의 트랜잭션**으로 저장.

## 💻 로컬 실행
> 전제: Node 20+, Docker Desktop 실행 중

```bash
npm install
# .env.local 생성 (.env.example 복사 후 값 확인)
#   Windows PowerShell:  Copy-Item .env.example .env.local
npm run db:setup     # Postgres 컨테이너 기동 + 스키마/시드 적용
npm run dev          # http://localhost:3000
```
`make` 가 있는 환경이면 `make setup` 으로 대체 가능.

### npm 스크립트
| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` / `start` | 프로덕션 빌드 / 실행 |
| `npm run db:up` / `db:down` | DB 컨테이너 기동 / 종료 |
| `npm run db:init` | 스키마+시드 적용 |
| `npm run db:setup` | up + init 한 번에 |
| `npm run db:reset` | DB 볼륨 삭제 후 재기동(완전 초기화) |

## 🔐 환경 변수 (`.env.local`)
```
DATABASE_URL=postgres://delivery:delivery@localhost:5432/deliveryapp
JWT_SECRET=<길고 무작위한 문자열>
```

## 🚀 배포 (Vercel + Neon)
1. **Neon**: 프로젝트 생성 → **Pooled** connection string 복사 → SQL Editor 에서 `db/schema.sql`, `db/seed.sql` 실행.
2. **Vercel**: 이 GitHub 저장소 Import → 환경 변수 설정
   - `DATABASE_URL` = Neon Pooled URL (`...-pooler...?sslmode=require`)
   - `JWT_SECRET` = 길고 무작위한 문자열
3. **Deploy** → 공개 URL 확인.

## 📄 함께 보기
- [DB 구조도 / 왜 이렇게 나눴나 — db/ERD.md](db/ERD.md)
- [막혔던 버그 3개 — docs/bug-log.md](docs/bug-log.md)
