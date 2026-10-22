import React, { useState } from 'react';
import { 
  FolderOpen, 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  Download, 
  Upload, 
  Trash2, 
  Tag, 
  Cloud, 
  Sparkles, 
  X,
  Lock,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { Patient, DocumentItem } from '../../types';
import { useToast } from '../../context/ToastContext';

interface DocumentCenterModuleProps {
  patients: Patient[];
}

export const DocumentCenterModule: React.FC<DocumentCenterModuleProps> = ({ patients }) => {
  const { showSuccess, showInfo } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedTag, setSelectedTag] = useState<string>('todos');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // New upload form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DocumentItem['category']>('informe');
  const [newPatientId, setNewPatientId] = useState<string>(patients[0]?.id || '');
  const [newTags, setNewTags] = useState('clínico, evaluación');

  // Initial Document repository with clinical & pastoral documents
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: 'doc-1',
      title: 'Consentimiento Informado General & Protección de Datos',
      category: 'consentimiento',
      fileName: 'Consentimiento_Firmado_EXP-042.pdf',
      fileUrl: '#',
      fileSize: '1.2 MB',
      patientId: patients[0]?.id,
      uploadedBy: 'Lic. David Morales',
      uploadedAt: '2026-10-15'
    },
    {
      id: 'doc-2',
      title: 'Informe Neuropsiquiátrico & Esquema Farmacológico',
      category: 'informe',
      fileName: 'Informe_Psiquiatria_Clinica_Gomez.pdf',
      fileUrl: '#',
      fileSize: '2.4 MB',
      patientId: patients[0]?.id,
      uploadedBy: 'Dr. Alejandro Rivas (Psiquiatra)',
      uploadedAt: '2026-10-18'
    },
    {
      id: 'doc-3',
      title: 'Perfil Psicométrico PHQ-9 & GAD-7 Basal',
      category: 'escala',
      fileName: 'Bateria_Psicometrica_Octubre.pdf',
      fileUrl: '#',
      fileSize: '890 KB',
      patientId: patients[1]?.id || patients[0]?.id,
      uploadedBy: 'Sistema Automatizado',
      uploadedAt: '2026-10-19'
    },
    {
      id: 'doc-4',
      title: 'Estudio de Perfil Tiroideo y Hemograma Completo',
      category: 'estudio',
      fileName: 'Laboratorio_Clinico_Metabolismo.pdf',
      fileUrl: '#',
      fileSize: '3.1 MB',
      patientId: patients[0]?.id,
      uploadedBy: 'Laboratorio Central',
      uploadedAt: '2026-10-12'
    },
    {
      id: 'doc-5',
      title: 'Audio Transcrito & Nota SOAP Dictada Sesión #4',
      category: 'audio',
      fileName: 'Dictado_Clinico_Sesion4.mp3',
      fileUrl: '#',
      fileSize: '4.8 MB',
      patientId: patients[0]?.id,
      uploadedBy: 'PastoralMente Voice Engine',
      uploadedAt: '2026-10-21'
    }
  ]);

  const allTags = ['todos', 'clínico', 'psiquiatría', 'laboratorio', 'urgente', 'consentimiento', 'audio'];

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'todos' || doc.category === selectedCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const doc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      fileName: `${newTitle.replace(/\s+/g, '_')}.pdf`,
      fileUrl: '#',
      fileSize: '1.5 MB',
      patientId: newPatientId,
      uploadedBy: 'Terapeuta Activo',
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    setDocuments((prev) => [doc, ...prev]);
    setIsUploadOpen(false);
    setNewTitle('');
    showSuccess('Documento Subido', `Archivo "${doc.title}" archivado y sincronizado con Firebase Storage.`);
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    showInfo('Documento Eliminado', 'El archivo ha sido retirado del repositorio clínico.');
  };

  const getCategoryColor = (cat: DocumentItem['category']) => {
    switch (cat) {
      case 'consentimiento':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'informe':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'escala':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'estudio':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'audio':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-900/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Centro Documental Inteligente</h2>
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-full flex items-center space-x-1">
                <Cloud className="w-3 h-3" />
                <span>Firebase Storage Sincronizado</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Gestión centralizada de expedientes escaneados, consentimientos, informes médicos y audios clínicos.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-blue-600/20 transition"
        >
          <Upload className="w-4 h-4" />
          <span>Subir Nuevo Documento</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'consentimiento', label: 'Consentimientos' },
            { id: 'informe', label: 'Informes' },
            { id: 'escala', label: 'Escalas' },
            { id: 'estudio', label: 'Laboratorios' },
            { id: 'audio', label: 'Audios' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, archivo o profesional..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const patientOwner = patients.find((p) => p.id === doc.patientId);
          return (
            <div
              key={doc.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-lg transition"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getCategoryColor(doc.category)}`}>
                    {doc.category}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{doc.fileSize}</span>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-400 font-mono truncate">
                  {doc.fileName}
                </p>

                {patientOwner && (
                  <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500">Expediente:</span> <strong className="text-slate-300">{patientOwner.fullName}</strong> ({patientOwner.code})
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500">{doc.uploadedAt}</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                    title="Vista Previa"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      showInfo('Descargando Documento', `Descargando ${doc.fileName}`);
                    }}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <span>Cargar Documento al Repositorio</span>
              </h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Título del Documento *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Evaluación Psicológica de Egreso Clínico"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Categoría</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="informe">Informe Clínico</option>
                    <option value="consentimiento">Consentimiento</option>
                    <option value="escala">Escala Psicométrica</option>
                    <option value="estudio">Laboratorio / Estudio</option>
                    <option value="audio">Audio de Sesión</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Asignar a Consultante</label>
                  <select
                    value={newPatientId}
                    onChange={(e) => setNewPatientId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 bg-slate-950/60 text-center space-y-2">
                <Cloud className="w-8 h-8 text-blue-400 mx-auto" />
                <p className="text-slate-300 font-semibold">Arrastra un archivo aquí o haz clic para examinar</p>
                <span className="text-[10px] text-slate-500 block">PDF, Word, JPG, MP3 (Cifrado AES-256 en Firebase Storage)</span>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md shadow-blue-600/20"
                >
                  Subir y Sincronizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">{previewDoc.title}</h3>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px] text-slate-300">
                <p><strong>Archivo:</strong> {previewDoc.fileName}</p>
                <p><strong>Tamaño:</strong> {previewDoc.fileSize}</p>
                <p><strong>Subido por:</strong> {previewDoc.uploadedBy}</p>
                <p><strong>Fecha:</strong> {previewDoc.uploadedAt}</p>
                <p><strong>Estado:</strong> Encriptado &bull; Almacenado de forma segura en Firebase Storage</p>
              </div>

              {/* Mock document preview content */}
              <div className="p-6 bg-white text-slate-900 rounded-xl shadow-inner space-y-3 font-serif">
                <div className="border-b pb-2 text-center">
                  <h4 className="font-bold text-sm tracking-wide">PASTORALMENTE AI &bull; CENTRO CLÍNICO</h4>
                  <p className="text-[10px] text-slate-600">CONFIDENCIALIDAD PROFESIONAL REGISTRADA</p>
                </div>
                <h5 className="font-bold text-xs">{previewDoc.title}</h5>
                <p className="text-[11px] leading-relaxed text-slate-700">
                  El presente documento certifica la documentación clínica archivada conforme a los más altos estándares de salud mental y consejería pastoral cristiana. El contenido se encuentra auditado y preservado en la infraestructura descentralizada y en la nube.
                </p>
                <div className="pt-4 border-t flex justify-between text-[10px] text-slate-500 font-sans">
                  <span>Código de Verificación: #PM-{previewDoc.id.toUpperCase()}</span>
                  <span>Firma Digital Válida</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end space-x-2">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
