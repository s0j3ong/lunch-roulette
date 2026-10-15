import { useEffect, useId, useRef } from 'react'
import './Modal.css'

// 식당 폼, 식당 상세, 음식 종류 룰렛을 띄우는 팝업. Esc나 "닫기"로 닫는다.
function Modal({ open, title, onClose, closeDisabled = false, size = 'medium', children }) {
  const dialogRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={`modal modal-${size}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        if (!closeDisabled) onClose()
      }}
    >
      <div className="modal-header">
        <h2 id={titleId}>{title}</h2>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          disabled={closeDisabled}
          aria-label={`${title} 창 닫기`}
        >
          × 닫기
        </button>
      </div>
      {open && <div className="modal-body">{children}</div>}
    </dialog>
  )
}

export default Modal
