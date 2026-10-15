import { useEffect, useId, useRef } from 'react'
import './ConfirmDialog.css'

function ConfirmDialog({ open, title, message, confirmLabel, isWorking, error, onConfirm, onCancel }) {
  const dialogRef = useRef(null)
  // 한 화면에 확인 창이 여러 개 있어도 제목 id가 겹치지 않게 한다.
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
      className="confirm-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        if (!isWorking) onCancel()
      }}
    >
      <h2 id={titleId}>{title}</h2>
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
