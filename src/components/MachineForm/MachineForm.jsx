import "./MachineForm.css";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { addMachine, updateMachine } from "../../Service/MachineService.js";
import { fetchAllMachineCategories } from "../../Service/MachineCategoryService.js";
import { fetchBranches } from "../../Service/BranchService.js";

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
        fetchBranches(0, 1000) // Fetch a large number to act as 'all' since no unpaginated endpoint
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
      const selectedCat = categories.find(c => c.categoryId === value);
      setFormData(prev => ({
        ...prev,
        categoryId: value,
        machineCategory: selectedCat ? selectedCat.name : ""
      }));
      return;
    }
    
    if (name === "branchId") {
      const selectedBranch = branches.find(b => b.branchId === value);
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
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading form...</span>
        </div>
      </div>
    );
  }

  return (
    <form className="machine-form" onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label form-label-sm fw-bold mb-1">Machine Name *</label>
          <input
            type="text"
            className="form-control form-control-sm"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Printer A1"
            required
          />
        </div>
        
        <div className="col-md-4">
          <label className="form-label form-label-sm fw-bold mb-1">Machine Category *</label>
          <select 
            className="form-select form-select-sm"
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

        <div className="col-md-4">
          <label className="form-label form-label-sm fw-bold mb-1">Branch *</label>
          <select 
            className="form-select form-select-sm"
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

        <div className="col-md-6">
          <label className="form-label form-label-sm fw-bold mb-1">Serial Number</label>
          <input
            type="text"
            className="form-control form-control-sm"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
            placeholder="SN-12345"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label form-label-sm fw-bold mb-1">Initial Reading</label>
          <input
            type="number"
            className="form-control form-control-sm"
            name="reading"
            value={formData.reading}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <div className="col-12 mt-4 mb-2">
          <h6 className="border-bottom pb-2 section-title">Contact Information</h6>
        </div>

        <div className="col-md-6">
          <label className="form-label form-label-sm fw-bold mb-1">Contact Mobile</label>
          <input
            type="tel"
            className="form-control form-control-sm"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            maxLength="15"
            placeholder="Phone Number"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label form-label-sm fw-bold mb-1">Contact Email</label>
          <input
            type="email"
            className="form-control form-control-sm"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
          />
        </div>

        <div className="col-12 mt-4 mb-2">
          <h6 className="border-bottom pb-2 section-title">Toner Request Details</h6>
        </div>

        <div className="col-md-6">
          <label className="form-label form-label-sm fw-bold mb-1">Toner Request Mobile</label>
          <input
            type="tel"
            className="form-control form-control-sm"
            name="tonerRequestMobile"
            value={formData.tonerRequestMobile}
            onChange={handleChange}
            maxLength="15"
            placeholder="Toner Contact Phone"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label form-label-sm fw-bold mb-1">Toner Request Email</label>
          <input
            type="email"
            className="form-control form-control-sm"
            name="tonerRequestEmail"
            value={formData.tonerRequestEmail}
            onChange={handleChange}
            placeholder="toner@example.com"
          />
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
        <button 
          type="button" 
          className="btn btn-light btn-sm px-4" 
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary btn-sm px-5 submit-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            <><i className="bi bi-check2-circle me-1"></i> Save Machine</>
          )}
        </button>
      </div>
    </form>
  );
};

export default MachineForm;
