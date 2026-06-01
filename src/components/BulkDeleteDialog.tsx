import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

interface BulkDeleteDialogProps {
  open: boolean
  count: number
  onConfirm: () => Promise<void>
  onCancel: () => void
  loading: boolean
}

export function BulkDeleteDialog({
  open,
  count,
  onConfirm,
  onCancel,
  loading,
}: BulkDeleteDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title="Delete Links">
      <p className="text-sm text-gray-600 mb-6">
        Are you sure you want to delete{' '}
        <span className="font-semibold text-gray-900">{count}</span>{' '}
        {count === 1 ? 'link' : 'links'}? This action cannot be undone and all associated analytics data will be lost.
      </p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          Delete {count === 1 ? 'Link' : 'Links'}
        </Button>
      </div>
    </Modal>
  )
}
