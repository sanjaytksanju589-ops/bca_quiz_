const KEY = { users: "bca_users_v1", attempts: "bca_attempts_v1", session: "bca_session_v1" };
const ADMIN_DEMO = { username: "sanjaytksanju589@gamil.com", password: "sanju@143" };
let role = "student", currentUser = null, quiz = null, timerId = null, questionStartedAt = 0;

const $ = id => document.getElementById(id);
const get = (k, f = []) => JSON.parse(localStorage.getItem(k) || JSON.stringify(f));
const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const uid = () => crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random();

function show(view) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  $(view).classList.add("active");
}
function users() { return get(KEY.users, []); }
function attempts() { return get(KEY.attempts, []); }
function saveSession() { set(KEY.session, { role, user: currentUser }); }
function clearSession() { localStorage.removeItem(KEY.session); currentUser = null; role = "student"; }

function seed() {
  if (!localStorage.getItem(KEY.users)) set(KEY.users, []);
  if (!localStorage.getItem(KEY.attempts)) set(KEY.attempts, []);
}
function particles() {
  const wrap = $("particles");
  for (let i = 0; i < 65; i++) {
    const p = document.createElement("i"); p.className = "particle";
    p.style.left = Math.random() * 100 + "%"; p.style.animationDuration = (8 + Math.random() * 14) + "s";
    p.style.animationDelay = (-Math.random() * 18) + "s"; p.style.opacity = (.2 + Math.random() * .7);
    wrap.appendChild(p);
  }
}
function togglePassword(e) {
  const btn = e.currentTarget, input = $(btn.dataset.target);
  input.type = input.type === "password" ? "text" : "password";
  btn.textContent = input.type === "password" ? "◉" : "◌";
  btn.setAttribute("aria-label", input.type === "password" ? "Show password" : "Hide password");
}
document.querySelectorAll(".eye").forEach(b => b.addEventListener("click", togglePassword));

document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  tab.classList.add("active"); role = tab.dataset.auth;
  $("registerPanel").classList.toggle("hidden", role !== "student");
  $("registerForm").classList.add("hidden"); $("loginError").textContent = "";
}));

$("showRegister").onclick = () => { $("loginForm").classList.add("hidden"); $("registerPanel").classList.add("hidden"); $("registerForm").classList.remove("hidden") };
$("cancelRegister").onclick = () => { $("registerForm").classList.add("hidden"); $("loginForm").classList.remove("hidden"); $("registerPanel").classList.remove("hidden") };

$("registerForm").onsubmit = e => {
  e.preventDefault();
  const name = $("regName").value.trim(), email = $("regEmail").value.trim().toLowerCase(), password = $("regPassword").value;
  if (users().some(u => u.email === email)) return $("registerError").textContent = "An account with this email already exists.";
  const user = { id: uid(), name, email, password, createdAt: new Date().toISOString() };
  set(KEY.users, [...users(), user]); currentUser = user; role = "student"; saveSession(); openStudent();
};

$("loginForm").onsubmit = e => {
  e.preventDefault();
  const id = $("loginId").value.trim().toLowerCase(), password = $("loginPassword").value;
  $("loginError").textContent = "";
  if (role === "admin") {
    if (id === ADMIN_DEMO.username && password === ADMIN_DEMO.password) { currentUser = { name: "Administrator", username: "admin" }; saveSession(); openAdmin(); }
    else $("loginError").textContent = "Invalid demo admin credentials.";
  } else {
    const u = users().find(x => (x.email === id || x.name.toLowerCase() === id) && x.password === password);
    if (!u) $("loginError").textContent = "Invalid student credentials. Please register first.";
    else { currentUser = u; saveSession(); openStudent(); }
  }
};

function userAttempts() { return attempts().filter(a => a.userId === currentUser.id) }
function passed(level) { return userAttempts().some(a => a.level === level && a.passed) }
function unlocked(level) { return level === 1 || passed(level - 1) }
function openStudent() {
  role = "student"; show("studentView"); $("navUser").textContent = currentUser.name; renderStudent();
}
function renderStudent() {
  const ats = userAttempts(), passedLevels = [1, 2, 3].filter(passed);
  $("studentName").textContent = currentUser.name;
  $("attemptCount").textContent = ats.length;
  $("unlockedCount").textContent = `${1 + passedLevels.length} / 3`;
  $("currentLevel").textContent = Math.min(3, 1 + passedLevels.length);
  const scores = ats.map(a => a.percentage); $("overallScore").textContent = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) + "%" : "0%";
  const names = { 1: "BCA Fundamentals", 2: "Intermediate Computer Science", 3: "Advanced BCA Challenge" };
  const desc = { 1: "Computer fundamentals, programming, DBMS, OS, networks and web basics.", 2: "Intermediate algorithms, systems, databases, software engineering and security.", 3: "Advanced algorithms, architecture, distributed systems, security and problem-solving." };
  $("levelGrid").innerHTML = [1, 2, 3].map(l => {
    const can = unlocked(l), done = passed(l);
    return `<article class="level-card glass ${can ? "" : "locked"}">
      <div class="level-no">0${l}</div><h3>${names[l]}</h3><p>${desc[l]}</p>
      <button class="${can ? "primary-btn" : "ghost-btn"}" ${can ? "" : "disabled"} onclick="startQuiz(${l})">${done ? "Retry Level" : "Start Level"}</button>
    </article>`;
  }).join("");
  $("studentAttempts").innerHTML = ats.length ? ats.slice().reverse().slice(0, 8).map(a => `
    <div class="attempt"><span>Level ${a.level}</span><span>${a.correct}/30</span><span>${a.percentage.toFixed(2)}%</span><strong class="${a.passed ? "pass" : "fail"}">${a.passed ? "PASS" : "FAIL"}</strong></div>`).join("") : "<p class='muted'>No attempts yet. Start Level 1 to begin.</p>";
}

function startQuiz(level) {
  if (!unlocked(level)) return;
  quiz = { level, index: 0, answers: Array(30).fill(null), startedAt: Date.now(), questionTimes: Array(30).fill(0), locked: false };
  show("quizView"); renderQuestion();
}
function renderQuestion() {
  clearInterval(timerId); const q = QUIZ_DATA[String(quiz.level)][quiz.index];
  $("quizLevelLabel").textContent = `LEVEL ${quiz.level}`;
  $("quizLevelTitle").textContent = ["", "BCA Fundamentals", "Intermediate Computer Science", "Advanced BCA Challenge"][quiz.level];
  $("questionNumber").textContent = `Question ${quiz.index + 1} / 30`;
  $("questionTopic").textContent = q.topic;
  $("questionText").textContent = q.question;
  $("quizProgress").style.width = ((quiz.index + 1) / 30 * 100) + "%";
  $("answers").innerHTML = q.options.map((o, i) => `<button class="answer ${quiz.answers[quiz.index] === i ? "selected" : ""}" onclick="selectAnswer(${i})"><span class="letter">${String.fromCharCode(65 + i)}</span><span>${escapeHTML(o)}</span></button>`).join("");
  $("nextQuestion").disabled = quiz.answers[quiz.index] === null;
  $("nextQuestion").textContent = quiz.index === 29 ? "Finish Quiz →" : "Next Question →";
  $("answerState").textContent = quiz.answers[quiz.index] === null ? "Select one answer" : "Answer selected";
  questionStartedAt = Date.now(); let remaining = 20; updateTimer(remaining);
  timerId = setInterval(() => { remaining--; updateTimer(remaining); if (remaining <= 0) { clearInterval(timerId); quiz.questionTimes[quiz.index] += 20; nextQuestion(true) } }, 1000);
}
function updateTimer(n) { $("timer").textContent = n; $("timer").classList.toggle("warning", n <= 5) }
function selectAnswer(i) {
  if (quiz.locked) return; quiz.answers[quiz.index] = i;
  document.querySelectorAll(".answer").forEach((b, idx) => b.classList.toggle("selected", idx === i));
  $("nextQuestion").disabled = false; $("answerState").textContent = "Answer selected";
}
function nextQuestion(timeout = false) {
  if (quiz.locked) return; quiz.questionTimes[quiz.index] += Math.min(20, (Date.now() - questionStartedAt) / 1000);
  if (quiz.index < 29) { quiz.index++; renderQuestion() } else finishQuiz();
}
$("nextQuestion").onclick = () => nextQuestion(false);
$("exitQuiz").onclick = () => { if (confirm("Exit this quiz? Your current attempt will not be scored.")) { clearInterval(timerId); openStudent() } };

function finishQuiz() {
  clearInterval(timerId); quiz.locked = true;
  const qs = QUIZ_DATA[String(quiz.level)], correct = quiz.answers.reduce((n, a, i) => n + (a === qs[i].answer ? 1 : 0), 0);
  const unanswered = quiz.answers.filter(a => a === null).length, wrong = 30 - correct - unanswered, percentage = correct / 30 * 100, passedNow = percentage >= 75;
  const totalTime = Math.round((Date.now() - quiz.startedAt) / 1000);
  const attempt = { id: uid(), userId: currentUser.id, userName: currentUser.name, email: currentUser.email, level: quiz.level, correct, wrong, unanswered, percentage, passed: passedNow, timeUsed: totalTime, date: new Date().toISOString() };
  set(KEY.attempts, [...attempts(), attempt]); renderResult(attempt);
}
function renderResult(a) {
  show("resultView"); $("resultTitle").textContent = a.passed ? `Level ${a.level} Cleared!` : `Level ${a.level} Not Cleared`;
  $("resultPercentage").textContent = a.percentage.toFixed(2) + "%"; $("resultStatus").textContent = a.passed ? "PASS" : "FAIL";
  $("resultStatus").className = a.passed ? "pass" : "fail"; $("resultCorrect").textContent = a.correct; $("resultWrong").textContent = a.wrong; $("resultUnanswered").textContent = a.unanswered;
  $("resultTime").textContent = formatTime(a.timeUsed); $("resultIcon").textContent = a.passed ? "✓" : "×"; $("resultIcon").classList.toggle("fail-icon", !a.passed);
  $("resultPrimary").textContent = a.passed && a.level < 3 ? `Continue to Level ${a.level + 1}` : "Retry Level";
  $("resultPrimary").onclick = () => a.passed && a.level < 3 ? startQuiz(a.level + 1) : startQuiz(a.level);
}
$("resultHome").onclick = openStudent;
$("studentLogout").onclick = () => { clearSession(); show("authView") };

function openAdmin() { role = "admin"; show("adminView"); renderAdmin() }
function renderAdmin() {
  const us = users(), ats = attempts();
  const passCount = l => ats.filter(a => a.level === l && a.passed).length;
  $("adminStats").innerHTML = [["Registered Students", us.length], ["Total Attempts", ats.length], ["L1 Passed", passCount(1)], ["L2 Passed", passCount(2)], ["L3 Passed", passCount(3)]].map(x => `<div class="glass stat"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join("");
  renderResults();
}
function renderResults() {
  const search = $("searchResults").value.trim().toLowerCase(), lf = $("levelFilter").value, sf = $("statusFilter").value;
  const rows = attempts().slice().reverse().filter(a => {
    const text = (a.userName + " " + a.email).toLowerCase();
    return (!search || text.includes(search)) && (lf === "all" || String(a.level) === lf) && (sf === "all" || (a.passed ? "PASS" : "FAIL") === sf);
  });
  $("resultsBody").innerHTML = rows.length ? rows.map(a => `<tr><td>${escapeHTML(a.userName)}<br><small class="muted">${escapeHTML(a.email || "")}</small></td><td>Level ${a.level}</td><td>${a.correct}/30</td><td>${a.percentage.toFixed(2)}%</td><td class="${a.passed ? "pass" : "fail"}">${a.passed ? "PASS" : "FAIL"}</td><td>${new Date(a.date).toLocaleString()}</td></tr>`).join("") : `<tr><td colspan="6">No results found.</td></tr>`;
}
["searchResults", "levelFilter", "statusFilter"].forEach(id => $(id).addEventListener("input", renderResults));
$("adminLogout").onclick = () => { clearSession(); show("authView") };

function escapeHTML(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])) }
function formatTime(sec) { const m = Math.floor(sec / 60), s = Math.round(sec % 60); return `${m}m ${s}s` }

function restore() {
  seed(); particles();
  const s = get(KEY.session, null);
  if (s?.role === "student" && s.user) { currentUser = s.user; openStudent() }
  else if (s?.role === "admin") { currentUser = s.user; openAdmin() }
  else show("authView");
}
restore();
