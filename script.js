const curriculum = {
  DSA: { type: "lesson", lessons: 24, description: "DSA · LESSON 1~24" },
  DSB: { type: "lesson", lessons: 24, description: "DSB · LESSON 1~24" },
  DSC: { type: "lesson", lessons: 24, description: "DSC · LESSON 1~24" },
  DSD: { type: "lesson", lessons: 24, description: "DSD · LESSON 1~24" },
  LSA: { type: "lesson", lessons: 24, description: "LSA · LESSON 1~24" },
  LSB: { type: "lesson", lessons: 24, description: "LSB · LESSON 1~24" },
  LSC: { type: "lesson", lessons: 24, description: "LSC · LESSON 1~24" },
  LSD: { type: "lesson", lessons: 24, description: "LSD · LESSON 1~24" },
  MSA: {
    type: "book",
    description: "MSA · Novel Vocabulary · LESSON 1~6",
    lessons: 6,
    books: ["Number the Stars", "The Wild Robot", "HOLES", "THE ONE AND ONLY IVAN"]
  },
  MSB: {
    type: "book",
    description: "MSB · Novel Vocabulary · LESSON 1~6",
    lessons: 6,
    books: ["Al Capone Does My Shirts", "HATCHET", "The Giver", "Walk Two Moons"]
  }
};

const modes = [
  { id: "meaning", title: "뜻 고르기", icon: "🎯", desc: "영어 단어를 보고 뜻을 고릅니다." },
  { id: "word", title: "단어 고르기", icon: "🔤", desc: "한글 뜻을 보고 영어 단어를 고릅니다." },
  { id: "spelling", title: "철자 입력", icon: "✍️", desc: "뜻을 보고 영어 철자를 직접 입력합니다." },
  { id: "ox", title: "OX 테스트", icon: "⭕", desc: "단어와 뜻이 맞는지 판단합니다." },
  { id: "mixed", title: "4지선다 퀴즈", icon: "🏆", desc: "뜻 고르기와 단어 고르기가 섞여 나옵니다." }
];

const levelOrder = ["DSA", "DSB", "DSC", "DSD", "LSA", "LSB", "LSC", "LSD", "MSA", "MSB"];

const state = {
  words: [],
  selectedLevel: null,
  selectedBook: "",
  selectedLesson: null,
  selectedMode: null,
  quizWords: [],
  wrongWords: [],
  currentIndex: 0,
  score: 0,
  answered: false,
  reviewMode: false,
  currentQuestionType: "meaning",
  currentAnswer: "",
  selectedWordsCache: []
};

const $ = (id) => document.getElementById(id);

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
  $(`screen-${name}`).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeAnswer(text) {
  return String(text || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function speakWord(word) {
  if (!window.speechSynthesis) {
    alert("이 브라우저에서는 발음 기능을 지원하지 않습니다.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.82;
  utterance.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function speakerButton(word, compact = false) {
  return `<button class="speaker-btn ${compact ? "small" : ""}" type="button" aria-label="${escapeHTML(word)} 발음 듣기" data-speak="${escapeHTML(word)}">🔊</button>`;
}

async function loadWords() {
  if (Array.isArray(window.JLS_WORDS) && window.JLS_WORDS.length > 0) {
    state.words = window.JLS_WORDS;
    return;
  }

  try {
    const response = await fetch("words.json");
    if (!response.ok) throw new Error("words.json 로딩 실패");
    state.words = await response.json();
  } catch (error) {
    console.error(error);
    state.words = [];
    alert("단어 데이터를 불러오지 못했습니다. 압축을 푼 뒤 index.html을 실행하거나, GitHub Pages에 업로드해 주세요.");
  }
}

function countWordsFor(level, book, lesson) {
  return state.words.filter(item => {
    const sameLevel = item.level === level;
    const sameBook = book ? item.book === book : !item.book;
    const sameLesson = Number(item.lesson) === Number(lesson);
    return sameLevel && sameBook && sameLesson;
  }).length;
}

function countLevelWords(level) {
  return state.words.filter(item => item.level === level).length;
}

function renderLevels() {
  const levelGrid = $("levelGrid");
  levelGrid.innerHTML = levelOrder.map(level => {
    const config = curriculum[level];
    const count = countLevelWords(level);
    return `
      <button class="tile-btn" data-level="${level}">
        <span class="tile-title">${level}</span>
        <span class="tile-sub">${config.description}</span>
        <span class="count-badge">${count.toLocaleString()} words</span>
      </button>
    `;
  }).join("");
  levelGrid.querySelectorAll("[data-level]").forEach(btn => {
    btn.addEventListener("click", () => selectLevel(btn.dataset.level));
  });
}

function selectLevel(level) {
  state.selectedLevel = level;
  state.selectedBook = "";
  state.selectedLesson = null;
  const config = curriculum[level];

  if (config.type === "book") {
    renderBooks(level);
    showScreen("book");
  } else {
    renderLessons();
    showScreen("lesson");
  }
}

function renderBooks(level) {
  const config = curriculum[level];
  $("bookHelp").textContent = `${level} 레벨의 책을 선택하세요.`;
  $("bookGrid").innerHTML = config.books.map(book => {
    const count = state.words.filter(item => item.level === level && item.book === book).length;
    return `
      <button class="tile-btn" data-book="${escapeHTML(book)}">
        <span class="tile-title">${escapeHTML(book)}</span>
        <span class="tile-sub">LESSON 1~6</span>
        <span class="count-badge">${count.toLocaleString()} words</span>
      </button>
    `;
  }).join("");
  $("bookGrid").querySelectorAll("[data-book]").forEach(btn => {
    btn.addEventListener("click", () => selectBook(btn.dataset.book));
  });
}

function selectBook(book) {
  state.selectedBook = book;
  renderLessons();
  showScreen("lesson");
}

function renderLessons() {
  const level = state.selectedLevel;
  const config = curriculum[level];
  const context = state.selectedBook ? `${level} · ${state.selectedBook}` : level;
  $("lessonHelp").textContent = `${context}의 LESSON을 선택하세요. 단어가 있는 LESSON만 선택할 수 있습니다.`;
  $("lessonBackBtn").setAttribute("data-back", config.type === "book" ? "book" : "home");

  $("lessonGrid").innerHTML = Array.from({ length: config.lessons }, (_, i) => {
    const lesson = i + 1;
    const count = countWordsFor(level, state.selectedBook, lesson);
    const disabled = count === 0;
    return `
      <button class="tile-btn lesson-btn ${disabled ? "disabled" : ""}" ${disabled ? "disabled" : ""} data-lesson="${lesson}">
        <span class="tile-title">LESSON ${lesson}</span>
        <span class="tile-sub">${disabled ? "단어 없음" : `${count} words`}</span>
      </button>
    `;
  }).join("");
  $("lessonGrid").querySelectorAll("[data-lesson]:not(:disabled)").forEach(btn => {
    btn.addEventListener("click", () => selectLesson(Number(btn.dataset.lesson)));
  });
}

function selectLesson(lesson) {
  state.selectedLesson = lesson;
  renderModes();
  showScreen("mode");
}

function renderModes() {
  const bookText = state.selectedBook ? ` · ${state.selectedBook}` : "";
  const selectedCount = getSelectedWords().length;
  $("modeSummary").textContent = `${state.selectedLevel}${bookText} · LESSON ${state.selectedLesson} · ${selectedCount} words`;
  $("modeGrid").innerHTML = modes.map(mode => `
    <button class="tile-btn mode-btn" data-mode="${mode.id}">
      <span class="mode-icon">${mode.icon}</span>
      <span class="tile-title">${mode.title}</span>
      <span class="tile-sub">${mode.desc}</span>
    </button>
  `).join("");
  $("modeGrid").querySelectorAll("[data-mode]").forEach(btn => {
    btn.addEventListener("click", () => startMode(btn.dataset.mode));
  });
}

function getSelectedWords() {
  return state.words.filter(item => {
    const sameLevel = item.level === state.selectedLevel;
    const sameLesson = Number(item.lesson) === Number(state.selectedLesson);
    const sameBook = state.selectedBook ? item.book === state.selectedBook : !item.book;
    return sameLevel && sameLesson && sameBook;
  });
}

function startMode(modeId, reviewWords = null) {
  const selectedWords = reviewWords || getSelectedWords();
  state.selectedMode = modeId;
  state.selectedWordsCache = selectedWords;
  state.quizWords = shuffle(selectedWords);
  state.wrongWords = [];
  state.currentIndex = 0;
  state.score = 0;
  state.answered = false;
  state.reviewMode = Boolean(reviewWords);

  if (state.quizWords.length === 0) {
    $("modeGrid").insertAdjacentHTML("afterbegin", `
      <div class="empty-state" style="grid-column:1/-1;">
        이 조건에는 아직 단어가 없습니다.<br />words.json에 단어를 추가해 주세요.
      </div>
    `);
    return;
  }

  showScreen("quiz");
  renderQuestion();
}

function currentModeTitle() {
  return modes.find(mode => mode.id === state.selectedMode)?.title || "퀴즈";
}

function renderQuestion() {
  state.answered = false;
  const word = state.quizWords[state.currentIndex];
  const total = state.quizWords.length;
  const progress = ((state.currentIndex) / total) * 100;

  $("progressText").textContent = `${state.currentIndex + 1} / ${total}`;
  $("scoreText").textContent = `${state.score}점`;
  $("progressBar").style.width = `${progress}%`;
  $("quizModeLabel").textContent = state.reviewMode ? `오답 복습 · ${currentModeTitle()}` : currentModeTitle();
  $("feedback").textContent = "";
  $("feedback").className = "feedback";
  $("nextBtn").classList.add("hidden");
  $("typingArea").classList.add("hidden");
  $("choicesArea").innerHTML = "";
  $("typingInput").value = "";
  state.currentAnswer = "";

  let type = state.selectedMode;
  if (type === "mixed") type = Math.random() > 0.5 ? "meaning" : "word";
  state.currentQuestionType = type;

  if (type === "meaning") renderMeaningQuestion(word);
  if (type === "word") renderWordQuestion(word);
  if (type === "spelling") renderSpellingQuestion(word);
  if (type === "ox") renderOXQuestion(word);
}

function uniqueValues(items) {
  return [...new Set(items.filter(Boolean).map(item => String(item)))];
}

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
  $("questionArea").innerHTML = `
    <p class="prompt-small">영어 단어의 알맞은 뜻을 고르세요.</p>
    <div class="question-word"><span>${escapeHTML(word.word)}</span>${speakerButton(word.word)}</div>
  `;
  renderChoices(getMeaningChoices(word), word.meaning, "meaning");
}

function renderWordQuestion(word) {
  $("questionArea").innerHTML = `
    <p class="prompt-small">뜻에 맞는 영어 단어를 고르세요.</p>
    <div class="question-meaning">${escapeHTML(word.meaning)}</div>
  `;
  renderChoices(getWordChoices(word), word.word, "word");
}

function renderSpellingQuestion(word) {
  $("questionArea").innerHTML = `
    <p class="prompt-small">뜻에 맞는 영어 단어의 철자를 입력하세요.</p>
    <div class="question-meaning">${escapeHTML(word.meaning)}</div>
    <div style="margin-top:14px;">${speakerButton(word.word)}</div>
  `;
  state.currentAnswer = word.word;
  $("typingArea").classList.remove("hidden");
  setTimeout(() => $("typingInput").focus(), 50);
}

function renderOXQuestion(word) {
  const makeWrong = Math.random() > 0.5;
  let shownMeaning = word.meaning;
  if (makeWrong) {
    const wrongPool = lessonPool(word).filter(item => item.meaning !== word.meaning);
    if (wrongPool.length) shownMeaning = shuffle(wrongPool)[0].meaning;
  }
  const answer = shownMeaning === word.meaning ? "O" : "X";
  state.currentAnswer = answer;

  $("questionArea").innerHTML = `
    <p class="prompt-small">단어와 뜻이 맞으면 O, 틀리면 X를 고르세요.</p>
    <div class="question-word"><span>${escapeHTML(word.word)}</span>${speakerButton(word.word)}</div>
    <div class="question-meaning" style="margin-top:18px;">${escapeHTML(shownMeaning)}</div>
  `;
  renderChoices(["O", "X"], answer, "ox");
}

function renderChoices(choices, answer, type) {
  state.currentAnswer = answer;
  $("choicesArea").innerHTML = choices.map((choice, index) => {
    const speaker = type === "word" ? speakerButton(choice, true) : "";
    return `
      <div class="choice-row">
        <button class="choice-btn" data-choice-index="${index}">
          <span>${escapeHTML(choice)}</span>
        </button>
        ${speaker}
      </div>
    `;
  }).join("");
  $("choicesArea").querySelectorAll("[data-choice-index]").forEach(btn => {
    btn.addEventListener("click", () => {
      const choice = choices[Number(btn.dataset.choiceIndex)];
      checkChoice(btn, choice, answer);
    });
  });
}

function checkChoice(button, choice, answer) {
  if (state.answered) return;
  state.answered = true;
  const isCorrect = choice === answer;
  markAnswer(isCorrect, answer);

  document.querySelectorAll(".choice-btn").forEach(btn => {
    btn.disabled = true;
    const idx = Number(btn.dataset.choiceIndex);
    const rowChoice = btn.querySelector("span")?.textContent || "";
    if (rowChoice === answer) btn.classList.add("correct");
  });
  if (!isCorrect) button.classList.add("wrong");
}

function checkTypingAnswer() {
  if (state.answered) return;
  const current = state.quizWords[state.currentIndex];
  const userAnswer = normalizeAnswer($("typingInput").value);
  const correctAnswer = normalizeAnswer(current.word);
  const isCorrect = userAnswer === correctAnswer;
  state.answered = true;
  markAnswer(isCorrect, current.word);
}

function markAnswer(isCorrect, answer) {
  const current = state.quizWords[state.currentIndex];
  if (isCorrect) {
    state.score += 1;
    $("feedback").textContent = "정답입니다! 잘했어요 👍";
    $("feedback").className = "feedback good";
  } else {
    state.wrongWords.push(current);
    $("feedback").textContent = `오답입니다. 정답: ${answer}`;
    $("feedback").className = "feedback bad";
  }
  $("scoreText").textContent = `${state.score}점`;
  $("nextBtn").classList.remove("hidden");
}

function nextQuestion() {
  if (state.currentIndex < state.quizWords.length - 1) {
    state.currentIndex += 1;
    renderQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  const total = state.quizWords.length;
  const correct = state.score;
  const wrong = total - correct;
  const rate = total ? Math.round((correct / total) * 100) : 0;

  $("progressBar").style.width = "100%";
  $("resultSummary").textContent = `${state.selectedLevel}${state.selectedBook ? " · " + state.selectedBook : ""} · LESSON ${state.selectedLesson} · ${currentModeTitle()}`;
  $("statTotal").textContent = total;
  $("statCorrect").textContent = correct;
  $("statWrong").textContent = wrong;
  $("statRate").textContent = `${rate}%`;
  $("reviewWrongBtn").classList.toggle("hidden", state.wrongWords.length === 0);
  showScreen("result");
}

function goBack(target) {
  showScreen(target);
}

function goHome() {
  state.selectedLevel = null;
  state.selectedBook = "";
  state.selectedLesson = null;
  state.selectedMode = null;
  showScreen("home");
}

function bindEvents() {
  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => goBack(btn.getAttribute("data-back")));
  });
  $("lessonBackBtn").addEventListener("click", () => goBack($("lessonBackBtn").getAttribute("data-back")));
  $("typingSubmit").addEventListener("click", checkTypingAnswer);
  $("typingInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") checkTypingAnswer();
  });
  $("nextBtn").addEventListener("click", nextQuestion);
  $("reviewWrongBtn").addEventListener("click", () => startMode(state.selectedMode, state.wrongWords));
  $("retryBtn").addEventListener("click", () => startMode(state.selectedMode));
  $("homeBtn").addEventListener("click", goHome);
  document.addEventListener("click", (event) => {
    const speakBtn = event.target.closest("[data-speak]");
    if (!speakBtn) return;
    event.preventDefault();
    event.stopPropagation();
    speakWord(speakBtn.dataset.speak);
  });
}

async function init() {
  await loadWords();
  renderLevels();
  bindEvents();
}

init();
