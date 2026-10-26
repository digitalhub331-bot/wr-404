(() => {
  'use strict';

  const STORAGE_KEY = 'wr404-memory-log-v1';
  const chatLog = document.querySelector('#chatLog');
  const chatForm = document.querySelector('#chatForm');
  const messageInput = document.querySelector('#messageInput');
  const memoryForm = document.querySelector('#memoryForm');
  const memoryList = document.querySelector('#memoryList');
  const memoryConsent = document.querySelector('#memoryConsent');
  const toast = document.querySelector('#toast');
  const recentReplies = [];
  let memories = loadMemories();
  let saveConsent = false;
  let recognition = null;
  let voiceOutput = false;
  let toastTimer;

  // Optional future AI integration: keep the current offline mode as the default.
  // A public GitHub Pages frontend must never contain a private API key. Add a
  // same-origin serverless proxy only if a future deployment intentionally uses one.
  // const OPTIONAL_AI_ENDPOINT = "";

  const replySets = [
    [/\b(hello|hi|hey|good morning|good evening)\b/, [
      'Hello. What would be useful to talk through today?',
      'Hi. What’s on your mind?',
      'Hey. Where should we start?'
    ]],
    [/\b(is life important|does life matter|meaning of life|life meaning)\b/, [
      'Life can matter through the people we care for, what we create, and what we choose to learn. It does not need to feel meaningful every moment. What part of life feels most important to you right now?',
      'There may not be one answer that fits everyone. Meaning often grows from values, relationships, and small choices. What has felt meaningful to you lately?'
    ]],
    [/\b(overwhelm|too much to do|too many demands)\b/, [
      'That sounds heavy. When demands compete, it helps to separate what is urgent from what can wait. Which one thing is creating the most pressure right now?',
      'It sounds like too much is landing at once. Pick one thing you can influence today; the rest can be sorted after. What feels most urgent?'
    ]],
    [/\b(sad|unhappy|down|heartbroken|grief|grieving)\b/, [
      'I’m sorry this is weighing on you. You don’t have to force yourself to feel differently. Would it help to talk about what happened, or focus on getting through the next hour?',
      'That sounds painful. For now, try naming what hurts most without judging yourself for it. What happened?'
    ]],
    [/\b(anxious|anxiety|panic|nervous|worried|worry)\b/, [
      'Anxiety can make a possible outcome feel certain. What do you know for sure, and what are you afraid might happen? Separating those can make the next step clearer.',
      'That sounds unsettling. Take one slow breath, then name the specific thing you’re worried about. We can sort what is in your control.'
    ]],
    [/\b(stress|stressed|pressure)\b/, [
      'Stress often points to a demand that feels bigger than your current resources. What part can be reduced, delayed, or shared?',
      'You sound under pressure. One useful first move is to make the next task smaller—what is the first five-minute step?'
    ]],
    [/\b(motivat|can't keep going|cannot keep going|give up)\b/, [
      'Motivation is unreliable; a small repeatable action is steadier. What is the smallest useful step you can take today?',
      'You may not need a big burst of motivation—just a clear next move. Choose one action that takes ten minutes or less.'
    ]],
    [/\b(goal|goals|ambition|dream)\b/, [
      'A goal becomes easier to act on when it is specific and close enough to start. What would progress look like by the end of this week?',
      'Let’s make the goal concrete: what is the next visible action, and what might get in its way?'
    ]],
    [/\b(procrastinat|putting it off|can't start|cannot start)\b/, [
      'Avoidance often grows when a task feels unclear or uncomfortable. Set a five-minute timer and do only the first step. What task are you avoiding?',
      'Make the start almost too small to refuse: open the document, write one line, or gather one item. Which task needs that first step?'
    ]],
    [/\b(confidence|self-esteem|self esteem|believe in myself)\b/, [
      'Confidence tends to grow from evidence, not just reassurance. Choose one manageable action and notice that you followed through.',
      'You do not need to feel completely confident to act. What is one small situation where you could practice trusting your judgment?'
    ]],
    [/\b(lonely|loneliness|no friends|nobody cares)\b/, [
      'Feeling lonely is painful, but it does not prove you are unwanted. A small reach-out to one relatively safe person can create an opening. Is there someone you could message?',
      'It sounds like connection is missing right now. Consider sending one honest, low-pressure message to someone you trust.'
    ]],
    [/\b(breakup|broke up|ex boyfriend|ex girlfriend|heartbreak)\b/, [
      'A breakup can bring grief and relief in waves. You do not have to settle the whole story today. What feels hardest about it right now?',
      'This is a real loss, even if ending the relationship was right. For today, protect your routine and lean on someone you trust.'
    ]],
    [/\b(friend|friendship|family|parent|relationship|partner|trust|communication|argument|conflict|bullying|peer pressure)\b/, [
      'Try separating what happened from what you assume it means. Then decide what you want the other person to understand. What outcome are you hoping for?',
      'A clear conversation can start with what happened, how it affected you, and what you need next. What would you want to say plainly?'
    ]],
    [/\b(school|study|studying|exam|revision|homework|marks|grade|college|university)\b/, [
      'For studying, active recall usually beats rereading: close the book and explain the idea from memory, then check what you missed. What subject are you working on?',
      'Try a focused 25-minute session, then take a short break. Start by writing one question you want to be able to answer from memory.'
    ]],
    [/\b(career|job|resume|cv|interview|internship|workplace)\b/, [
      'A career choice is easier to explore as a small experiment. Pick one role, learn what a normal day looks like, and talk to someone who does it.',
      'You do not have to decide your whole future at once. What skill or field would you like to test next?'
    ]],
    [/\b(money|budget|saving|debt|income|expenses|money stress)\b/, [
      'A calm first step is to list what comes in and what goes out, without judging it. Then choose one small change. I can help with general budgeting, not personal financial advice.',
      'Money stress gets less vague when you write down the numbers and due dates. What expense or decision is pressing most?'
    ]],
    [/\b(sleep|insomnia|can't sleep|cannot sleep)\b/, [
      'Poor sleep can make everyday problems feel sharper. A steady wind-down and a consistent wake time may help. If it persists or affects your health, speak with a qualified professional.',
      'For tonight, reduce stimulation and give yourself a simple wind-down routine. If sleep problems keep affecting your day, consider getting professional advice.'
    ]],
    [/\b(habit|discipline|routine|time management|focus|concentration|procrastinat)\b/, [
      'Make the habit easier to repeat: attach it to something you already do, and keep the first version small. What habit are you trying to build?',
      'Consistency improves when the environment helps. Remove one obstacle and decide exactly when you’ll begin.'
    ]],
    [/\b(overthink|overthinking|can't stop thinking|cannot stop thinking|ruminat)\b/, [
      'Overthinking can resemble problem-solving while repeating the same loop. Write down the worry, what you know for sure, and one action within your control.',
      'Try asking: “Is there a decision to make, or am I replaying uncertainty?” If there is a decision, choose the next small step.'
    ]],
    [/\b(anger|angry|furious|jealous|jealousy|regret|rejection|criticis|perfectionis)\b/, [
      'That reaction may point to something you care about or a need that feels threatened. Pause before acting; choose a response you’ll still respect tomorrow.',
      'Name the feeling and the need beneath it before deciding what to do. A short pause can protect you from making the moment worse.'
    ]],
    [/\b(failure|failed|mistake|success|resilien|patience|gratitude|forgive|forgiveness|boundar|values|belief|purpose|meaning)\b/, [
      'Separate the event from the story you’re telling about yourself. What can this teach you, and what is one thing still within your control?',
      'A useful perspective is to focus on what this situation asks of you now, rather than judging your whole character by one moment.'
    ]],
    [/\b(stoic|stoicism)\b/, [
      'A practical Stoic idea is to separate your choices and effort from what you cannot control, such as another person’s reaction. Put attention where it can change something.',
      'Stoicism asks what is within your control and what is not. That distinction can help you spend effort more deliberately.'
    ]],
    [/\b(buddh|mindfulness|meditation|present moment)\b/, [
      'Mindfulness starts by noticing what is happening without immediately judging it. Name one thing you see, hear, and feel; then return to the task in front of you.',
      'Try observing a thought as a thought, rather than a fact or command. Then choose what deserves your attention next.'
    ]],
    [/\b(quote|deep quote|inspirational quote)\b/, [
      '“You do not need the whole map to take the next step.”',
      '“A quiet beginning is still a beginning.”',
      '“Clarity often comes after the first honest question.”'
    ]],
    [/\b(random topic|random topics|surprise me|talk about random|talk on random)\b/, [
      'Here’s a topic: What makes a place feel like home? What comes to mind first?',
      'Try this: Would you rather be able to remember every book you read or speak every language? Why?',
      'A question for us: Can a small daily habit change how someone sees themselves?'
    ]]
  ];

  function loadMemories() {
    try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(saved) ? saved : []; }
    catch { return []; }
  }

  function safeText(text) { return String(text).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function showToast(text) { const node = toast; node.textContent = text; node.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove('show'), 2400); }
  function saveMemories() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(memories)); renderMemories(); } catch { showToast('Could not save. Browser storage may be unavailable.'); } }
  function renderMemories() {
    document.querySelector('#memoryCount').textContent = String(memories.length).padStart(2, '0');
    if (!memories.length) { memoryList.innerHTML = '<p class="empty-memory">No saved notes. Add one when you’re ready.</p>'; return; }
    memoryList.innerHTML = memories.slice().reverse().map(item => `<article class="memory-entry"><div class="memory-entry-top"><span class="memory-type">${safeText(item.type || 'note')} · ${safeText(item.topic || 'life')}</span><span class="memory-date">${safeText(item.date || '')}<button class="delete-entry" type="button" data-delete="${safeText(item.id)}" aria-label="Delete memory entry">×</button></span></div><p class="memory-content">${safeText(item.content || '')}</p></article>`).join('');
  }
  function addMemory(type, content, topic='life') {
    const clean = content.trim(); if (!clean) return false;
    const summary = clean.slice(0, 140);
    memories.push({id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, type, topic, summary, user_words: clean.slice(0, 500), insight: 'You chose to keep this note for later reflection.', next_step: '', content: clean.slice(0, 500), date: new Date().toLocaleDateString()});
    saveMemories(); return true;
  }
  function addMessage(role, text, extra='') {
    const article = document.createElement('article'); article.className = `message ${role === 'user' ? 'user-message' : 'bot-message'}`;
    article.innerHTML = `<div class="speaker"><span class="speaker-mark">${role === 'user' ? 'YOU' : 'WR'}</span><span>${role === 'user' ? 'USER' : 'WR-404'} <small>${role === 'user' ? 'INPUT' : 'RESPONSE'}</small></span></div><div class="message-body"><p>${safeText(text)}</p>${extra}</div>`;
    chatLog.append(article); chatLog.scrollTop = chatLog.scrollHeight;
    if (role === 'bot' && voiceOutput && 'speechSynthesis' in window) { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(text)); }
    return article;
  }
  function classifyMemory(message) {
    const m = message.toLowerCase();
    if (/\b(goal|i want to|i hope to|i'm trying to|i am trying to)\b/.test(m)) return ['goal','life'];
    if (/\b(i feel|i'm feeling|i am feeling|i am happy|i'm happy|i am sad|i'm sad)\b/.test(m)) return ['feeling','life'];
    if (/\b(mark|score|exam result|grade)\b/.test(m)) return ['result','study'];
    if (/\b(i believe|my belief)\b/.test(m)) return ['belief','life'];
    if (/\b(lesson|learned that|life taught me)\b/.test(m)) return ['lesson','life'];
    if (/\b(quote|words to remember)\b/.test(m)) return ['quote','life'];
    if (/\b(idea|i discovered|i realised|i realized|i found out)\b/.test(m)) return ['idea','life'];
    return null;
  }
  function chooseReply(message) {
    const m = message.toLowerCase();
    if (/\b(suicid|kill myself|end my life|hurt myself|self.?harm|immediate danger|being abused)\b/.test(m)) return 'I’m sorry you’re facing this. If you may be in immediate danger, contact your local emergency service now and tell a trusted person who can stay with you. If you’re in India, call 112 for emergency help or Tele-MANAS at 14416. Are you safe right now?';
    if (/\b(is life important|does life matter|is life worth living)\b/.test(m)) return 'Yes. Your life matters, even if it is hard to feel that right now. If this question is personal, please tell someone you trust how you’re doing. Are you safe at this moment?';
    if (/\b(describe yourself|about yourself|who are you)\b/.test(m)) return 'I’m WR-404, a reflection chatbot. I can help you sort a situation into facts, feelings, assumptions, and options. I’m software, not a person or a professional adviser.';
    if (/\b(do you want to know|want to hear).{0,45}\b(score|marks|scored|result)\b/.test(m)) return 'Yes—tell me. It sounds like you’re pleased with your work, and I’d like to hear how it went.';
    if (/\b(what is trust|define trust|describe trust)\b/.test(m)) return 'Trust is feeling able to rely on someone because their actions are consistent and honest. It grows through repeated behavior, not promises alone.';
    if (/\b(teach|explain).{0,35}\b(tenses?)\b/.test(m)) return 'The three basic English tenses are present (I walk), past (I walked), and future (I will walk). They show when an action happens. Try changing one sentence into all three.';
    if (/\b(snell|refraction)\b/.test(m)) return 'Snell’s law describes how light bends between materials: n₁ sin(θ₁) = n₂ sin(θ₂). The angles are measured from the normal, a line perpendicular to the surface. Light bends toward the normal when it enters a material with a higher refractive index.';
    if (/\b(talk about life|talk about emotions|what are emotions|describe emotions?)\b/.test(m)) return /emotion/.test(m) ? 'Emotions are signals, not commands. They can point to what matters, hurts, scares you, or what you need. Naming one clearly can make the next choice easier.' : 'Life gets meaning from what we value, build, learn, and share. It will not always feel clear or fair, but small choices can shape its direction. What matters most to you right now?';
    const match = replySets.find(([pattern]) => pattern.test(m));
    if (match) {
      const available = match[1].filter(text => !recentReplies.includes(text));
      let answer = (available.length ? available : match[1])[Math.floor(Math.random() * (available.length || match[1].length))];
      if (!available.length) {
        const angles = [' A useful next step is to name the part you can influence.', ' You could also look at what you need most in this situation.', ' Try focusing on one choice you can make today.'];
        answer += angles[recentReplies.length % angles.length];
      }
      recentReplies.push(answer); if (recentReplies.length > 12) recentReplies.shift(); return answer;
    }
    if (/\b(tell me about|explain|what is|how do i|how can i|help me with|talk about)\b/.test(m)) return 'I can help think that through. Tell me which part you want to understand or change, and I’ll keep the answer practical.';
    return 'I want to understand what you mean before I advise. What feels like the main issue here?';
  }
  function respond(message) {
    addMessage('user', message);
    const memory = classifyMemory(message);
    const saveButton = memory ? `<button class="save-suggestion" type="button" data-save-note="${safeText(memory[0])}" data-topic="${safeText(memory[1])}" data-content="${safeText(message)}">SAVE THIS TO MEMORY LOG</button>` : '';
    window.setTimeout(() => addMessage('bot', chooseReply(message), saveButton), 260);
  }

  chatForm.addEventListener('submit', event => {
    event.preventDefault(); const text = messageInput.value.trim(); if (!text) return;
    messageInput.value = ''; messageInput.style.height = 'auto'; respond(text);
  });
  messageInput.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); chatForm.requestSubmit(); } });
  messageInput.addEventListener('input', () => { messageInput.style.height = 'auto'; messageInput.style.height = `${Math.min(messageInput.scrollHeight, 150)}px`; });
  document.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => { messageInput.value = button.dataset.prompt; chatForm.requestSubmit(); }));
  memoryForm.addEventListener('submit', event => {
    event.preventDefault(); const content = document.querySelector('#memoryInput').value.trim();
    if (!saveConsent) { showToast('Choose “I agree” before saving a note.'); return; }
    if (addMemory(document.querySelector('#memoryType').value, content)) { document.querySelector('#memoryInput').value = ''; showToast('Saved in this browser.'); }
  });
  memoryConsent.addEventListener('change', () => { saveConsent = memoryConsent.checked; showToast(saveConsent ? 'Memory saving enabled.' : 'Memory saving disabled. Existing notes remain until deleted.'); });
  memoryList.addEventListener('click', event => {
    const deleteButton = event.target.closest('[data-delete]'); if (!deleteButton) return;
    memories = memories.filter(item => item.id !== deleteButton.dataset.delete); saveMemories(); showToast('Entry deleted.');
  });
  chatLog.addEventListener('click', event => {
    const button = event.target.closest('[data-save-note]'); if (!button) return;
    if (!saveConsent) { showToast('Choose “I agree” in MEMORY LOG before saving.'); return; }
    if (addMemory(button.dataset.saveNote, button.dataset.content, button.dataset.topic)) { button.textContent = 'SAVED TO MEMORY LOG'; button.disabled = true; }
  });
  document.querySelector('#clearMemory').addEventListener('click', () => {
    if (!memories.length) return showToast('Memory log is already empty.');
    if (!window.confirm('Delete all saved notes from this browser?')) return;
    memories = []; saveMemories(); showToast('All saved notes deleted.');
  });
  document.querySelector('#clearChat').addEventListener('click', () => {
    chatLog.innerHTML = '<article class="message bot-message"><div class="speaker"><span class="speaker-mark">WR</span><span>WR-404 <small>READY</small></span></div><div class="message-body"><p>Session cleared. What would be useful to think through now?</p></div></article>';
    recentReplies.length = 0;
  });

  document.querySelector('#voiceOutput').addEventListener('click', event => {
    voiceOutput = !voiceOutput; event.currentTarget.textContent = voiceOutput ? 'VOICE ON' : 'VOICE OFF'; event.currentTarget.setAttribute('aria-pressed', String(voiceOutput));
    if (!voiceOutput && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  });
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const voiceInput = document.querySelector('#voiceInput');
  if (SpeechRecognition) {
    recognition = new SpeechRecognition(); recognition.lang = navigator.language || 'en-US'; recognition.interimResults = false;
    recognition.onresult = event => { messageInput.value = `${messageInput.value} ${event.results[0][0].transcript}`.trim(); messageInput.focus(); messageInput.dispatchEvent(new Event('input')); };
    recognition.onerror = () => showToast('Voice input failed. Check browser microphone permission.');
    recognition.onend = () => { voiceInput.classList.remove('listening'); voiceInput.textContent = 'MIC'; };
    voiceInput.addEventListener('click', () => { try { recognition.start(); voiceInput.classList.add('listening'); voiceInput.textContent = 'LISTENING'; } catch { recognition.stop(); } });
  } else { voiceInput.disabled = true; voiceInput.title = 'Voice input is not available in this browser.'; }

  renderMemories();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
})();
