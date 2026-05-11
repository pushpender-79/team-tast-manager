import { createPortal } from 'react-dom'

export default function Modal({ children, onClose }) {
  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {children}
    </div>,
    document.body
  )
}