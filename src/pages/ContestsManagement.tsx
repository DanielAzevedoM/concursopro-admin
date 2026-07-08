import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, FileText, Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "../services/api";
import CategoryModal from "../components/modals/CategoryModal";
import ExamModal from "../components/modals/ExamModal";

export default function ContestsManagement() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingExam, setEditingExam] = useState<any>(null);

  const loadData = async () => {
    try {
      const catRes = await api.get("/categories");
      const examRes = await api.get("/categories/exams");
      setCategories(catRes.data.data || catRes.data);
      setExams(examRes.data.data || examRes.data);
    } catch (err) {
      console.error("Erro", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("ATENÇÃO: Excluir este concurso apagará TODAS as provas e questões vinculadas a ele. Deseja continuar?")) {
      try {
        await api.delete(`/categories/${id}`);
        loadData();
      } catch (err) {
        console.error("Erro ao deletar categoria", err);
        alert("Erro ao deletar categoria.");
      }
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (window.confirm("ATENÇÃO: Excluir esta prova apagará TODAS as questões vinculadas a ela. Deseja continuar?")) {
      try {
        await api.delete(`/categories/exams/${id}`);
        loadData();
      } catch (err) {
        console.error("Erro ao deletar prova", err);
        alert("Erro ao deletar prova.");
      }
    }
  };

  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: any) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const openNewExamModal = () => {
    setEditingExam(null);
    setIsExamModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Categories */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Concursos (Categorias)</h2>
            <p className="text-sm text-gray-500">Categorias macro de provas.</p>
          </div>
          <button
            onClick={openNewCategoryModal}
            className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Novo Concurso
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map(c => (
            <div key={c.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg flex-shrink-0">
                  <Folder className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 line-clamp-1">{c.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.description}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 border-l pl-3 border-gray-100">
                <button
                  onClick={() => openEditCategoryModal(c)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(c.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-3 p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">Nenhum concurso encontrado.</div>
          )}
        </div>
      </section>

      {/* Exams */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Provas Específicas</h2>
            <p className="text-sm text-gray-500">Provas vinculadas a concursos.</p>
          </div>
          <button
            onClick={openNewExamModal}
            className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nova Prova
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Nome da Prova</th>
                <th className="px-6 py-4">Cargo</th>
                <th className="px-6 py-4">Concurso Pai</th>
                <th className="px-6 py-4">Banca</th>
                <th className="px-6 py-4">Ano</th>
                <th className="px-6 py-4">Questões</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {exams.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-3">
                    <FileText className="w-4 h-4 text-blue-500" />
                    {e.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {e.role || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-semibold text-xs">
                      {e.category?.name || "Sem categoria"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{e.institution}</td>
                  <td className="px-6 py-4 text-gray-600">{e.year}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{e.questionsCount || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/concursos/provas/${e.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar Prova e Questões"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExam(e.id)}
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
          {exams.length === 0 && (
            <div className="p-8 text-center text-gray-500">Nenhuma prova encontrada.</div>
          )}
        </div>
      </section>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={loadData}
        initialData={editingCategory}
      />

      <ExamModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        onSuccess={loadData}
        categories={categories}
        initialData={editingExam}
      />
    </div>
  );
}
