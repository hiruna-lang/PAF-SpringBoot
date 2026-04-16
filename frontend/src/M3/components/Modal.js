import { CloseIcon } from "./Icons";

export default function Modal({ open, title, subtitle, children, onClose, footer }) {
  if (!open) {
    return null;
  }

  return (
    <div className="m3-modal-backdrop" onClick={onClose}>
      <div className="m3-modal" onClick={(event) => event.stopPropagation()}>
        <div className="m3-modal__header">
          <div>
            <h3>{title}</h3>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button type="button" className="m3-icon-button" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="m3-modal__body">{children}</div>
        {footer ? <div className="m3-modal__footer">{footer}</div> : null}
      </div>
    </div>
  );
}
