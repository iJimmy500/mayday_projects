// Utility helper functions for Hot Potato

export const TRIVIA_CATEGORIES = [
  { id: 'any', name: 'Any Category' },
  { id: '9', name: 'General Knowledge' },
  { id: '11', name: 'Movies' },
  { id: '12', name: 'Music' },
  { id: '15', name: 'Video Games' },
  { id: '17', name: 'Science & Nature' },
  { id: '21', name: 'Sports' },
  { id: '22', name: 'Geography' },
  { id: '23', name: 'History' },
];

export function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

export function generateMathQuestion() {
  const ops = ['+', '-', '*'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let num1, num2, ans;
  
  if (op === '+') {
    num1 = Math.floor(Math.random() * 60) + 10;
    num2 = Math.floor(Math.random() * 60) + 10;
    ans = num1 + num2;
  } else if (op === '-') {
    num1 = Math.floor(Math.random() * 80) + 20;
    num2 = Math.floor(Math.random() * num1);
    ans = num1 - num2;
  } else {
    num1 = Math.floor(Math.random() * 12) + 3;
    num2 = Math.floor(Math.random() * 12) + 3;
    ans = num1 * num2;
  }
  
  const q = `Solve: ${num1} ${op} ${num2}`;
  const options = [ans];
  while (options.length < 4) {
    let wrong = ans + (Math.floor(Math.random() * 24) - 12);
    if (wrong !== ans && !options.includes(wrong) && wrong >= 0) {
      options.push(wrong);
    }
  }
  
  const shuffled = options.sort(() => 0.5 - Math.random());
  const aIndex = shuffled.indexOf(ans);
  
  return {
    category: 'Math',
    q,
    options: shuffled.map(String),
    a: aIndex
  };
}

export async function fetchRandomWordsList(cachedWords, count, setLoadingStatus) {
  let words = cachedWords;
  if (!words || words.length === 0) {
    if (setLoadingStatus) setLoadingStatus('Downloading vocabulary bank...');
    const res = await fetch('/txtFiles/words.txt');
    const text = await res.text();
    words = text.split('\n').map(w => w.trim()).filter(w => w.length > 2 && !w.includes(' '));
  }
  
  const shuffled = [...words].sort(() => 0.5 - Math.random());
  return {
    selected: shuffled.slice(0, count),
    cache: words
  };
}

export async function loadVocabQuestions(cachedWords, count, setLoadingStatus) {
  if (setLoadingStatus) setLoadingStatus('Fetching vocabulary definitions...');
  
  const { selected: randomWords, cache } = await fetchRandomWordsList(cachedWords, count * 2, setLoadingStatus);
  const questions = [];
  
  const chunkSize = 5;
  for (let i = 0; i < randomWords.length && questions.length < count; i += chunkSize) {
    const chunk = randomWords.slice(i, i + chunkSize);
    
    const promises = chunk.map(async (word) => {
      try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!res.ok) return null;
        const data = await res.json();
        const definition = data[0]?.meanings[0]?.definitions[0]?.definition;
        if (!definition) return null;
        return { word, definition };
      } catch {
        return null;
      }
    });
    
    const results = await Promise.all(promises);
    const valid = results.filter(Boolean);
    questions.push(...valid);
  }

  const finalQuestions = questions.slice(0, count);
  
  return {
    questions: finalQuestions.map((item, idx) => {
      const incorrectDefs = finalQuestions
        .filter((_, i) => i !== idx)
        .map(q => q.definition)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
        
      while (incorrectDefs.length < 3) {
        incorrectDefs.push("A common English word or term.");
      }
      
      const options = [item.definition, ...incorrectDefs];
      const shuffledOptions = options.sort(() => 0.5 - Math.random());
      const aIndex = shuffledOptions.indexOf(item.definition);
      
      return {
        category: 'Vocabulary',
        q: `What is the definition of "${item.word}"?`,
        options: shuffledOptions,
        a: aIndex
      };
    }),
    cache
  };
}

export async function loadTriviaQuestions(triviaCat, count, setLoadingStatus) {
  if (setLoadingStatus) setLoadingStatus('Fetching trivia questions...');
  let url = `https://opentdb.com/api.php?amount=${count}&type=multiple`;
  if (triviaCat !== 'any') {
    url += `&category=${triviaCat}`;
  }
  
  const res = await fetch(url);
  const data = await res.json();
  
  if (data.response_code !== 0) {
    throw new Error("Trivia API error");
  }
  
  return data.results.map(q => {
    const qText = decodeHTML(q.question);
    const correctOpt = decodeHTML(q.correct_answer);
    const wrongOpts = q.incorrect_answers.map(decodeHTML);
    const options = [correctOpt, ...wrongOpts];
    const shuffled = options.sort(() => 0.5 - Math.random());
    const aIndex = shuffled.indexOf(correctOpt);
    
    return {
      category: 'Trivia',
      q: qText,
      options: shuffled,
      a: aIndex
    };
  });
}

export async function loadQuestionSet(settings, count, cachedWords, setLoadingStatus) {
  const activeCats = [];
  if (settings.math) activeCats.push('math');
  if (settings.trivia) activeCats.push('trivia');
  if (settings.vocab) activeCats.push('vocab');
  
  if (activeCats.length === 0) activeCats.push('math');
  
  const questionsPerCat = Math.ceil(count / activeCats.length);
  const jobs = [];
  let updatedCache = cachedWords;
  
  if (settings.trivia) {
    jobs.push(loadTriviaQuestions(settings.triviaCat, questionsPerCat, setLoadingStatus).catch(() => []));
  }
  if (settings.vocab) {
    const vocabJob = loadVocabQuestions(cachedWords, questionsPerCat, setLoadingStatus)
      .then(res => {
        updatedCache = res.cache;
        return res.questions;
      })
      .catch(() => []);
    jobs.push(vocabJob);
  }
  
  const results = await Promise.all(jobs);
  let compiled = [];
  
  results.forEach(res => {
    compiled.push(...res);
  });
  
  if (settings.math) {
    const mathCount = count - compiled.length;
    for (let i = 0; i < Math.max(0, mathCount); i++) {
      compiled.push(generateMathQuestion());
    }
  }
  
  return {
    questions: compiled.sort(() => 0.5 - Math.random()).slice(0, count),
    cache: updatedCache
  };
}

export function compileLeaderboard(playerStats, loserName) {
  const statsList = Object.keys(playerStats).map(name => {
    const p = playerStats[name];
    const avgSpeed = p.totalCorrectCount > 0 ? (p.totalCorrectTime / p.totalCorrectCount).toFixed(1) : '—';
    return {
      name,
      avgSpeed: avgSpeed === '—' ? 9999 : parseFloat(avgSpeed),
      avgSpeedStr: avgSpeed,
      correct: p.correct,
      wrong: p.wrong,
      rounds: p.roundsSurvived,
      math: p.mathAnswers,
      trivia: p.triviaAnswers,
      vocab: p.vocabAnswers
    };
  });

  const fastest = [...statsList]
    .filter(s => s.avgSpeed !== 9999)
    .sort((a, b) => a.avgSpeed - b.avgSpeed)[0];
    
  const mostPenalized = [...statsList]
    .sort((a, b) => b.wrong - a.wrong)[0];
    
  const mathProdigy = [...statsList]
    .sort((a, b) => b.math - a.math)[0];

  const triviaKing = [...statsList]
    .sort((a, b) => b.trivia - a.trivia)[0];

  const vocabWizard = [...statsList]
    .sort((a, b) => b.vocab - a.vocab)[0];

  return {
    leaderboard: statsList.sort((a, b) => b.correct - a.correct),
    highlights: {
      fastest: fastest && fastest.avgSpeed !== 9999 ? fastest : null,
      mostPenalized: mostPenalized && mostPenalized.wrong > 0 ? mostPenalized : null,
      mathProdigy: mathProdigy && mathProdigy.math > 0 ? mathProdigy : null,
      triviaKing: triviaKing && triviaKing.trivia > 0 ? triviaKing : null,
      vocabWizard: vocabWizard && vocabWizard.vocab > 0 ? vocabWizard : null,
    }
  };
}
