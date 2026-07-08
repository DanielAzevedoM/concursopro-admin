import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ApiService } from "../../services/ApiService";
import { useAlert } from "../../contexts/AlertContext";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export default function CategoryModal({ isOpen, onClose, onSuccess, initialData }: CategoryModalProps) {
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({ name: initialData.name || "", description: initialData.description || "" });
    } else {
      setFormData({ name: "", description: "" });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (initialData) {
        await ApiService.put(`/categories/${initialData.id}`, formData);
      } else {
        await ApiService.post("/categories", formData);
      }
      setFormData({ name: "", description: "" });
      onSuccess();
      onClose();
      showAlert({
        type: "success",
        title: "Sucesso!",
        message: "Concurso salvo com sucesso!"
      });
    } catch (err) {
      console.error("Erro ao salvar concurso", err);
      showAlert({
        type: "error",
        title: "Erro",
        message: "Erro ao salvar concurso."
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">{initialData ? "Editar Concurso" : "Novo Concurso"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Concurso</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
              placeholder="Ex: SEFAZ SP"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all resize-none"
              placeholder="Ex: Concurso público para Secretaria da Fazenda..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-gray-900 hover:bg-black text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center"
            >
              {saving ? "Salvando..." : (initialData ? "Salvar Alterações" : "Criar Concurso")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
