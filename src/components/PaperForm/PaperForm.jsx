import "./PaperForm.css";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { addPaper, updatePaper, fetchAllPaperCategoriesList, fetchAllPaperGroupsList } from "../../Service/PaperService.js";

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
        paperCategoryName: selectedPaper.paperCategory || "",   // response field: paperCategory
        paperGroupId: selectedPaper.paperGroupId || "",
        paperGroupName: selectedPaper.paperGroup || "",          // response field: paperGroup
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
    // Map form state to exactly what PaperRequest expects
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
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading form...</span>
        </div>
      </div>
    );
  }

  return (
    <form className="paper-form" onSubmit={handleSubmit}>
      <div className="row g-3">
        {/* Paper Name */}
        <div className="col-md-12">
          <label htmlFor="p-name" className="form-label form-label-sm fw-bold mb-1">
            Paper Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="p-name"
            name="name"
            placeholder="e.g. A4 80gsm Bond Paper"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Category */}
        <div className="col-md-6">
          <label htmlFor="p-categoryId" className="form-label form-label-sm fw-bold mb-1">
            Paper Category <span className="text-danger">*</span>
          </label>
          <select
            className="form-select form-select-sm"
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

        {/* Group */}
        <div className="col-md-6">
          <label htmlFor="p-groupId" className="form-label form-label-sm fw-bold mb-1">
            Paper Group <span className="text-danger">*</span>
          </label>
          <select
            className="form-select form-select-sm"
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

        {/* Reading Count */}
        <div className="col-md-6">
          <label htmlFor="p-readingCount" className="form-label form-label-sm fw-bold mb-1">
            Reading Count
          </label>
          <input
            type="number"
            className="form-control form-control-sm"
            id="p-readingCount"
            name="readingCount"
            min="0"
            value={formData.readingCount}
            onChange={handleChange}
          />
        </div>

        {/* Active */}
        <div className="col-md-6 d-flex align-items-end mb-1">
          <div className="form-check form-switch mt-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="p-isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <label className="form-check-label form-label-sm fw-bold ms-1" htmlFor="p-isActive">
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
            <><i className="bi bi-check2-circle me-1" />{selectedPaper ? "Update" : "Save"} Paper</>
          )}
        </button>
      </div>
    </form>
  );
};

export default PaperForm;
