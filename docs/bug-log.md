# 막혔던 지점 3개 + 해결 방법

> 과제 제출 문서/영상 ③의 근거. 아래는 **이 프로젝트를 만들며 실제로 만난** 에러들이다.
> 영상에서는 이 중 **본인이 가장 잘 설명할 수 있는 1개**를 골라 에러 메시지 → 원인 → 해결을 화면으로 보여주면 된다.

---

## 버그 1. `create-next-app` 이 한글 폴더명에서 실패
**에러 메시지**
```
Could not create a project called "컴퓨터과학개론 기말 프로젝트" because of npm naming restrictions:
* name can only contain URL-friendly characters
```
**원인**
프로젝트를 현재 폴더(`.`)에 생성하면 `create-next-app` 이 **폴더 이름을 npm 패키지 이름으로** 쓰려고 한다.
npm 패키지 이름은 소문자·URL 안전 문자만 허용하는데, 폴더명이 한글 + 공백이라 규칙 위반이 됐다.

**해결**
영문 이름의 하위 폴더에 먼저 생성한 뒤 내용물을 루트로 옮겼다.
```bash
npx create-next-app@latest deliveryweb --ts --tailwind --app --skip-install
# deliveryweb/ 안의 파일을 루트로 이동 후 deliveryweb/ 삭제
```
`package.json` 의 `"name"` 도 `deliveryweb`(영문)으로 들어가 정상 동작.

---

## 버그 2. Next.js 16 빌드 실패 — `next.config.ts` 의 `eslint` 키
**에러 메시지**
```
⚠ `eslint` configuration in next.config.ts is no longer supported.
Type error: Object literal may only specify known properties,
and 'eslint' does not exist in type 'NextConfig'.
```
**원인**
배포 시 ESLint 경고로 빌드가 막히지 않게 하려고 `next.config.ts` 에 `eslint: { ignoreDuringBuilds: true }` 를 넣었다.
하지만 **Next.js 16부터는 빌드와 lint가 분리**되어 이 옵션 자체가 사라졌고, 타입에도 없어 빌드가 깨졌다.

**해결**
해당 키를 제거했다. Next 16은 `next build` 가 더 이상 ESLint로 막히지 않으므로 옵션이 필요 없다.
(타입 검사는 그대로 유지되어 실제 타입 오류는 빌드에서 잡힌다.)

---

## 버그 3. `docker compose` 연결 실패 — Docker 데몬 미실행
**에러 메시지**
```
unable to get image 'postgres:16-alpine': failed to connect to the docker API at
npipe:////./pipe/dockerDesktopLinuxEngine ... The system cannot find the file specified.
```
**원인**
`docker` CLI 는 설치돼 있었지만 **Docker Desktop(데몬)이 실행 중이 아니어서** 컨테이너를 띄울 수 없었다.
CLI 가 깔려 있다고 데몬이 떠 있는 것은 아니다.

**해결**
Docker Desktop 을 먼저 실행하고 데몬이 준비될 때까지 기다린 뒤 `npm run db:setup` 을 다시 실행했다.
이후 Postgres 컨테이너가 정상 기동되고 스키마/시드가 적용됐다.

---

## (심화) 더 깊게 설명하고 싶다면
- **서버리스 세션**: Vercel은 요청마다 다른 함수 인스턴스가 처리해 서버 메모리를 공유하지 않는다. 그래서 세션을 서버 메모리에 두지 않고 **JWT를 httpOnly 쿠키**에 담아 stateless 로 처리했다. (`app/lib/auth.ts`)
- **주문 트랜잭션**: `orders` 와 `order_items` 를 따로 INSERT 하다 중간에 실패하면 "헤더만 있고 내역 없는" 깨진 주문이 남는다. 그래서 `BEGIN ... COMMIT/ROLLBACK` 으로 묶었다. (`app/api/orders/route.ts`)
