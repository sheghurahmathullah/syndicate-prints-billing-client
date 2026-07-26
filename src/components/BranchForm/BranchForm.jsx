import "./BranchForm.css";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { addBranch, updateBranch } from "../../Service/BranchService.js";

const BranchForm = ({ selectedBranch, onClose, refreshList }) => {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    shopName: "",
    address: "",
    email: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedBranch) {
      setFormData({
        name: selectedBranch.name || "",
        phoneNumber: selectedBranch.phoneNumber || "",
        shopName: selectedBranch.shopName || "",
        address: selectedBranch.address || "",
        email: selectedBranch.email || ""
      });
    } else {
      setFormData({
        name: "",
        phoneNumber: "",
        shopName: "",
        address: "",
        email: ""
      });
    }
  }, [selectedBranch]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      // Allow only numbers by stripping out non-digit characters
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue
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
      if (selectedBranch) {
        await updateBranch(selectedBranch.branchId, formData);
        toast.success("Branch updated successfully");
      } else {
        await addBranch(formData);
        toast.success("Branch added successfully");
      }
      refreshList();
      onClose();
    } catch (error) {
      console.error("Error saving branch:", error);
      const errorMessage = error.response?.data?.message || "Error saving branch";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="branch-form" onSubmit={handleSubmit}>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="form-floating">
            <input
              type="text"
              className="form-control premium-input"
              id="name"
              name="name"
              placeholder="Branch Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <label htmlFor="name">Branch Name *</label>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-floating">
            <input
              type="text"
              className="form-control premium-input"
              id="shopName"
              name="shopName"
              placeholder="Shop Name"
              value={formData.shopName}
              onChange={handleChange}
              required
            />
            <label htmlFor="shopName">Shop Name *</label>
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-floating">
            <input
              type="tel"
              className="form-control premium-input"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              maxLength="15"
              required
            />
            <label htmlFor="phoneNumber">Phone Number *</label>
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-floating">
            <input
              type="email"
              className="form-control premium-input"
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            <label htmlFor="email">Email</label>
          </div>
        </div>

        <div className="col-12">
          <div className="form-floating">
            <textarea
              className="form-control premium-input"
              id="address"
              name="address"
              placeholder="Address"
              style={{ height: "100px" }}
              value={formData.address}
              onChange={handleChange}
              required
            ></textarea>
            <label htmlFor="address">Address *</label>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
        <button 
          type="button" 
          className="btn btn-light px-4" 
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary px-5 submit-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            <><i className="bi bi-check2-circle me-2"></i> Save Branch</>
          )}
        </button>
      </div>
    </form>
  );
};

export default BranchForm;
