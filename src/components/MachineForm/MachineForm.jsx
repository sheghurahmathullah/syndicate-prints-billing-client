import "./MachineForm.css";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { addMachine, updateMachine } from "../../Service/MachineService.js";
import { fetchAllMachineCategories } from "../../Service/MachineCategoryService.js";
import { fetchBranches } from "../../Service/BranchService.js";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner.jsx";

const MachineForm = ({ selectedMachine, onClose, refreshList }) => {
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    machineCategory: "",
    reading: "",
    serialNumber: "",
    mobile: "",
    email: "",
    tonerRequestMobile: "",
    tonerRequestEmail: "",
    branchId: "",
    branchName: ""
  });
  
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    loadDropdownData();
    
    if (selectedMachine) {
      setFormData({
        name: selectedMachine.name || "",
        categoryId: selectedMachine.categoryId || "",
        machineCategory: selectedMachine.machineCategory || "",
        reading: selectedMachine.reading || "",
        serialNumber: selectedMachine.serialNumber || "",
        mobile: selectedMachine.mobile || "",
        email: selectedMachine.email || "",
        tonerRequestMobile: selectedMachine.tonerRequestMobile || "",
        tonerRequestEmail: selectedMachine.tonerRequestEmail || "",
        branchId: selectedMachine.branchId || "",
        branchName: selectedMachine.branchName || ""
      });
    }
  }, [selectedMachine]);

  const loadDropdownData = async () => {
    try {
      setFetchingData(true);
      const [categoryRes, branchRes] = await Promise.all([
        fetchAllMachineCategories(),
        fetchBranches(0, 1000)
      ]);
      
      setCategories(categoryRes.data || []);
      setBranches(branchRes.data?.content || []);
    } catch (error) {
      console.error("Error loading dropdowns:", error);
      toast.error("Failed to load categories or branches");
    } finally {
      setFetchingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "mobile" || name === "tonerRequestMobile") {
      const numericValue = value.replace(/\D/g, "");
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    if (name === "categoryId") {
      const selectedCat = categories.find(c => String(c.categoryId) === String(value));
      setFormData(prev => ({
        ...prev,
        categoryId: value,
        machineCategory: selectedCat ? selectedCat.name : ""
      }));
      return;
    }
    
    if (name === "branchId") {
      const selectedBranch = branches.find(b => String(b.branchId) === String(value));
      setFormData(prev => ({
        ...prev,
        branchId: value,
        branchName: selectedBranch ? selectedBranch.name : ""
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedMachine) {
        await updateMachine(selectedMachine.machineId, formData);
        toast.success("Machine updated successfully");
      } else {
        await addMachine(formData);
        toast.success("Machine added successfully");
      }
      refreshList();
      onClose();
    } catch (error) {
      console.error("Error saving machine:", error);
      const errorMessage = error.response?.data?.message || "Error saving machine";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return <LoadingSpinner message="Preparing machine form..." />;
  }

  return (
    <div className="user-form-wrapper">
      <div className="user-form-card">
        <form className="machine-form" onSubmit={handleSubmit}>
          {/* Section 1: Basic Machine Info */}
          <div className="form-section-header mb-3">
            <div className="form-header-badge">
              <i className="bi bi-printer-fill"></i>
            </div>
            <div>
              <h6 className="form-section-title mb-0">Machine Specification</h6>
              <span className="form-section-subtitle">Basic details, category & branch assignment</span>
            </div>
          </div>

          <div className="row g-3">
            {/* Machine Name */}
            <div className="col-md-4">
              <div className="rich-form-group">
                <label className="rich-form-label">
                  Machine Name <span className="text-danger">*</span>
                </label>
                <div className="rich-input-group">
                  <span className="rich-input-icon"><i className="bi bi-printer-fill"></i></span>
                  <input
                    type="text"
                    className="rich-form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Heidelberg Offset 01"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Machine Category */}
            <div className="col-md-4">
              <div className="rich-form-group">
                <label className="rich-form-label">
                  Category <span className="text-danger">*</span>
                </label>
                <div className="rich-input-group">
                  <span className="rich-input-icon"><i className="bi bi-diagram-3-fill"></i></span>
                  <select 
                    className="rich-form-control"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Branch */}
            <div className="col-md-4">
              <div className="rich-form-group">
                <label className="rich-form-label">
                  Branch <span className="text-danger">*</span>
                </label>
                <div className="rich-input-group">
                  <span className="rich-input-icon"><i className="bi bi-geo-alt-fill"></i></span>
                  <select 
                    className="rich-form-control"
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch.branchId} value={branch.branchId}>{branch.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Serial Number */}
            <div className="col-md-6">
              <div className="rich-form-group">
                <label className="rich-form-label">Serial Number</label>
                <div className="rich-input-group">
                  <span className="rich-input-icon"><i className="bi bi-hash"></i></span>
                  <input
                    type="text"
                    className="rich-form-control font-monospace"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    placeholder="e.g. SN-9874521"
                  />
                </div>
              </div>
            </div>

            {/* Initial Reading */}
            <div className="col-md-6">
              <div className="rich-form-group">
                <label className="rich-form-label">Initial Reading</label>
                <div className="rich-input-group">
                  <span className="rich-input-icon"><i className="bi bi-speedometer2"></i></span>
                  <input
                    type="number"
                    className="rich-form-control"
                    name="reading"
                    value={formData.reading}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="form-section-header mt-4 mb-3">
            <div className="form-header-badge">
              <i className="bi bi-telephone-fill"></i>
            </div>
            <div>
              <h6 className="form-section-title mb-0">General Contact Information</h6>
              <span className="form-section-subtitle">Support & operational contact details</span>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <div className="rich-form-group">
                <label className="rich-form-label">Contact Mobile</label>
                <div className="rich-input-group">
                  <span className="rich-input-icon"><i className="bi bi-telephone-fill"></i></span>
                  <input
                    type="tel"
                    className="rich-form-control"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    maxLength="15"
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="rich-form-group">
                <label className="rich-form-label">Contact Email</label>
                <div className="rich-input-group">
                  <span className="rich-input-icon"><i className="bi bi-envelope-fill"></i></span>
                  <input
                    type="email"
                    className="rich-form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="support@company.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Toner Request Details */}
          <div className="form-section-header mt-4 mb-3">
            <div className="form-header-badge">
              <i className="bi bi-droplet-fill"></i>
            </div>
            <div>
              <h6 className="form-section-title mb-0">Toner Request Details</h6>
              <span className="form-section-subtitle">Specific contacts for toner & consumable refills</span>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <div className="rich-form-group">
                <label className="rich-form-label">Toner Request Mobile</label>
                <div className="rich-input-group">
                  <span className="rich-input-icon"><i className="bi bi-phone-fill"></i></span>
                  <input
                    type="tel"
                    className="rich-form-control"
                    name="tonerRequestMobile"
                    value={formData.tonerRequestMobile}
                    onChange={handleChange}
                    maxLength="15"
                    placeholder="e.g. 9123456789"
                  />
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="rich-form-group">
                <label className="rich-form-label">Toner Request Email</label>
                <div className="rich-input-group">
                  <span className="rich-input-icon"><i className="bi bi-send-fill"></i></span>
                  <input
                    type="email"
                    className="rich-form-control"
                    name="tonerRequestEmail"
                    value={formData.tonerRequestEmail}
                    onChange={handleChange}
                    placeholder="toner-request@company.com"
                  />
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
                  <i className="bi bi-check2-circle me-1"></i> Save Machine
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MachineForm;
