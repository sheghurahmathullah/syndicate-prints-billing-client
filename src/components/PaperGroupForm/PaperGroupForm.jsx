import "./PaperGroupForm.css";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { addPaperGroup, updatePaperGroup } from "../../Service/PaperService.js";

const PaperGroupForm = ({ selectedGroup, onClose, refreshList }) => {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(
      selectedGroup
        ? { name: selectedGroup.name || "", description: selectedGroup.description || "" }
        : { name: "", description: "" }
    );
  }, [selectedGroup]);

  const handleChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedGroup) {
        await updatePaperGroup(selectedGroup.groupId, formData);
        toast.success("Paper Group updated successfully");
      } else {
        await addPaperGroup(formData);
        toast.success("Paper Group added successfully");
      }
      refreshList();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving paper group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-form-wrapper">
      <div className="user-form-card">
        {/* Form Header Banner */}
        <div className="form-section-header mb-4">
          <div className="form-header-badge">
            <i className="bi bi-collection-fill"></i>
          </div>
          <div>
            <h6 className="form-section-title mb-0">
              {selectedGroup ? "Edit Paper Group" : "Create New Paper Group"}
            </h6>
            <p className="form-section-subtitle mb-0">
              Fill in the group details below
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Group Name */}
            <div className="col-md-12">
              <div className="rich-form-group">
                <label htmlFor="pg-name" className="rich-form-label">
                  Group Name <span className="text-danger">*</span>
                </label>
                <div className="rich-input-group">
                  <i className="bi bi-collection rich-input-icon"></i>
                  <input
                    type="text"
                    className="rich-form-control"
                    id="pg-name"
                    name="name"
                    placeholder="e.g. A4 Group, Standard Offset"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="col-md-12">
              <div className="rich-form-group">
                <label htmlFor="pg-description" className="rich-form-label">
                  Description
                </label>
                <div className="rich-input-group">
                  <i className="bi bi-card-text rich-input-icon" style={{ top: "1.1rem" }}></i>
                  <textarea
                    className="rich-form-control"
                    id="pg-description"
                    name="description"
                    placeholder="Optional description for this paper group"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="form-action-footer">
            <button
              type="button"
              className="btn-form-cancel"
              onClick={onClose}
              disabled={loading}
            >
              <i className="bi bi-x-lg me-1"></i> Cancel
            </button>
            <button
              type="submit"
              className="btn-form-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle me-1"></i>
                  {selectedGroup ? "Update Group" : "Save Group"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaperGroupForm;
