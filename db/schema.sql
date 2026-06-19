-- ============================================================
--  배달앱 데이터베이스 스키마 (PostgreSQL)
--  주의: 이 스크립트는 기존 테이블을 DROP 후 재생성하는 "초기화" 스크립트다.
--        운영 DB(Neon)에는 최초 1회만 실행한다.
-- ============================================================

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders      CASCADE;
DROP TABLE IF EXISTS menus       CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS users       CASCADE;

-- 회원 : 이메일/비밀번호 로그인
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,   -- 로그인 ID, 중복 불가
  password_hash VARCHAR(255) NOT NULL,          -- bcrypt 해시 (평문 저장 금지)
  name          VARCHAR(100) NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 식당
CREATE TABLE restaurants (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(150) NOT NULL,
  category         VARCHAR(50)  NOT NULL,        -- 치킨/분식/피자/카페 ...
  description      TEXT,
  image_url        TEXT,                         -- 데모에서는 이모지 사용
  delivery_fee     INTEGER NOT NULL DEFAULT 0,   -- 배달비(원)
  min_order_amount INTEGER NOT NULL DEFAULT 0,   -- 최소주문금액(원)
  rating           NUMERIC(2,1) NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 메뉴 : 식당 1 : N 메뉴
CREATE TABLE menus (
  id            SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          VARCHAR(150) NOT NULL,
  description   TEXT,
  price         INTEGER NOT NULL,                -- 단가(원)
  image_url     TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 주문(헤더) : "한 번의 주문" = 한 행. 회원 1 : N 주문
CREATE TABLE orders (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  total_amount  INTEGER NOT NULL,                       -- 메뉴합계 + 배달비
  status        VARCHAR(20) NOT NULL DEFAULT 'received', -- received | delivering | completed
  address       VARCHAR(255) NOT NULL,                  -- 배달 주소
  phone         VARCHAR(30),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 주문상세 : 주문 1 : N 메뉴줄.
--  ★ menu_name, unit_price 를 "주문 시점 값"으로 스냅샷 저장한다.
--    → 나중에 메뉴 가격/이름이 바뀌어도 과거 주문 내역은 그대로 보존된다.
CREATE TABLE order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id    INTEGER REFERENCES menus(id),          -- 메뉴가 삭제돼도 내역은 남도록 NULL 허용
  menu_name  VARCHAR(150) NOT NULL,                 -- 주문 시점 이름 스냅샷
  unit_price INTEGER NOT NULL,                      -- 주문 시점 단가 스냅샷
  quantity   INTEGER NOT NULL CHECK (quantity > 0)
);

-- 자주 조회되는 외래키에 인덱스
CREATE INDEX idx_menus_restaurant   ON menus(restaurant_id);
CREATE INDEX idx_orders_user        ON orders(user_id);
CREATE INDEX idx_order_items_order  ON order_items(order_id);
