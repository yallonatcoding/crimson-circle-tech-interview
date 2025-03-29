
const DialogCatDetails = ({children, onClose}) => (
  <dialog
    className="fixed top-0 right-0 bottom-0 h-screen w-full bg-[rgba(0,0,0,0.6)] backdrop-blur-lg flex items-center justify-center px-2"
    onClick={onClose}
  >
    <section
      className="relative overflow-auto max-w-lg max-h-lvh bg-gray-100 flex"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className="px-3 py-1.5 absolute top-0 right-0 backdrop-blur cursor-pointer"
        onClick={onClose}
      >
        ✕
      </button>

      {children}
    </section>
  </dialog>
)

export default DialogCatDetails