import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileQuestion, Pencil, Trash2, Save } from "lucide-react";
import { api } from "../services/api";
import QuestionEditModal from "../components/modals/QuestionEditModal";

export default function ExamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", role: "", institution: "", year: "" });
  const [saving, setSaving] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  const loadData = async () => {
    try {
      const res = await api.get(`/categories/exams/${id}`);
      const data = res.data.data || res.data;
      setExam(data);
      setFormData({
        name: data.name || "",
        role: data.role || "",
        institution: data.institution || "",
        year: data.year || ""
      });
    } catch (err) {
      console.error("Erro", err);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/categories/exams/${id}`, formData);
      alert("Dados da prova atualizados!");
      loadData();
    } catch (err) {
      alert("Erro ao atualizar prova");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (window.confirm("Deseja realmente excluir esta questão?")) {
      try {
        await api.delete(`/questions/${qId}`);
        loadData();
      } catch (err) {
        alert("Erro ao deletar questão.");
      }
    }
  };

  const openEditModal = (question: any) => {
    setEditingQuestion(question);
    setIsEditModalOpen(true);
  };

  if (!exam) return <div className="p-8 text-center text-gray-500">Carregando prova...</div>;

  return (
    <div className="space-y-8">
      <button 
        onClick={() => navigate("/concursos")}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Concursos
      </button>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Detalhes da Prova</h2>
        <form onSubmit={handleSaveExam} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Prova</label>
              <input
                type="text" required value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
              <input
                type="text" value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banca</label>
              <input
                type="text" required value={formData.institution}
                onChange={e => setFormData({...formData, institution: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
              <input
                type="number" required value={formData.year}
                onChange={e => setFormData({...formData, year: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button 
              type="submit" disabled={saving}
              className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Questões ({exam.questions?.length || 0})</h2>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-1/2">Enunciado</th>
                <th className="px-6 py-4">Assunto</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {exam.questions?.map((q: any) => (
                <tr key={q.id} className="hover:bg-gray-50 group">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <FileQuestion className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="text-gray-900 line-clamp-3 font-medium">
                        {q.text}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-semibold text-xs">
                      {q.subject || "Outros"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {q.type === "RIGHT_WRONG" ? (
                      <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md font-semibold text-xs">CERTO/ERRADO</span>
                    ) : (
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-semibold text-xs">MÚLTIPLA ESCOLHA</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(q)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {(!exam.questions || exam.questions.length === 0) && (
            <div className="p-8 text-center text-gray-500">Nenhuma questão nesta prova.</div>
          )}
        </div>
      </div>

      <QuestionEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSuccess={loadData}
        initialData={editingQuestion}
      />
    </div>
  );
}
