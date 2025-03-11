import ReactDOM from 'react-dom'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function useModal() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const modalRoot = document.getElementById('modal-root')
    setModalContainer(modalRoot)
  }, [])

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const renderModal = (children: React.ReactNode) => {
    if (!modalContainer) return null
    return ReactDOM.createPortal(
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            key={modalContainer.id}
            style={{
              position: 'fixed',
              top: '0',
              left: '0',
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'all 0.2s',
              zIndex: '1000'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>,
      modalContainer
    )
  }

  return { isModalOpen, openModal, closeModal, renderModal }
}
