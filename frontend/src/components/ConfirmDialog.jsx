import { useEffect, useRef } from 'react'
import './ConfirmDialog.css'

function ConfirmDialog({ open, title, message, confirmLabel, isWorking, error, onConfirm, onCancel }) {
  const dialogRef = useRef(null)

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
      className="confirm-dialog"
      aria-labelledby="confirm-dialog-title"
      onCancel={(event) => {
        event.preventDefault()
        if (!isWorking) onCancel()
      }}
    >
      <h2 id="confirm-dialog-title">{title}</h2>
      <p>{message}</p>
      {error && <p className="confirm-dialog-error" role="alert">{error}</p>}
      <div className="confirm-dialog-actions">
        <button className="secondary-button" type="button" onClick={onCancel} disabled={isWorking} autoFocus>
          취소하기
        </button>
        <button className="danger-button" type="button" onClick={onConfirm} disabled={isWorking}>
          {isWorking ? '삭제 중이에요.' : confirmLabel}
        </button>
      </div>
    </dialog>
  )
}

export default ConfirmDialog
