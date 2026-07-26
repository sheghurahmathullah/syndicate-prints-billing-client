import "./ManagePaperGroup.css";
import PaperGroupForm from "../../components/PaperGroupForm/PaperGroupForm.jsx";
import PaperGroupList from "../../components/PaperGroupList/PaperGroupList.jsx";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchPaperGroups } from "../../Service/PaperService.js";

const ManagePaperGroup = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => { loadGroups(); }, [page, size]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const { data } = await fetchPaperGroups(page, size);
      setGroups(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch {
      toast.error("Unable to fetch paper groups");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (grp) => { setSelectedGroup(grp); setIsFormOpen(true); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const onAddClick = () => { setSelectedGroup(null); setIsFormOpen(true); };
  const onCloseForm = () => { setIsFormOpen(false); setSelectedGroup(null); };

  return (
    <div className="paper-group-page text-dark">
      <div className="paper-page-header mb-3">
        <div>
          <h4 className="mb-0">Paper Groups</h4>
        </div>
        {!isFormOpen && (
          <button className="btn btn-primary btn-sm paper-add-btn" onClick={onAddClick}>
            <i className="bi bi-plus-lg" /> Add Group
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="paper-form-section fade-in">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">
              <i className="bi bi-collection me-1" />
              {selectedGroup ? "Edit Group" : "Add New Group"}
            </h5>
            <button className="btn btn-outline-secondary btn-sm" onClick={onCloseForm}>
              <i className="bi bi-x-lg" /> Close
            </button>
          </div>
          <PaperGroupForm selectedGroup={selectedGroup} onClose={onCloseForm} refreshList={loadGroups} />
        </div>
      ) : (
        <div className="paper-list-section fade-in">
          <div className="paper-banner position-relative text-center text-white mb-3 rounded px-3 py-3" style={{ backgroundColor: "#1a3a5c" }}>
            <div className="position-absolute top-0 end-0 m-2 px-2 py-1 badge bg-light text-dark shadow-sm fw-bold small">
              Total: {totalElements}
            </div>
            <h5 className="fw-bold mb-1 text-uppercase tracking-wider">Paper Group Management</h5>
            <p className="mb-0 text-white-50" style={{ fontSize: "0.8rem" }}>Manage and organise all paper groups</p>
          </div>
          <PaperGroupList
            groups={groups}
            loading={loading}
            onEdit={onEdit}
            refreshList={loadGroups}
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

export default ManagePaperGroup;
