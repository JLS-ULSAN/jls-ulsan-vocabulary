const chessCurriculum = {
  DSA: { type: "lesson", lessons: 24, description: "DSA · LESSON 1~24" },
  DSB: { type: "lesson", lessons: 24, description: "DSB · LESSON 1~24" },
  DSC: { type: "lesson", lessons: 24, description: "DSC · LESSON 1~24" },
  DSD: { type: "lesson", lessons: 24, description: "DSD · LESSON 1~24" },
  LSA: { type: "lesson", lessons: 24, description: "LSA · LESSON 1~24" },
  LSB: { type: "lesson", lessons: 24, description: "LSB · LESSON 1~24" },
  LSC: { type: "lesson", lessons: 24, description: "LSC · LESSON 1~24" },
  LSD: { type: "lesson", lessons: 24, description: "LSD · LESSON 1~24" },
  MSA: { type: "book", description: "MSA · Novel Vocabulary · LESSON 1~6", lessons: 6, books: ["Number the Stars", "The Wild Robot", "HOLES", "THE ONE AND ONLY IVAN"] },
  MSB: { type: "book", description: "MSB · Novel Vocabulary · LESSON 1~6", lessons: 6, books: ["Al Capone Does My Shirts", "HATCHET", "The Giver", "Walk Two Moons"] }
};

const chessLevelOrder = ["DSA", "DSB", "DSC", "DSD", "LSA", "LSB", "LSC", "LSD", "MSA", "MSB"];
const aceCategoryOrder = ["원어민 활용교재", "Total-map", "Voca-map", "절대수능-map Voca", "수능공습 어휘학습"];
const aceTitleOrder = {
  "원어민 활용교재": [
    "Art & Architecture - Foundation", "Business & Economics - Expert", "Careers & Inspiring People - Foundation",
    "Education & Career - Expert", "Education & Career - Explorer", "Environment - Expert", "Environment - Explorer",
    "Global Affairs - Explorer", "Health & Hobbies - Foundation", "Historical Figures - Expert", "Money & Charity - Foundation",
    "Pollution & Environmental Technology - Foundation", "Science & Technology - Explorer", "Social Issues - Explorer",
    "The World Of Art - Explorer", "The World of Arts - Expert", "Travel & Communication - Foundation"
  ],
  "Total-map": [
    "Starter Basic A1-A3", "Starter Basic A4-A6", "Starter Basic B1-B3", "Starter Basic B4-B6",
    "Starter Inter A1-A3", "Starter Inter B1-B3", "Starter Inter B4-B6", "Basic A1-A3", "Basic A4-A6",
    "Basic B1-B3", "Basic B4-B6", "Inter A1-A3", "Inter A4-A6", "Inter B1-B3", "Inter B4-B6"
  ],
  "Voca-map": ["Basic A-1", "Basic B-1", "Basic B-2", "Inter A-1", "Inter A-2", "Inter B-1", "Inter B-2"],
  "절대수능-map Voca": ["Basic 1", "Basic 2", "Basic 3", "Basic 4", "Inter 1", "Inter 2", "Inter 3", "Inter 4"],
  "수능공습 어휘학습": ["수능공습 A", "수능공습 B", "수능공습 C"]
};

const modes = [
  { id: "meaning", title: "뜻 고르기", icon: "🎯", desc: "영어 단어를 보고 뜻을 고릅니다." },
  { id: "word", title: "단어 고르기", icon: "🔤", desc: "한글 뜻을 보고 영어 단어를 고릅니다." },
  { id: "spelling", title: "철자 입력", icon: "✍️", desc: "뜻을 보고 영어 철자를 직접 입력합니다." },
  { id: "ox", title: "OX 테스트", icon: "⭕", desc: "단어와 뜻이 맞는지 판단합니다." },
  { id: "mixed", title: "4지선다 퀴즈", icon: "🏆", desc: "뜻 고르기와 단어 고르기가 섞여 나옵니다." }
];

const state = {
  words: [], program: null, category: "", title: "", book: "", chapter: "", selectedMode: null,
  quizWords: [], wrongWords: [], currentIndex: 0, score: 0, answered: false, reviewMode: false,
  currentQuestionType: "meaning", currentAnswer: "", selectedWordsCache: []
};

const $ = (id) => document.getElementById(id);
function showScreen(name) {
  document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
  $(`screen-${name}`).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function shuffle(array) { return [...array].sort(() => Math.random() - 0.5); }
function escapeHTML(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function normalizeAnswer(text) { return String(text || "").trim().toLowerCase().replace(/\s+/g, " "); }
function naturalNumber(value) { const m = String(value).match(/(\d+)/); return m ? Number(m[1]) : 9999; }
function sortNatural(values) { return [...values].sort((a,b) => naturalNumber(a) - naturalNumber(b) || String(a).localeCompare(String(b), "ko")); }
function unique(arr) { return [...new Set(arr.filter(Boolean).map(v => String(v)))]; }

let voicesLoaded = false;
function loadVoices() {
  if (!window.speechSynthesis) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices.length) voicesLoaded = true;
  return voices;
}
function speakWord(word) {
  if (!window.speechSynthesis) { alert("이 브라우저에서는 발음 기능을 지원하지 않습니다."); return; }
  const voices = loadVoices();
  const englishVoice = voices.find(v => v.lang === "en-US") || voices.find(v => String(v.lang).startsWith("en-")) || voices.find(v => /english/i.test(v.name));
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = englishVoice?.lang || "en-US";
  if (englishVoice) utterance.voice = englishVoice;
  utterance.rate = 0.82;
  utterance.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
if (window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}
function speakerButton(word, compact = false) {
  return `<button class="speaker-btn ${compact ? "small" : ""}" type="button" aria-label="${escapeHTML(word)} 발음 듣기" data-speak="${escapeHTML(word)}">🔊</button>`;
}

async function loadWords() {
  if (Array.isArray(window.JLS_WORDS) && window.JLS_WORDS.length > 0) { state.words = window.JLS_WORDS; return; }
  try {
    const response = await fetch("words.json");
    if (!response.ok) throw new Error("words.json 로딩 실패");
    state.words = await response.json();
  } catch (error) {
    console.error(error); state.words = [];
    alert("단어 데이터를 불러오지 못했습니다. 압축을 푼 뒤 index.html을 실행하거나, GitHub Pages에 업로드해 주세요.");
  }
}

function countWords(filter) { return state.words.filter(filter).length; }
function getLevelColorClass(level) {
  if (["DSA", "DSB", "DSC", "DSD"].includes(level)) return "level-red";
  if (["LSA", "LSB", "LSC", "LSD"].includes(level)) return "level-green";
  return "";
}

function getAceCategoryColorClass(category) {
  const map = {
    "원어민 활용교재": "ace-cat-native",
    "Total-map": "ace-cat-total",
    "Voca-map": "ace-cat-voca",
    "절대수능-map Voca": "ace-cat-suneung",
    "수능공습 어휘학습": "ace-cat-gongseup"
  };
  return map[category] || "";
}

function contextText() {
  const parts = [state.program, state.category, state.title, state.book, state.chapter].filter(Boolean);
  return parts.join(" · ");
}

function renderPrograms() {
  const chessCount = countWords(w => w.program === "체스");
  const aceCount = countWords(w => w.program === "에이스");
  $("programGrid").innerHTML = `
    <button class="tile-btn program-btn chess-card" data-program="체스"><span class="tile-title">체스</span><span class="tile-sub">DSA~MSB 기존 레벨</span><span class="count-badge">${chessCount.toLocaleString()} words</span></button>
    <button class="tile-btn program-btn ace-card" data-program="에이스"><span class="tile-title">에이스</span><span class="tile-sub">원어민 활용교재 · Total-map · Voca-map · 수능 어휘</span><span class="count-badge">${aceCount.toLocaleString()} words</span></button>`;
  $("programGrid").querySelectorAll("[data-program]").forEach(btn => btn.addEventListener("click", () => selectProgram(btn.dataset.program)));
}
function selectProgram(program) {
  Object.assign(state, { program, category:"", title:"", book:"", chapter:"", selectedMode:null });
  if (program === "체스") { renderChessLevels(); showScreen("level"); }
  else { renderAceCategories(); showScreen("category"); }
}

function renderChessLevels() {
  $("levelTitle").textContent = "체스 레벨을 선택하세요";
  $("levelHelp").textContent = "DSA~MSB 중 학습할 레벨을 선택합니다.";
  $("levelGrid").innerHTML = chessLevelOrder.map(level => {
    const config = chessCurriculum[level];
    const count = countWords(item => item.program === "체스" && item.title === level);
    return `<button class="tile-btn ${getLevelColorClass(level)}" data-level="${level}"><span class="tile-title">${level}</span><span class="tile-sub">${config.description}</span><span class="count-badge">${count.toLocaleString()} words</span></button>`;
  }).join("");
  $("levelGrid").querySelectorAll("[data-level]").forEach(btn => btn.addEventListener("click", () => selectChessLevel(btn.dataset.level)));
}
function selectChessLevel(level) {
  state.title = level; state.book = ""; state.chapter = ""; state.category = "";
  const config = chessCurriculum[level];
  if (config.type === "book") { renderBooks(level); showScreen("book"); }
  else { renderChessPathOptions(level); showScreen("lesson"); }
}

function renderChessPathOptions(level) {
  const lessonCount = countWords(item => item.program === "체스" && item.category !== "Glossary" && item.title === level && !item.book);
  const glossaryCount = countWords(item => item.program === "체스" && item.category === "Glossary" && item.title === level);
  $("lessonStep").textContent = "STEP 3";
  $("lessonTitle").textContent = `${level} 학습 유형을 선택하세요`;
  $("lessonHelp").textContent = glossaryCount > 0 ? "기존 Lesson 또는 Glossary 중 선택합니다." : "이 레벨은 Glossary 없이 Lesson만 학습합니다.";
  $("lessonBackBtn").setAttribute("data-back", "level");
  const items = [
    `<button class="tile-btn lesson-btn" data-chess-path="lesson"><span class="tile-title">Lesson</span><span class="tile-sub">Lesson 1~24</span><span class="count-badge">${lessonCount.toLocaleString()} words</span></button>`
  ];
  if (glossaryCount > 0) {
    items.push(`<button class="tile-btn lesson-btn glossary-btn" data-chess-path="glossary"><span class="tile-title">Glossary</span><span class="tile-sub">${level} 1 / ${level} 2</span><span class="count-badge">${glossaryCount.toLocaleString()} words</span></button>`);
  }
  $("lessonGrid").innerHTML = items.join("");
  $("lessonGrid").querySelectorAll("[data-chess-path]").forEach(btn => btn.addEventListener("click", () => {
    const path = btn.dataset.chessPath;
    if (path === "lesson") {
      state.category = ""; state.book = ""; state.chapter = "";
      renderLearningUnits("chessPath"); showScreen("lesson");
    } else {
      state.category = "Glossary"; state.book = ""; state.chapter = "";
      renderGlossaryLevels(); showScreen("lesson");
    }
  }));
}

function renderGlossaryLevels() {
  const levels = unique(state.words.filter(w => w.program === "체스" && w.category === "Glossary" && w.title === state.title).map(w => w.book));
  const ordered = levels.sort((a,b) => naturalNumber(a) - naturalNumber(b) || String(a).localeCompare(String(b), "ko"));
  $("lessonStep").textContent = "STEP 4";
  $("lessonTitle").textContent = `${state.title} Glossary를 선택하세요`;
  $("lessonHelp").textContent = "Glossary 1 또는 2를 선택합니다.";
  $("lessonBackBtn").setAttribute("data-back", "chessPath");
  $("lessonGrid").innerHTML = ordered.map(name => {
    const count = countWords(w => w.program === "체스" && w.category === "Glossary" && w.title === state.title && w.book === name);
    return `<button class="tile-btn lesson-btn glossary-btn" data-glossary-level="${escapeHTML(name)}"><span class="tile-title">${escapeHTML(name)}</span><span class="tile-sub">세부 단계 선택</span><span class="count-badge">${count.toLocaleString()} words</span></button>`;
  }).join("");
  if (!ordered.length) $("lessonGrid").innerHTML = `<div class="empty-state" style="grid-column:1/-1;">이 레벨에는 아직 Glossary 단어가 없습니다.</div>`;
  $("lessonGrid").querySelectorAll("[data-glossary-level]").forEach(btn => btn.addEventListener("click", () => {
    state.book = btn.dataset.glossaryLevel; state.chapter = ""; state.category = "Glossary";
    renderGlossarySheets(); showScreen("lesson");
  }));
}

function renderGlossarySheets() {
  const sheets = unique(state.words.filter(w => w.program === "체스" && w.category === "Glossary" && w.title === state.title && w.book === state.book).map(w => w.chapter));
  const ordered = sortNatural(sheets);
  $("lessonStep").textContent = "STEP 5";
  $("lessonTitle").textContent = "세부 단계를 선택하세요";
  $("lessonHelp").textContent = `${state.title} · ${state.book}의 세부 단계는 업로드한 엑셀 시트명 기준입니다.`;
  $("lessonBackBtn").setAttribute("data-back", "glossaryLevel");
  $("lessonGrid").innerHTML = ordered.map(sheetName => {
    const count = countWords(w => w.program === "체스" && w.category === "Glossary" && w.title === state.title && w.book === state.book && w.chapter === sheetName);
    return `<button class="tile-btn lesson-btn glossary-btn" data-unit="${escapeHTML(sheetName)}"><span class="tile-title">${escapeHTML(sheetName)}</span><span class="tile-sub">${count.toLocaleString()} words</span></button>`;
  }).join("");
  $("lessonGrid").querySelectorAll("[data-unit]").forEach(btn => btn.addEventListener("click", () => { state.chapter = btn.dataset.unit; renderModes(); showScreen("mode"); }));
}

function renderBooks(level) {
  const config = chessCurriculum[level];
  $("bookHelp").textContent = `${level} 레벨의 책을 선택하세요.`;
  $("bookGrid").innerHTML = config.books.map(book => {
    const count = countWords(item => item.program === "체스" && item.title === level && item.book === book);
    return `<button class="tile-btn" data-book="${escapeHTML(book)}"><span class="tile-title">${escapeHTML(book)}</span><span class="tile-sub">LESSON 1~6 · Glossary</span><span class="count-badge">${count.toLocaleString()} words</span></button>`;
  }).join("");
  $("bookGrid").querySelectorAll("[data-book]").forEach(btn => btn.addEventListener("click", () => { state.book = btn.dataset.book; state.category = ""; renderLearningUnits("book"); showScreen("lesson"); }));
}

function renderAceCategories() {
  $("categoryGrid").innerHTML = aceCategoryOrder.map(category => {
    const count = countWords(w => w.program === "에이스" && w.category === category);
    return `<button class="tile-btn category-btn ${getAceCategoryColorClass(category)}" data-category="${escapeHTML(category)}"><span class="tile-title">${escapeHTML(category)}</span><span class="tile-sub">세부 교재 선택</span><span class="count-badge">${count.toLocaleString()} words</span></button>`;
  }).join("");
  $("categoryGrid").querySelectorAll("[data-category]").forEach(btn => btn.addEventListener("click", () => selectAceCategory(btn.dataset.category)));
}
function selectAceCategory(category) {
  state.category = category; state.title = ""; state.chapter = ""; state.book = "";
  renderAceTitles(); showScreen("title");
}
function renderAceTitles() {
  $("titleHelp").textContent = state.category;
  const existing = unique(state.words.filter(w => w.program === "에이스" && w.category === state.category).map(w => w.title));
  const order = aceTitleOrder[state.category] || existing;
  const titles = [...order.filter(t => existing.includes(t)), ...existing.filter(t => !order.includes(t)).sort((a,b)=>a.localeCompare(b,"ko"))];
  $("titleGrid").innerHTML = titles.map(title => {
    const count = countWords(w => w.program === "에이스" && w.category === state.category && w.title === title);
    return `<button class="tile-btn title-btn" data-title="${escapeHTML(title)}"><span class="tile-title">${escapeHTML(title)}</span><span class="tile-sub">학습 단위 선택</span><span class="count-badge">${count.toLocaleString()} words</span></button>`;
  }).join("");
  $("titleGrid").querySelectorAll("[data-title]").forEach(btn => btn.addEventListener("click", () => { state.title = btn.dataset.title; renderLearningUnits("title"); showScreen("lesson"); }));
}

function learningUnitLabel() {
  if (state.program === "체스") return "LESSON";
  if (state.category === "절대수능-map Voca") return "DAY";
  if (state.category === "수능공습 어휘학습") return "UNIT";
  return "Chapter";
}
function renderLearningUnits(backTarget) {
  const label = learningUnitLabel();
  $("lessonTitle").textContent = `${label}을 선택하세요`;
  $("lessonHelp").textContent = `${contextText()}의 학습 단위를 선택하세요. 단어가 있는 항목만 선택할 수 있습니다.`;
  $("lessonBackBtn").setAttribute("data-back", backTarget);
  $("lessonStep").textContent = state.program === "체스" && !state.book ? "STEP 4" : "STEP 4";

  let units;
  if (state.program === "체스") {
    const level = state.title;
    const cfg = chessCurriculum[level];
    units = Array.from({length: cfg.lessons}, (_,i)=>`LESSON ${i+1}`);
    if (cfg.type === "book" && state.book) {
      const glossaryCount = countWords(w => w.program === "체스" && w.category === "Glossary" && w.title === level && w.book === state.book && w.chapter === "Glossary");
      if (glossaryCount > 0) units.push("Glossary");
    }
  } else {
    units = unique(state.words.filter(w => w.program === state.program && w.category === state.category && w.title === state.title).map(w => w.chapter));
    units = sortNatural(units);
    if (state.category === "수능공습 어휘학습") {
      units.sort((a,b) => {
        const ma=String(a).match(/(\d+)회\s*Unit\s*(\d+)/); const mb=String(b).match(/(\d+)회\s*Unit\s*(\d+)/);
        if (ma && mb) return (Number(ma[1])-Number(mb[1])) || (Number(ma[2])-Number(mb[2]));
        return String(a).localeCompare(String(b),"ko");
      });
    }
  }

  $("lessonGrid").innerHTML = units.map(unit => {
    const count = getWordsForUnit(unit).length;
    const disabled = count === 0;
    const isGlossary = unit === "Glossary";
    return `<button class="tile-btn lesson-btn ${isGlossary ? "glossary-btn" : ""} ${disabled ? "disabled" : ""}" ${disabled ? "disabled" : ""} data-unit="${escapeHTML(unit)}"><span class="tile-title">${escapeHTML(unit)}</span><span class="tile-sub">${disabled ? "단어 없음" : `${count.toLocaleString()} words`}</span></button>`;
  }).join("");
  $("lessonGrid").querySelectorAll("[data-unit]:not(:disabled)").forEach(btn => btn.addEventListener("click", () => {
    const unit = btn.dataset.unit;
    if (state.program === "체스" && (state.title === "MSA" || state.title === "MSB") && state.book && unit === "Glossary") state.category = "Glossary";
    else if (state.program === "체스") state.category = "";
    state.chapter = unit; renderModes(); showScreen("mode");
  }));
}
function getWordsForUnit(unitName = state.chapter) {
  return state.words.filter(w => {
    if (w.program !== state.program) return false;
    if (state.program === "체스") {
      if (w.title !== state.title) return false;

      // MSA/MSB는 책 선택 화면에서 Lesson 1~6과 Glossary가 같은 화면에 표시됩니다.
      // 이때 버튼 개수 계산 단계에서는 state.category가 아직 "Glossary"로 바뀌기 전이므로,
      // unitName이 "Glossary"이면 Glossary 단어를 바로 찾도록 별도 처리합니다.
      if ((state.title === "MSA" || state.title === "MSB") && state.book && unitName === "Glossary") {
        return w.category === "Glossary" && w.book === state.book && w.chapter === "Glossary";
      }

      if (state.category === "Glossary") {
        if (w.category !== "Glossary") return false;
        if (state.book && w.book !== state.book) return false;
        return w.chapter === unitName;
      }
      if (w.category === "Glossary") return false;
      if (state.book && w.book !== state.book) return false;
      if (!state.book && w.book) return false;
      return w.chapter === unitName;
    }
    return w.category === state.category && w.title === state.title && w.chapter === unitName;
  });
}

function renderModes() {
  const selectedCount = getSelectedWords().length;
  $("modeSummary").textContent = `${contextText()} · ${selectedCount.toLocaleString()} words`;
  $("modeGrid").innerHTML = modes.map(mode => `<button class="tile-btn mode-btn" data-mode="${mode.id}"><span class="mode-icon">${mode.icon}</span><span class="tile-title">${mode.title}</span><span class="tile-sub">${mode.desc}</span></button>`).join("");
  $("modeGrid").querySelectorAll("[data-mode]").forEach(btn => btn.addEventListener("click", () => startMode(btn.dataset.mode)));
}
function getSelectedWords() { return getWordsForUnit(state.chapter); }

function startMode(modeId, reviewWords = null) {
  const selectedWords = reviewWords || getSelectedWords();
  state.selectedMode = modeId; state.selectedWordsCache = selectedWords; state.quizWords = shuffle(selectedWords);
  state.wrongWords = []; state.currentIndex = 0; state.score = 0; state.answered = false; state.reviewMode = Boolean(reviewWords);
  if (state.quizWords.length === 0) {
    $("modeGrid").insertAdjacentHTML("afterbegin", `<div class="empty-state" style="grid-column:1/-1;">이 조건에는 아직 단어가 없습니다.</div>`); return;
  }
  showScreen("quiz"); renderQuestion();
}
function currentModeTitle() { return modes.find(mode => mode.id === state.selectedMode)?.title || "퀴즈"; }
function renderQuestion() {
  state.answered = false;
  const word = state.quizWords[state.currentIndex];
  const total = state.quizWords.length;
  const progress = ((state.currentIndex) / total) * 100;
  $("progressText").textContent = `${state.currentIndex + 1} / ${total}`;
  $("scoreText").textContent = `${state.score}점`;
  $("progressBar").style.width = `${progress}%`;
  $("quizModeLabel").textContent = state.reviewMode ? `오답 복습 · ${currentModeTitle()}` : currentModeTitle();
  $("feedback").textContent = ""; $("feedback").className = "feedback"; $("nextBtn").classList.add("hidden");
  $("typingArea").classList.add("hidden"); $("choicesArea").innerHTML = ""; $("typingInput").value = ""; state.currentAnswer = "";
  let type = state.selectedMode; if (type === "mixed") type = Math.random() > 0.5 ? "meaning" : "word"; state.currentQuestionType = type;
  if (type === "meaning") renderMeaningQuestion(word);
  if (type === "word") renderWordQuestion(word);
  if (type === "spelling") renderSpellingQuestion(word);
  if (type === "ox") renderOXQuestion(word);
}
function uniqueValues(items) { return [...new Set(items.filter(Boolean).map(item => String(item)))]; }
function lessonPool(excludeItem = null) {
  const local = state.selectedWordsCache.length ? state.selectedWordsCache : getSelectedWords();
  const source = local.length >= 4 ? local : state.words;
  return source.filter(item => !excludeItem || item.word !== excludeItem.word || item.meaning !== excludeItem.meaning);
}
function getMeaningChoices(correctWord) {
  const pool = uniqueValues(lessonPool(correctWord).filter(item => item.meaning !== correctWord.meaning).map(item => item.meaning));
  return shuffle([correctWord.meaning, ...shuffle(pool).slice(0, 3)]);
}
function getWordChoices(correctWord) {
  const pool = uniqueValues(lessonPool(correctWord).filter(item => item.word !== correctWord.word).map(item => item.word));
  return shuffle([correctWord.word, ...shuffle(pool).slice(0, 3)]);
}
function renderMeaningQuestion(word) {
  $("questionArea").innerHTML = `<p class="prompt-small">영어 단어의 알맞은 뜻을 고르세요.</p><div class="question-word"><span>${escapeHTML(word.word)}</span>${speakerButton(word.word)}</div>`;
  renderChoices(getMeaningChoices(word), word.meaning, "meaning");
}
function renderWordQuestion(word) {
  $("questionArea").innerHTML = `<p class="prompt-small">뜻에 맞는 영어 단어를 고르세요.</p><div class="question-meaning">${escapeHTML(word.meaning)}</div>`;
  renderChoices(getWordChoices(word), word.word, "word");
}
function renderSpellingQuestion(word) {
  $("questionArea").innerHTML = `<p class="prompt-small">뜻에 맞는 영어 단어의 철자를 입력하세요.</p><div class="question-meaning">${escapeHTML(word.meaning)}</div><div style="margin-top:14px;">${speakerButton(word.word)}</div>`;
  state.currentAnswer = word.word; $("typingArea").classList.remove("hidden"); setTimeout(() => $("typingInput").focus(), 50);
}
function renderOXQuestion(word) {
  const makeWrong = Math.random() > 0.5; let shownMeaning = word.meaning;
  if (makeWrong) { const wrongPool = lessonPool(word).filter(item => item.meaning !== word.meaning); if (wrongPool.length) shownMeaning = shuffle(wrongPool)[0].meaning; }
  const answer = shownMeaning === word.meaning ? "O" : "X"; state.currentAnswer = answer;
  $("questionArea").innerHTML = `<p class="prompt-small">단어와 뜻이 맞으면 O, 틀리면 X를 고르세요.</p><div class="question-word"><span>${escapeHTML(word.word)}</span>${speakerButton(word.word)}</div><div class="question-meaning" style="margin-top:18px;">${escapeHTML(shownMeaning)}</div>`;
  renderChoices(["O", "X"], answer, "ox");
}
function renderChoices(choices, answer, type) {
  state.currentAnswer = answer;
  $("choicesArea").innerHTML = choices.map((choice, index) => {
    const speaker = type === "word" ? speakerButton(choice, true) : "";
    return `<div class="choice-row"><button class="choice-btn" data-choice-index="${index}"><span>${escapeHTML(choice)}</span></button>${speaker}</div>`;
  }).join("");
  $("choicesArea").querySelectorAll("[data-choice-index]").forEach(btn => btn.addEventListener("click", () => { const choice = choices[Number(btn.dataset.choiceIndex)]; checkChoice(btn, choice, answer); }));
}
function checkChoice(button, choice, answer) {
  if (state.answered) return; state.answered = true;
  const isCorrect = choice === answer; markAnswer(isCorrect, answer);
  document.querySelectorAll(".choice-btn").forEach(btn => { btn.disabled = true; const rowChoice = btn.querySelector("span")?.textContent || ""; if (rowChoice === answer) btn.classList.add("correct"); });
  if (!isCorrect) button.classList.add("wrong");
}
function checkTypingAnswer() {
  if (state.answered) return;
  const current = state.quizWords[state.currentIndex];
  const isCorrect = normalizeAnswer($("typingInput").value) === normalizeAnswer(current.word);
  state.answered = true; markAnswer(isCorrect, current.word);
}
function markAnswer(isCorrect, answer) {
  const current = state.quizWords[state.currentIndex];
  if (isCorrect) { state.score += 1; $("feedback").textContent = "정답입니다! 잘했어요 👍"; $("feedback").className = "feedback good"; }
  else { state.wrongWords.push(current); $("feedback").textContent = `오답입니다. 정답: ${answer}`; $("feedback").className = "feedback bad"; }
  $("scoreText").textContent = `${state.score}점`; $("nextBtn").classList.remove("hidden");
}
function nextQuestion() { if (state.currentIndex < state.quizWords.length - 1) { state.currentIndex += 1; renderQuestion(); } else { showResult(); } }
function showResult() {
  const total = state.quizWords.length; const correct = state.score; const wrong = total - correct; const rate = total ? Math.round((correct / total) * 100) : 0;
  $("progressBar").style.width = "100%"; $("resultSummary").textContent = `${contextText()} · ${currentModeTitle()}`;
  $("statTotal").textContent = total; $("statCorrect").textContent = correct; $("statWrong").textContent = wrong; $("statRate").textContent = `${rate}%`;
  $("reviewWrongBtn").classList.toggle("hidden", state.wrongWords.length === 0); showScreen("result");
}
function goBack(target) {
  if (target === "chessPath") { state.category = ""; state.book = ""; state.chapter = ""; renderChessPathOptions(state.title); showScreen("lesson"); return; }
  if (target === "glossaryLevel") { state.category = "Glossary"; state.book = ""; state.chapter = ""; renderGlossaryLevels(); showScreen("lesson"); return; }
  showScreen(target);
}
function goHome() { Object.assign(state, { program:null, category:"", title:"", book:"", chapter:"", selectedMode:null }); showScreen("home"); }
function bindEvents() {
  document.querySelectorAll("[data-back]").forEach(btn => btn.addEventListener("click", () => goBack(btn.getAttribute("data-back"))));
  $("lessonBackBtn").addEventListener("click", () => goBack($("lessonBackBtn").getAttribute("data-back")));
  $("typingSubmit").addEventListener("click", checkTypingAnswer);
  $("typingInput").addEventListener("keydown", (event) => { if (event.key === "Enter") checkTypingAnswer(); });
  $("nextBtn").addEventListener("click", nextQuestion);
  $("reviewWrongBtn").addEventListener("click", () => startMode(state.selectedMode, state.wrongWords));
  $("retryBtn").addEventListener("click", () => startMode(state.selectedMode));
  $("homeBtn").addEventListener("click", goHome);
  document.addEventListener("click", (event) => { const speakBtn = event.target.closest("[data-speak]"); if (!speakBtn) return; event.preventDefault(); event.stopPropagation(); speakWord(speakBtn.dataset.speak); });
}
async function init() { await loadWords(); renderPrograms(); bindEvents(); }
init();
