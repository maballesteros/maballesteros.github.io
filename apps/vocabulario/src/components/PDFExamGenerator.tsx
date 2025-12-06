import { useState } from 'react';
import { gruposData } from '../data';
import { createPortal } from 'react-dom';

type LocalizedText = {
  en: string;
  es: string;
};

type Palabra = {
  en: string;
  es: string;
};

type Tema = {
  id: string;
  nombre: LocalizedText;
  palabras: Palabra[];
};

type GrupoTematico = {
  id: string;
  tipo: 'vocabulario' | 'frases';
  nombre: LocalizedText;
  nivel: {
    titulo: LocalizedText;
  };
  temas: Tema[];
};

type PDFExamGeneratorProps = {
  isOpen: boolean;
  onClose: () => void;
  grupos: GrupoTematico[];
};

export const PDFExamGenerator = ({ isOpen, onClose, grupos }: PDFExamGeneratorProps) => {
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(20);
  const [includeAnswers, setIncludeAnswers] = useState(true);

  if (!isOpen) return null;

  const toggleLevel = (id: string) => {
    setSelectedLevels((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    // 1. Gather words
    const targetGroups = grupos.filter((g) => selectedLevels.includes(g.id));
    const allWords = targetGroups.flatMap((g) => g.temas.flatMap((t) => t.palabras));

    if (allWords.length === 0) {
      alert('Please select at least one level with words.');
      return;
    }

    // 2. Random selection
    const deck: Palabra[] = [];
    const pool = [...allWords];
    const count = Math.min(questionCount, pool.length);

    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      deck.push(pool.splice(idx, 1)[0]);
    }

    // 3. Generate HTML
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate the exam.');
      return;
    }

    const date = new Date().toLocaleDateString();

    const styles = `
      <style>
        body { font-family: sans-serif; padding: 40px; color: #1e293b; }
        h1 { text-align: center; color: #2563eb; margin-bottom: 10px; }
        .meta { text-align: center; color: #64748b; margin-bottom: 40px; font-size: 0.9em; }
        .exam-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .question { margin-bottom: 15px; page-break-inside: avoid; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
        .label { font-weight: bold; display: block; margin-bottom: 4px; }
        .line { border-bottom: 1px solid #94a3b8; height: 24px; margin-top: 4px; }
        .page-break { page-break-before: always; }
        .answer-key { margin-top: 40px; }
        .answer-row { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding: 8px 0; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    `;

    const questionsHtml = deck.map((p, i) => `
      <div class="question">
        <span class="label">${i + 1}. ${p.en}</span>
        <div class="line"></div>
      </div>
    `).join('');

    const answersHtml = includeAnswers ? `
      <div class="page-break"></div>
      <h1>Answer Key</h1>
      <div class="answer-key">
        ${deck.map((p, i) => `
          <div class="answer-row">
            <span>${i + 1}. ${p.en}</span>
            <strong>${p.es}</strong>
          </div>
        `).join('')}
      </div>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vocabulary Exam - ${date}</title>
          ${styles}
        </head>
        <body>
          <h1>Vocabulary Exam</h1>
          <div class="meta">Date: ${date} &bull; Questions: ${count}</div>
          
          <div class="exam-grid">
            ${questionsHtml}
          </div>

          ${answersHtml}

          <script>
            window.onload = () => {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-fade-in">
        <h2 className="mb-4 text-2xl font-bold text-blue-800">Create PDF Exam</h2>

        <div className="mb-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Select Levels</label>
            <div className="flex flex-wrap gap-2">
              {grupos.map((g) => (
                <button
                  key={g.id}
                  onClick={() => toggleLevel(g.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${selectedLevels.includes(g.id)
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {g.nivel.titulo.es}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Number of Questions: {questionCount}
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="answers"
              checked={includeAnswers}
              onChange={(e) => setIncludeAnswers(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="answers" className="text-sm font-medium text-slate-700">
              Include Answer Key
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={selectedLevels.length === 0}
            className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
          >
            Generate PDF
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
