import { useState, useEffect } from "react";
import { Save, Eye, FileImage, UploadCloud, X } from "lucide-react";
import { api } from "../services/api";

interface ParsedQuestion {
  text: string;
  subject?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  optionE?: string;
  correctOption?: string;
  explanation?: string;
  type: string;
  imageUrl?: string;
}

export default function QuestionsImporter() {
  const [activeTab, setActiveTab] = useState<"BULK" | "SINGLE">("BULK");
  
  // Shared State
  const [categories, setCategories] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  
  // Bulk State
  const [rawText, setRawText] = useState("");
  const [subjectInput, setSubjectInput] = useState("");
  const [questionType, setQuestionType] = useState<"MULTIPLE_CHOICE" | "RIGHT_WRONG">("MULTIPLE_CHOICE");
  const [globalExplanation, setGlobalExplanation] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [step, setStep] = useState<"INPUT" | "PREVIEW">("INPUT");

  // Single State
  const [singleQuestion, setSingleQuestion] = useState<ParsedQuestion>({
    text: "",
    subject: "",
    type: "MULTIPLE_CHOICE",
    correctOption: "A",
    explanation: "",
    optionA: "", optionB: "", optionC: "", optionD: "", optionE: "",
    imageUrl: ""
  });

  useEffect(() => {
    async function loadFormFilters() {
      try {
        const catRes = await api.get("/categories");
        const examRes = await api.get("/categories/exams");
        setCategories(catRes.data.data || catRes.data);
        setExams(examRes.data.data || examRes.data);
      } catch (err) {
        console.error("Erro ao carregar selects.", err);
      }
    }
    loadFormFilters();
  }, []);

  // --- BULK LOGIC ---
  const handleParse = () => {
    if (!rawText.trim()) return;

    const questions: ParsedQuestion[] = [];
    const qSplit = rawText.split(/(?=\b\d+\s*[.-])/);
    
    for (const block of qSplit) {
      if (!block.trim()) continue;
      
      const q: ParsedQuestion = {
        text: "",
        subject: subjectInput || "Outros",
        type: questionType,
        explanation: globalExplanation
      };

      if (questionType === "RIGHT_WRONG") {
        q.text = block.trim();
        q.correctOption = "C"; 
        questions.push(q);
      } else {
        const parts = block.split(/(?=\b[a-fA-F][.)\s-]+)/);
        q.text = parts[0].trim();
        
        for (let i = 1; i < parts.length; i++) {
          const optText = parts[i].trim();
          const letter = optText.charAt(0).toUpperCase();
          const optionValue = optText.substring(2).trim();

          if (letter === "A") q.optionA = optionValue;
          if (letter === "B") q.optionB = optionValue;
          if (letter === "C") q.optionC = optionValue;
          if (letter === "D") q.optionD = optionValue;
          if (letter === "E") q.optionE = optionValue;
        }
        questions.push(q);
      }
    }

    setParsedQuestions(questions);
    setStep("PREVIEW");
  };

  const handleSaveBulk = async () => {
    if (!selectedCategory || !selectedExam) {
      alert("Selecione um Concurso e uma Prova antes de salvar.");
      return;
    }

    const payload = parsedQuestions.map(q => ({
      ...q,
      categoryId: selectedCategory,
      examId: selectedExam,
      correctOption: q.correctOption || "A",
    }));

    try {
      await api.post("/questions/bulk", { questions: payload });
      alert("Questões em massa salvas com sucesso!");
      setRawText("");
      setGlobalExplanation("");
      setParsedQuestions([]);
      setStep("INPUT");
    } catch (err) {
      alert("Erro ao salvar questões.");
    }
  };

  // --- SINGLE LOGIC ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSingleQuestion(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSingle = async () => {
    if (!selectedCategory || !selectedExam) {
      alert("Selecione um Concurso e uma Prova antes de salvar.");
      return;
    }

    if (!singleQuestion.text.trim()) {
      alert("O enunciado é obrigatório.");
      return;
    }

    const payload = {
      ...singleQuestion,
      categoryId: selectedCategory,
      examId: selectedExam,
    };

    try {
      // Reusing bulk endpoint for a single question since we don't have a specific POST /questions in the controller.
      await api.post("/questions/bulk", { questions: [payload] });
      alert("Questão salva com sucesso!");
      setSingleQuestion({
        text: "", subject: "", type: "MULTIPLE_CHOICE", correctOption: "A", explanation: "",
        optionA: "", optionB: "", optionC: "", optionD: "", optionE: "", imageUrl: ""
      });
    } catch (err) {
      alert("Erro ao salvar a questão.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Importador de Questões</h2>
        <p className="text-gray-500">Adicione questões manualmente ou importe blocos inteiros de texto.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row bg-gray-100 p-1 rounded-lg w-full sm:w-fit">
        <button 
          onClick={() => setActiveTab("BULK")}
          className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === "BULK" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Importação em Massa
        </button>
        <button 
          onClick={() => setActiveTab("SINGLE")}
          className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === "SINGLE" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Criar Questão Única
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        {/* Global Context (Shared) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-6 border-b border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Concurso Pai</label>
            <select 
              value={selectedCategory} 
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-gray-900 outline-none"
            >
              <option value="">Selecione o concurso...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prova Específica</label>
            <select 
              value={selectedExam} 
              onChange={e => setSelectedExam(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-gray-900 outline-none"
            >
              <option value="">Selecione a prova...</option>
              {exams.filter(e => e.category.id === selectedCategory).map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.year})</option>
              ))}
            </select>
          </div>
        </div>

        {/* --- BULK TAB --- */}
        {activeTab === "BULK" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="font-bold text-gray-900 text-lg">Configuração em Massa</h3>
              {step === "PREVIEW" && (
                <button 
                  onClick={handleSaveBulk}
                  className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Salvar {parsedQuestions.length} Questões
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Formato da Prova</label>
                <select 
                  value={questionType} 
                  onChange={e => setQuestionType(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-gray-900 outline-none"
                >
                  <option value="MULTIPLE_CHOICE">Múltipla Escolha (ABCDE)</option>
                  <option value="RIGHT_WRONG">Certo / Errado (CESPE)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assunto Global (Opcional)</label>
                <input 
                  type="text" 
                  value={subjectInput}
                  onChange={e => setSubjectInput(e.target.value)}
                  placeholder="Ex: Direito Penal"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>
            </div>

            {step === "INPUT" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Texto da Prova (Cole aqui)</label>
                  <textarea
                    className="w-full h-80 border border-gray-300 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                    placeholder="1. Pergunta aqui...\nA) Opção\nB) Opção"
                    value={rawText}
                    onChange={e => setRawText(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gabarito/Explicação Padrão (Opcional)</label>
                  <textarea
                    className="w-full h-24 border border-gray-300 rounded-lg p-4 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                    placeholder="Você pode colar comentários ou o gabarito geral aqui. Será aplicado a todas as questões geradas."
                    value={globalExplanation}
                    onChange={e => setGlobalExplanation(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={handleParse}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> Pré-visualizar {rawText ? 'Questões' : ''}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-t pt-6 mt-6">
                  <h3 className="font-bold text-gray-900">Pré-visualização ({parsedQuestions.length} encontradas)</h3>
                  <button onClick={() => setStep("INPUT")} className="text-sm text-blue-600 font-medium hover:underline">
                    Voltar e editar texto
                  </button>
                </div>
                
                <div className="space-y-4">
                  {parsedQuestions.map((q, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="font-bold text-sm text-indigo-600 mb-2">{q.subject}</div>
                      <p className="text-gray-900 font-medium whitespace-pre-wrap mb-4">{q.text}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        {q.type === "RIGHT_WRONG" ? (
                          <>
                            <div className="bg-emerald-50 text-emerald-700 p-2 rounded-md font-medium border border-emerald-100 flex items-center gap-2">
                              <span className="font-bold text-emerald-900">(C)</span> Certo
                            </div>
                            <div className="bg-red-50 text-red-700 p-2 rounded-md font-medium border border-red-100 flex items-center gap-2">
                              <span className="font-bold text-red-900">(E)</span> Errado
                            </div>
                          </>
                        ) : (
                          <>
                            {q.optionA && <div><span className="font-bold text-gray-900">A)</span> {q.optionA}</div>}
                            {q.optionB && <div><span className="font-bold text-gray-900">B)</span> {q.optionB}</div>}
                            {q.optionC && <div><span className="font-bold text-gray-900">C)</span> {q.optionC}</div>}
                            {q.optionD && <div><span className="font-bold text-gray-900">D)</span> {q.optionD}</div>}
                            {q.optionE && <div><span className="font-bold text-gray-900">E)</span> {q.optionE}</div>}
                          </>
                        )}
                      </div>
                      {q.explanation && (
                        <div className="mt-4 p-3 bg-white border border-gray-200 rounded text-xs text-gray-500 italic">
                          <span className="font-bold text-gray-700">Explicação/Gabarito Padrão: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- SINGLE TAB --- */}
        {activeTab === "SINGLE" && (
          <div className="space-y-6">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <FileImage className="w-5 h-5 text-indigo-600" />
              Criação Manual (Suporta Imagem)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Formato da Questão</label>
                <select 
                  value={singleQuestion.type} 
                  onChange={e => setSingleQuestion({...singleQuestion, type: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-gray-900 outline-none"
                >
                  <option value="MULTIPLE_CHOICE">Múltipla Escolha (ABCDE)</option>
                  <option value="RIGHT_WRONG">Certo / Errado (CESPE)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assunto</label>
                <input 
                  type="text" 
                  value={singleQuestion.subject}
                  onChange={e => setSingleQuestion({...singleQuestion, subject: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enunciado (Obrigatório)</label>
              <textarea
                className="w-full h-32 border border-gray-300 rounded-lg p-4 text-sm focus:ring-2 focus:ring-gray-900 outline-none resize-y"
                value={singleQuestion.text}
                onChange={e => setSingleQuestion({...singleQuestion, text: e.target.value})}
              />
            </div>

            {/* Image Upload */}
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center relative">
              {singleQuestion.imageUrl ? (
                <div className="relative w-full max-w-md">
                  <button 
                    onClick={() => setSingleQuestion({...singleQuestion, imageUrl: ""})}
                    className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <img src={singleQuestion.imageUrl} alt="Preview" className="w-full rounded-lg border border-gray-200 shadow-sm" />
                </div>
              ) : (
                <div className="text-center">
                  <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 font-medium">Clique para adicionar uma imagem à questão</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF (Máx 2MB recomendado)</p>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Options */}
            {singleQuestion.type === "MULTIPLE_CHOICE" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                {["A", "B", "C", "D", "E"].map((opt) => (
                  <div key={opt} className="flex items-center gap-3">
                    <span className="font-bold text-gray-700 w-6">{opt})</span>
                    <input
                      type="text"
                      value={singleQuestion[`option${opt}` as keyof typeof singleQuestion]}
                      onChange={(e) => setSingleQuestion({ ...singleQuestion, [`option${opt}`]: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-emerald-700 mb-2">Gabarito (Correta)</label>
                {singleQuestion.type === "MULTIPLE_CHOICE" ? (
                  <select 
                    value={singleQuestion.correctOption}
                    onChange={e => setSingleQuestion({...singleQuestion, correctOption: e.target.value})}
                    className="w-full border border-emerald-300 bg-emerald-50 text-emerald-900 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                  >
                    {["A", "B", "C", "D", "E"].map(opt => <option key={opt} value={opt}>Alternativa {opt}</option>)}
                  </select>
                ) : (
                  <select 
                    value={singleQuestion.correctOption}
                    onChange={e => setSingleQuestion({...singleQuestion, correctOption: e.target.value})}
                    className="w-full border border-emerald-300 bg-emerald-50 text-emerald-900 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                  >
                    <option value="C">CERTO</option>
                    <option value="E">ERRADO</option>
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Explicação Definitiva (Gabarito)</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none resize-y"
                  value={singleQuestion.explanation}
                  onChange={e => setSingleQuestion({...singleQuestion, explanation: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button 
                onClick={handleSaveSingle}
                className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2"
              >
                <Save className="w-5 h-5" /> Salvar Questão
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
