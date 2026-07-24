import { useState, useEffect } from "react";
import { X, UploadCloud } from "lucide-react";
import { ApiService } from "../../services/ApiService";
import { useAlert } from "../../contexts/AlertContext";

interface QuestionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export default function QuestionEditModal({ isOpen, onClose, onSuccess, initialData }: QuestionEditModalProps) {
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({
    baseText: "",
    text: "",
    subject: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    optionE: "",
    correctOption: "A",
    explanation: "",
    imageUrl: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        baseText: initialData.scope?.text || "",
        text: initialData.text || "",
        subject: initialData.subject || "",
        optionA: initialData.optionA || "",
        optionB: initialData.optionB || "",
        optionC: initialData.optionC || "",
        optionD: initialData.optionD || "",
        optionE: initialData.optionE || "",
        correctOption: initialData.correctOption || "A",
        explanation: initialData.explanation || "",
        imageUrl: initialData.imageUrl || ""
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen || !initialData) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ApiService.put(`/questions/${initialData.id}`, formData);
      onSuccess();
      onClose();
      showAlert({
        type: "success",
        title: "Sucesso!",
        message: "Questão atualizada com sucesso!"
      });
    } catch (err) {
      console.error("Erro ao salvar questão", err);
      showAlert({
        type: "error",
        title: "Erro",
        message: "Erro ao salvar questão."
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/90 backdrop-blur-md z-10">
          <h2 className="text-xl font-bold text-gray-900">Editar Questão</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Concurso Pai</label>
              <div className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed">
                {initialData.category?.name || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prova / Exame</label>
              <div className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed">
                {initialData.exam?.name || "N/A"}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assunto (Tag)</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Texto Base (Para a questão atual e relacionadas)</label>
            <textarea
              rows={4}
              value={formData.baseText}
              onChange={(e) => setFormData({ ...formData, baseText: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
              placeholder="Ex: Texto motivador, situação hipotética, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enunciado / Texto</label>
            <textarea
              required
              rows={4}
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
            />
          </div>

          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center relative">
            {formData.imageUrl ? (
              <div className="relative w-full max-w-md">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, imageUrl: ""})}
                  className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>
                <img src={formData.imageUrl} alt="Preview" className="w-full rounded-lg border border-gray-200 shadow-sm" />
              </div>
            ) : (
              <div className="text-center">
                <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">Clique para adicionar/alterar imagem da questão</p>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>

          {initialData.type === "MULTIPLE_CHOICE" ? (
            <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">Alternativas</h3>
              {["A", "B", "C", "D", "E"].map((opt) => (
                <div key={opt} className="flex items-center gap-3">
                  <span className="font-bold text-gray-700 w-6">{opt})</span>
                  <input
                    type="text"
                    value={formData[`option${opt}` as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [`option${opt}`]: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-orange-50 text-orange-800 p-4 rounded-xl border border-orange-100 flex flex-col gap-2">
              <h3 className="font-bold">Formato: Certo ou Errado (CESPE)</h3>
              <p className="text-sm">Esta questão não possui alternativas de texto, apenas exige que o candidato julgue o enunciado acima como Certo ou Errado.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-emerald-600 mb-1">Gabarito (Opção Correta)</label>
              {initialData.type === "MULTIPLE_CHOICE" ? (
                <select
                  value={formData.correctOption}
                  onChange={(e) => setFormData({ ...formData, correctOption: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-300 bg-emerald-50 text-emerald-900 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                >
                  {["A", "B", "C", "D", "E"].map(opt => (
                    <option key={opt} value={opt}>Alternativa {opt}</option>
                  ))}
                </select>
              ) : (
                <select
                  value={formData.correctOption}
                  onChange={(e) => setFormData({ ...formData, correctOption: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-300 bg-emerald-50 text-emerald-900 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                >
                  <option value="C">CERTO</option>
                  <option value="E">ERRADO</option>
                </select>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Explicação (Opcional)</label>
              <textarea
                rows={2}
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all resize-y"
                placeholder="Por que essa é a resposta correta?"
              />
            </div>
          </div>

          <div className="pt-6 pb-2 border-t flex justify-end gap-3 sticky bottom-0 bg-white z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center"
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
