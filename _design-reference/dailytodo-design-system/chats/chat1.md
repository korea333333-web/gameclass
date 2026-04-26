# 심플 디자인 참고

_Started 2026-04-26 16:42 UTC_

---

## User



## Assistant

I'll start by exploring what's been provided in this project to understand what I'm working with.

_[tool: list_files]_

_[tool: update_todos]_

The project is empty — no codebase, no Figma links, no screenshots, no slide decks. The only context I have is the company description: **투두 (오늘의 할일)** — which translates to "Todo (Today's To-Do List)" in Korean.

Without source material (codebase, Figma, screenshots, brand guide, or even a website URL), I'd be inventing the entire brand from scratch — which would produce a generic AI design system, not a real one. The skill prompt is explicit: *"Stop if key resources are inaccessible... NEVER go ahead spending tons of time making a design system if you cannot access all the resources the user gave you."*

Before I proceed, I need you to point me at the actual product so this design system reflects your real brand and not my guess at one.

**What I need from you:**

1. **Is 투두 an existing product, or are we creating a brand from scratch?**
   - If existing: please attach the **codebase** (Import menu → local folder or GitHub repo), share a **Figma file link**, or paste a **website/App Store URL** so I can pull real screenshots.
   - If from scratch: I can do that too, but I'll need direction on tone, audience, and visual mood — let me know and I'll send a questionnaire.

2. **Which surfaces matter?** Mobile app only? Web app? Marketing site? Multiple?

3. **Any existing brand assets?** Logo files, color palette, fonts already chosen, screenshots of the current product — anything you can drop in via the Import menu helps.

Once you attach materials (or confirm it's a from-scratch brand exercise), I'll pick this back up and run end-to-end without stopping.

## User

요런 느낌의 디자인을 완전 참고해주면 좋겠어 너무나 시플한디자인이야

## Assistant

좋아요! 스크린샷을 자세히 살펴볼게요.

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: set_project_title]_

_[tool: update_todos]_

스크린샷에서 디자인 DNA를 분석했습니다. 핵심 관찰:

- **극단적 미니멀리즘** — 흰색에 가까운 따뜻한 베이지/오프화이트 배경, 배경 색조에 묻히는 카드
- **컬러 팔레트**: 따뜻한 오프화이트 (#F2EEE8 류), 진한 갈색 텍스트 (#3D3530 류), 매우 옅은 색조의 카드 (#FAF7F2)
- **타입**: SF Pro 한국어 (또는 Apothem/Apple SD Gothic Neo 류) — 가는 weight, 큰 시계 숫자가 시그니처
- **상태 아이콘**: O (완료), X (실패), △ (부분), → (연기) — 한국어 학습/일정관리에서 흔한 이모지 없는 기호 시스템
- **iOS 위젯/잠금화면 레퍼런스** — 알림 카드 스타일, 잠금화면 시계, 캘린더 스트립
- **둥근 사각형, 매우 옅은 그림자** — 거의 보더리스
- **이모지/아이콘 거의 없음** — 카메라 버튼, 톱니바퀴, 캘린더 정도

자료 만들어볼게요. 먼저 폰트 매칭 — 한글에는 **Pretendard** 또는 **Apple SD Gothic Neo**, 영문에는 **SF Pro/Inter**가 가장 가깝습니다. Pretendard로 갑니다 (CDN으로 로드 가능, 무료, Apple SD Gothic Neo와 매우 유사).

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

네, 이해했어요. 색상 팔레트는 매우 제한적이니까 — **아이콘, 형태, 디테일, 간격, 비율, 타이포그래피의 미묘함**이 디자인의 전부예요. 이게 실패하면 디자인 전체가 실패합니다.

이 점을 염두에 두고 작업할게요:

**아이콘 원칙 (이 디자인 시스템의 핵심):**

1. **얇은 stroke (1.25-1.5px)**, 둥근 line cap, 24px 그리드
2. **iOS SF Symbols 미감과 일치** — 부드럽고 절제된 형태, 과하지 않은 둥근 모서리
3. **하나의 아이콘 패밀리만 사용** — Lucide 또는 Phosphor를 섞지 않음
4. **상태 표시는 절대 아이콘 아님** — `O X △ →` 는 타이포그래피 (이게 시그니처)
5. **컬러 fill 절대 금지** — 모든 아이콘은 `--ink-1` 또는 `--ink-2`, 단일 색상

**Phosphor Icons (regular weight)**로 갈게요 — SF Symbols와 가장 비슷합니다 (Lucide보다). Apple SD Gothic Neo의 부드러운 곡선과 잘 어울려요.

이제 아이콘 라이브러리를 셋업하고, 아이콘을 신중하게 선별해서 카피해넣고, 아이콘 사용 규칙을 매우 자세히 문서화할게요.

_[tool: run_script]_

24개 아이콘 다운로드 완료. 이제 ICONOGRAPHY 섹션을 더 자세하게 다시 쓰고, 디자인 시스템 프리뷰 카드를 만들고, UI 키트를 세팅할게요.

_[tool: str_replace_edit]_

_[tool: snip]_

이제 디자인 시스템 프리뷰 카드를 만들고, UI 키트를 만들 거예요. 먼저 카드들 — 작은 카드 여러 개로 분할:

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

이제 아이콘 카드(가장 중요!), 컴포넌트 카드들 만들게요:

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: register_assets]_

_[tool: snip]_

Now I'll build the iOS UI kit — the centerpiece of this design system. Three core screens: lock screen, notification center widget, in-app calendar/task view.

_[tool: copy_starter_component]_

_[tool: snip]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: snip]_

_[tool: read_file]_

_[tool: snip]_

I have what I need to build the UI kit. Let me create the components.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: snip]_

_[tool: done]_

_[tool: snip]_

_[tool: register_assets]_

Now let me finish: SKILL.md, update README index, and verify.

_[tool: write_file]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: done]_

_[tool: fork_verifier_agent]_

**CAVEATS**

- 폰트는 **Pretendard** (CDN)로 대체했습니다 — 실제 앱은 Apple SD Gothic Neo (iOS 시스템)일 가능성이 높습니다. iOS에서 자동으로 시스템 폰트로 fallback되도록 폰트 스택을 짰으니 실기기에서는 시스템 폰트로 보일 거예요.
- **로고/앱 아이콘 자료가 없어서** wordmark `DAILYTODO`만 사용했습니다. 실제 로고가 있다면 보내주세요.
- **아이콘은 Phosphor Regular**로 통일했습니다 — iOS SF Symbols와 가장 비슷한 자유 라이브러리예요. 만약 실제 앱에서 SF Symbols를 쓴다면 그게 더 정확합니다.
- **상태 마크의 시그니처 처리** (`O X △ →`를 아이콘이 아닌 타이포그래피로) 가 디자인 시스템의 핵심으로 깔렸습니다. UI kit과 모든 카드가 이 규칙을 따릅니다.
- 스크린샷 3장만으로 만들었기 때문에 **설정 화면, 할 일 추가 모달, 빈 상태(empty state)** 등은 추측 없이 생략했습니다.

---

**👉 다음 스텝 — 같이 다듬어가요!**

이 시스템을 완벽하게 만들려면 도와주세요:

1. **실제 로고/앱 아이콘** 있으면 첨부해주세요 — wordmark만으로는 부족해요
2. **추가 스크린샷** — 특히 **할 일 추가 화면, 설정 화면, 빈 상태** — 이게 있으면 컴포넌트 라이브러리가 훨씬 풍부해집니다
3. **아이콘 룩이 마음에 드세요?** Phosphor Regular 대신 다른 스타일 (더 가는 것, 채워진 것 등)을 원하시면 말씀해주세요. 색상은 제한적이지만 아이콘이 디자인의 전부라고 하셨으니 여기를 가장 신경써서 다듬고 싶어요
4. **카테고리 prefix `(독서)` 처리** — 지금은 muted gray로 처리했는데, 카테고리별로 색을 다르게 하고 싶은지? 아니면 지금처럼 통일된 회색이 맞는지?
5. **`O X △ →` 외에 다른 상태**가 있나요? (예: `?` 보류, `★` 중요 등)

알려주시면 바로 반영할게요!

