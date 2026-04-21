import { ImageIcon } from "./Icons";
import { VALIDATION_LIMITS } from "../validation";

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AttachmentUploader({ files, setFiles, error }) {
  async function handleChange(event) {
    const selectedFiles = Array.from(event.target.files || []);
    const nextSelection = selectedFiles.slice(0, VALIDATION_LIMITS.ticket.maxAttachments - files.length);
    const prepared = await Promise.all(
      nextSelection.map(async (file) => ({
        id: `${file.name}-${Date.now()}`,
        name: file.name,
        file,
        preview: await readAsDataUrl(file),
      }))
    );
    setFiles([...files, ...prepared].slice(0, 3));
    event.target.value = "";
  }

  return (
    <div className="m3-form-field">
      <label htmlFor="attachments">Images</label>
      <div className="m3-upload">
        <div className="m3-upload__dropzone">
          <ImageIcon />
          <p>Upload up to 3 images for clearer diagnosis. Each file must be 5 MB or smaller.</p>
          <input id="attachments" type="file" accept="image/*" multiple onChange={handleChange} />
        </div>
        {files.length ? (
          <div className="m3-attachment-grid">
            {files.map((file) => (
              <div key={file.id} className="m3-attachment-card">
                <img src={file.preview || file.url} alt={file.name} />
                <div className="m3-attachment-card__footer">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    className="m3-link-button"
                    onClick={() => setFiles(files.filter((item) => item.id !== file.id))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {error ? <span className="m3-field-error">{error}</span> : null}
      </div>
    </div>
  );
}
