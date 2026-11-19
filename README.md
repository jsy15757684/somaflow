# SOMAFLOW PT STUDIO (소마플로우) 공식 웹사이트

마포구 대흥동 1:1 맞춤 웰니스 스튜디오 **소마플로우(SOMAFLOW)** 홍보 웹사이트입니다.  
피지오맵([https://physiomap.kr/somaflowPT](https://physiomap.kr/somaflowPT))의 공식 정보와 실제 스튜디오 시설 고해상도 사진을 바탕으로 최신 웰니스 브랜딩 트렌드를 반영하여 제작되었습니다.

---

## 🌿 브랜드 아이덴티티 & 디자인 컨셉
- **Slogan**: "몸과 마음의 본질적인 흐름(Flow)을 회복하는 시간"
- **Color Mood**: 리치 포레스트 그린(`--color-forest-deep`), 세이지 그린(`--color-sage`), 소프트 아이보리/크림(`--color-bg-ivory`), 어스 웜 클레이(`--color-clay`)
- **Typography**: Pretendard(국문 최적 가독성) + Plus Jakarta Sans(영문 하이엔드 웰니스 감성)
- **Key Characteristics**:
  - 물리치료사 출신 대표 강사의 해부학적 전문성
  - Level 0(가장 낮은 단계)부터 시작하는 안전한 맞춤 설계
  - 100% 프라이빗 1:1 예약제 독립 운동 공간
  - 수면·호흡·영양·심리·운동을 연결하는 5-Pillar 라이프스타일 케어

---

## 🚀 주요 기능 및 인터랙션
1. **Interactive Navigation & Responsive Drawer**:
   - 스크롤 시 반투명 글래스모피즘 블러 효과
   - 모바일 전용 슬라이드 아웃 드로어 메뉴
2. **5-Pillar Wellness System**:
   - 수면, 호흡, 영양, 심리, 운동 5대 핵심 가치 카드
3. **Programs Tab Switcher**:
   - 근골격계 운동 (기능 개선 및 체형 정렬)
   - 퍼스널 트레이닝 (맞춤형 근력 증진)
   - 기구 필라테스 (캐딜락 & 리포머 척추 정렬)
4. **Facility Photo Gallery & Lightbox Modal**:
   - 실제 스튜디오 내부 사진 6종 그리드 배치
   - 클릭 시 고화질 확대 라이트박스 뷰어 지원
5. **Interactive Self-Assessment**:
   - "나에게 소마플로우가 필요할까요?" 4가지 체크리스트 실시간 피드백
6. **Location & Direct Links**:
   - 네이버 톡톡 실시간 문의 URL 연동
   - 네이버 지도 / 플레이스 바로가기
   - 지하철(대흥역 3번 출구) 및 운영시간 안내
7. **Consultation Form & Floating Quick Action Bar**:
   - 1:1 방문 상담 신청 폼
   - 모바일/데스크톱 하단 플로팅 퀵 버튼
8. **Compliance & Legal Notice**:
   - 비의료기관 필수 법적 고지문 원문 완벽 반영

---

## 📁 디렉토리 구조
```
somaflow/
├── index.html              # 메인 랜딩 페이지
├── package.json            # Vite 환경 및 패키지 설정
├── README.md               # 프로젝트 안내 문서
├── css/
│   └── style.css           # 커스텀 웰니스 스타일시트
├── js/
│   └── main.js             # 탭, 라이트박스, 아코디언 등 인터랙션 스크립트
└── public/
    └── images/             # 실제 스튜디오 고해상도 사진 에셋
        ├── hero_cover.png
        ├── facility_01.png
        ├── facility_02.png
        ├── facility_03.png
        ├── facility_04.png
        ├── facility_05.png
        ├── facility_06.png
        └── facility_07.png
```

---

## 💻 실행 및 확인 방법

### 방법 1. 정적 파일 직접 실행
별도의 설치 없이 [index.html](file:///Users/jay_mac/somaflow/index.html)을 웹 브라우저(Chrome, Safari 등)에서 더블 클릭하여 바로 열 수 있습니다.

### 방법 2. 로컬 서버 실행 (권장)
```bash
# Python 내장 서버로 실행할 경우 (기본 4173 포트 구동 중)
python3 -m http.server 4173

# 또는 Vite 개발 서버 실행
npm install
npm run dev
```
브라우저에서 `http://localhost:4173`으로 접속하여 확인하실 수 있습니다.
