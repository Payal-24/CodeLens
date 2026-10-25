import React from "react";

function SuccessModal({ message, show }) {
    if (!show) return null;

    return (
        <div className="success-modal-overlay">
            <div className="success-modal">
                <div className="success-checkmark">
                    <div className="checkmark-circle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                </div>
                <h2>{message}</h2>
            </div>
        </div>
    );
}

export default SuccessModal;
