import "./ManageMachine.css";
import MachineForm from "../../components/MachineForm/MachineForm.jsx";
import MachineList from "../../components/MachineList/MachineList.jsx";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchMachines } from "../../Service/MachineService.js";

const ManageMachine = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadMachines();
  }, [page, size]);

  const loadMachines = async () => {
    try {
      setLoading(true);
      const response = await fetchMachines(page, size);

      const pageData = response.data.page || response.data;
      const content = response.data.content || pageData.content || [];
      const totalPagesVal = pageData.totalPages || 1;
      const totalElementsVal = pageData.totalElements || content.length;

      setMachines(content);
      setTotalPages(totalPagesVal);
      setTotalElements(totalElementsVal);
    } catch (error) {
      console.error(error);
      toast.error("Unable to fetch machines");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (machine) => {
    setSelectedMachine(machine);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onAddClick = () => {
    setSelectedMachine(null);
    setIsFormOpen(true);
  };

  const onCloseForm = () => {
    setIsFormOpen(false);
    setSelectedMachine(null);
  };

  return (
    <div className="machines-page text-dark">
      {/* Premium Header Card */}
      <div className="manage-header-card mb-3">
        <div className="header-title-box">
          <div className="header-icon-badge">
            <i className="bi bi-printer-fill"></i>
          </div>
          <div>
            <h4 className="mb-0 fw-bold text-dark">Manage Machines</h4>
            <p className="mb-0 text-muted small">
              Comprehensive oversight and administration of all machines
            </p>
          </div>
        </div>

        {!isFormOpen && (
          <button className="btn-premium-add" onClick={onAddClick}>
            <i className="bi bi-plus-lg"></i>
            <span>Add Machine</span>
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="machine-form-section fade-in">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
              <i className="bi bi-printer text-primary"></i>{" "}
              {selectedMachine ? "Edit Machine Details" : "Add New Machine"}
            </h5>
            <button className="btn btn-outline-secondary btn-sm rounded-2" onClick={onCloseForm}>
              <i className="bi bi-x-lg me-1"></i> Close
            </button>
          </div>
          <MachineForm
            selectedMachine={selectedMachine}
            onClose={onCloseForm}
            refreshList={loadMachines}
          />
        </div>
      ) : (
        <div className="machine-list-section fade-in">
          {/* Responsive Banner */}
          <div className="machine-management-banner mb-3">
            <div className="banner-content">
              <h5 className="banner-title">MACHINE MANAGEMENT</h5>
              <p className="banner-subtitle">
                Comprehensive oversight and administration of all machines
              </p>
            </div>
            <div className="banner-stat-badge">
              TOTAL MACHINES: {totalElements || machines.length}
            </div>
          </div>
          <MachineList 
            machines={machines} 
            loading={loading}
            onEdit={onEdit} 
            refreshList={loadMachines} 
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

export default ManageMachine;
