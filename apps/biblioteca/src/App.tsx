import { useState, useEffect } from 'react';
import { Search, Book as BookIcon, Menu, X, Sun, Moon, Type, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Types
interface Ebook {
    id: string;
    title: string;
    author: string;
    cover: string;
    description: string;
    path: string;
}

interface Chapter {
    id: string;
    title: string;
    sections: { title: string; path: string }[];
}

interface EbookIndex {
    title: string;
    basePath: string;
    chapters: Chapter[];
}

export default function App() {
    const [view, setView] = useState<'gallery' | 'reader'>('gallery');
    const [ebooks, setEbooks] = useState<Ebook[]>([]);
    const [selectedBook, setSelectedBook] = useState<Ebook | null>(null);
    const [bookIndex, setBookIndex] = useState<EbookIndex | null>(null);
    const [currentSection, setCurrentSection] = useState<{ title: string; path: string } | null>(null);
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [sidebarSearch, setSidebarSearch] = useState('');

    // Reader Settings
    const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>(() => (localStorage.getItem('reader-theme') as any) || 'light');
    const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('reader-fontSize') || '18'));
    const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>(() => (localStorage.getItem('reader-fontFamily') as any) || 'serif');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        fetch('/ebooks/ebooks.json')
            .then(res => res.json())
            .then(data => {
                setEbooks(data);
                // Persistence: Check for last read book and section
                const lastBookId = localStorage.getItem('reader-lastBookId');
                const lastSectionPath = localStorage.getItem('reader-lastSectionPath');

                if (lastBookId && lastSectionPath) {
                    const book = data.find((b: Ebook) => b.id === lastBookId);
                    if (book) {
                        openBook(book, lastSectionPath);
                    }
                }
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        localStorage.setItem('reader-theme', theme);
        localStorage.setItem('reader-fontSize', fontSize.toString());
        localStorage.setItem('reader-fontFamily', fontFamily);
    }, [theme, fontSize, fontFamily]);

    const openBook = async (book: Ebook, resumePath?: string) => {
        setLoading(true);
        setSelectedBook(book);
        localStorage.setItem('reader-lastBookId', book.id);

        try {
            const res = await fetch(book.path);
            const index = await res.json();
            setBookIndex(index);
            setView('reader');

            // Check for book-specific resume path if none provided
            const effectiveResumePath = resumePath || localStorage.getItem(`reader-lastSectionPath-${book.id}`);

            const sectionToLoad = effectiveResumePath
                ? index.chapters.flatMap((c: Chapter) => c.sections).find((s: any) => s.path === effectiveResumePath)
                : index.chapters?.[0]?.sections?.[0];

            if (sectionToLoad) {
                loadSection(sectionToLoad, index.basePath, book.id);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadSection = async (section: { title: string; path: string }, basePath: string, bookId?: string) => {
        setLoading(true);
        setCurrentSection(section);

        const id = bookId || selectedBook?.id;
        if (id) {
            localStorage.setItem('reader-lastSectionPath', section.path); // Global last section
            localStorage.setItem(`reader-lastSectionPath-${id}`, section.path); // Book-specific last section
        }

        try {
            const path = section.path.startsWith('/') ? section.path : `${basePath}${section.path}`;
            const res = await fetch(path);
            const text = await res.text();
            setContent(text);
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            setContent('Error al cargar el contenido.');
        } finally {
            setLoading(false);
        }
    };

    const flatSections = bookIndex?.chapters.flatMap(c => c.sections) || [];
    const currentIndex = flatSections.findIndex(s => s.path === currentSection?.path);

    const navigate = (direction: 'prev' | 'next') => {
        const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex >= 0 && newIndex < flatSections.length && bookIndex) {
            loadSection(flatSections[newIndex], bookIndex.basePath);
        }
    };

    const filteredEbooks = ebooks.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={cn("min-h-screen transition-colors duration-300", theme)}>
            {view === 'gallery' ? (
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                        <div>
                            <h1 className="text-4xl font-bold mb-2 tracking-tight">Biblioteca Digital</h1>
                            <p className="text-[var(--text-secondary)]">Explora tu colección de sabiduría.</p>
                        </div>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por título o autor..."
                                className="w-full pl-12 pr-4 py-3 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredEbooks.map(book => (
                            <div
                                key={book.id}
                                className="premium-card group bg-[var(--bg-secondary)] cursor-pointer"
                                onClick={() => openBook(book)}
                            >
                                <div className="aspect-[2/3] overflow-hidden bg-gray-200">
                                    <img
                                        src={book.cover}
                                        alt={book.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                                <div className="p-6">
                                    <h2 className="text-xl font-bold mb-1 group-hover:text-[var(--accent)] transition-colors">{book.title}</h2>
                                    <p className="text-sm text-[var(--text-secondary)] mb-4">{book.author}</p>
                                    <p className="text-sm line-clamp-3 text-[var(--text-secondary)]">{book.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-screen overflow-hidden bg-[var(--reader-bg)] text-[var(--reader-text)]">
                    {/* Reader Header */}
                    <header className="h-16 border-b border-[var(--border)] flex items-center justify-between px-4 flex-shrink-0 z-20 bg-[var(--reader-bg)]">
                        <div className="flex items-center gap-2 md:gap-4">
                            <button
                                onClick={() => setView('gallery')}
                                className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors"
                                title="Volver a la galería"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors"
                            >
                                <Menu size={24} />
                            </button>
                            <div className="hidden lg:flex items-center gap-2">
                                <span className="font-bold text-xs md:text-sm uppercase tracking-widest truncate max-w-[150px]">{selectedBook?.title}</span>
                                <span className="text-[var(--border)]">|</span>
                                <span className="text-xs md:text-sm text-[var(--text-secondary)] truncate max-w-[200px]">{currentSection?.title}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 md:gap-3">
                            <div className="flex bg-[var(--bg-secondary)] rounded-full p-1 border border-[var(--border)] mr-2">
                                <button
                                    onClick={() => navigate('prev')}
                                    disabled={currentIndex <= 0}
                                    className="p-1.5 md:p-2 hover:bg-[var(--border)] rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Anterior"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <div className="w-[1px] bg-[var(--border)] mx-1" />
                                <button
                                    onClick={() => navigate('next')}
                                    disabled={currentIndex >= flatSections.length - 1}
                                    className="p-1.5 md:p-2 hover:bg-[var(--border)] rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Siguiente"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            <button
                                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors"
                            >
                                <Settings size={20} />
                            </button>
                        </div>
                    </header>

                    <div className="flex flex-1 overflow-hidden relative">
                        {/* Sidebar */}
                        <aside
                            className={cn(
                                "fixed inset-y-0 left-0 z-30 w-80 bg-[var(--bg-secondary)] border-r border-[var(--border)] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 pt-16 lg:pt-0 flex flex-col",
                                isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:w-0 lg:overflow-hidden lg:border-none"
                            )}
                        >
                            <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex gap-2 items-center">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Filtrar contenido..."
                                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--reader-bg)] border border-[var(--border)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
                                        value={sidebarSearch}
                                        onChange={(e) => setSidebarSearch(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-2 hover:bg-[var(--reader-bg)] rounded-full transition-colors lg:hidden text-[var(--text-secondary)]"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                {bookIndex?.chapters.map(chapter => {
                                    const filteredSections = chapter.sections.filter(s =>
                                        s.title.toLowerCase().includes(sidebarSearch.toLowerCase())
                                    );

                                    if (filteredSections.length === 0 && !chapter.title.toLowerCase().includes(sidebarSearch.toLowerCase())) {
                                        return null;
                                    }

                                    return (
                                        <div key={chapter.id} className="mb-6">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-3 px-3 opacity-80">
                                                {chapter.title}
                                            </h3>
                                            <ul className="space-y-1">
                                                {(sidebarSearch ? filteredSections : chapter.sections).map(section => (
                                                    <li key={section.path}>
                                                        <button
                                                            onClick={() => loadSection(section, bookIndex.basePath)}
                                                            className={cn(
                                                                "w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all duration-200",
                                                                currentSection?.path === section.path
                                                                    ? "bg-[var(--accent)] text-white font-medium shadow-md shadow-[var(--accent)]/20"
                                                                    : "hover:bg-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--reader-text)]"
                                                            )}
                                                        >
                                                            {section.title}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </aside>

                        {/* Reading Content */}
                        <main className="flex-1 overflow-y-auto custom-scrollbar relative px-4 py-8 md:py-12 md:px-8">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
                                </div>
                            ) : (
                                <article
                                    className="reader-content"
                                    style={{
                                        '--reader-font-family': fontFamily === 'serif' ? 'var(--reader-font-serif)' : 'var(--reader-font-sans)',
                                        '--reader-font-size': `${fontSize}px`
                                    } as any}
                                >
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            img: ({ node, ...props }) => {
                                                const src = props.src || '';
                                                // Rewrite relative paths for images
                                                const rewrittenSrc = src.startsWith('..')
                                                    ? `${bookIndex?.basePath}${src.replace('../', '')}`
                                                    : src;
                                                return <img {...props} src={rewrittenSrc} className="rounded-xl shadow-lg my-8 mx-auto" alt={props.alt || ''} />;
                                            },
                                            a: ({ node, ...props }) => {
                                                const href = props.href || '';
                                                const isExternal = href.startsWith('http') || href.startsWith('mailto:');

                                                if (isExternal) {
                                                    return <a {...props} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline" />;
                                                }

                                                return (
                                                    <a
                                                        {...props}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (!currentSection || !bookIndex) return;

                                                            // Simple path resolution
                                                            const currentDir = currentSection.path.split('/').slice(0, -1);
                                                            const targetParts = href.split('/');

                                                            const resolvedParts = [...currentDir];

                                                            for (const part of targetParts) {
                                                                if (part === '..') {
                                                                    resolvedParts.pop();
                                                                } else if (part !== '.') {
                                                                    resolvedParts.push(part);
                                                                }
                                                            }

                                                            const resolvedPath = resolvedParts.join('/');
                                                            const targetSection = bookIndex.chapters
                                                                .flatMap(c => c.sections)
                                                                .find(s => s.path === resolvedPath);

                                                            if (targetSection) {
                                                                loadSection(targetSection, bookIndex.basePath);
                                                            } else {
                                                                console.warn('Section not found:', resolvedPath);
                                                            }
                                                        }}
                                                        className="cursor-pointer text-[var(--accent)] hover:underline"
                                                    />
                                                );
                                            }
                                        }}
                                    >
                                        {content}
                                    </ReactMarkdown>
                                </article>
                            )}
                        </main>

                        {/* Settings Overlay */}
                        {isSettingsOpen && (
                            <div className="absolute top-2 right-4 z-40 w-64 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 transition-all animate-in fade-in zoom-in duration-200">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-bold">Ajustes de Lectura</h4>
                                    <button onClick={() => setIsSettingsOpen(false)}><X size={18} /></button>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-[var(--text-secondary)] mb-3 block">Tema</label>
                                        <div className="flex gap-2">
                                            {[
                                                { id: 'light', icon: Sun, label: 'Luz' },
                                                { id: 'sepia', icon: BookIcon, label: 'Sepia' },
                                                { id: 'dark', icon: Moon, label: 'Noche' }
                                            ].map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setTheme(t.id as any)}
                                                    className={cn(
                                                        "flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border transition-all",
                                                        theme === t.id ? "border-[var(--accent)] bg-white/10" : "border-[var(--border)]"
                                                    )}
                                                >
                                                    <t.icon size={18} />
                                                    <span className="text-[10px] font-medium">{t.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold uppercase text-[var(--text-secondary)] mb-3 block text-center">Tamaño de Fuente: {fontSize}px</label>
                                        <input
                                            type="range" min="14" max="24" value={fontSize}
                                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                                            className="w-full accent-[var(--accent)]"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold uppercase text-[var(--text-secondary)] mb-3 block">Tipografía</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setFontFamily('serif')}
                                                className={cn("flex-1 py-2 rounded-lg border font-serif", fontFamily === 'serif' ? "border-[var(--accent)] bg-white/10" : "border-[var(--border)]")}
                                            >
                                                Serif
                                            </button>
                                            <button
                                                onClick={() => setFontFamily('sans')}
                                                className={cn("flex-1 py-2 rounded-lg border font-sans", fontFamily === 'sans' ? "border-[var(--accent)] bg-white/10" : "border-[var(--border)]")}
                                            >
                                                Sans
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
