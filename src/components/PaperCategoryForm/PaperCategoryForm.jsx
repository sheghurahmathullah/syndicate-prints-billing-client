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
    <form className="paper-category-form" onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-8">
          <label htmlFor="pc-name" className="form-label form-label-sm fw-bold mb-1">
            Category Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="pc-name"
            name="name"
            placeholder="e.g. Bond Paper"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-4 d-flex align-items-end mb-1">
          <div className="form-check form-switch mt-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="pc-isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <label className="form-check-label form-label-sm fw-bold ms-1" htmlFor="pc-isActive">
              {formData.isActive ? "Active" : "Inactive"}
            </label>
          </div>
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
            <><i className="bi bi-check2-circle me-1" />{selectedCategory ? "Update" : "Save"} Category</>
          )}
        </button>
      </div>
    </form>
  );
};

export default PaperCategoryForm;
