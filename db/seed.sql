-- ============================================================
--  샘플 데이터 (식당 + 메뉴). schema.sql 실행 후 실행한다.
-- ============================================================

INSERT INTO restaurants (name, category, description, image_url, address, delivery_fee, min_order_amount, rating) VALUES
('황금올리브치킨', '치킨', '바삭한 후라이드와 매콤달콤 양념치킨 전문점', '🍗', '서울시 강남구 역삼동 123-1', 3000, 15000, 4.7),
('마포분식',       '분식', '떡볶이·김밥·튀김이 맛있는 동네 분식집',     '🍢', '서울시 마포구 서교동 45-6',  2000,  8000, 4.5),
('나폴리피자',     '피자', '화덕에 구운 정통 나폴리 스타일 피자',       '🍕', '서울시 강남구 역삼동 77',    3500, 18000, 4.6),
('하루카페',       '카페', '핸드드립 커피와 수제 디저트',               '☕', '서울시 서초구 서초동 12-3',  2500, 10000, 4.8);

-- 배달 가능 지역(동)
INSERT INTO restaurant_areas (restaurant_id, dong) VALUES
((SELECT id FROM restaurants WHERE name='황금올리브치킨'), '역삼동'),
((SELECT id FROM restaurants WHERE name='황금올리브치킨'), '삼성동'),
((SELECT id FROM restaurants WHERE name='황금올리브치킨'), '대치동'),
((SELECT id FROM restaurants WHERE name='마포분식'),       '서교동'),
((SELECT id FROM restaurants WHERE name='마포분식'),       '합정동'),
((SELECT id FROM restaurants WHERE name='마포분식'),       '망원동'),
((SELECT id FROM restaurants WHERE name='나폴리피자'),     '역삼동'),
((SELECT id FROM restaurants WHERE name='나폴리피자'),     '서초동'),
((SELECT id FROM restaurants WHERE name='하루카페'),       '서초동'),
((SELECT id FROM restaurants WHERE name='하루카페'),       '역삼동'),
((SELECT id FROM restaurants WHERE name='하루카페'),       '방배동');

-- 치킨
INSERT INTO menus (restaurant_id, name, description, price, image_url) VALUES
((SELECT id FROM restaurants WHERE name='황금올리브치킨'), '후라이드치킨', '겉바속촉 기본 후라이드', 18000, '🍗'),
((SELECT id FROM restaurants WHERE name='황금올리브치킨'), '양념치킨',     '매콤달콤 양념',         19000, '🍗'),
((SELECT id FROM restaurants WHERE name='황금올리브치킨'), '반반치킨',     '후라이드 반 양념 반',   19000, '🍗'),
((SELECT id FROM restaurants WHERE name='황금올리브치킨'), '콜라 1.25L',   '시원한 콜라',           2000, '🥤');

-- 분식
INSERT INTO menus (restaurant_id, name, description, price, image_url) VALUES
((SELECT id FROM restaurants WHERE name='마포분식'), '떡볶이',   '쫄깃한 떡과 매운 소스', 4000, '🍢'),
((SELECT id FROM restaurants WHERE name='마포분식'), '김밥',     '야채김밥',             3500, '🍙'),
((SELECT id FROM restaurants WHERE name='마포분식'), '순대',     '쫄깃한 순대 한 접시',   5000, '🍢'),
((SELECT id FROM restaurants WHERE name='마포분식'), '모둠튀김', '오징어·고구마·김말이',  4000, '🍤'),
((SELECT id FROM restaurants WHERE name='마포분식'), '라면',     '얼큰한 라면',           4500, '🍜');

-- 피자
INSERT INTO menus (restaurant_id, name, description, price, image_url) VALUES
((SELECT id FROM restaurants WHERE name='나폴리피자'), '마르게리타', '토마토·모짜렐라·바질', 16000, '🍕'),
((SELECT id FROM restaurants WHERE name='나폴리피자'), '페퍼로니',   '페퍼로니 듬뿍',       19000, '🍕'),
((SELECT id FROM restaurants WHERE name='나폴리피자'), '고르곤졸라', '꿀에 찍어 먹는 피자',  20000, '🍕'),
((SELECT id FROM restaurants WHERE name='나폴리피자'), '콜라 500ml', '시원한 콜라',          2000, '🥤');

-- 카페
INSERT INTO menus (restaurant_id, name, description, price, image_url) VALUES
((SELECT id FROM restaurants WHERE name='하루카페'), '아메리카노', '진한 에스프레소', 4500, '☕'),
((SELECT id FROM restaurants WHERE name='하루카페'), '카페라떼',   '부드러운 우유거품', 5000, '☕'),
((SELECT id FROM restaurants WHERE name='하루카페'), '치즈케이크', '꾸덕한 수제 치즈케이크', 6500, '🍰'),
((SELECT id FROM restaurants WHERE name='하루카페'), '크로플',     '바삭한 크로플', 6000, '🧇');
