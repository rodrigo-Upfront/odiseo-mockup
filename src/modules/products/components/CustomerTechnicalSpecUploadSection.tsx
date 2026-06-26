import { Upload, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getDocumentsByProject, saveDocument, deleteDocument, generateDocumentId } from "../../../shared/data/projectDocumentStorage";

interface CustomerTechnicalSpecUploadSectionProps {
  projectCode: string;
  error?: string;
  required?: boolean;
  onFilesChange: (fileNames: string[]) => void;
  embedded?: boolean;
}

export default function CustomerTechnicalSpecUploadSection({
  projectCode,
  error,
  required = false,
  onFilesChange,
  embedded = false,
}: CustomerTechnicalSpecUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string>("");

  const acceptedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".pdf", ".doc", ".docx", ".xls", ".xlsx"];

  useEffect(() => {
    const files = getDocumentsByProject(projectCode);
    const fileNames = files.map((f) => f.fileName);
    setUploadedFiles(fileNames);
    onFilesChange(fileNames);
  }, [projectCode, onFilesChange]);

  const getFileExtension = (fileName: string): string => {
    const match = fileName.match(/\.[^/.]+$/);
    return match ? match[0].toLowerCase() : "";
  };

  const isValidFileExtension = (fileName: string): boolean => {
    const extension = getFileExtension(fileName);
    return acceptedExtensions.some((ext) => ext.toLowerCase() === extension.toLowerCase());
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadError("");
    const newFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name;

      if (!isValidFileExtension(fileName)) {
        setUploadError(
          `El archivo "${fileName}" no tiene una extensión válida. Extensiones permitidas: ${acceptedExtensions.join(", ")}`
        );
        continue;
      }

      try {
        const base64Data = await fileToBase64(file);
        const fileExtension = getFileExtension(fileName);

        saveDocument({
          id: generateDocumentId(),
          projectCode,
          fileName,
          fileType: file.type,
          fileExtension,
          fileSize: file.size,
          base64Data,
          uploadedAt: new Date().toISOString(),
        });

        newFiles.push(fileName);
      } catch (err) {
        console.error("Error uploading file:", err);
        setUploadError(`Error al cargar el archivo "${fileName}"`);
      }
    }

    if (newFiles.length > 0) {
      const allFiles = [...uploadedFiles, ...newFiles];
      setUploadedFiles(allFiles);
      onFilesChange(allFiles);
    }
  };

  const handleRemoveFile = (fileName: string) => {
    const documents = getDocumentsByProject(projectCode);
    const doc = documents.find((d) => d.fileName === fileName);

    if (doc) {
      deleteDocument(doc.id);
    }

    const updatedFiles = uploadedFiles.filter((f) => f !== fileName);
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const containerClass = embedded
    ? "rounded-lg border border-slate-200 bg-slate-50 p-4"
    : "rounded-xl border border-slate-200 bg-white p-4 shadow-sm";

  return (
    <div className={containerClass}>
      {!embedded && (
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          Carga de especificación técnica del cliente
        </h3>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          error || uploadError
            ? "border-red-300 bg-red-50"
            : isDragging
              ? "border-brand-primary bg-brand-primary/5"
              : "border-slate-200 bg-slate-50 hover:border-slate-300"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload
            size={24}
            className={`${error || uploadError ? "text-red-500" : isDragging ? "text-brand-primary" : "text-slate-400"}`}
          />
          <p className="text-sm font-semibold text-slate-900">
            Arrastra aquí tus documentos o haz clic para seleccionar archivos
          </p>
          {acceptedExtensions.length > 0 && (
            <p className="text-xs text-slate-500">
              Extensiones permitidas: {acceptedExtensions.join(", ")}
            </p>
          )}
        </div>

        <input
          type="file"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          id={`file-input-spec-${projectCode}`}
          accept={acceptedExtensions.join(",")}
        />

        <label
          htmlFor={`file-input-spec-${projectCode}`}
          className="mt-3 inline-block cursor-pointer px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Seleccionar archivos
        </label>
      </div>

      {(error || uploadError) && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs font-medium text-red-700">
            {error || uploadError}
          </p>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-slate-600">
            Archivos cargados ({uploadedFiles.length}):
          </p>
          <ul className="space-y-1">
            {uploadedFiles.map((fileName) => (
              <li
                key={fileName}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 text-sm"
              >
                <span className="text-slate-700 truncate">{fileName}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(fileName)}
                  className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
                  title="Eliminar archivo"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {required && uploadedFiles.length === 0 && !error && (
        <p className="mt-2 text-xs text-amber-700">
          Este campo es obligatorio. Debe cargar al menos un archivo.
        </p>
      )}
    </div>
  );
}
