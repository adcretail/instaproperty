interface OwnerMobileDialogProps {
  property: any;
  onClose: () => void;
}

const OwnerMobileDialog = ({ property, onClose }: OwnerMobileDialogProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Owner's Mobile Number</h2>
        <p className="text-gray-700 mb-4">{property.contactNumber}</p>
        <button
          className="w-full bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-700"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default OwnerMobileDialog;
