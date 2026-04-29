# Master the Words | JLS ULSAN Word Trainer v4

새로 업로드된 실제 레벨별 단어 데이터를 반영한 4차 버전입니다.

## 포함 파일

- `index.html`
- `style.css`
- `script.js`
- `words.json`
- `README.md`

## 반영 기능

- 레벨 선택: DSA, DSB, DSC, DSD, LSA, LSB, LSC, LSD, MSA, MSB
- 일반 레벨: LESSON 1~24
- MSA / MSB: 책 선택 후 LESSON 1~6 선택
- 학습 모드 5개
  - 뜻 고르기
  - 단어 고르기
  - 철자 입력
  - OX 테스트
  - 4지선다 퀴즈
- 정답 / 오답 표시
- 점수 / 정답률 표시
- 오답 복습
- 스피커 아이콘 클릭 시 영어 단어 발음 재생
- 모바일 최적화

## 단어 데이터 반영 결과

총 단어 수: 7,886개

- DSA: 432 words / LESSON 1~24
- DSB: 470 words / LESSON 1~24
- DSC: 576 words / LESSON 1~24
- DSD: 960 words / LESSON 1~24
- LSA: 720 words / LESSON 1~24
- LSB: 732 words / LESSON 1~24
- LSC: 852 words / LESSON 1~24
- LSD: 840 words / LESSON 1~24
- MSA - Number the Stars: 288 words / LESSON 1~6
- MSA - The Wild Robot: 288 words / LESSON 1~6
- MSA - HOLES: 288 words / LESSON 1~6
- MSA - THE ONE AND ONLY IVAN: 288 words / LESSON 1~6
- MSB - Al Capone Does My Shirts: 288 words / LESSON 1~6
- MSB - HATCHET: 288 words / LESSON 1~6
- MSB - The Giver: 288 words / LESSON 1~6
- MSB - Walk Two Moons: 288 words / LESSON 1~6

## 사용 방법

1. 압축을 풉니다.
2. GitHub Pages에 업로드하거나, 간단한 로컬 서버에서 실행합니다.
3. `index.html`을 엽니다.
4. 레벨 → 책 또는 LESSON → 학습 모드를 선택합니다.

참고: 브라우저 보안 정책 때문에 `index.html`을 더블클릭으로 열면 `words.json`을 불러오지 못하는 경우가 있습니다. 이 경우 GitHub Pages에 올리거나 로컬 서버에서 실행하면 됩니다.

## 단어 데이터 구조

`words.json`은 아래 형식으로 구성되어 있습니다.

```json
{
  "level": "DSA",
  "book": "",
  "lesson": 1,
  "word": "wolf",
  "meaning": "늑대"
}
```

MSA / MSB 소설 레벨은 `book` 값이 들어갑니다.

```json
{
  "level": "MSA",
  "book": "The Wild Robot",
  "lesson": 1,
  "word": "rage - raged",
  "meaning": "맹렬히 계속되다"
}
```


## v4-local 수정 사항

- `index.html`을 더블클릭해서 실행해도 단어가 보이도록 `words-data.js`에 단어 데이터를 내장했습니다.
- `words.json`도 함께 포함되어 있어 GitHub Pages 배포 후에도 동일하게 사용할 수 있습니다.
- 총 단어 수: 7,886개
- DSA~LSD: LESSON 1~24
- MSA/MSB: 각 책별 LESSON 1~6
