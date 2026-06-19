-- ============================================================
--  배달앱 데이터베이스 스키마 (PostgreSQL)
--  주의: 기존 테이블을 DROP 후 재생성하는 "초기화" 스크립트.
--        운영 DB(Neon)에는 최초 1회만 실행한다.
-- ============================================================

DROP TABLE IF EXISTS reviews          CASCADE;
DROP TABLE IF EXISTS restaurant_areas CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders      CASCADE;
DROP TABLE IF EXISTS menus       CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS users       CASCADE;

-- 회원 : 이메일/비밀번호 로그인. role 로 손님/사장님 구분
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,   -- 로그인 ID, 중복 불가
  password_hash VARCHAR(255) NOT NULL,          -- bcrypt 해시 (평문 저장 금지)
  name          VARCHAR(100) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'customer', -- customer | owner
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 식당 : owner_id 로 등록한 사장님 연결 (시드 데이터는 NULL = 플랫폼 제공)
CREATE TABLE restaurants (
  id               SERIAL PRIMARY KEY,
  owner_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name             VARCHAR(150) NOT NULL,
  category         VARCHAR(50)  NOT NULL,
  description      TEXT,
  image_url        TEXT,
  address          VARCHAR(255),                -- 가게 주소
  delivery_fee     INTEGER NOT NULL DEFAULT 0,
  min_order_amount INTEGER NOT NULL DEFAULT 0,
  rating           NUMERIC(2,1) NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 배달 가능 지역 : 식당 1 : N 동(洞)
CREATE TABLE restaurant_areas (
  id            SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  dong          VARCHAR(50) NOT NULL
);

-- 메뉴 : 식당 1 : N 메뉴
CREATE TABLE menus (
  id            SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          VARCHAR(150) NOT NULL,
  description   TEXT,
  price         INTEGER NOT NULL,
  image_url     TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 주문(헤더) : "한 번의 주문" = 한 행. 회원 1 : N 주문
CREATE TABLE orders (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  order_type    VARCHAR(10)  NOT NULL DEFAULT 'delivery', -- delivery | takeout
  total_amount  INTEGER NOT NULL,
  status        VARCHAR(20)  NOT NULL DEFAULT 'received',  -- received | delivering | completed
  address       VARCHAR(255) NOT NULL,
  phone         VARCHAR(30)  NOT NULL,                     -- 연락처 필수
  request       VARCHAR(50),                               -- 요청사항 (최대 50자)
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 주문상세 : 주문 1 : N 메뉴줄. 주문 시점 이름/단가/옵션 스냅샷
CREATE TABLE order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id    INTEGER REFERENCES menus(id),
  menu_name  VARCHAR(150) NOT NULL,        -- 주문 시점 이름 스냅샷
  unit_price INTEGER NOT NULL,             -- 주문 시점 단가 스냅샷
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  options    VARCHAR(100)                  -- 선택 옵션/요청 스냅샷 (예: "덜 맵게")
);

-- 리뷰 : 손님이 식당에 남김. 식당 1 : N 리뷰
CREATE TABLE reviews (
  id            SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content       VARCHAR(500) NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 자주 조회되는 외래키 인덱스
CREATE INDEX idx_menus_restaurant   ON menus(restaurant_id);
CREATE INDEX idx_orders_user        ON orders(user_id);
CREATE INDEX idx_order_items_order  ON order_items(order_id);
CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_restaurants_owner  ON restaurants(owner_id);
CREATE INDEX idx_areas_dong         ON restaurant_areas(dong);
CREATE INDEX idx_areas_restaurant   ON restaurant_areas(restaurant_id);
