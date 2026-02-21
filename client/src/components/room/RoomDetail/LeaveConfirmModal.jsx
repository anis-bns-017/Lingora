// components/room/RoomDetail/LeaveConfirmModal.jsx
import React from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

const LeaveConfirmModal = ({ isOpen, onClose, onConfirm, roomName }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leave Room">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Leave "{roomName}"?</h3>
        <p className="text-gray-400 text-sm mb-6">
          Are you sure you want to leave this room? You can always come back later.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1">
            Leave Room
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LeaveConfirmModal;