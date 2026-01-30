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
    if (examTopicSelect) {
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
    
    // Find the button that was clicked and make it active
    const tabs = document.querySelectorAll('.mode-tab');
    tabs.forEach(tab => {
        if (tab.textContent.toLowerCase().includes(mode)) {
            tab.classList.add('active');
        }
    });
}

function getFilteredQuestions() {
    const topic = document.getElementById('topicSelect').value;
    return topic === 'all' ? allQuestions : allQuestions.filter(q => q.topic === topic);
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
        const card = createQuestionCard(q, index + 1);
        container.appendChild(card);
    });
    renderMath();
}

function renderMath() {
	if (window.MathJax) {
		window.MathJax.typesetPromise().catch(err => console.log(err));
	}

function createQuestionCard(q, displayNum) {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.innerHTML = `
        <div class="question-header">
            <span class="topic-badge">${q.topic}</span>
            <span class="difficulty-badge ${(q.difficulty || 'basic').toLowerCase()}">${q.difficulty || 'Basic'}</span>
        </div>
        <div class="question-text"><strong>Q${displayNum}:</strong> ${q.question}</div>
        ${q.image ? `<img src="${q.image}" class="question-image" alt="Question diagram">` : ''}
        <div class="answer" style="display:none;">${q.answer || 'No answer provided.'}</div>
        <button class="answer-button" onclick="toggleAnswer(this)">Show answer</button>
    `;
    return card;
}

function toggleAnswer(btn) {
    const answerDiv = btn.previousElementSibling;
    const isHidden = answerDiv.style.display === 'none';
    answerDiv.style.display = isHidden ? 'block' : 'none';
    btn.textContent = isHidden ? 'Hide answer' : 'Show answer';
    if (isHidden) renderMath(answerDiv);
}

function getExamFilteredQuestions() {
    const topic = document.getElementById('examTopicSelect').value;
    return topic === 'all' ? allQuestions : allQuestions.filter(q => q.topic === topic);
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
        card.innerHTML = `
            <input type="checkbox" value="${q.id}" ${selectedForExam.has(q.id) ? 'checked' : ''} 
                   style="width:20px; height:20px; cursor:pointer; margin-top:5px;"
                   onchange="toggleSelection('${q.id}', this.checked)">
            <div style="flex:1;">
                <div class="question-header">
                    <span class="topic-badge">${q.topic}</span>
                    <span class="difficulty-badge ${(q.difficulty || 'basic').toLowerCase()}">${q.difficulty || 'Basic'}</span>
                </div>
                <div class="question-text">${q.question}</div>
            </div>
        `;
        container.appendChild(card);
    });
    renderMath();
}

function toggleSelection(id, checked) {
    if (checked) selectedForExam.add(id);
    else selectedForExam.delete(id);
    document.getElementById('selectedCount').textContent = selectedForExam.size;
}

function showRandomQuestion() {
    const filtered = getFilteredQuestions();
    if (filtered.length === 0) return;
    const q = filtered[Math.floor(Math.random() * filtered.length)];
    const container = document.getElementById('questions');
    container.innerHTML = '';
    const card = createQuestionCard(q, 'Random');
    container.appendChild(card);
    renderMath();
}

function renderMath(element = null) {
    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
        const target = element ? [element] : [];
        MathJax.typesetPromise(target).catch(err => console.log(err));
    }
}

function generateExam() {
    if (selectedForExam.size === 0) {
        alert('Please select at least one question.');
        return;
    }
    const selected = allQuestions.filter(q => selectedForExam.has(q.id));
    const totalMarks = selected.reduce((sum, q) => sum + (q.marks || 0), 0);
    
    // Logic for 60-minute exam: roughly 1 mark per minute
    const timeAllowed = 60; 
    
    let examHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Physics Exam</title>
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <style>
        @media print {
            .no-print { display: none; }
            body { margin: 0; padding: 20mm; }
            .page-break { page-break-after: always; }
        }
        body { font-family: 'Times New Roman', serif; line-height: 1.5; color: #000; padding: 40px; max-width: 800px; margin: auto; }
        .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 20px; margin-bottom: 30px; }
        .exam-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold; }
        .question { margin-bottom: 40px; position: relative; }
        .marks { position: absolute; right: 0; font-weight: bold; }
        .q-text { margin-right: 60px; }
        .space { border-bottom: 1px dotted #ccc; height: 100px; margin: 20px 0; }
        .footer { text-align: center; font-size: 0.8em; margin-top: 50px; border-top: 1px solid #000; padding-top: 10px; }
        button { background: #444; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="no-print" style="text-align:center;">
        <button onclick="window.print()">🖨️ Print to PDF / Paper</button>
        <p style="color:#666; font-size:0.9em;">(Select "Save as PDF" in the printer destination)</p>
    </div>
    <div class="header">
        <h1>PHYSICS EXAMINATION</h1>
        <p>Department of Science</p>
    </div>
    <div class="exam-info">
        <span>Time Allowed: ${timeAllowed} minutes</span>
        <span>Total Marks: ${totalMarks}</span>
    </div>
    <div class="instructions" style="margin-bottom:30px; border:1px solid #000; padding:10px;">
        <strong>Instructions to Candidates:</strong>
        <ul>
            <li>Answer all questions.</li>
            <li>Calculators may be used.</li>
            <li>Show all your working for full marks.</li>
        </ul>
    </div>
    `;

    selected.forEach((q, i) => {
        examHTML += `
        <div class="question">
            <span class="marks">(${q.marks || 0} marks)</span>
            <div class="q-text">
                <strong>Question ${i + 1}</strong><br>
                ${q.question}
            </div>
            <div class="space"></div>
        </div>
        `;
    });

    examHTML += `
    <div class="footer">
        © Question Bank Physics Exam - Generated on ${new Date().toLocaleDateString()}
    </div>
</body>
</html>`;

    const win = window.open('', '_blank');
    win.document.write(examHTML);
    win.document.close();
}

loadQuestions();
