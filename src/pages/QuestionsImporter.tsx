import { useState, useEffect } from "react";
import { Save, Eye } from "lucide-react";
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
}

export default function QuestionsImporter() {
  const [rawText, setRawText] = useState("");
  const [subjectInput, setSubjectInput] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [step, setStep] = useState<"INPUT" | "PREVIEW">("INPUT");
  
  // Categorias e Exams para vincular
  const [categories, setCategories] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  useEffect(() => {
    // Busca dados base para dropdown
    async function loadFormFilters() {
      try {
        const catRes = await api.get("/categories");
        const examRes = await api.get("/categories/exams");
        setCategories(catRes.data.data || catRes.data);
        setExams(examRes.data.data || examRes.data);
      } catch (err) {
        console.error("Erro ao carregar selects. Verifique se precisa do token de autenticação Admin.", err);
      }
    }
    loadFormFilters();
  }, []);

  const handleParse = () => {
    if (!rawText.trim()) return;

    const questions: ParsedQuestion[] = [];
    
    // Divisão baseada no número seguido de ponto e espaço (Ex: 1. )
    const qSplit = rawText.split(/(?=\b\d+\s*[.-])/);
    
    for (const block of qSplit) {
      if (!block.trim()) continue;
      
      const q: ParsedQuestion = {
        text: "",
        subject: subjectInput || "Outros", // Usa o assunto digitado como padrão para todas essas questões
      };

      // Divisão das alternativas a), b), c), etc.
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
      correctOption: "A", // Default mock (precisaria interpretar o gabarito)
      explanation: "Explicação gerada automaticamente no import",
    }));

    try {
      await api.post("/questions/bulk", { questions: payload });
      alert("Questões salvas com sucesso!");
      setRawText("");
      setParsedQuestions([]);
      setStep("INPUT");
    } catch (err) {
      alert("Erro ao salvar questões.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Importador de Questões</h2>
          <p className="text-gray-500">Cole o texto bruto da prova e nosso sistema extrairá as alternativas.</p>
        </div>
        
        {step === "PREVIEW" && (
          <button 
            onClick={handleSaveBulk}
            className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Salvar {parsedQuestions.length} Questões
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Concurso (Categoria)</label>
            <select 
              value={selectedCategory} 
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-gray-900 focus:outline-none"
            >
              <option value="">Selecione...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prova</label>
            <select 
              value={selectedExam} 
              onChange={e => setSelectedExam(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-gray-900 focus:outline-none"
            >
              <option value="">Selecione...</option>
              {exams.filter(e => e.category.id === selectedCategory).map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.year})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assunto Geral (Opcional)</label>
            <input 
              type="text" 
              value={subjectInput}
              onChange={e => setSubjectInput(e.target.value)}
              placeholder="Ex: Direito Penal"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-gray-900 focus:outline-none"
            />
          </div>
        </div>

        {step === "INPUT" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Texto da Prova (Ctrl + V)</label>
            <textarea
              className="w-full h-96 border border-gray-300 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
              placeholder="1. Qual é a cor do cavalo branco?\nA) Branco\nB) Preto\nC) Azul"
              value={rawText}
              onChange={e => setRawText(e.target.value)}
            />
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleParse}
                className="bg-[#3b82f6] hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Pré-visualizar {rawText ? 'Questões' : ''}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
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
                    {q.optionA && <div><span className="font-bold text-gray-900">A)</span> {q.optionA}</div>}
                    {q.optionB && <div><span className="font-bold text-gray-900">B)</span> {q.optionB}</div>}
                    {q.optionC && <div><span className="font-bold text-gray-900">C)</span> {q.optionC}</div>}
                    {q.optionD && <div><span className="font-bold text-gray-900">D)</span> {q.optionD}</div>}
                    {q.optionE && <div><span className="font-bold text-gray-900">E)</span> {q.optionE}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
