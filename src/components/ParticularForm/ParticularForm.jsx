import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import "./ParticularForm.css";
import { fetchAllMachineCategories } from "../../Service/MachineCategoryService.js";
import { fetchAllPaperGroupsList, fetchAllPapersList } from "../../Service/PaperService.js";

const ParticularForm = ({ onSubmit, initialData = null, onCancel }) => {
  const [formData, setFormData] = useState({
    particularId: "",
    name: "",
    price: "",
    priceBack: "",
    commisionRate: "",
    taxNumber: "",
    machineCategoryId: "",
    paperGroupId: "",
    paperId: "",
    isActive: true,
  });

  const [machineCategories, setMachineCategories] = useState([]);
  const [paperGroups, setPaperGroups] = useState([]);
  const [papers, setPapers] = useState([]);

  useEffect(() => {
    // Load dropdown options
    const loadDropdownData = async () => {
      try {
        const [catRes, pgRes, pRes] = await Promise.all([
          fetchAllMachineCategories(),
          fetchAllPaperGroupsList(),
          fetchAllPapersList()
        ]);
        setMachineCategories(catRes.data || []);
        setPaperGroups(pgRes.data || []);
        setPapers(pRes.data || []);
      } catch (error) {
        console.error("Error loading dropdown data for Particulars:", error);
        toast.error("Failed to load options for form");
      }
    };
    loadDropdownData();

    if (initialData) {
      setFormData({
        particularId: initialData.particularId || "",
        name: initialData.name || "",
        price: initialData.price || "",
        priceBack: initialData.priceBack || "",
        commisionRate: initialData.commisionRate || "",
        taxNumber: initialData.taxNumber || "",
        machineCategoryId: initialData.machineCategoryId || "",
        paperGroupId: initialData.paperGroupId || "",
        paperId: initialData.paperId || "",
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Map the selected IDs back to the expected payload (including resolving names if backend expects them)
    // The backend expects MachineCategory, PaperGroup, Paper strings and IDs
    const selectedCategory = machineCategories.find(c => c.categoryId === formData.machineCategoryId);
    const selectedGroup = paperGroups.find(g => g.groupId === formData.paperGroupId);
    const selectedPaper = papers.find(p => p.paperId === formData.paperId);

    const payload = {
      ...formData,
      price: formData.price ? parseFloat(formData.price) : 0,
      priceBack: formData.priceBack ? parseFloat(formData.priceBack) : 0,
      commisionRate: formData.commisionRate ? parseFloat(formData.commisionRate) : 0,
      machineCategory: selectedCategory ? selectedCategory.name : "",
      paperGroup: selectedGroup ? selectedGroup.name : "",
      paper: selectedPaper ? selectedPaper.name : "",
    };

    onSubmit(payload);
  };

  return (
    <div className="particular-form-container fade-in">
      <div className="form-header">
        <h3 className="form-title">
          {initialData ? "Edit Particular" : "Add New Particular"}
        </h3>
        <p className="form-subtitle">
          {initialData
            ? "Update the details for this particular."
            : "Fill in the details to create a new particular."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="particular-form">
        <div className="form-grid">
          {/* Column 1 */}
          <div className="form-column">
            <div className="form-group">
              <label>Particular ID <span className="required">*</span></label>
              <div className="input-with-icon">
                <i className="bi bi-hash"></i>
                <input
                  type="text"
                  name="particularId"
                  value={formData.particularId}
                  onChange={handleChange}
                  required
                  placeholder="E.g., PRT-001"
                  disabled={!!initialData} // Disallow changing ID in edit mode
                />
              </div>
            </div>

            <div className="form-group">
              <label>Particular Name <span className="required">*</span></label>
              <div className="input-with-icon">
                <i className="bi bi-fonts"></i>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter name"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Machine Category</label>
              <div className="input-with-icon">
                <i className="bi bi-diagram-3"></i>
                <select
                  name="machineCategoryId"
                  value={formData.machineCategoryId}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select Machine Category</option>
                  {machineCategories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="form-column">
            <div className="form-row split-2">
              <div className="form-group">
                <label>Price <span className="required">*</span></label>
                <div className="input-with-icon">
                  <i className="bi bi-currency-rupee"></i>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Price Back</label>
                <div className="input-with-icon">
                  <i className="bi bi-currency-rupee"></i>
                  <input
                    type="number"
                    step="0.01"
                    name="priceBack"
                    value={formData.priceBack}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="form-row split-2">
              <div className="form-group">
                <label>Commission Rate</label>
                <div className="input-with-icon">
                  <i className="bi bi-percent"></i>
                  <input
                    type="number"
                    step="0.01"
                    name="commisionRate"
                    value={formData.commisionRate}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Tax Number</label>
                <div className="input-with-icon">
                  <i className="bi bi-receipt"></i>
                  <input
                    type="text"
                    name="taxNumber"
                    value={formData.taxNumber}
                    onChange={handleChange}
                    placeholder="Enter Tax No"
                  />
                </div>
              </div>
            </div>

            <div className="form-row split-2">
              <div className="form-group">
                <label>Paper Group</label>
                <div className="input-with-icon">
                  <i className="bi bi-collection"></i>
                  <select
                    name="paperGroupId"
                    value={formData.paperGroupId}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Select Paper Group</option>
                    {paperGroups.map((pg) => (
                      <option key={pg.groupId} value={pg.groupId}>
                        {pg.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Paper</label>
                <div className="input-with-icon">
                  <i className="bi bi-file-earmark-text"></i>
                  <select
                    name="paperId"
                    value={formData.paperId}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Select Paper</option>
                    {papers.map((p) => (
                      <option key={p.paperId} value={p.paperId}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-footer">
          <div className="status-toggle">
            <label className="switch">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <span className="slider round"></span>
            </label>
            <span className="status-label">
              {formData.isActive ? "Active Status" : "Inactive Status"}
            </span>
          </div>

          <div className="form-actions">
            {onCancel && (
              <button
                type="button"
                className="btn-cancel"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
            <button type="submit" className="btn-submit">
              {initialData ? (
                <>
                  <i className="bi bi-check2-circle"></i> Update Particular
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle"></i> Save Particular
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ParticularForm;
