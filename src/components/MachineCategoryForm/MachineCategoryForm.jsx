import "./MachineCategoryForm.css";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { addMachineCategory, updateMachineCategory } from "../../Service/MachineCategoryService.js";

const MachineCategoryForm = ({ selectedCategory, onClose, refreshList }) => {
  const [formData, setFormData] = useState({
    name: "",
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      setFormData({
        name: selectedCategory.name || "",
        isActive: selectedCategory.isActive !== undefined ? selectedCategory.isActive : true
      });
    } else {
      setFormData({
        name: "",
        isActive: true
      });
    }
  }, [selectedCategory]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedCategory) {
        await updateMachineCategory(selectedCategory.categoryId, formData);
        toast.success("Machine Category updated successfully");
      } else {
        await addMachineCategory(formData);
        toast.success("Machine Category added successfully");
      }
      refreshList();
      onClose();
    } catch (error) {
      console.error("Error saving machine category:", error);
      const errorMessage = error.response?.data?.message || "Error saving machine category";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-form-wrapper">
      <div className="user-form-card">
        <form className="machine-category-form" onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Category Name */}
            <div className="col-md-8">
              <div className="rich-form-group">
                <label htmlFor="name" className="rich-form-label">
                  Category Name <span className="text-danger">*</span>
                </label>
                <div className="rich-input-group">
                  <span className="rich-input-icon">
                    <i className="bi bi-tag-fill"></i>
                  </span>
                  <input
                    type="text"
                    className="rich-form-control"
                    id="name"
                    name="name"
                    placeholder="Enter Category Name (e.g. Offset Printing)"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Status Switch */}
            <div className="col-md-4">
              <div className="rich-form-group">
                <label className="rich-form-label">Account Status</label>
                <div className="status-switch-card">
                  <div className="form-check form-switch m-0 d-flex align-items-center gap-2">
                    <input
                      className="form-check-input role-switch-check cursor-pointer"
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <label className="form-check-label fw-semibold text-dark small mb-0 cursor-pointer" htmlFor="isActive">
                      {formData.isActive ? (
                        <span className="text-success"><i className="bi bi-check-circle-fill me-1"></i>Active</span>
                      ) : (
                        <span className="text-danger"><i className="bi bi-x-circle-fill me-1"></i>Inactive</span>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="form-action-footer">
            <button 
              type="button" 
              className="btn-form-cancel" 
              onClick={onClose}
              disabled={loading}
            >
              <i className="bi bi-x-circle me-1"></i> Cancel
            </button>
            <button 
              type="submit" 
              className="btn-form-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle me-1"></i> Save Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MachineCategoryForm;
