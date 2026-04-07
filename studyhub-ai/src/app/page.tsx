'use client';

import { useState } from 'react';
import { 
  FileText, 
  MessageSquare, 
  Layers, 
  Briefcase, 
  Upload, 
  Sparkles,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Target
} from 'lucide-react';
import axios from 'axios';

type Tab = 'summarize' | 'ask' | 'flashcards' | 'placement';

interface Card {
  question: string;
  answer: string;
}

export default function StudyHub() {
  const [activeTab, setActiveTab] = useState<Tab>('summarize');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryBullets, setSummaryBullets] = useState<string[]>([]);
  const [qaPair, setQaPair] = useState<{question: string, answer: string, score?: number} | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [placementData, setPlacementData] = useState<{tip: string, stats: any} | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!notes) return;
    setIsLoading(true);
    try {
      const { data } = await axios.post('/api/summarize', { text: notes });
      setSummaryBullets(data.bullets);
      setActiveTab('summarize');
    } catch (error) {
      console.error(error);
      alert('Failed to summarize notes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = (e.target as any).question.value;
    if (!question || !notes) return;
    setIsLoading(true);
    try {
      const { data } = await axios.post('/api/ask', { question, context: notes });
      setQaPair({ question, answer: data.answer, score: data.score });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlashcards = async () => {
    if (!notes) return;
    setIsLoading(true);
    try {
      const { data } = await axios.post('/api/flashcards', { summary: notes.slice(0, 1000) });
      setCards(data.cards);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlacement = async () => {
    if (!notes) return;
    // Extract a potential topic from the first line or first few words
    const topic = notes.split('\n')[0].slice(0, 50);
    setIsLoading(true);
    try {
      const { data } = await axios.post('/api/placement', { topic });
      setPlacementData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadStatus('Uploading...');
    try {
      await axios.post('/api/upload', formData);
      setUploadStatus('Uploaded Successfully!');
      
      // For the demo, if it's a text file, let's read it into the textarea
      if (file.type === 'text/plain') {
        const text = await file.text();
        setNotes(text);
      }
    } catch (error) {
      setUploadStatus('Upload Failed');
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 animate-fade-in text-zinc-100">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 glass rounded-full text-indigo-400 font-medium">
          <Sparkles size={18} />
          <span>AI-Powered Study Assistant</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
          StudyHub AI
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Multi-model workflow: Summarize notes, ask questions, and get Kaggle-backed placement tips.
        </p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Note Input */}
        <section className="lg:col-span-12 glass shadow-xl p-6 overflow-hidden relative">
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText size={20} className="text-indigo-400" />
                Raw Study Notes
              </h2>
              <div className="flex items-center gap-4">
                {uploadStatus && (
                  <span className="text-xs text-indigo-400 font-medium animate-pulse">
                    {uploadStatus}
                  </span>
                )}
                <label className="cursor-pointer px-3 py-1.5 glass text-sm rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2">
                  <Upload size={14} />
                  Upload Data
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
           </div>
           <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your study notes here (e.g., 'Database Management Systems is the study of...') or upload a file."
            className="w-full h-48 bg-transparent border-none focus:ring-0 text-zinc-300 placeholder:text-zinc-600 resize-none glass-input p-4 rounded-xl mb-4 font-mono text-sm"
           />
           <div className="flex justify-end gap-3">
              <button 
                onClick={handleSummarize}
                disabled={isLoading || !notes}
                className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                Process Notes
              </button>
           </div>
        </section>

        {/* Tab Navigation */}
        <nav className="lg:col-span-12 flex flex-wrap gap-2 p-1 glass rounded-2xl">
          {[
            { id: 'summarize', icon: FileText, label: 'Summary' },
            { id: 'ask', icon: MessageSquare, label: 'Ask Notes' },
            { id: 'flashcards', icon: Layers, label: 'Flashcards' },
            { id: 'placement', icon: Briefcase, label: 'Placement Tips' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 font-medium ${
                activeTab === tab.id 
                ? 'tab-active' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Dynamic Content Area */}
        <section className="lg:col-span-12 glass p-8 min-h-[400px] relative">
           {activeTab === 'summarize' && (
             <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <Sparkles className="text-indigo-400" />
                    Key Takeaways
                  </h3>
                </div>
                {summaryBullets.length > 0 ? (
                  <ul className="space-y-4">
                    {summaryBullets.map((bullet, i) => (
                      <li key={i} className="flex gap-3 p-4 glass-card rounded-xl border-l-4 border-l-indigo-500">
                        <CheckCircle2 className="text-indigo-500 shrink-0" size={20} />
                        <span className="text-zinc-200">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-12 text-center text-zinc-500 italic">
                    <p>Processing your notes will generate a smart summary here.</p>
                  </div>
                )}
             </div>
           )}

           {activeTab === 'ask' && (
             <div className="space-y-6 animate-fade-in">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <MessageSquare className="text-indigo-400" />
                  Extractive Q&A
                </h3>
                <form onSubmit={handleAsk} className="flex gap-2">
                  <input 
                    name="question"
                    type="text" 
                    required
                    placeholder="e.g. What are the key concepts mentioned?"
                    className="flex-1 glass-input px-4 py-3 rounded-xl"
                  />
                  <button 
                    disabled={isLoading}
                    type="submit"
                    className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-semibold transition-all flex items-center gap-2"
                  >
                    {isLoading ? <Loader2 className="spin" size={18} /> : 'Ask'}
                  </button>
                </form>
                {qaPair && (
                  <div className="mt-8 space-y-4 p-6 glass-card rounded-2xl border-l-4 border-l-emerald-500">
                    <div className="font-bold text-zinc-400">Q: {qaPair.question}</div>
                    <div className="text-lg text-white">A: {qaPair.answer}</div>
                    {qaPair.score && (
                      <div className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">
                        Confidence Score: {(qaPair.score * 100).toFixed(2)}%
                      </div>
                    )}
                  </div>
                )}
             </div>
           )}

           {activeTab === 'flashcards' && (
             <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">3D Revision Cards</h3>
                  <button 
                    onClick={handleFlashcards}
                    disabled={isLoading || !notes}
                    className="px-6 py-2 glass hover:bg-white/5 rounded-xl font-semibold transition-all flex items-center gap-2 border-indigo-500/30"
                  >
                    Generate {cards.length > 0 ? 'New' : ''} Cards
                  </button>
                </div>
                {cards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card, i) => (
                      <div key={i} className="card-container h-64 cursor-pointer">
                        <div className="card-inner relative w-full h-full text-center">
                          <div className="card-front absolute inset-0 glass-card p-6 flex items-center justify-center font-bold text-lg rounded-2xl">
                             {card.question}
                          </div>
                          <div className="card-back absolute inset-0 bg-indigo-600 p-6 flex items-center justify-center text-white text-md rounded-2xl shadow-2xl">
                             {card.answer}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-zinc-500 italic">
                    <p>Click "Generate" to create interactive flashcards for revision.</p>
                  </div>
                )}
             </div>
           )}

           {activeTab === 'placement' && (
             <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <Briefcase className="text-indigo-400" />
                    Kaggle Placement Engine
                  </h3>
                  <button 
                    onClick={handlePlacement}
                    disabled={isLoading || !notes}
                    className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold transition-all"
                  >
                    Analyze Relevance
                  </button>
                </div>

                {placementData ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                       <div className="p-8 glass-card rounded-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Briefcase size={80} />
                          </div>
                          <h4 className="text-indigo-400 font-bold text-sm uppercase tracking-widest mb-4">AI Counselor Advice</h4>
                          <div className="text-lg leading-relaxed text-zinc-100 whitespace-pre-wrap">
                            {placementData.tip}
                          </div>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="p-6 glass rounded-2xl border-indigo-500/20">
                          <div className="flex items-center gap-2 text-indigo-400 mb-4 font-bold">
                            <Target size={18} />
                            <span>Dataset Signal</span>
                          </div>
                          <div className="space-y-4">
                             <div>
                                <div className="text-xs text-zinc-500">Domain Identified</div>
                                <div className="text-xl font-bold">{placementData.stats.domain}</div>
                             </div>
                             <div>
                                <div className="text-xs text-zinc-500">Kaggle Placement Rate</div>
                                <div className="text-3xl font-black text-indigo-500">{placementData.stats.rate}%</div>
                             </div>
                             <div className="pt-4 border-t border-white/5 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-zinc-500">Degree Avg</span>
                                  <span>{placementData.stats.avgDegreeP}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-zinc-500">WorkEx Bonus</span>
                                  <span className="text-emerald-500">+{((parseFloat(placementData.stats.workexWithRate) - parseFloat(placementData.stats.workexWithoutRate))).toFixed(1)}%</span>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-zinc-500 italic">
                    <p>Get insights into how this topic correlates with real-world campus placement data.</p>
                  </div>
                )}
             </div>
           )}
        </section>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-20 pb-12 flex flex-col items-center gap-4 text-zinc-500 text-sm">
        <div className="flex gap-6 items-center">
           <span className="flex items-center gap-1"><ExternalLink size={12} /> Hugging Face</span>
           <span className="flex items-center gap-1"><ExternalLink size={12} /> Groq Llama 3</span>
           <span className="flex items-center gap-1"><ExternalLink size={12} /> Supabase Storage</span>
        </div>
        <p>© 2026 StudyHub AI — Built for Students</p>
      </footer>
    </main>
  );
}

