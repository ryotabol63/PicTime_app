import React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.3)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "#fff", borderRadius: 8, padding: 24, minWidth: 300, boxShadow: "0 2px 8px #888" }}>
        {children}
        <div style={{ textAlign: "right", marginTop: 16 }}>
          <button onClick={onClose} style={{ background: "#a5d6a7", color: "#fff", border: "none", borderRadius: 6, padding: "6px 16px" }}>閉じる</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
