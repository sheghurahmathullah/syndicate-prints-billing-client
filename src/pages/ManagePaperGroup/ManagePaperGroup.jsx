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
      const response = await fetchPaperGroups(page, size);

      const data = response.data;
      let content = [];
      let totalPagesVal = 1;
      let totalElementsVal = 0;

      if (Array.isArray(data)) {
        content = data;
        totalElementsVal = data.length;
      } else if (data) {
        const pageData = data.page || data;
        content = data.content || pageData.content || [];
        totalPagesVal = pageData.totalPages !== undefined ? pageData.totalPages : 1;
        totalElementsVal = pageData.totalElements !== undefined && pageData.totalElements !== null ? pageData.totalElements : content.length;
      }

      setGroups(content);
      setTotalPages(totalPagesVal);
      setTotalElements(totalElementsVal);
    } catch (err) {
      console.error(err);
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
      {/* Premium Header Card */}
      <div className="manage-header-card mb-3">
        <div className="header-title-box">
          <div className="header-icon-badge">
            <i className="bi bi-collection-fill"></i>
          </div>
          <div>
            <h4 className="mb-0 fw-bold text-dark">Paper Groups</h4>
            <p className="mb-0 text-muted small">
              Manage and organize all paper groups
            </p>
          </div>
        </div>

        {!isFormOpen && (
          <button className="btn-premium-add" onClick={onAddClick}>
            <i className="bi bi-plus-lg"></i>
            <span>Add Group</span>
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="paper-form-section fade-in">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
              <i className="bi bi-collection text-primary"></i>
              {selectedGroup ? "Edit Group Details" : "Add New Group"}
            </h5>
            <button className="btn btn-outline-secondary btn-sm rounded-2" onClick={onCloseForm}>
              <i className="bi bi-x-lg me-1"></i> Close
            </button>
          </div>
          <PaperGroupForm selectedGroup={selectedGroup} onClose={onCloseForm} refreshList={loadGroups} />
        </div>
      ) : (
        <div className="paper-list-section fade-in">
          {/* Responsive Banner */}
          <div className="paper-management-banner mb-3">
            <div className="banner-content">
              <h5 className="banner-title">PAPER GROUP MANAGEMENT</h5>
              <p className="banner-subtitle">
                Manage and organize all paper groups
              </p>
            </div>
            <div className="banner-stat-badge">
              TOTAL GROUPS: {totalElements || groups.length}
            </div>
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
