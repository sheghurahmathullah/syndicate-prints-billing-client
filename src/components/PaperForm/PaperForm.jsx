import "./PaperForm.css";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { addPaper, updatePaper, fetchAllPaperCategoriesList, fetchAllPaperGroupsList } from "../../Service/PaperService.js";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner.jsx";

const PaperForm = ({ selectedPaper, onClose, refreshList }) => {
  const [formData, setFormData] = useState({
    name: "",
    paperCategoryId: "",
    paperCategoryName: "",
    paperGroupId: "",
    paperGroupName: "",
    readingCount: 0,
    isActive: true,
  });
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    loadDropdowns();
    if (selectedPaper) {
      setFormData({
        name: selectedPaper.name || "",
        paperCategoryId: selectedPaper.paperCategoryId || "",
        paperCategoryName: selectedPaper.paperCategory || "",
        paperGroupId: selectedPaper.paperGroupId || "",
        paperGroupName: selectedPaper.paperGroup || "",
        readingCount: selectedPaper.readingCount || 0,
        isActive: selectedPaper.isActive ?? true,
      });
    }
  }, [selectedPaper]);

  const loadDropdowns = async () => {
    try {
      setFetchingData(true);
      const [catRes, grpRes] = await Promise.all([
        fetchAllPaperCategoriesList(),
        fetchAllPaperGroupsList(),
      ]);
      setCategories(catRes.data || []);
      setGroups(grpRes.data || []);
    } catch {
      toast.error("Failed to load categories or groups");
    } finally {
      setFetchingData(false);
    }
  };

  const handleChange = ({ target: { name, value, type, checked } }) => {
    if (name === "paperCategoryId") {
      const cat = categories.find((c) => c.categoryId === value);
      setFormData((prev) => ({ ...prev, paperCategoryId: value, paperCategoryName: cat?.name || "" }));
      return;
    }
    if (name === "paperGroupId") {
      const grp = groups.find((g) => g.groupId === value);
      setFormData((prev) => ({ ...prev, paperGroupId: value, paperGroupName: grp?.name || "" }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      paperCategory: formData.paperCategoryName,
      paperCategoryId: formData.paperCategoryId,
      paperGroup: formData.paperGroupName,
      paperGroupId: formData.paperGroupId,
      readingCount: Number(formData.readingCount) || 0,
      isActive: formData.isActive,
    };
    try {
      setLoading(true);
      if (selectedPaper) {
        await updatePaper(selectedPaper.paperId, payload);
        toast.success("Paper updated successfully");
      } else {
        await addPaper(payload);
        toast.success("Paper added successfully");
      }
      refreshList();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving paper");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return <LoadingSpinner message="Preparing paper form..." />;
  }

  return (
    <div className="user-form-wrapper">
      <div className="user-form-card">
        {/* Form Header Banner */}
        <div className="form-section-header mb-4">
          <div className="form-header-badge">
            <i className="bi bi-file-earmark-text-fill"></i>
          </div>
          <div>
            <h6 className="form-section-title mb-0">
              {selectedPaper ? "Edit Paper Stock" : "Create New Paper Stock"}
            </h6>
            <p className="form-section-subtitle mb-0">
              Configure paper specifications and group assignments
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Paper Name */}
            <div className="col-md-12">
              <div className="rich-form-group">
                <label htmlFor="p-name" className="rich-form-label">
                  Paper Name <span className="text-danger">*</span>
                </label>
                <div className="rich-input-group">
                  <i className="bi bi-file-earmark-text rich-input-icon"></i>
                  <input
                    type="text"
                    className="rich-form-control"
                    id="p-name"
                    name="name"
                    placeholder="e.g. A4 80gsm Bond Paper"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="col-md-6">
              <div className="rich-form-group">
                <label htmlFor="p-categoryId" className="rich-form-label">
                  Paper Category <span className="text-danger">*</span>
                </label>
                <div className="rich-input-group">
                  <i className="bi bi-layers rich-input-icon"></i>
                  <select
                    className="rich-form-control"
                    id="p-categoryId"
                    name="paperCategoryId"
                    value={formData.paperCategoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.categoryId} value={cat.categoryId}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Group Dropdown */}
            <div className="col-md-6">
              <div className="rich-form-group">
                <label htmlFor="p-groupId" className="rich-form-label">
                  Paper Group <span className="text-danger">*</span>
                </label>
                <div className="rich-input-group">
                  <i className="bi bi-collection rich-input-icon"></i>
                  <select
                    className="rich-form-control"
                    id="p-groupId"
                    name="paperGroupId"
                    value={formData.paperGroupId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Group</option>
                    {groups.map((grp) => (
                      <option key={grp.groupId} value={grp.groupId}>
                        {grp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Reading Count */}
            <div className="col-md-6">
              <div className="rich-form-group">
                <label htmlFor="p-readingCount" className="rich-form-label">
                  Reading Count
                </label>
                <div className="rich-input-group">
                  <i className="bi bi-speedometer2 rich-input-icon"></i>
                  <input
                    type="number"
                    className="rich-form-control"
                    id="p-readingCount"
                    name="readingCount"
                    min="0"
                    placeholder="0"
                    value={formData.readingCount}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Status Switch */}
            <div className="col-md-6">
              <div className="rich-form-group">
                <label className="rich-form-label">Status</label>
                <div className="d-flex align-items-center h-100 pt-1">
                  <div className="form-check form-switch custom-status-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="p-isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <label className="form-check-label fw-bold ms-2" htmlFor="p-isActive">
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
                  {selectedPaper ? "Update Paper" : "Save Paper"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaperForm;
