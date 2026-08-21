import "./PaperCategoryForm.css";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { addPaperCategory, updatePaperCategory } from "../../Service/PaperService.js";

const PaperCategoryForm = ({ selectedCategory, onClose, refreshList }) => {
  const [formData, setFormData] = useState({ name: "", isActive: true });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(
      selectedCategory
        ? { name: selectedCategory.name || "", isActive: selectedCategory.isActive ?? true }
        : { name: "", isActive: true }
    );
  }, [selectedCategory]);

  const handleChange = ({ target: { name, value, type, checked } }) => {
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedCategory) {
        await updatePaperCategory(selectedCategory.categoryId, formData);
        toast.success("Paper Category updated successfully");
      } else {
        await addPaperCategory(formData);
        toast.success("Paper Category added successfully");
      }
      refreshList();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving paper category");
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
            <i className="bi bi-layers-fill"></i>
          </div>
          <div>
            <h6 className="form-section-title mb-0">
              {selectedCategory ? "Edit Paper Category" : "Create New Paper Category"}
            </h6>
            <p className="form-section-subtitle mb-0">
              Fill in the category information below
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Category Name */}
            <div className="col-md-8">
              <div className="rich-form-group">
                <label htmlFor="pc-name" className="rich-form-label">
                  Category Name <span className="text-danger">*</span>
                </label>
                <div className="rich-input-group">
                  <i className="bi bi-layers rich-input-icon"></i>
                  <input
                    type="text"
                    className="rich-form-control"
                    id="pc-name"
                    name="name"
                    placeholder="e.g. Bond Paper, Art Card, Matte"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Active Status Switch */}
            <div className="col-md-4">
              <div className="rich-form-group">
                <label className="rich-form-label">Status</label>
                <div className="d-flex align-items-center h-100 pt-1">
                  <div className="form-check form-switch custom-status-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="pc-isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <label className="form-check-label fw-bold ms-2" htmlFor="pc-isActive">
                      {formData.isActive ? (
                        <span className="text-success">Active</span>
                      ) : (
                        <span className="text-danger">Inactive</span>
                      )}
                    </label>
                  </div>
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
                  {selectedCategory ? "Update Category" : "Save Category"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaperCategoryForm;
