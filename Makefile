# 로컬 개발용 단축 명령 (make 가 설치된 환경: Linux/Mac/WSL/Git Bash)
# Windows 에 make 가 없으면 아래 npm 스크립트를 그대로 사용:
#   npm run db:up / db:down / db:init / db:setup

up:        ## DB 컨테이너 기동
	docker compose -f db/docker-compose.yml up -d

down:      ## DB 컨테이너 종료
	docker compose -f db/docker-compose.yml down

init:      ## 스키마 + 시드 적용
	node --env-file=.env.local db/init-db.mjs

reset:     ## DB 완전 초기화(볼륨 삭제 후 재기동)
	docker compose -f db/docker-compose.yml down -v
	docker compose -f db/docker-compose.yml up -d

setup: up init  ## 기동 + 초기화 한 번에

.PHONY: up down init reset setup
