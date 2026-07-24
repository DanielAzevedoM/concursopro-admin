import { useState, useEffect } from "react";
import { Save, Eye, FileImage, UploadCloud, X } from "lucide-react";
import { api } from "../services/api";
import { useAlert } from "../contexts/AlertContext";

interface ParsedQuestion {
  baseText?: string;
  questionText: string;
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

const PROMPT_CESPE = `Atue como um especialista em formatação de dados e processamento de textos de concursos públicos. Seu objetivo é receber o texto bruto de uma prova do CESPE/CEBRASPE, a lista de matérias (conteúdo programático) e o respectivo gabarito, formatando-os em dois blocos distintos, padronizados e dentro de blocos de código.

Siga rigorosamente as regras abaixo:

## REGRAS PARA O BLOCO 1 (PROVA)
1. Coloque todo o resultado do Bloco 1 dentro de um bloco de código markdown (iniciado e terminado com \`\`\`text).
2. Ignorar Cabeçalhos e Instruções: Remova textos padrões da banca (ex: "Cada um dos itens da prova objetiva...", "Espaço livre", "CESPE | CEBRASPE", datas de aplicação, etc.).
3. Limpeza de Sujeira de PDF: Remova as numerações de linhas soltas no meio do texto (ex: \\t1, 4, 7, 10) e junte as quebras de linha indesejadas para formar parágrafos contínuos e coesos.
4. Identificação de Matéria: Analise o conteúdo de cada texto base e das questões vinculadas a ele. Compare esse conteúdo com a lista de "MATÉRIAS" fornecida e identifique qual é a disciplina correta. Adicione a tag \`[MATÉRIA: Nome da Matéria]\` em uma linha isolada.
5. Textos de Referência: Sempre que houver um texto, poema, figura ou situação que sirva de base para uma ou mais questões, coloque a tag \`[TEXTO BASE]\` imediatamente abaixo da tag da matéria. 
   Exemplo de estrutura:
   [MATÉRIA: LÍNGUA PORTUGUESA]
   [TEXTO BASE]
   O nome é o nosso rosto na multidão...
6. Formatação e Numeração de Questões: 
   - MANTENHA ESTRITAMENTE a numeração original das questões. Se o bloco começar na questão 40, inicie com 40.
   - Formato: "[Número original da questão]. [Texto da questão]"
   - Em questões que possuam a estrutura "Situação hipotética: [...] Assertiva: [...]", mantenha essa estrutura clara na mesma linha ou no mesmo parágrafo da questão.
7. Inicie a resposta deste bloco com o título: "BLOCO 1 (Copie e cole na Caixa de Texto da Prova)" fora do bloco de código, e em seguida abra o bloco de código com o conteúdo.

## REGRAS PARA O BLOCO 2 (GABARITO)
1. Coloque todo o resultado do Bloco 2 dentro de um bloco de código markdown (iniciado e terminado com \`\`\`text).
2. Extraia a relação exata de "Número da Questão -> Resposta" da tabela/matriz fornecida.
3. Converta a tabela para uma lista vertical simples.
4. MANTENHA ESTRITAMENTE a numeração original para garantir o vínculo perfeito com a prova.
5. Formato exigido: [Número da Questão]. [Letra C, E ou X] (onde X representa questão anulada). Exemplo:
   1. C
   2. E
   3. X
6. Inicie a resposta deste bloco com o título: "BLOCO 2 (Copie e cole na Caixa de Gabarito)" fora do bloco de código.

## DINÂMICA DE EXECUÇÃO
- Se eu enviar a Prova e as Matérias primeiro, gere o **BLOCO 1** e, ao final, escreva explicitamente: "Por favor, envie o texto do gabarito para que eu possa gerar o BLOCO 2."
- Se eu enviar a Prova, as Matérias e o Gabarito na mesma mensagem, entregue os dois blocos em sequência.

Aqui estão os dados brutos para você formatar:

[COLE AQUI A LISTA DE MATÉRIAS]

[COLE AQUI A PROVA]

[COLE AQUI O GABARITO (SE JÁ TIVER)]`;

const EXAMPLE_CESPE = `BLOCO 1 (Copie e cole na Caixa de Texto da Prova)
\`\`\`text
[MATÉRIA: LÍNGUA PORTUGUESA]
[TEXTO BASE]
A vida humana só viceja sob algum tipo de luz, de preferência a do sol, tão óbvia quanto essencial. Somos animais diurnos, por mais que boêmios da pá virada e vampiros em geral discordem dessa afirmativa. Poucas vezes a gente pensa nisso, do mesmo jeito que devem ser poucas as pessoas que acordam se sentindo primatas, mamíferos ou terráqueos, outros rótulos que nos cabem por força da natureza das coisas.

1. A forma verbal “viceja” poderia ser substituída por germina, sem prejuízo da coerência e da correção gramatical do trecho.
2. Infere-se do primeiro parágrafo do texto que “boêmios da pá virada e vampiros” diferem biologicamente dos seres humanos em geral, os quais tendem a desempenhar a maior parte de suas atividades durante a manhã e a tarde.

[MATÉRIA: RACIOCÍNIO LÓGICO-MATEMÁTICO]
[TEXTO BASE]
Uma unidade da PRF interceptou, durante vários meses, lotes de mercadorias vendidas por uma empresa com a emissão de notas fiscais falsas. A sequência dos números das notas fiscais apreendidas, ordenados pela data de interceptação, é a seguinte: 25, 75, 50, 150, 100, 300, 200, 600, 400, 1.200, 800, ....
Tendo como referência essa situação hipotética, julgue os itens seguintes, considerando que a sequência dos números das notas fiscais apreendidas segue o padrão apresentado.

21. O padrão apresentado pela referida sequência indica que os números podem corresponder, na ordem em que aparecem, a ordenadas de pontos do gráfico de uma função afim de inclinação positiva.
22. A partir do padrão da sequência, infere-se que o 12.º termo é o número 1.600.
\`\`\`

BLOCO 2 (Copie e cole na Caixa de Gabarito)
\`\`\`text
1. E
2. C
21. C
22. X
\`\`\`
`;

const PROMPT_MULTIPLE_CHOICE = `Atue como um especialista em formatação de dados e processamento de textos de concursos públicos. Seu objetivo é receber o texto bruto de uma prova de múltipla escolha, a lista de matérias (conteúdo programático) e o respectivo gabarito, formatando-os em dois blocos distintos, padronizados e EXCLUSIVAMENTE dentro de blocos de código para que o usuário possa copiar o conteúdo com um único clique.

Siga rigorosamente as regras abaixo:

## REGRAS PARA O BLOCO 1 (PROVA)
1. Formato Copiável: Coloque TODO o resultado do Bloco 1 dentro de um bloco de código markdown (iniciado e terminado com \`\`\`text). Nenhuma parte da prova deve ficar de fora desse bloco.
2. Ignorar Cabeçalhos e Instruções: Remova textos padrões da banca (ex: "Instruções aos candidatos", "Duração da prova", datas de aplicação, nome da instituição, etc.).
3. Limpeza de Sujeira de PDF: Remova as numerações de linhas soltas no meio do texto (ex: \\t1, 4, 7, 10) e junte as quebras de linha indesejadas para formar parágrafos contínuos e coesos.
4. Identificação de Matéria: Analise o conteúdo de cada texto base e das questões vinculadas a ele. Compare esse conteúdo com a lista de "MATÉRIAS" fornecida e identifique qual é a disciplina correta. Adicione a tag \`[MATÉRIA: Nome da Matéria]\` em uma linha isolada.
5. Textos de Referência: Sempre que houver um texto, poema, figura ou situação que sirva de base para uma ou mais questões, coloque a tag \`[TEXTO BASE]\` imediatamente abaixo da tag da matéria. 
   Exemplo de estrutura:
   [MATÉRIA: LÍNGUA PORTUGUESA]
   [TEXTO BASE]
   O nome é o nosso rosto na multidão...
6. Formatação de Questões e Alternativas: 
   - MANTENHA ESTRITAMENTE a numeração original das questões. Se o bloco começar na questão 40, inicie com 40.
   - Formato do Enunciado: "[Número original da questão]. [Texto da questão]"
   - Formato das Alternativas: Liste cada alternativa em uma nova linha imediatamente abaixo do enunciado, padronizando o início com letras maiúsculas seguidas de parêntese (ex: "A) ", "B) ", "C) ", "D) ", "E) "). 
   - ATENÇÃO: Garanta que o texto de uma mesma alternativa forme um parágrafo único e contínuo, juntando quebras de linha indevidas que possam ter vindo do PDF.
7. Inicie a resposta deste bloco com o título: "BLOCO 1 (Copie e cole na Caixa de Texto da Prova)" fora do bloco de código, e em seguida abra o bloco de código com o conteúdo.

## REGRAS PARA O BLOCO 2 (GABARITO)
1. Formato Copiável: Coloque TODO o resultado do Bloco 2 dentro de um bloco de código markdown (iniciado e terminado com \`\`\`text).
2. Extraia a relação exata de "Número da Questão -> Resposta" da tabela/matriz fornecida.
3. Converta a tabela para uma lista vertical simples.
4. MANTENHA ESTRITAMENTE a numeração original para garantir o vínculo perfeito com a prova.
5. Formato exigido: [Número da Questão]. [Letra A, B, C, D, E ou X] (onde X representa questão anulada). Exemplo:
   1. A
   2. C
   3. E
   4. X
6. Inicie a resposta deste bloco com o título: "BLOCO 2 (Copie e cole na Caixa de Gabarito)" fora do bloco de código.

## DINÂMICA DE EXECUÇÃO
- Se eu enviar a Prova e as Matérias primeiro, gere o **BLOCO 1** e, ao final, escreva explicitamente: "Por favor, envie o texto do gabarito para que eu possa gerar o BLOCO 2."
- Se eu enviar a Prova, as Matérias e o Gabarito na mesma mensagem, entregue os dois blocos em sequência, ambos em seus respectivos blocos de código copiáveis.

Aqui estão os dados brutos para você formatar:

[COLE AQUI A LISTA DE MATÉRIAS]

[COLE AQUI A PROVA]

[COLE AQUI O GABARITO (SE JÁ TIVER)]`;

const EXAMPLE_MULTIPLE_CHOICE = `BLOCO 1 (Copie e cole na Caixa de Texto da Prova)
\`\`\`text
[MATÉRIA: DIREITO CONSTITUCIONAL]
[TEXTO BASE]
A Constituição Federal de 1988 é a lei fundamental e suprema do Brasil.

1. Conforme a CF/88, qual é o prazo de validade do concurso público?
A) Até 1 ano, prorrogável.
B) Até 2 anos, prorrogável uma vez, por igual período.
C) Até 3 anos.
D) Até 4 anos.
E) Indeterminado.

[MATÉRIA: LÍNGUA PORTUGUESA]
2. Marque a alternativa correta quanto à acentuação gráfica:
A) Ideia
B) Pássaro
C) Árvore
D) Todas as anteriores estão corretas
E) Nenhuma das alternativas
\`\`\`

BLOCO 2 (Copie e cole na Caixa de Gabarito)
\`\`\`text
1. B
2. D
\`\`\`
`;

export default function QuestionsImporter() {
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<"BULK" | "SINGLE">("BULK");
  const [aiPromptModal, setAiPromptModal] = useState<string | null>(null);
  const [promptModalTab, setPromptModalTab] = useState<"PROMPT" | "EXEMPLO">("PROMPT");

  // Shared State
  const [categories, setCategories] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  // Bulk State
  const [rawText, setRawText] = useState("");
  const [bulkGabarito, setBulkGabarito] = useState("");
  const [subjectInput, setSubjectInput] = useState("");
  const [questionType, setQuestionType] = useState<"MULTIPLE_CHOICE" | "RIGHT_WRONG">("MULTIPLE_CHOICE");
  const [globalExplanation, setGlobalExplanation] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [step, setStep] = useState<"INPUT" | "PREVIEW">("INPUT");

  // Single State
  const [singleQuestion, setSingleQuestion] = useState<ParsedQuestion>({
    questionText: "",
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
    let textToParse = rawText;
    let answerKey: Record<string, string> = {};

    // 1. Extrair o Gabarito
    let gabaritoText = bulkGabarito;
    const gabaritoMatch = textToParse.match(/Padr[ãa]o.*gabarito:\s*([\s\S]*)/i);
    if (gabaritoMatch) {
      gabaritoText += "\n" + gabaritoMatch[1];
      textToParse = textToParse.substring(0, gabaritoMatch.index);
    }

    if (gabaritoText) {
      const lines = gabaritoText.split('\n');
      for (const line of lines) {
        const match = line.trim().match(/^(\d+)[.)-]?\s*([a-zA-Z])/);
        if (match) {
          answerKey[match[1]] = match[2].toUpperCase();
        }
      }
    }

    // 2. Separar blocos por [MATÉRIA:] ou [TEXTO BASE]
    const blocks = textToParse.split(/(?=\[MATÉRIA:|\[TEXTO BASE\])/i);
    let currentSubject = subjectInput || "Outros";
    let currentTextoBase = "";

    for (const block of blocks) {
      let blockContent = block.trim();
      if (!blockContent) continue;

      const subjMatch = blockContent.match(/^\[MATÉRIA:\s*(.+?)\]/i);
      if (subjMatch) {
        currentSubject = subjMatch[1].trim();
        currentTextoBase = ""; // Clear base text on new subject
        blockContent = blockContent.substring(subjMatch[0].length).trim();
      }

      const baseMatch = blockContent.match(/^\[TEXTO BASE\]/i);
      if (baseMatch) {
        blockContent = blockContent.substring(baseMatch[0].length).trim();
      }

      const qSplit = blockContent.split(/(?:^|\n)(\d+[.)-]\s+)/);
      const prefixText = qSplit[0].trim();
      
      // Update base text if explicitly tagged or if there's stray text before the first question
      if (baseMatch || prefixText) {
        currentTextoBase = prefixText;
      }

      for (let j = 1; j < qSplit.length; j += 2) {
        const qDelimiter = qSplit[j];
        const qBody = qSplit[j+1];
        if (!qDelimiter || qBody === undefined) continue;

        const chunk = (qDelimiter + qBody).trim();
        if (!chunk) continue;

        const match = chunk.match(/^(\d+)[.)-]\s+([\s\S]*)/);
        if (match) {
          const qNumber = match[1];
          let qContent = match[2].trim();
          const ans = answerKey[qNumber];

          if (ans === "X") {
            continue; // Pula questões anuladas
          }

          const q: ParsedQuestion = {
            baseText: currentTextoBase,
            questionText: "",
            subject: currentSubject,
            type: questionType,
            explanation: globalExplanation
          };

          if (questionType === "RIGHT_WRONG") {
            q.questionText = qContent;
            q.correctOption = ans || "C";
            questions.push(q);
          } else {
            const parts = qContent.split(/(?:^|\n)(\s*[a-fA-F][.)-]\s+)/);
            q.questionText = parts[0].trim();

            for (let k = 1; k < parts.length; k += 2) {
              const optDelimiter = parts[k];
              const optBody = parts[k+1];
              if (!optDelimiter || optBody === undefined) continue;

              const optText = (optDelimiter + optBody).trim();
              const letterMatch = optText.match(/^([a-fA-F])[.)-]\s+([\s\S]*)/);
              if (letterMatch) {
                const letter = letterMatch[1].toUpperCase();
                const optionValue = letterMatch[2].trim();

                if (letter === "A") q.optionA = optionValue;
                if (letter === "B") q.optionB = optionValue;
                if (letter === "C") q.optionC = optionValue;
                if (letter === "D") q.optionD = optionValue;
                if (letter === "E") q.optionE = optionValue;
              }
            }
            q.correctOption = ans || "A";
            questions.push(q);
          }
        }
      }
    }

    setParsedQuestions(questions);
    setStep("PREVIEW");
  };

  const handleSaveBulk = async () => {
    if (!selectedCategory || !selectedExam) {
      showAlert({
        type: "warning",
        title: "Atenção",
        message: "Selecione um Concurso e uma Prova antes de salvar."
      });
      return;
    }

    const scopesMap = new Map<string, any>();

    parsedQuestions.forEach(q => {
      const baseText = q.baseText || "";
      if (!scopesMap.has(baseText)) {
        scopesMap.set(baseText, {
          categoryId: selectedCategory,
          examId: selectedExam,
          text: baseText,
          questions: []
        });
      }

      scopesMap.get(baseText).questions.push({
        text: q.questionText,
        subject: q.subject,
        type: q.type,
        correctOption: q.correctOption,
        explanation: q.explanation,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        optionE: q.optionE,
      });
    });

    const payload = Array.from(scopesMap.values());

    try {
      await api.post("/questions/bulk", { scopes: payload });
      showAlert({
        type: "success",
        title: "Sucesso!",
        message: "Questões em massa salvas com sucesso!"
      });
      setRawText("");
      setGlobalExplanation("");
      setParsedQuestions([]);
      setStep("INPUT");
    } catch (err) {
      showAlert({
        type: "error",
        title: "Erro",
        message: "Erro ao salvar questões."
      });
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
      showAlert({
        type: "warning",
        title: "Atenção",
        message: "Selecione um Concurso e uma Prova antes de salvar."
      });
      return;
    }

    if (!singleQuestion.questionText.trim()) {
      showAlert({
        type: "warning",
        title: "Atenção",
        message: "O enunciado é obrigatório."
      });
      return;
    }

    const payload = [{
      categoryId: selectedCategory,
      examId: selectedExam,
      text: "",
      imageUrl: singleQuestion.imageUrl,
      questions: [{
        text: singleQuestion.questionText,
        subject: singleQuestion.subject,
        type: singleQuestion.type,
        correctOption: singleQuestion.correctOption,
        explanation: singleQuestion.explanation,
        optionA: singleQuestion.optionA,
        optionB: singleQuestion.optionB,
        optionC: singleQuestion.optionC,
        optionD: singleQuestion.optionD,
        optionE: singleQuestion.optionE,
      }]
    }];

    try {
      await api.post("/questions/bulk", { scopes: payload });
      showAlert({
        type: "success",
        title: "Sucesso!",
        message: "Questão salva com sucesso!"
      });
      setSingleQuestion({
        questionText: "", subject: "", type: "MULTIPLE_CHOICE", correctOption: "A", explanation: "",
        optionA: "", optionB: "", optionC: "", optionD: "", optionE: "", imageUrl: ""
      });
    } catch (err) {
      showAlert({
        type: "error",
        title: "Erro",
        message: "Erro ao salvar a questão."
      });
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
              {exams.filter(e => e.category?.id === selectedCategory).map(e => (
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
                <div className="flex gap-2 items-center">
                  <select
                    value={questionType}
                    onChange={e => setQuestionType(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-gray-900 outline-none"
                  >
                    <option value="MULTIPLE_CHOICE">Múltipla Escolha (ABCDE)</option>
                    <option value="RIGHT_WRONG">Certo / Errado (CESPE)</option>
                  </select>
                  <button
                    onClick={() => setAiPromptModal(questionType === "RIGHT_WRONG" ? "CESPE" : "MULTIPLA_ESCOLHA")}
                    className="whitespace-nowrap bg-indigo-50 text-indigo-600 border border-indigo-200 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-100 transition-colors"
                    title="Ver Prompt IA para este formato"
                  >
                    Ver Prompt IA
                  </button>
                </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gabarito das Questões (Obrigatório)</label>
                  <textarea
                    className="w-full h-32 border border-emerald-300 bg-emerald-50 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Cole a lista do gabarito aqui (Ex: 1. C \n2. E \n3. X). Você também pode colar no final do texto da prova."
                    value={bulkGabarito}
                    onChange={e => setBulkGabarito(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Explicação/Comentário Padrão (Opcional)</label>
                  <textarea
                    className="w-full h-24 border border-gray-300 rounded-lg p-4 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                    placeholder="Você pode colar comentários aqui. Este texto será salvo como a 'explicação' de todas as questões."
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
                      {q.baseText && (
                        <div className="mb-4 bg-white p-3 border border-gray-200 rounded text-sm text-gray-600">
                          <span className="font-bold block mb-1">Texto Base:</span>
                          {q.baseText}
                        </div>
                      )}
                      <div className="font-bold text-sm text-indigo-600 mb-2">{q.subject}</div>
                      <p className="text-gray-900 font-medium whitespace-pre-wrap mb-4">{q.questionText}</p>

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
                  onChange={e => setSingleQuestion({
                    ...singleQuestion,
                    type: e.target.value as any,
                    correctOption: e.target.value === "RIGHT_WRONG" ? "C" : "A"
                  })}
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
                  onChange={e => setSingleQuestion({ ...singleQuestion, subject: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enunciado (Obrigatório)</label>
              <textarea
                className="w-full h-32 border border-gray-300 rounded-lg p-4 text-sm focus:ring-2 focus:ring-gray-900 outline-none resize-y"
                value={singleQuestion.questionText}
                onChange={e => setSingleQuestion({ ...singleQuestion, questionText: e.target.value })}
              />
            </div>

            {/* Image Upload */}
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center relative">
              {singleQuestion.imageUrl ? (
                <div className="relative w-full max-w-md">
                  <button
                    onClick={() => setSingleQuestion({ ...singleQuestion, imageUrl: "" })}
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
                      value={singleQuestion[`option${opt}` as keyof typeof singleQuestion] as string}
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
                    onChange={e => setSingleQuestion({ ...singleQuestion, correctOption: e.target.value })}
                    className="w-full border border-emerald-300 bg-emerald-50 text-emerald-900 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                  >
                    {["A", "B", "C", "D", "E"].map(opt => <option key={opt} value={opt}>Alternativa {opt}</option>)}
                  </select>
                ) : (
                  <select
                    value={singleQuestion.correctOption}
                    onChange={e => setSingleQuestion({ ...singleQuestion, correctOption: e.target.value })}
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
                  onChange={e => setSingleQuestion({ ...singleQuestion, explanation: e.target.value })}
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

      {/* Modal Prompt IA */}
      {aiPromptModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in duration-300">
            <div className="flex flex-col border-b border-gray-100">
              <div className="flex justify-between items-center p-6 pb-2">
                <h2 className="text-xl font-bold text-gray-900">
                  Prompt para IA ({aiPromptModal === "CESPE" ? "Certo / Errado" : "Múltipla Escolha"})
                </h2>
                <button onClick={() => setAiPromptModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="px-6 flex gap-4">
                <button
                  onClick={() => setPromptModalTab("PROMPT")}
                  className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${promptModalTab === "PROMPT" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                  Prompt de Instrução
                </button>
                <button
                  onClick={() => setPromptModalTab("EXEMPLO")}
                  className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${promptModalTab === "EXEMPLO" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                  Exemplo de Retorno
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              {promptModalTab === "PROMPT" ? (
                <>
                  <p className="text-gray-600 mb-4">
                    Copie o texto abaixo e cole em uma IA como o ChatGPT ou Claude para formatar a prova e o gabarito automaticamente de acordo com as regras deste sistema.
                  </p>

                  <div className="relative">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiPromptModal === "CESPE" ? PROMPT_CESPE : PROMPT_MULTIPLE_CHOICE);
                        showAlert({ type: "success", title: "Copiado!", message: "Prompt copiado para a área de transferência." });
                      }}
                      className="absolute top-4 right-4 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      Copiar Prompt
                    </button>
                    <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto text-sm whitespace-pre-wrap font-mono">
                      {aiPromptModal === "CESPE" ? PROMPT_CESPE : PROMPT_MULTIPLE_CHOICE}
                    </pre>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Este é um exemplo de como a IA deve retornar o conteúdo após processar o seu prompt. Observe a estrutura de Blocos e Tags:
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto text-sm whitespace-pre-wrap font-mono">
                    {aiPromptModal === "CESPE" ? EXAMPLE_CESPE : EXAMPLE_MULTIPLE_CHOICE}
                  </pre>
                </>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setAiPromptModal(null)}
                className="bg-gray-900 text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-black transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
