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

type ProgressReportGeneratorProps = {
    isOpen: boolean;
    onClose: () => void;
    grupos: GrupoTematico[];
    highScores: Record<string, number>;
    mistakes: Record<string, number>;
    examScores: Record<string, number>;
};

export const ProgressReportGenerator = ({
    isOpen,
    onClose,
    grupos,
    highScores,
    mistakes,
    examScores
}: ProgressReportGeneratorProps) => {
    if (!isOpen) return null;

    const handleGenerate = () => {
        // 1. Calculate Stats
        let totalWords = 0;
        let totalLearned = 0;
        const problemWords: { en: string; es: string; count: number }[] = [];

        grupos.forEach((grupo) => {
            grupo.temas.forEach((tema) => {
                totalWords += tema.palabras.length;
                const score = highScores[tema.id] ?? 0;
                totalLearned += Math.min(score, tema.palabras.length);

                tema.palabras.forEach((p) => {
                    const errorCount = mistakes[p.en] ?? 0;
                    if (errorCount > 0) {
                        problemWords.push({ ...p, count: errorCount });
                    }
                });
            });
        });

        // Sort problem words by mistake count (descending)
        problemWords.sort((a, b) => b.count - a.count);

        const totalMistakes = Object.values(mistakes).reduce((acc, curr) => acc + curr, 0);
        const globalProgress = totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0;

        // 2. Generate HTML
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to generate the report.');
            return;
        }

        const date = new Date().toLocaleDateString();

        const styles = `
      <style>
        body { font-family: sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
        h1 { text-align: center; color: #2563eb; margin-bottom: 10px; }
        h2 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 40px; }
        .meta { text-align: center; color: #64748b; margin-bottom: 40px; font-size: 0.9em; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0; }
        .stat-value { font-size: 2em; font-weight: bold; color: #2563eb; display: block; }
        .stat-label { color: #64748b; font-size: 0.9em; font-weight: 600; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
        .table th { color: #64748b; font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.05em; }
        .progress-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; width: 100px; display: inline-block; vertical-align: middle; margin-right: 10px; }
        .progress-fill { height: 100%; background: #2563eb; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 999px; font-size: 0.75em; font-weight: bold; }
        .badge-green { background: #dcfce7; color: #166534; }
        .badge-red { background: #fee2e2; color: #991b1b; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    `;

        const problemWordsHtml = problemWords.length > 0 ? `
      <h2>⚠️ Areas for Improvement</h2>
      <p>These are the words that have caused the most difficulty.</p>
      <table class="table">
        <thead>
          <tr>
            <th>Word (EN)</th>
            <th>Translation (ES)</th>
            <th>Mistakes</th>
          </tr>
        </thead>
        <tbody>
          ${problemWords.slice(0, 50).map(w => `
            <tr>
              <td><strong>${w.en}</strong></td>
              <td>${w.es}</td>
              <td><span class="badge badge-red">${w.count} errors</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : `
      <h2>⚠️ Areas for Improvement</h2>
      <p>No mistakes recorded yet! Keep practicing to track your weak spots.</p>
    `;

        const groupsHtml = `
      <h2>📚 Progress by Level</h2>
      <table class="table">
        <thead>
          <tr>
            <th>Level</th>
            <th>Progress</th>
            <th>Exam Status</th>
          </tr>
        </thead>
        <tbody>
          ${grupos.map(g => {
            const groupTotal = g.temas.reduce((acc, t) => acc + t.palabras.length, 0);
            const groupLearned = g.temas.reduce((acc, t) => acc + Math.min(highScores[t.id] ?? 0, t.palabras.length), 0);
            const percent = groupTotal > 0 ? Math.round((groupLearned / groupTotal) * 100) : 0;
            const examScore = examScores[g.id] ?? 0;
            const passed = examScore >= Math.ceil(30 * 0.7); // Assuming 30 questions and 70% pass

            return `
              <tr>
                <td>
                  <strong>${g.nivel.titulo.en}</strong><br>
                  <span style="font-size: 0.9em; color: #64748b">${g.nombre.en}</span>
                </td>
                <td>
                  <div class="progress-bar"><div class="progress-fill" style="width: ${percent}%"></div></div>
                  ${percent}%
                </td>
                <td>
                  ${passed
                    ? '<span class="badge badge-green">Passed</span>'
                    : '<span class="badge" style="background: #f1f5f9; color: #64748b">Not Passed</span>'}
                </td>
              </tr>
            `;
        }).join('')}
        </tbody>
      </table>
    `;

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Progress Report - ${date}</title>
          ${styles}
        </head>
        <body>
          <h1>Student Progress Report</h1>
          <div class="meta">Generated on ${date}</div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-value">${globalProgress}%</span>
              <span class="stat-label">Total Completion</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">${totalLearned} / ${totalWords}</span>
              <span class="stat-label">Words Learned</span>
            </div>
            <div class="stat-card">
              <span class="stat-value" style="color: #dc2626">${totalMistakes}</span>
              <span class="stat-label">Total Mistakes</span>
            </div>
          </div>

          ${groupsHtml}

          ${problemWordsHtml}

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
                <h2 className="mb-4 text-2xl font-bold text-blue-800">Progress Report</h2>
                <p className="mb-6 text-slate-600">
                    Generate a detailed PDF report including your learning statistics, progress by level, and a list of words you struggle with.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-slate-200 bg-white py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
                    >
                        Generate Report
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
