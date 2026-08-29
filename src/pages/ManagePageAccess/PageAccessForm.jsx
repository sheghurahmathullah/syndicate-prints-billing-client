import { useState } from "react";
import toast from "react-hot-toast";

const PageAccessForm = ({ onCreate }) => {
  const [formData, setFormData] = useState({
    page: "",
    admin: true,
    manager: false,
    employee: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.page.trim()) {
      toast.error("Page Name is required");
      return;
    }

    try {
      setLoading(true);
      await onCreate(formData);
      setFormData({
        page: "",
        admin: true,
        manager: false,
        employee: false,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Add New Page</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="page">Page Identifier (e.g. DASHBOARD)</label>
          <input
            type="text"
            id="page"
            name="page"
            className="form-control"
            value={formData.page}
            onChange={handleChange}
            placeholder="Enter unique page name"
            required
          />
        </div>

        <div className="checkbox-group">
          <div className="checkbox-item">
            <span>Admin Access</span>
            <label className="switch">
              <input
                type="checkbox"
                name="admin"
                checked={formData.admin}
                onChange={handleChange}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="checkbox-item">
            <span>Manager Access</span>
            <label className="switch">
              <input
                type="checkbox"
                name="manager"
                checked={formData.manager}
                onChange={handleChange}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="checkbox-item">
            <span>Employee Access</span>
            <label className="switch">
              <input
                type="checkbox"
                name="employee"
                checked={formData.employee}
                onChange={handleChange}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Adding..." : "Add Page Access"}
        </button>
      </form>
    </div>
  );
};

export default PageAccessForm;
