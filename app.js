let allQuestions = [];
let selectedForExam = new Set();

async function loadQuestions() {
  try {
    const response = await fetch('questions.json');
    allQuestions = await response.json();

    setupTopics();
    setupExamTopics();
    setupEvents();
    renderQuestions();
    renderExamQuestions();
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

function setupExamTopics() {
  const examTopicSelect = document.getElementById('examTopicSelect');
  const topics = [...new Set(allQuestions.map(q => q.topic))].sort();
  topics.forEach(topic => {
    const opt = document.createElement('option');
    opt.value = topic;
    opt.textContent = topic;
    examTopicSelect.appendChild(opt);
  });
  if (examTopicSelect.addEventListener) {
    examTopicSelect.addEventListener('change', renderExamQuestions);
  }
}

function setupEvents() {
  const topicSelect = document.getElementById('topicSelect');
  const randomBtn = document.getElementById('randomBtn');

  if (topicSelect) topicSelect.addEventListener('change', renderQuestions);
  if (randomBtn) randomBtn.addEventListener('click', showRandomQuestion);
}

function switchMode(mode) {
  document.querySelectorAll('.mode-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.mode-tab').forEach(el => el.classList.remove('active'));
  
  const content = document.getElementById(mode);
  if (content) content.classList.add('active');
  
  event.target.classList.add('active');
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

    const header = document.createElement('div');
    header.className = 'question-header';
    header.innerHTML = `<span class="topic-badge">${q.topic}</span><span class="difficulty-badge ${(q.difficulty || 'basic').toLowerCase()}">${q.difficulty || 'Basic'}</span>`;
    card.appendChild(header);

    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.innerHTML = `<strong>Q${index + 1}:</strong> ${q.question}`;
    card.appendChild(questionText);

    if (q.image && q.image !== 'null' && q.image !== '') {
      const img = document.createElement('img');
      img.src = q.image;
      img.className = 'question-image';
      img.alt = 'Question diagram';
      card.appendChild(img);
    }

    const answerDiv = document.createElement('div');
    answerDiv.className = 'answer';
    answerDiv.innerHTML = q.answer || 'No answer provided.';
    card.appendChild(answerDiv);

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'answer-button';
    toggleBtn.textContent = 'Show answer';
    toggleBtn.addEventListener('click', () => {
      const isHidden = answerDiv.style.display === 'none' || answerDiv.style.display === '';
      answerDiv.style.display = isHidden ? 'block' : 'none';
      toggleBtn.textContent = isHidden ? 'Hide answer' : 'Show answer';
      
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
  });

  if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
    setTimeout(() => {
      MathJax.typesetPromise([container]).catch(err => console.log(err));
    }, 100);
  }
}

function getExamFilteredQuestions() {
  const topic = document.getElementById('examTopicSelect').value;
  if (topic === 'all') {
    return allQuestions;
  } else {
    return allQuestions.filter(q => q.topic === topic);
  }
}

function renderExamQuestions() {
  const container = document.getElementById('examQuestions');
  container.innerHTML = '';

  const filtered = getExamFilteredQuestions();

  if (filtered.length === 0) {
    container.innerHTML = '<div class="no-questions">No questions available.</div>';
    return;
  }

  filtered.forEach((q) => {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.style.display = 'flex';
    card.style.gap = '15px';
    card.style.alignItems = 'flex-start';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = q.id;
    checkbox.checked = selectedForExam.has(q.id);
    checkbox.style.width = '20px';
    checkbox.style.height = '20px';
    checkbox.style.cursor = 'pointer';
    checkbox.style.marginTop = '5px';
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        selectedForExam.add(q.id);
      } else {
        selectedForExam.delete(q.id);
      }
      updateSelectedCount();
    });
    card.appendChild(checkbox);

    const contentDiv = document.createElement('div');
    contentDiv.style.flex = '1';

    const header = document.createElement('div');
    header.className = 'question-header';
    header.innerHTML = `<span class="topic-badge">${q.topic}</span><span class="difficulty-badge ${(q.difficulty || 'basic').toLowerCase()}">${q.difficulty || 'Basic'}</span>`;
    contentDiv.appendChild(header);

    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.innerHTML = `${q.question}`;
    contentDiv.appendChild(questionText);

    card.appendChild(contentDiv);
    container.appendChild(card);
  });

  if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
    setTimeout(() => {
      MathJax.typesetPromise([container]).catch(err => console.log(err));
    }, 100);
  }
}

function updateSelectedCount() {
  document.getElementById('selectedCount').textContent = selectedForExam.size;
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

  const header = document.createElement('div');
  header.className = 'question-header';
  header.innerHTML = `<span class="topic-badge">${randomQuestion.topic}</span><span class="difficulty-badge ${(randomQuestion.difficulty || 'basic').toLowerCase()}">${randomQuestion.difficulty || 'Basic'}</span>`;
  card.appendChild(header);

  const questionText = document.createElement('div');
  questionText.className = 'question-text';
  questionText.innerHTML = `<strong>Random Question:</strong> ${randomQuestion.question}`;
  card.appendChild(questionText);

  if (randomQuestion.image && randomQuestion.image !== 'null' && randomQuestion.image !== '') {
    const img = document.createElement('img');
    img.src = randomQuestion.image;
    img.className = 'question-image';
    img.alt = 'Question diagram';
    card.appendChild(img);
  }

  const answerDiv = document.createElement('div');
  answerDiv.className = 'answer';
  answerDiv.innerHTML = randomQuestion.answer || 'No answer provided.';
  card.appendChild(answerDiv);

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'answer-button';
  toggleBtn.textContent = 'Show answer';
  toggleBtn.addEventListener('click', () => {
    const isHidden = answerDiv.style.display === 'none' || answerDiv.style.display === '';
    answerDiv.style.display = isHidden ? 'block' : 'none';
    toggleBtn.textContent = isHidden ? 'Hide answer' : 'Show answer';
    
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

  if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
    setTimeout(() => {
      MathJax.typesetPromise([container]).catch(err => console.log(err));
    }, 100);
  }
}

function generateExam() {
  if (selectedForExam.size === 0) {
    alert('Please select at least one question to generate an exam.');
    return;
  }

  const selectedQuestions = allQuestions.filter(q => selectedForExam.has(q.id));
  const totalMarks = selectedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);

  let examHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Physics Exam</title>
      <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
      <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .question { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .marks { float: right; color: #666; font-weight: bold; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Physics Question Bank Exam</h1>
        <p>Total Questions: ${selectedQuestions.length} | Total Marks: ${totalMarks}</p>
        <p>Time: 1 hour</p>
      </div>
  `;

  selectedQuestions.forEach((q, index) => {
    examHTML += `
      <div class="question">
        <strong>Q${index + 1}.</strong> ${q.question}
        <div class="marks">[${q.marks || 0} marks]</div>
        <div style="clear: both;"></div>
      </div>
      <div style="min-height: 60px; margin: 20px 0;"></div>
    `;
  });

  examHTML += `
      <div class="footer">
        <p>Generated from Physics Question Bank</p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([examHTML], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Physics_Exam_' + new Date().toISOString().split('T')[0] + '.html';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

loadQuestions();
