import { useEffect, useState } from "react";
import { Folder, FileText, Plus } from "lucide-react";
import { api } from "../services/api";

export default function ContestsManagement() {
  const [categories, setCategories] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  // Modals for creation could be added here later. For now we just list.

  useEffect(() => {
    async function loadData() {
      try {
        const catRes = await api.get("/categories");
        const examRes = await api.get("/categories/exams");
        setCategories(catRes.data.data || catRes.data);
        setExams(examRes.data.data || examRes.data);
      } catch (err) {
        console.error("Erro", err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Categories */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Concursos (Categorias)</h2>
            <p className="text-sm text-gray-500">Categorias macro de provas.</p>
          </div>
          <button className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Concurso
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map(c => (
            <div key={c.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg">
                <Folder className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{c.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Exams */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Provas Específicas</h2>
            <p className="text-sm text-gray-500">Provas vinculadas a concursos.</p>
          </div>
          <button className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nova Prova
          </button>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Nome da Prova</th>
                <th className="px-6 py-4">Concurso Pai</th>
                <th className="px-6 py-4">Banca</th>
                <th className="px-6 py-4">Ano</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {exams.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-3">
                    <FileText className="w-4 h-4 text-blue-500" />
                    {e.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-semibold text-xs">
                      {e.category?.name || "Sem categoria"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{e.institution}</td>
                  <td className="px-6 py-4 text-gray-600">{e.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {exams.length === 0 && (
            <div className="p-8 text-center text-gray-500">Nenhuma prova encontrada.</div>
          )}
        </div>
      </section>
    </div>
  );
}
