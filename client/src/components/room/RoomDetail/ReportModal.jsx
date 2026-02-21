import React, { useState } from 'react';
import { FaFlag } from 'react-icons/fa';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Avatar from '../../ui/Avatar';

const reportReasons = [
  'Inappropriate behavior',
  'Harassment or bullying',
  'Spam or advertising',
  'Offensive language',
  'Sharing inappropriate content',
  'Other'
];

const ReportModal = ({ isOpen, onClose, onSubmit, user }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [step, setStep] = useState(1); // 1: select reason, 2: add details

  const handleNext = () => {
    if (selectedReason) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    onSubmit(reason);
    setSelectedReason('');
    setCustomReason('');
    setStep(1);
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    setStep(1);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Report User">
      <div className="space-y-6">
        {/* User Info */}
        {user && (
          <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
            <Avatar src={user.avatar} alt={user.username} size="md" />
            <div>
              <p className="font-medium">{user.username}</p>
              <p className="text-sm text-gray-500">Reporting this user</p>
            </div>
          </div>
        )}

        {step === 1 ? (
          <>
            {/* Reason Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Why are you reporting this user?
              </label>
              <div className="space-y-2">
                {reportReasons.map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleNext} disabled={!selectedReason}>
                Next
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Additional Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional details (optional)
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Please provide any additional context..."
              />
            </div>

            {/* Preview */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <FaFlag className="text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Report Summary</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    <span className="font-medium">Reason:</span> {selectedReason}
                  </p>
                  {customReason && (
                    <p className="text-xs text-yellow-700 mt-1">
                      <span className="font-medium">Details:</span> {customReason}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleSubmit}>
                Submit Report
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ReportModal;