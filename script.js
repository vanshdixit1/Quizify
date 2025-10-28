/* Simple multiple-choice quiz script
   Features:
   - questions array with text and choices
   - next button navigation
   - scoring and localStorage high score
   - progress bar
*/
const QUIZ_KEY = 'quiz_highscore_v1';
const TIMER_KEY = 'quiz_timer_enabled_v1';
const TIMER_LEN_KEY = 'quiz_timer_length_v1';
const DEFAULT_TIMER_SECONDS = 30;

const questions = [
  // Technology
  { id: 1, q: 'Which language runs in a web browser?', choices: ['Java','C','Python','JavaScript'], answer: 3, category: 'Technology' },
  { id: 2, q: 'What does CSS stand for?', choices: ['Central Style Sheets','Cascading Style Sheets','Cascading Simple Sheets','Computer Style Sheets'], answer: 1, category: 'Technology' },
  { id: 3, q: 'What does HTML stand for?', choices: ['Hyper Trainer Marking Language','Hyper Text Marketing Language','Hyper Text Markup Language','Hyper Text Markup Leveler'], answer: 2, category: 'Technology' },
  { id: 4, q: 'What does CPU stand for?', choices: ['Central Processing Unit','Computer Personal Unit','Central Process Unit','Control Processing Unit'], answer: 0, category: 'Technology' },
  { id: 5, q: 'Which protocol is primarily used to load web pages?', choices: ['FTP','HTTP','SMTP','SSH'], answer: 1, category: 'Technology' },
  // Art
  { id: 10, q: 'Which artist painted the Mona Lisa?', choices: ['Van Gogh','Leonardo da Vinci','Pablo Picasso','Claude Monet'], answer: 1, category: 'Art' },
  { id: 11, q: 'The painting "Starry Night" was painted by?', choices: ['Salvador Dali','Vincent van Gogh','Edvard Munch','Henri Matisse'], answer: 1, category: 'Art' },
  { id: 12, q: 'Which art movement is Andy Warhol associated with?', choices: ['Impressionism','Surrealism','Pop Art','Baroque'], answer: 2, category: 'Art' },
  { id: 13, q: 'Which medium uses paint applied to wet plaster?', choices: ['Tempera','Fresco','Oil','Acrylic'], answer: 1, category: 'Art' },
  { id: 14, q: 'Which artist is associated with Cubism?', choices: ['Pablo Picasso','Salvador Dali','Claude Monet','Rembrandt'], answer: 0, category: 'Art' },

  // Literature
  { id: 20, q: 'Who wrote "Romeo and Juliet"?', choices: ['Charles Dickens','William Shakespeare','Jane Austen','Mark Twain'], answer: 1, category: 'Literature' },
  { id: 21, q: 'Which novel begins with "Call me Ishmael"?', choices: ['Moby-Dick','Great Expectations','Ulysses','The Odyssey'], answer: 0, category: 'Literature' },
  { id: 22, q: 'Who is the author of "1984"?', choices: ['Aldous Huxley','George Orwell','F. Scott Fitzgerald','J.R.R. Tolkien'], answer: 1, category: 'Literature' },
  { id: 23, q: 'Who wrote "Pride and Prejudice"?', choices: ['Charlotte Brontë','Jane Austen','Emily Dickinson','Louisa May Alcott'], answer: 1, category: 'Literature' },
  { id: 24, q: 'Which work is by Homer?', choices: ['The Iliad','Don Quixote','Hamlet','The Aeneid'], answer: 0, category: 'Literature' },

  // Science
  { id: 30, q: 'What is the chemical symbol for water?', choices: ['H2O','O2','CO2','NaCl'], answer: 0, category: 'Science' },
  { id: 31, q: 'Who developed the theory of relativity?', choices: ['Isaac Newton','Albert Einstein','Nikola Tesla','Galileo Galilei'], answer: 1, category: 'Science' },
  { id: 32, q: 'What planet is known as the Red Planet?', choices: ['Venus','Mars','Jupiter','Mercury'], answer: 1, category: 'Science' },
  { id: 33, q: 'What gas do plants produce during photosynthesis?', choices: ['Oxygen','Hydrogen','Nitrogen','Carbon Monoxide'], answer: 0, category: 'Science' },
  { id: 34, q: 'What is the force that keeps us on the ground?', choices: ['Magnetism','Gravity','Friction','Electrostatic'], answer: 1, category: 'Science' },

  // History
  { id: 40, q: 'Which year did World War II end?', choices: ['1940','1942','1945','1950'], answer: 2, category: 'History' },
  { id: 41, q: 'Who was the first President of the United States?', choices: ['Abraham Lincoln','George Washington','Thomas Jefferson','John Adams'], answer: 1, category: 'History' },
  { id: 42, q: 'The Great Wall is located in which country?', choices: ['India','China','Japan','Korea'], answer: 1, category: 'History' },
  { id: 43, q: 'In which year did the Berlin Wall fall?', choices: ['1989','1979','1999','1969'], answer: 0, category: 'History' },
  { id: 44, q: 'Who was known as the Maid of Orleans?', choices: ['Joan of Arc','Catherine the Great','Cleopatra','Boudica'], answer: 0, category: 'History' },

  // Geography
  { id: 50, q: 'What is the largest ocean on Earth?', choices: ['Atlantic','Pacific','Indian','Arctic'], answer: 1, category: 'Geography' },
  { id: 51, q: 'Which country has the city of Cairo?', choices: ['Egypt','Morocco','Turkey','Greece'], answer: 0, category: 'Geography' },
  { id: 52, q: 'Mount Everest is located on which mountain range?', choices: ['Andes','Rockies','Himalayas','Alps'], answer: 2, category: 'Geography' },
  { id: 53, q: 'Which continent is Brazil in?', choices: ['Africa','South America','Asia','Europe'], answer: 1, category: 'Geography' },
  { id: 54, q: 'Which river runs through Baghdad?', choices: ['Nile','Amazon','Tigris','Volga'], answer: 2, category: 'Geography' },

  // Sports
  { id: 60, q: 'How many players are there in a football (soccer) team on the field?', choices: ['9','10','11','12'], answer: 2, category: 'Sports' },
  { id: 61, q: 'Which sport uses a shuttlecock?', choices: ['Tennis','Badminton','Squash','Table Tennis'], answer: 1, category: 'Sports' },
  { id: 62, q: 'In which sport is the term "home run" used?', choices: ['Cricket','Baseball','Basketball','Rugby'], answer: 1, category: 'Sports' },
  { id: 63, q: 'How many points is a touchdown worth in American football?', choices: ['3','6','1','2'], answer: 1, category: 'Sports' },
  { id: 64, q: 'Which Grand Slam is played on clay?', choices: ['Wimbledon','US Open','Australian Open','French Open'], answer: 3, category: 'Sports' },

  // Music
  { id: 70, q: 'Who is known as the "King of Pop"?', choices: ['Elvis Presley','Michael Jackson','Prince','Justin Bieber'], answer: 1, category: 'Music' },
  { id: 71, q: 'Which instrument has keys and pedals and strings?', choices: ['Guitar','Violin','Piano','Drums'], answer: 2, category: 'Music' },
  { id: 72, q: 'Which composer wrote the "Fifth Symphony"?', choices: ['Mozart','Beethoven','Bach','Tchaikovsky'], answer: 1, category: 'Music' },
  { id: 73, q: 'Which band recorded "Hey Jude"?', choices: ['The Rolling Stones','The Beatles','Queen','Pink Floyd'], answer: 1, category: 'Music' },
  { id: 74, q: 'Which instrument is primarily used in jazz and has a reed?', choices: ['Trumpet','Saxophone','Cello','Oboe'], answer: 1, category: 'Music' },

  // Movies
  { id: 80, q: 'Which movie features the character Darth Vader?', choices: ['Star Trek','Star Wars','The Matrix','Avatar'], answer: 1, category: 'Movies' },
  { id: 81, q: 'Which director is known for the movie "Jurassic Park"?', choices: ['Steven Spielberg','James Cameron','Christopher Nolan','Martin Scorsese'], answer: 0, category: 'Movies' },
  { id: 82, q: 'Which movie won Best Picture at the 1994 Oscars?', choices: ['Pulp Fiction','Forrest Gump','The Shawshank Redemption','Braveheart'], answer: 1, category: 'Movies' },
  { id: 83, q: 'Which actor played the character Jack in "Titanic"?', choices: ['Brad Pitt','Leonardo DiCaprio','Tom Cruise','Matt Damon'], answer: 1, category: 'Movies' },
  { id: 84, q: 'Which film is directed by Christopher Nolan and features a dream-within-dream concept?', choices: ['Inception','Memento','Dunkirk','Interstellar'], answer: 0, category: 'Movies' },

  // Languages
  { id: 90, q: 'What is the most spoken language in the world by native speakers?', choices: ['English','Mandarin Chinese','Spanish','Hindi'], answer: 1, category: 'Languages' },
  { id: 91, q: '"Bonjour" is a greeting in which language?', choices: ['Spanish','French','German','Italian'], answer: 1, category: 'Languages' },
  { id: 92, q: 'Which language uses Cyrillic script?', choices: ['Arabic','Hebrew','Russian','Greek'], answer: 2, category: 'Languages' },
  { id: 93, q: 'Which language is primarily spoken in Brazil?', choices: ['Spanish','Portuguese','French','English'], answer: 1, category: 'Languages' },
  { id: 94, q: 'What is the official language of Egypt?', choices: ['Arabic','Turkish','Persian','Hebrew'], answer: 0, category: 'Languages' },

  // Mathematics
  { id: 100, q: 'What is 7 x 8?', choices: ['54','56','58','60'], answer: 1, category: 'Mathematics' },
  { id: 101, q: 'What is the value of pi (approx)?', choices: ['2.14','2.72','3.14','4.13'], answer: 2, category: 'Mathematics' },
  { id: 102, q: 'What is the square root of 81?', choices: ['7','8','9','10'], answer: 2, category: 'Mathematics' },
  { id: 103, q: 'What is 12 divided by 3?', choices: ['3','4','6','5'], answer: 1, category: 'Mathematics' },
  { id: 104, q: 'What is the next prime after 7?', choices: ['9','10','11','13'], answer: 2, category: 'Mathematics' },

  // General Knowledge
  { id: 110, q: 'Which color do you get by mixing red and white?', choices: ['Pink','Brown','Orange','Purple'], answer: 0, category: 'General' },
  { id: 111, q: 'What currency is used in Japan?', choices: ['Yuan','Dollar','Yen','Won'], answer: 2, category: 'General' },
  { id: 112, q: 'Which gas do plants primarily absorb from the air?', choices: ['Oxygen','Nitrogen','Carbon Dioxide','Hydrogen'], answer: 2, category: 'General' },
  { id: 113, q: 'Which planet is known for its rings?', choices: ['Mars','Saturn','Jupiter','Uranus'], answer: 1, category: 'General' },
  { id: 114, q: 'What is the boiling point of water at sea level in °C?', choices: ['90°C','95°C','100°C','105°C'], answer: 2, category: 'General' }
];
// background images per category (Unsplash source links)
const BG_IMAGES = {
  // more art-focused background (paint brushes / palette)
  'Art': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1600&q=60',
  'Literature': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1600&q=60',
  // more science-focused background (laboratory / microscope / equipment)
  'Science': 'https://img.freepik.com/free-vector/hand-drawn-colorful-science-education-background_23-2148489182.jpg',
  // history-relevant background (classical ruins / columns)
  'History': 'https://tse3.mm.bing.net/th/id/OIP.OF12EdAlJq4u16ZS9FznYQHaE3?rs=1&pid=ImgDetMain&o=7&rm=3',
  'Geography': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=60',
  // sports-relevant background (stadium / action shot)
  'Sports': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1600&q=60',
  'Technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=60',
  // music-relevant background (piano / instruments)
  'Music': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1600&q=60',
  // movies-relevant background (cinema / film reel / projector)
    'Movies': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1950&q=80',
  'Languages': 'https://wallpaperaccess.com/full/1260521.jpg',
  'Mathematics': 'https://th.bing.com/th/id/R.ba01d095b9f9a650e61d8f49d2b28519?rik=rVVFOj18ozgpZw&riu=http%3a%2f%2fwww.pixelstalk.net%2fwp-content%2fuploads%2f2016%2f05%2fMath-Mathematics-Formula-Wallpaper-for-PC.jpg&ehk=%2bfTho6j8Ym8wGaYhOjf%2bGXs56O7AyL38fNlEbHjIzqQ%3d&risl=&pid=ImgRaw&r=0',
  'General': 'https://wallpapercave.com/wp/wp9440117.jpg'
};

function applyBackgroundForCategory(cat){
  // overlay plus image — try a case-insensitive lookup so 'science' or 'Science' both work
  const keys = Object.keys(BG_IMAGES);
  const norm = String(cat || '').toLowerCase();
  let key = keys.find(k => String(k).toLowerCase() === norm);
  // fallback: try singular/plural variants (movie <-> movies)
  if(!key){
    const alt = norm.endsWith('s') ? norm.slice(0, -1) : norm + 's';
    key = keys.find(k => String(k).toLowerCase() === alt);
  }
  const img = (key && BG_IMAGES[key]) || BG_IMAGES[cat] || 'https://images.unsplash.com/photo-1505765050711-1e6d7f3a8f3a?auto=format&fit=crop&w=1600&q=60';
  // use a much lighter overlay so the image reads brighter but still keeps contrast
  document.body.style.backgroundImage = `linear-gradient(180deg, rgba(3,7,18,0.18), rgba(3,7,18,0.08)), url('${img}')`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center center';
  document.body.style.backgroundAttachment = 'fixed';
  // enable high-contrast dark text over category backgrounds
  try{ document.body.classList.add('category-text-dark'); }catch(e){}
}

// runtime filtered questions by category
let filteredQuestions = questions;
let selectedCategory = null;

let state = {
  index: 0,
  score: 0,
  answered: false
};

let timer = {
  enabled: false,
  remaining: DEFAULT_TIMER_SECONDS,
  id: null,
  total: DEFAULT_TIMER_SECONDS
};
let raf = { id: null, startTs: null, pausedAt: null, running: false };

// elements
const el = {
  title: null,
  meta: null,
  question: null,
  answers: null,
  nextBtn: null,
  progressBar: null,
  scoreWrap: null,
  restartBtn: null
};

function $(sel){ return document.querySelector(sel); }

// global toggle so inline onclick in the HTML can call it too
function updateTimerLabel(){
  try{ const btn = document.getElementById('timerToggle'); if(btn) btn.textContent = timer.enabled ? `Timer: ON (${timer.total}s)` : 'Use timer'; }catch(e){}
}
function toggleTimer(){
  // If we're about to enable the timer, prompt the user to choose the length
  if(!timer.enabled){
    showTimerChooser();
    return;
  }
  // otherwise disable and persist
  timer.enabled = false;
  localStorage.setItem(TIMER_KEY, '0');
  stopTimer();
  try{ if(document.getElementById('timerDisplay')) document.getElementById('timerDisplay').textContent = '—'; }catch(e){}
  updateCountdownBar(0);
  updateTimerLabel();
  console.log('toggleTimer global: disabled');
}

function init(){
  el.title = $('.title');
  el.meta = $('.meta');
  el.question = $('.question');
  el.answers = $('.answers');
  el.nextBtn = $('.next-btn');
  el.progressBar = $('.progress > i');
  el.scoreWrap = $('.score-wrap');
  el.restartBtn = $('.restart-btn');

  // debug: report key elements so we can verify timer wiring
  console.log('init: elements — nextBtn=', !!el.nextBtn, 'restartBtn=', !!el.restartBtn);

  renderQuestion();
  // use event delegation for controls to ensure handlers fire even if elements
  // are replaced or weren't available at init time
  document.addEventListener('click', function delegatedClick(e){
    const next = e.target.closest && e.target.closest('.next-btn');
    const restart = e.target.closest && e.target.closest('.restart-btn');
    if(next){ onNext(); }
    if(restart){ onRestart(); }
  });
  // also attach direct listeners if elements exist (fallback)
  try{
    if(el.nextBtn) el.nextBtn.addEventListener('click', ()=>{ console.log('next clicked (direct)'); onNext(); });
    if(el.restartBtn) el.restartBtn.addEventListener('click', ()=>{ console.log('restart clicked (direct)'); onRestart(); });
  }catch(e){}

  // keyboard shortcuts: Right Arrow = Next, R = Restart
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowRight'){
      console.log('shortcut: ArrowRight -> next');
      onNext();
    }
    if(e.key === 'r' || e.key === 'R'){
      console.log('shortcut: R -> restart');
      onRestart();
    }
  });
  // timer elements
  el.timerToggle = $('#timerToggle');
  el.timerDisplay = $('#timerDisplay');
  console.log('init: timer elements — toggle=', !!el.timerToggle, 'display=', !!el.timerDisplay);
  if(el.timerDisplay){
    // make sure the timer display is visible (help with color/contrast issues)
    el.timerDisplay.style.opacity = '1';
    if(!el.timerDisplay.textContent) el.timerDisplay.textContent = '—';
  }
  // load timer preference
  timer.enabled = getTimerPref();
  // attach simple click handler; inline onclick also calls toggleTimer as fallback
  try{ if(el.timerToggle) el.timerToggle.addEventListener('click', ()=>{ toggleTimer(); }); }catch(e){}
  // timer length radios
  el.timerRadios = document.getElementsByName('timerLen');
  const savedLen = getTimerLength();
  timer.total = savedLen || DEFAULT_TIMER_SECONDS;
  timer.remaining = timer.total;
  // set radio checked state
  [...el.timerRadios].forEach(r=>{ r.checked = Number(r.value) === timer.total; r.addEventListener('change', onTimerLenChange); });
  // legacy handler kept for compatibility (no-op if missing)
  try{ if(el.timerToggle) el.timerToggle.addEventListener('change', onTimerToggle); }catch(e){}
  // render first question after wiring is complete
  renderQuestion();
  document.addEventListener('visibilitychange', onVisibilityChange);

  // settings removed
}

// tiny debug helper used by inline onclicks in index.html
function debugClick(name){
  try{
    console.log('debugClick:', name);
    let b = document.getElementById('debugBadge');
    if(!b){
      b = document.createElement('div');
      b.id = 'debugBadge';
      b.style.position = 'fixed';
      b.style.right = '12px';
      b.style.bottom = '12px';
      b.style.padding = '8px 10px';
      b.style.background = 'rgba(0,0,0,0.6)';
      b.style.color = 'white';
      b.style.borderRadius = '8px';
      b.style.zIndex = 9999;
      document.body.appendChild(b);
    }
    b.textContent = `Clicked: ${name} @ ${new Date().toLocaleTimeString()}`;
    setTimeout(()=>{ if(b) b.remove(); }, 1800);
  }catch(e){ console.error(e); }
}

function pickCategoryFromURL(){
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat');
  if(cat){
    selectedCategory = cat;
    // filter questions
    const match = questions.filter(q=>q.category && q.category.toLowerCase() === cat.toLowerCase());
    if(match.length) filteredQuestions = match;
    else filteredQuestions = questions; // fallback to all
    // set background for this category
    try{ applyBackgroundForCategory(selectedCategory); }catch(e){}
    // when viewing a category, Home should go to landing
    try{ const homeLink = document.getElementById('homeLink'); if(homeLink) homeLink.href = 'landing.html'; }catch(e){}
  } else {
    filteredQuestions = questions;
    selectedCategory = null;
    // reset to default background
    try{ document.body.style.backgroundImage = `linear-gradient(180deg,rgba(3,7,18,0.55),rgba(3,7,18,0.65)),url('https://images.unsplash.com/photo-1505765050711-1e6d7f3a8f3a?auto=format&fit=crop&w=1600&q=60')`; }catch(e){}
    // when not viewing a category, Home should go to home.html
    try{ const homeLink = document.getElementById('homeLink'); if(homeLink) homeLink.href = 'home.html'; }catch(e){}
    // remove high-contrast class when not viewing a category
    try{ document.body.classList.remove('category-text-dark'); }catch(e){}
  }
}

function renderQuestion(){
  // ensure category selection applied
  pickCategoryFromURL();
  const cur = filteredQuestions[state.index];
  const total = filteredQuestions.length;
  // guard: if index out of range (e.g., after switching category), reset
  if(state.index >= total){ state.index = 0; }
  // recompute cur after potential reset
  const question = filteredQuestions[state.index];
  const curQ = question;
  el.title.textContent = `Question ${state.index + 1} of ${total}`;
  // update category label
  const catLabel = $('#categoryLabel');
  catLabel.textContent = selectedCategory ? `Category: ${selectedCategory}` : 'All categories';
  el.question.textContent = curQ.q;
  el.answers.innerHTML = '';
  curQ.choices.forEach((c,i)=>{
    const b = document.createElement('button');
    b.className = 'btn';
    b.type = 'button';
    b.dataset.idx = i;
    b.textContent = c;
    b.addEventListener('click', onAnswer);
    el.answers.appendChild(b);
  });
  updateProgress();
  el.scoreWrap.classList.add('hidden');
  state.answered = false;
  // update next button label: show 'Submit' on the final question
  try{
    if(el.nextBtn){
      el.nextBtn.textContent = (state.index < (total - 1)) ? 'Next' : 'Submit';
    }
  }catch(e){console.warn('Failed to update next button label', e);}
  // reset and start timer if enabled
  stopTimer();
  // set remaining and total based on selected length
  timer.total = getTimerLength() || DEFAULT_TIMER_SECONDS;
  timer.remaining = timer.total;
  updateCountdownBar(0);
  if(timer.enabled){
    startTimer();
  } else {
    el.timerDisplay.textContent = '—';
  }
}

function onAnswer(e){
  if(state.answered) return;
  state.answered = true;
  // stop timer once answered
  stopTimer();
  const btn = e.currentTarget;
  const selected = Number(btn.dataset.idx);
  const cur = filteredQuestions[state.index];
  const correct = cur.answer;
  // mark buttons
  [...el.answers.children].forEach(b=>{
    const idx = Number(b.dataset.idx);
    b.disabled = true;
    if(idx === correct) b.classList.add('correct');
    if(idx === selected && idx !== correct) b.classList.add('wrong');
  });
  if(selected === correct){
    state.score += 1;
  }
  // update progress to include the answered question
  try{ updateProgress(); }catch(e){console.warn('updateProgress failed', e); }
}

function onNext(){
  if(!state.answered){
    // if user hasn't answered, treat as skip and move on
  }
  // ensure timer stopped when moving to next
  stopTimer();
  if(state.index < filteredQuestions.length - 1){
    state.index += 1;
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults(){
  el.scoreWrap.classList.remove('hidden');
  try{ if(el.progressBar) el.progressBar.style.width = '100%'; }catch(e){}
  $('.score').textContent = `Your score: ${state.score} / ${filteredQuestions.length}`;
  saveHighScore(state.score);
  // record attempt to server (best-effort)
  try{ recordAttempt(); }catch(e){ console.warn('recordAttempt invocation failed', e); }
}

// determine API base: prefer running server on localhost:3001 for file:// pages
function getApiBase(){
  try{
    // if the page is served via http(s) and not file:, prefer that origin
    if(location && location.protocol && location.protocol.indexOf('http') === 0){
      return location.origin;
    }
  }catch(e){}
  // default dev server
  return 'http://localhost:3001';
}

async function recordAttempt(){
  try{
    const API_BASE = getApiBase();
    const token = localStorage.getItem('quizify_token');
    if(!token) return; // no auth
    const payload = {
      category: selectedCategory || 'All',
      score: state.score,
      total: filteredQuestions.length
    };
    const res = await fetch(API_BASE + '/api/attempt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(payload)
    });
    // attempt best-effort: if fails, log and continue
    if(!res.ok){
      const txt = await res.text();
      console.warn('recordAttempt failed', res.status, txt);
    } else {
      console.log('recordAttempt saved');
    }
    // NOTE: Do NOT redirect automatically after showing results.
    // Keep the user on the same page so the score remains visible.
    // If you want to provide a link/button to view attempts, add an explicit
    // UI control (e.g., "View my attempts") that navigates to the home page.
  }catch(e){ console.warn('recordAttempt error', e && e.message ? e.message : e); }
}

function onRestart(){
  state.index = 0;
  state.score = 0;
  stopTimer();
  renderQuestion();
}

function onTimerToggle(e){
  timer.enabled = e.currentTarget.checked;
  localStorage.setItem(TIMER_KEY, timer.enabled ? '1' : '0');
  if(timer.enabled){
    // start timer on current question
    // ensure timer uses current selection
    timer.total = getTimerLength() || DEFAULT_TIMER_SECONDS;
    timer.remaining = timer.total;
    console.log('onTimerToggle: starting timer, total=', timer.total);
    startTimer();
  } else {
    stopTimer();
    el.timerDisplay.textContent = '—';
    updateCountdownBar(0);
  }
}

function startTimer(){
  console.log('startTimer invoked');
  // use currently selected length
  timer.total = getTimerLength() || DEFAULT_TIMER_SECONDS;
  timer.remaining = timer.total;
  // timestamp-driven interval (more reliable across browsers)
  if(el.timerDisplay) el.timerDisplay.textContent = formatTime(timer.remaining);
  updateCountdownBar(0);
  // clear any previous timer
  stopTimer();
  timer._startTs = performance.now();
  timer._endTs = timer._startTs + timer.total * 1000;
  // update every 200ms for smooth bar and responsive display
  timer.id = setInterval(()=>{
    const now = performance.now();
    const msLeft = Math.max(timer._endTs - now, 0);
    timer.remaining = Math.ceil(msLeft / 1000);
    if(el.timerDisplay) el.timerDisplay.textContent = formatTime(timer.remaining);
    const frac = (timer.total * 1000 - msLeft) / (timer.total * 1000);
    updateCountdownBar(frac);
    if(msLeft <= 0){
      // time's up
      clearInterval(timer.id); timer.id = null;
      // visually disable choices and show correct answer
      if(!state.answered){
        state.answered = true;
        const cur = filteredQuestions[state.index];
        [...el.answers.children].forEach(b=>{
          const idx = Number(b.dataset.idx);
          b.disabled = true;
          if(idx === cur.answer) b.classList.add('correct');
        });
        try{ updateProgress(); }catch(e){}
      }
      // advance after a short delay so user can see correct answer
      setTimeout(()=>{
        if(state.index < filteredQuestions.length - 1){
          state.index += 1;
          renderQuestion();
        } else {
          showResults();
        }
      }, 900);
    }
  }, 200);
}

function stopTimer(){
  // stop RAF and mark not running
  raf.running = false;
  if(raf.id){ cancelAnimationFrame(raf.id); raf.id = null; }
  // clear display timer id if any
  if(timer.id){ clearInterval(timer.id); timer.id = null; }
  // clear bar pacing
  updateCountdownBar(0);
  const barWrap = document.querySelector('.countdown-bar');
  if(barWrap) barWrap.classList.remove('paused');
}

function formatTime(sec){
  const s = sec % 60;
  return `${s}s`;
}

function getTimerPref(){
  const v = localStorage.getItem(TIMER_KEY);
  return v === '1';
}

function getTimerLength(){
  const v = localStorage.getItem(TIMER_LEN_KEY);
  return v ? Number(v) : DEFAULT_TIMER_SECONDS;
}

function onTimerLenChange(e){
  const val = Number(e.currentTarget.value);
  localStorage.setItem(TIMER_LEN_KEY, String(val));
  // update timer totals for current session
  timer.total = val;
  timer.remaining = val;
  updateCountdownBar(0);
  // reflect the new length in any visible UI and restart if timer is active
  try{ updateTimerLabel(); }catch(e){}
  if(el.timerDisplay) el.timerDisplay.textContent = formatTime(timer.remaining);
  if(timer.enabled){
    stopTimer();
    startTimer();
  }
}

function updateCountdownBar(fraction){
  const bar = document.querySelector('.countdown-bar > i');
  if(!bar) return;
  // fraction: 0..1 where 0 = empty, 1 = full elapsed. We want width to show elapsed
  const pct = Math.min(Math.max(fraction * 100, 0), 100);
  bar.style.width = pct + '%';
}

function onVisibilityChange(){
  const barWrap = document.querySelector('.countdown-bar');
  if(document.hidden){
    // pause
    raf.pausedAt = performance.now();
    raf.running = false;
    if(raf.id){ cancelAnimationFrame(raf.id); raf.id = null; }
    if(barWrap) barWrap.classList.add('paused');
  } else {
    // resume: adjust startTs so elapsed excludes hidden duration
    if(raf.pausedAt && raf.startTs){
      const hiddenMs = performance.now() - raf.pausedAt;
      raf.startTs += hiddenMs;
    }
    raf.pausedAt = null;
    if(barWrap) barWrap.classList.remove('paused');
    if(timer.enabled && !raf.running){
      raf.running = true;
      raf.id = requestAnimationFrame((ts)=>{
        raf.startTs = raf.startTs || ts;
        raf.id = requestAnimationFrame(function tick(t){
          if(!raf.running) return;
          const elapsedMs = t - raf.startTs;
          const elapsed = Math.floor(elapsedMs / 1000);
          timer.remaining = Math.max(timer.total - elapsed, 0);
          el.timerDisplay.textContent = formatTime(timer.remaining);
          const frac = (timer.total - timer.remaining) / timer.total;
          updateCountdownBar(frac);
          if(timer.remaining <= 0){
            stopTimer();
            if(!state.answered){
              state.answered = true;
              const cur = filteredQuestions[state.index];
              [...el.answers.children].forEach(b=>{
                const idx = Number(b.dataset.idx);
                b.disabled = true;
                if(idx === cur.answer) b.classList.add('correct');
              });
              try{ updateProgress(); }catch(e){}
            }
            setTimeout(()=>{ if(state.index < filteredQuestions.length - 1){ state.index += 1; renderQuestion(); } else { showResults(); } }, 900);
            return;
          }
          raf.id = requestAnimationFrame(tick);
        });
      });
    }
  }
}

function updateProgress(){
  const total = filteredQuestions.length || 1;
  // include the current question as completed when state.answered is true
  const completed = Math.min(total, state.index + (state.answered ? 1 : 0));
  const pct = Math.round((completed / total) * 100);
  el.progressBar.style.width = pct + '%';
}

function saveHighScore(score){
  const prev = getHighScore();
  if(score > prev){
    localStorage.setItem(QUIZ_KEY, String(score));
  }
}

function getHighScore(){
  const v = localStorage.getItem(QUIZ_KEY);
  return v ? Number(v) : 0;
}

function onResetHighScore(){
  if(!confirm('Reset high score? This cannot be undone.')) return;
  localStorage.removeItem(QUIZ_KEY);
  // update UI
  alert('High score reset.');
}

function onResetPreferences(){
  if(!confirm('Reset timer preferences (toggle and length) to defaults?')) return;
  localStorage.removeItem(TIMER_KEY);
  localStorage.removeItem(TIMER_LEN_KEY);
  // reset UI: default 30s and toggle off
  timer.enabled = false;
  el.timerToggle.checked = false;
  // set radio back to 30
  [...el.timerRadios].forEach(r=>{ r.checked = Number(r.value) === DEFAULT_TIMER_SECONDS; });
  timer.total = DEFAULT_TIMER_SECONDS;
  timer.remaining = timer.total;
  stopTimer();
  if(el.timerDisplay) el.timerDisplay.textContent = '—';
  updateCountdownBar(0);
  alert('Preferences reset.');
}

// create and show a small chooser UI near the timer button so the user selects 15/30/60
function showTimerChooser(){
  // avoid duplicates
  if(document.getElementById('timerChooser')) return;
  const btn = el.timerToggle || document.getElementById('timerToggle');
  const chooser = document.createElement('div');
  chooser.id = 'timerChooser';
  chooser.style.position = 'absolute';
  chooser.style.zIndex = 99999;
  chooser.style.background = 'rgba(255,255,255,0.98)';
  chooser.style.border = '1px solid rgba(0,0,0,0.08)';
  chooser.style.boxShadow = '0 8px 24px rgba(2,6,23,0.12)';
  chooser.style.padding = '8px';
  chooser.style.borderRadius = '8px';
  chooser.style.display = 'flex';
  chooser.style.gap = '8px';
  chooser.style.alignItems = 'center';

  const makeBtn = (s)=>{
    const b = document.createElement('button');
    b.className = 'btn';
    b.style.padding = '6px 10px';
    b.textContent = s + 's';
    b.addEventListener('click', ()=>{ applyTimerChoice(Number(s)); });
    return b;
  };
  chooser.appendChild(makeBtn(15));
  chooser.appendChild(makeBtn(30));
  chooser.appendChild(makeBtn(60));

  // cancel button
  const cancel = document.createElement('button');
  cancel.textContent = 'Cancel';
  cancel.className = 'btn';
  cancel.style.background = '#ccc';
  cancel.style.color = '#000';
  cancel.style.padding = '6px 10px';
  cancel.addEventListener('click', ()=>{ chooser.remove(); });
  chooser.appendChild(cancel);

  document.body.appendChild(chooser);
  // position near the timer toggle button
  try{
    const r = (btn && btn.getBoundingClientRect && btn.getBoundingClientRect()) || { left: 20, top: 20, height: 24 };
    chooser.style.left = (window.scrollX + r.left) + 'px';
    chooser.style.top = (window.scrollY + r.top + r.height + 6) + 'px';
  }catch(e){ console.warn('positioning chooser failed', e); }
  // close when clicking outside
  const onDocClick = (ev)=>{
    if(!chooser.contains(ev.target) && ev.target !== btn){ chooser.remove(); document.removeEventListener('click', onDocClick); }
  };
  setTimeout(()=>{ document.addEventListener('click', onDocClick); }, 10);
}

function applyTimerChoice(seconds){
  try{ localStorage.setItem(TIMER_LEN_KEY, String(seconds)); }catch(e){}
  timer.total = seconds;
  timer.remaining = seconds;
  // persist enabled
  timer.enabled = true;
  try{ localStorage.setItem(TIMER_KEY, '1'); }catch(e){}
  updateTimerLabel();
  if(el.timerDisplay) el.timerDisplay.textContent = formatTime(timer.remaining);
  // remove chooser if present
  const c = document.getElementById('timerChooser'); if(c) c.remove();
  // restart timer
  stopTimer();
  startTimer();
}

window.addEventListener('DOMContentLoaded', init);
