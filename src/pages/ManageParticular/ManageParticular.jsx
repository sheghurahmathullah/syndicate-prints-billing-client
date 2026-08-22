import { useState, useRef } from "react";
import toast from "react-hot-toast";
import "./ManageParticular.css";
import ParticularList from "../../components/ParticularList/ParticularList.jsx";
import ParticularForm from "../../components/ParticularForm/ParticularForm.jsx";
import { addParticular, updateParticular } from "../../Service/ParticularService.js";

const ManageParticular = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingParticular, setEditingParticular] = useState(null);
  
  // Ref to trigger list refresh
  const listRef = useRef();

  const handleAddClick = () => {
    setEditingParticular(null);
    setShowForm(true);
  };

  const handleEditClick = (particular) => {
    setEditingParticular(particular);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingParticular(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingParticular) {
        await updateParticular(editingParticular.particularId, formData);
        toast.success("Particular updated successfully");
      } else {
        await addParticular(formData);
        toast.success("Particular created successfully");
      }
      
      // Close form and refresh list
      setShowForm(false);
      setEditingParticular(null);
      // Hacky way to refresh the list without passing state up and down deeply
      if (listRef.current) {
        const refreshEvent = new CustomEvent("refreshParticulars");
        window.dispatchEvent(refreshEvent);
      } else {
        // Alternatively we can force a re-mount or pass a trigger state
        window.dispatchEvent(new CustomEvent("refreshParticulars"));
      }
    } catch (error) {
      console.error("Error saving particular:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error(`Failed to ${editingParticular ? "update" : "create"} particular`);
      }
    }
  };

  return (
    <div className="manage-page fade-in">
      <div className="page-header mb-3 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-0">Manage Particulars</h4>
        </div>
        {!showForm && (
          <button className="btn btn-primary btn-sm" onClick={handleAddClick}>
            <i className="bi bi-plus-lg"></i> Add Particular
          </button>
        )}
      </div>

      {showForm ? (
        <div className="form-section fade-in">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">
              <i className="bi bi-list-columns-reverse"></i>{" "}
              {editingParticular ? "Edit Particular" : "Add New Particular"}
            </h5>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleCancelForm}>
              <i className="bi bi-x-lg"></i> Close
            </button>
          </div>
          <ParticularForm
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
            initialData={editingParticular}
          />
        </div>
      ) : (
        <div className="list-section fade-in" ref={listRef}>
          <div className="machine-banner position-relative text-center text-white mb-3 rounded px-3 py-3" style={{ backgroundColor: '#002142' }}>
            <h5 className="fw-bold mb-1 text-uppercase tracking-wider">Particular Management</h5>
            <p className="mb-0 text-white-50" style={{ fontSize: '0.8rem' }}>Comprehensive oversight and administration of billing particulars</p>
          </div>
          <ParticularListWrapper onEdit={handleEditClick} />
        </div>
      )}
    </div>
  );
};

// Wrapper component to handle custom refresh events seamlessly
import { useEffect } from "react";
const ParticularListWrapper = ({ onEdit }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleRefresh = () => setRefreshKey((prev) => prev + 1);
    window.addEventListener("refreshParticulars", handleRefresh);
    return () => window.removeEventListener("refreshParticulars", handleRefresh);
  }, []);

  return <ParticularList key={refreshKey} onEdit={onEdit} />;
};

export default ManageParticular;
