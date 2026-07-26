import "./ManageBranches.css";
import BranchForm from "../../components/BranchForm/BranchForm.jsx";
import BranchList from "../../components/BranchList/BranchList.jsx";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchBranches } from "../../Service/BranchService.js";

const ManageBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadBranches();
  }, [page, size]);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const response = await fetchBranches(page, size);
      
      const { content, totalPages: fetchedTotalPages, totalElements: fetchedTotalElements } = response.data;
      
      setBranches(content || []);
      setTotalPages(fetchedTotalPages || 0);
      setTotalElements(fetchedTotalElements || 0);
    } catch (error) {
      console.error(error);
      toast.error("Unable to fetch branches");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (branch) => {
    setSelectedBranch(branch);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onAddClick = () => {
    setSelectedBranch(null);
    setIsFormOpen(true);
  };

  const onCloseForm = () => {
    setIsFormOpen(false);
    setSelectedBranch(null);
  };

  return (
    <div className="branches-page text-dark">
      <div className="branches-header">
        <div>
          <h2>Manage Branches</h2>
        </div>
        {!isFormOpen && (
          <button className="btn btn-primary add-branch-btn" onClick={onAddClick}>
            <i className="bi bi-plus-lg"></i> Add Branch
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="branch-form-section fade-in">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>
              <i className="bi bi-building-add"></i>{" "}
              {selectedBranch ? "Edit Branch" : "Add New Branch"}
            </h3>
            <button className="btn btn-outline-secondary btn-sm" onClick={onCloseForm}>
              <i className="bi bi-x-lg"></i> Close
            </button>
          </div>
          <BranchForm
            selectedBranch={selectedBranch}
            onClose={onCloseForm}
            refreshList={loadBranches}
          />
        </div>
      ) : (
        <div className="branch-list-section fade-in">
          <div className="branch-banner position-relative text-center text-white mb-4 rounded px-4 py-4" style={{ backgroundColor: '#002952' }}>
            <div className="position-absolute top-0 end-0 m-3 px-3 py-2 badge bg-light text-dark shadow-sm fw-bold">
              Total Branches: {totalElements}
            </div>
            <h3 className="fw-bold mb-2 text-uppercase tracking-wider">Branch Management</h3>
            <p className="mb-0 text-white-50 small">Comprehensive oversight and administration of all organizational branches</p>
          </div>
          <BranchList 
            branches={branches} 
            loading={loading}
            onEdit={onEdit} 
            refreshList={loadBranches} 
            page={page}
            setPage={setPage}
            size={size}
            setSize={setSize}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  );
};

export default ManageBranches;
