import React from 'react';

interface EventModalProps {
  show: boolean;
  annotation: string;
  onAnnotationChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  show,
  annotation,
  onAnnotationChange,
  onSave,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Add Annotation</h3>
        <textarea
          className="w-full p-2 border rounded mb-4"
          value={annotation}
          onChange={(e) => onAnnotationChange(e.target.value)}
          placeholder="Enter event description..."
          rows={3}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};