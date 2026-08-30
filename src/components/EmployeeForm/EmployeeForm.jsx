import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { fetchAllBranchesList } from "../../Service/BranchService.js";
import "./EmployeeForm.css"; // We'll just reuse generic form styles mostly, but create a stub

const EmployeeForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfJoin: "",
    branch: "",
    designation: "",
    salary: "",
    role: "ROLE_USER", // default
    photo: "",
    resume: ""
  });
  
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [resumePreviewName, setResumePreviewName] = useState(null);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        setLoadingBranches(true);
        const response = await fetchAllBranchesList();
        const branchList = Array.isArray(response.data) ? response.data : [];
        setBranches(branchList);
      } catch (error) {
        console.error("Error fetching branches list:", error);
        toast.error("Failed to load branches list");
      } finally {
        setLoadingBranches(false);
      }
    };
    loadBranches();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        dateOfJoin: initialData.dateOfJoin || "",
        branch: initialData.branch || "",
        designation: initialData.designation || "",
        salary: initialData.salary || "",
        role: initialData.role || "ROLE_USER",
        photo: initialData.photo || "",
        resume: initialData.resume || ""
      });
      if (initialData.photo) {
        setPhotoPreview(initialData.photo);
      }
      if (initialData.resume) {
        setResumePreviewName("Existing file uploaded");
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (field === 'photo') {
         if (!file.type.startsWith('image/')) {
            toast.error("Please select a valid image file");
            return;
         }
      }
      if (field === 'resume') {
         if (file.type !== 'application/pdf' && !file.type.includes('word') && !file.type.includes('document')) {
             toast.error("Please upload PDF or Word document for resume");
             return;
         }
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
           ...prev,
           [field]: reader.result
        }));
        if (field === 'photo') {
            setPhotoPreview(reader.result);
        } else if (field === 'resume') {
            setResumePreviewName(file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.branch || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
         ...formData,
         salary: formData.salary ? parseFloat(formData.salary) : 0.0
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="employee-form-container">
      <form onSubmit={handleSubmit} className="custom-form">
        <div className="row g-3">
          
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">First Name <span className="text-danger">*</span></label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person"></i></span>
                <input
                  type="text"
                  className="form-control"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  required
                />
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">Last Name <span className="text-danger">*</span></label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person"></i></span>
                <input
                  type="text"
                  className="form-control"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email <span className="text-danger">*</span></label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="role" className="form-label">Role <span className="text-danger">*</span></label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-shield-check"></i></span>
                <select
                  className="form-select"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="ROLE_USER">User</option>
                  <option value="ROLE_ADMIN">Admin</option>
                  <option value="ROLE_MANAGER">Manager</option>
                </select>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="dateOfJoin" className="form-label">Date of Joining</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-calendar-check"></i></span>
                <input
                  type="date"
                  className="form-control"
                  id="dateOfJoin"
                  name="dateOfJoin"
                  value={formData.dateOfJoin}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="branch" className="form-label">Branch <span className="text-danger">*</span></label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-building"></i></span>
                <select
                  className="form-select"
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                  disabled={loadingBranches}
                >
                  <option value="">{loadingBranches ? "Loading branches..." : "Select Branch"}</option>
                  {branches.map((b) => (
                    <option key={b.branchId || b.id || b.name} value={b.name}>
                      {b.name} {b.shopName ? `(${b.shopName})` : ''}
                    </option>
                  ))}
                  {formData.branch && !branches.some((b) => b.name === formData.branch) && (
                    <option value={formData.branch}>{formData.branch}</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="designation" className="form-label">Designation</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-briefcase"></i></span>
                <input
                  type="text"
                  className="form-control"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Enter designation"
                />
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="salary" className="form-label">Salary (₹)</label>
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">Employee Photo</label>
              <div className="file-upload-card">
                 <input
                   type="file"
                   id="photoUpload"
                   className="d-none"
                   accept="image/*"
                   onChange={(e) => handleFileChange(e, 'photo')}
                 />
                 <label htmlFor="photoUpload" className="file-upload-label btn btn-sm btn-outline-primary w-100">
                    <i className="bi bi-image me-1"></i> Choose Photo
                 </label>
                 {photoPreview && (
                    <div className="mt-2 text-center">
                       <img src={photoPreview} alt="Preview" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} className="shadow-sm border" />
                    </div>
                 )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">Employee Resume (PDF/Word)</label>
              <div className="file-upload-card">
                 <input
                   type="file"
                   id="resumeUpload"
                   className="d-none"
                   accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                   onChange={(e) => handleFileChange(e, 'resume')}
                 />
                 <label htmlFor="resumeUpload" className="file-upload-label btn btn-sm btn-outline-info w-100">
                    <i className="bi bi-file-earmark-text me-1"></i> Choose Resume File
                 </label>
                 {resumePreviewName && (
                    <div className="mt-2 small text-success fw-semibold">
                       <i className="bi bi-check-circle-fill me-1"></i> {resumePreviewName}
                    </div>
                 )}
              </div>
            </div>
          </div>

        </div>

        <div className="form-actions mt-4 d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-light"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-save me-1"></i> {initialData ? "Update Employee" : "Save Employee"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
