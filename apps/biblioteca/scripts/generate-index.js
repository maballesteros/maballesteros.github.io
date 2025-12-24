import fs from 'fs';
import path from 'path';

const baseDir = '/Users/mike/projects/maballesteros.github.io/ebooks/diario_del_guerrero';
const outputFilePath = path.join(baseDir, 'index.json');

const months = [
    { id: 'mes_01', dir: 'mes_01_disciplina', title: 'Mes 01: Disciplina' },
    { id: 'mes_02', dir: 'mes_02_autocontrol', title: 'Mes 02: Autocontrol' },
    { id: 'mes_03', dir: 'mes_03_percepcion', title: 'Mes 03: Percepción' },
    { id: 'mes_04', dir: 'mes_04_accion', title: 'Mes 04: Acción' },
    { id: 'mes_05', dir: 'mes_05_resistencia', title: 'Mes 05: Resistencia' },
    { id: 'mes_06', dir: 'mes_06_estrategia', title: 'Mes 06: Estrategia' },
    { id: 'mes_07', dir: 'mes_07_maestria', title: 'Mes 07: Maestría' },
    { id: 'mes_08', dir: 'mes_08_libertad', title: 'Mes 08: Libertad' },
    { id: 'mes_09', dir: 'mes_09_entorno', title: 'Mes 09: Entorno' },
    { id: 'mes_10', dir: 'mes_10_ego', title: 'Mes 10: Ego' },
    { id: 'mes_11', dir: 'mes_11_muerte', title: 'Mes 11: Muerte' },
    { id: 'mes_12', dir: 'mes_12_integracion', title: 'Mes 12: Integración' }
];

function getTitleFromMd(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const firstLine = content.split('\n')[0];
        return firstLine.replace(/^#\s*/, '').trim();
    } catch (e) {
        return path.basename(filePath);
    }
}

const ebookIndex = {
    title: "Diario del Guerrero",
    basePath: "/ebooks/diario_del_guerrero/",
    chapters: [
        {
            id: "intro",
            title: "Introducciones",
            sections: [
                { title: "Guía Maestra", path: "diario_estructura.md" },
                { title: "Anexo Galería", path: "anexo_galeria.md" }
            ]
        }
    ]
};

months.forEach(month => {
    const monthPath = path.join(baseDir, month.dir);
    if (fs.existsSync(monthPath)) {
        const sections = [];

        // Add intro if exists
        const introPath = path.join(monthPath, `intro_${month.dir.substring(0, 6)}.md`);
        if (fs.existsSync(introPath)) {
            sections.push({ title: "Introducción", path: `${month.dir}/${path.basename(introPath)}` });
        }

        const files = fs.readdirSync(monthPath)
            .filter(f => f.endsWith('.md') && !f.startsWith('intro_') && !f.startsWith('indice_'))
            .sort();

        files.forEach(file => {
            const fullPath = path.join(monthPath, file);
            const title = getTitleFromMd(fullPath);
            sections.push({ title, path: `${month.dir}/${file}` });
        });

        ebookIndex.chapters.push({
            id: month.id,
            title: month.title,
            sections
        });
    }
});

fs.writeFileSync(outputFilePath, JSON.stringify(ebookIndex, null, 2));
console.log('Index generated correctly at:', outputFilePath);
