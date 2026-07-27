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
      const totalPages = pageData.totalPages || 0;
      const totalElements = pageData.totalElements || 0;

      setMachines(content);
      setTotalPages(totalPages);
      setTotalElements(totalElements);
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
      <div className="machines-header mb-3">
        <div>
          <h4 className="mb-0">Manage Machines</h4>
        </div>
        {!isFormOpen && (
          <button className="btn btn-primary btn-sm add-machine-btn" onClick={onAddClick}>
            <i className="bi bi-plus-lg"></i> Add Machine
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="machine-form-section fade-in">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">
              <i className="bi bi-printer"></i>{" "}
              {selectedMachine ? "Edit Machine" : "Add New Machine"}
            </h5>
            <button className="btn btn-outline-secondary btn-sm" onClick={onCloseForm}>
              <i className="bi bi-x-lg"></i> Close
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
          <div className="machine-banner position-relative text-center text-white mb-3 rounded px-3 py-3" style={{ backgroundColor: '#002952' }}>
            <div className="position-absolute top-0 end-0 m-2 px-2 py-1 badge bg-light text-dark shadow-sm fw-bold small">
              Total Machines: {totalElements}
            </div>
            <h5 className="fw-bold mb-1 text-uppercase tracking-wider">Machine Management</h5>
            <p className="mb-0 text-white-50" style={{ fontSize: '0.8rem' }}>Comprehensive oversight and administration of all machines</p>
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
