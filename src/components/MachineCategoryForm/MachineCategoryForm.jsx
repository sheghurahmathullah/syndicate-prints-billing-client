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
    <form className="machine-category-form" onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-8">
          <label htmlFor="name" className="form-label form-label-sm fw-bold mb-1">Category Name *</label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="name"
            name="name"
            placeholder="Enter Category Name"
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
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <label className="form-check-label form-label-sm fw-bold ms-1" htmlFor="isActive">
              {formData.isActive ? "Active" : "Inactive"}
            </label>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
        <button 
          type="button" 
          className="btn btn-light btn-sm px-3" 
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary btn-sm px-4 submit-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            <><i className="bi bi-check2-circle me-1"></i> Save Category</>
          )}
        </button>
      </div>
    </form>
  );
};

export default MachineCategoryForm;
