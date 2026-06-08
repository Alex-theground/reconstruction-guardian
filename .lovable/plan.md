## 브랜드 명칭 변경: 정감 컨설팅 → 바른집행

### 적용 범위

**1. 코드 일괄 치환 (sed)**
다음 파일의 "정감 컨설팅" → "바른집행" 일괄 변경:
- `README.md`
- `src/components/SiteFooter.tsx`
- `src/components/SiteHeader.tsx`
- `src/lib/home-content.ts`
- `src/routes/admin.dashboard.tsx`
- `src/routes/admin.index.tsx`
- `src/routes/cases.tsx`
- `src/routes/contact.tsx`
- `src/routes/contract.tsx`
- `src/routes/index.tsx`
- `src/routes/process.tsx`
- `src/routes/services.tsx`
- `src/routes/simulator.tsx`

**2. 로고 마크 변경**
- 헤더/푸터의 한자 마크 `正` → `바름` 의미를 살려 **`바`** (한글 1자)로 교체
- '正監(정감)' 자산은 더 이상 유효하지 않으므로 한자 마크 유지는 부적절
- 폰트는 기존 `font-serif` 유지 (Noto Serif KR 톤)

**3. 영문 태그라인**
- 현재: `Union Audit Partners`
- 변경 후: **`Right Execution Partners`** (바른집행 직역 + Partners 톤 유지)
- 적용 위치: `SiteHeader.tsx`, `SiteFooter.tsx`

**4. 푸터 회사 설명 문구**
- "정감 컨설팅는 어떠한 시공사…" → "바른집행은 어떠한 시공사…" (조사 '는' → '은' 자연스럽게 교정)

**5. 도메인/이메일**
- `info@junggam.kr`, `junggam.kr` 표기는 **그대로 유지** (실제 도메인 변경은 별도 작업)
- 사용자가 원하면 다음 단계에서 정리

### 변경하지 않는 것

- DB(`site_content`)에는 "정감 회계/컨설팅" 텍스트가 저장돼 있지 않음을 직전 작업에서 확인 → 마이그레이션 불필요
- 본문 콘텐츠 내 "정감 컨설팅 감독" 같은 표현은 회사명 부분만 치환됨 (→ "바른집행 감독")

### 결정 필요

1. **로고 마크**: `바` 한 글자로 교체 (권장) vs 다른 안 (예: `正` 유지 / 로고 이미지 별도 제작)
2. **영문 태그라인**: `Right Execution Partners` (권장) vs 다른 안 (예: 그대로 `Union Audit Partners` 유지)
3. **도메인 표기 `junggam.kr`**: 이번엔 유지 (권장) vs 함께 변경

승인해주시면 위 범위로 바로 반영하겠습니다.
