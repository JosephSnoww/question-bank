let allQuestions = [];

async function loadQuestions() {
  try {
    const response = await fetch('questions.json');
    allQuestions = await response.json();

    setupTopics();
    setupEvents();
    renderQuestions();
  } catch (err) {
    console.error('Error loading questions.json:', err);
  }
}

function setupTopics() {
  const topicSelect = document.getElementById('topicSelect');
  const topics = [...new Set(allQuestions.map(q => q.topic))];

  topics.forEach(topic => {
    const opt = document.createElement('option');
    opt.value = topic;
    opt.textContent = topic;
    topicSelect.appendChild(opt);
  });
}

function setupEvents() {
  const topicSelect = document.getElementById('topicSelect');
  const randomBtn = document.getElementById('randomBtn');

  topicSelect.addEventListener('change', renderQuestions);
  randomBtn.addEventListener('click', showRandomQuestion);
}

function getFilteredQuestions() {
  const topic = document.getElementById('topicSelect').value;

  if (topic === 'all') {
    return allQuestions;
  } else {
    return allQuestions.filter(q => q.topic === topic);
  }
}

function renderQuestions() {
  const container = document.getElementById('questions');
  container.innerHTML = '';

  const filtered = getFilteredQuestions();

  filtered.forEach((q, index) => {
    const div = document.createElement('div');
    div.className = 'question';

    const header = document.createElement('div');
    header.innerHTML = `<b>Q${index + 1} (${q.topic}${q.difficulty ? ', ' + q.difficulty : ''}):</b> ${q.question}`;
    div.appendChild(header);

    const answerDiv = document.createElement('div');
    answerDiv.className = 'answer';
    answerDiv.textContent = q.answer || 'No answer provided.';
    div.appendChild(answerDiv);

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Show answer';
    toggleBtn.addEventListener('click', () => {
      const isHidden = answerDiv.style.display === 'none' || answerDiv.style.display === '';
      answerDiv.style.display = isHidden ? 'block' : 'none';
      toggleBtn.textContent = isHidden ? 'Hide answer' : 'Show answer';
    });
    div.appendChild(toggleBtn);

    container.appendChild(div);
  });
}

function showRandomQuestion() {
  const filtered = getFilteredQuestions();
  if (filtered.length === 0) return;

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const randomQuestion = filtered[randomIndex];

  const container = document.getElementById('questions');
  container.innerHTML = '';

  const div = document.createElement('div');
  div.className = 'question';

  const header = document.createElement('div');
  header.innerHTML = `<b>Random (${randomQuestion.topic}${randomQuestion.difficulty ? ', ' + randomQuestion.difficulty : ''}):</b> ${randomQuestion.question}`;
  div.appendChild(header);

  const answerDiv = document.createElement('div');
  answerDiv.className = 'answer';
  answerDiv.textContent = randomQuestion.answer || 'No answer provided.';
  div.appendChild(answerDiv);

  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = 'Show answer';
  toggleBtn.addEventListener('click', () => {
    const isHidden = answerDiv.style.display === 'none' || answerDiv.style.display === '';
    answerDiv.style.display = isHidden ? 'block' : 'none';
    toggleBtn.textContent = isHidden ? 'Hide answer' : 'Show answer';
  });
  div.appendChild(toggleBtn);

  container.appendChild(div);
}

loadQuestions();
