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
  const topics = [...new Set(allQuestions.map(q => q.topic))].sort();

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

  if (filtered.length === 0) {
    container.innerHTML = '<div class="no-questions">No questions found for this topic.</div>';
    return;
  }

  filtered.forEach((q, index) => {
    const card = document.createElement('div');
    card.className = 'question-card';

    // Header with badges
    const header = document.createElement('div');
    header.className = 'question-header';
    header.innerHTML = `<span class="topic-badge">${q.topic}</span><span class="difficulty-badge ${(q.difficulty || 'basic').toLowerCase()}">${q.difficulty || 'Basic'}</span>`;
    card.appendChild(header);

    // Question text
    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.innerHTML = `<strong>Q${index + 1}:</strong> ${q.question}`;
    card.appendChild(questionText);

    // Image if present
    if (q.image && q.image !== 'null' && q.image !== '') {
      const img = document.createElement('img');
      img.src = q.image;
      img.className = 'question-image';
      img.alt = 'Question diagram';
      card.appendChild(img);
    }

    // Answer section
    const answerDiv = document.createElement('div');
    answerDiv.className = 'answer';
    answerDiv.innerHTML = q.answer || 'No answer provided.';
    card.appendChild(answerDiv);

    // Toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'answer-button';
    toggleBtn.textContent = 'Show answer';
    toggleBtn.addEventListener('click', () => {
      const isHidden = answerDiv.style.display === 'none' || answerDiv.style.display === '';
      answerDiv.style.display = isHidden ? 'block' : 'none';
      toggleBtn.textContent = isHidden ? 'Hide answer' : 'Show answer';
      
      // Trigger MathJax to re-render math in answer
      if (typeof MathJax !== 'undefined' && isHidden) {
        setTimeout(() => {
          MathJax.contentDocument.dispatchEvent(new Event('render'));
          if (MathJax.typesetPromise) {
            MathJax.typesetPromise([answerDiv]).catch(err => console.log(err));
          }
        }, 100);
      }
    });
    card.appendChild(toggleBtn);

    container.appendChild(card);
  });

  // Trigger MathJax rendering for all questions
  if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
    setTimeout(() => {
      MathJax.typesetPromise([container]).catch(err => console.log(err));
    }, 100);
  }
}

function showRandomQuestion() {
  const filtered = getFilteredQuestions();
  if (filtered.length === 0) return;

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const randomQuestion = filtered[randomIndex];

  const container = document.getElementById('questions');
  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'question-card';

  // Header with badges
  const header = document.createElement('div');
  header.className = 'question-header';
  header.innerHTML = `<span class="topic-badge">${randomQuestion.topic}</span><span class="difficulty-badge ${(randomQuestion.difficulty || 'basic').toLowerCase()}">${randomQuestion.difficulty || 'Basic'}</span>`;
  card.appendChild(header);

  // Question text
  const questionText = document.createElement('div');
  questionText.className = 'question-text';
  questionText.innerHTML = `<strong>Random Question:</strong> ${randomQuestion.question}`;
  card.appendChild(questionText);

  // Image if present
  if (randomQuestion.image && randomQuestion.image !== 'null' && randomQuestion.image !== '') {
    const img = document.createElement('img');
    img.src = randomQuestion.image;
    img.className = 'question-image';
    img.alt = 'Question diagram';
    card.appendChild(img);
  }

  // Answer section
  const answerDiv = document.createElement('div');
  answerDiv.className = 'answer';
  answerDiv.innerHTML = randomQuestion.answer || 'No answer provided.';
  card.appendChild(answerDiv);

  // Toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'answer-button';
  toggleBtn.textContent = 'Show answer';
  toggleBtn.addEventListener('click', () => {
    const isHidden = answerDiv.style.display === 'none' || answerDiv.style.display === '';
    answerDiv.style.display = isHidden ? 'block' : 'none';
    toggleBtn.textContent = isHidden ? 'Hide answer' : 'Show answer';
    
    // Trigger MathJax to re-render math in answer
    if (typeof MathJax !== 'undefined' && isHidden) {
      setTimeout(() => {
        if (MathJax.typesetPromise) {
          MathJax.typesetPromise([answerDiv]).catch(err => console.log(err));
        }
      }, 100);
    }
  });
  card.appendChild(toggleBtn);

  container.appendChild(card);

  // Trigger MathJax rendering
  if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
    setTimeout(() => {
      MathJax.typesetPromise([container]).catch(err => console.log(err));
    }, 100);
  }
}

loadQuestions();
