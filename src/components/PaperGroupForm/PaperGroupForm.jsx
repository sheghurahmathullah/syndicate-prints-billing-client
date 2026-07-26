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
    <form className="paper-group-form" onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-12">
          <label htmlFor="pg-name" className="form-label form-label-sm fw-bold mb-1">
            Group Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="pg-name"
            name="name"
            placeholder="e.g. A4 Group"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-12">
          <label htmlFor="pg-description" className="form-label form-label-sm fw-bold mb-1">
            Description
          </label>
          <textarea
            className="form-control form-control-sm"
            id="pg-description"
            name="description"
            placeholder="Optional description for this group"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
        <button type="button" className="btn btn-light btn-sm px-3" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary btn-sm px-4 paper-submit-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
              Saving...
            </>
          ) : (
            <><i className="bi bi-check2-circle me-1" />{selectedGroup ? "Update" : "Save"} Group</>
          )}
        </button>
      </div>
    </form>
  );
};

export default PaperGroupForm;
