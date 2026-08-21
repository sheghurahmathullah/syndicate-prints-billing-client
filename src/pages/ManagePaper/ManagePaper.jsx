import "./ManagePaper.css";
import PaperForm from "../../components/PaperForm/PaperForm.jsx";
import PaperList from "../../components/PaperList/PaperList.jsx";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchPapers } from "../../Service/PaperService.js";

const ManagePaper = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => { loadPapers(); }, [page, size]);

  const loadPapers = async () => {
    try {
      setLoading(true);
      const response = await fetchPapers(page, size);

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

      setPapers(content);
      setTotalPages(totalPagesVal);
      setTotalElements(totalElementsVal);
    } catch (err) {
      console.error(err);
      toast.error("Unable to fetch papers");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (paper) => { setSelectedPaper(paper); setIsFormOpen(true); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const onAddClick = () => { setSelectedPaper(null); setIsFormOpen(true); };
  const onCloseForm = () => { setIsFormOpen(false); setSelectedPaper(null); };

  return (
    <div className="paper-page text-dark">
      {/* Premium Header Card */}
      <div className="manage-header-card mb-3">
        <div className="header-title-box">
          <div className="header-icon-badge">
            <i className="bi bi-file-earmark-text-fill"></i>
          </div>
          <div>
            <h4 className="mb-0 fw-bold text-dark">Paper Management</h4>
            <p className="mb-0 text-muted small">
              Comprehensive oversight and administration of paper stock
            </p>
          </div>
        </div>

        {!isFormOpen && (
          <button className="btn-premium-add" onClick={onAddClick}>
            <i className="bi bi-plus-lg"></i>
            <span>Add Paper</span>
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="paper-form-section fade-in">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
              <i className="bi bi-file-earmark-text text-primary"></i>
              {selectedPaper ? "Edit Paper Details" : "Add New Paper"}
            </h5>
            <button className="btn btn-outline-secondary btn-sm rounded-2" onClick={onCloseForm}>
              <i className="bi bi-x-lg me-1"></i> Close
            </button>
          </div>
          <PaperForm selectedPaper={selectedPaper} onClose={onCloseForm} refreshList={loadPapers} />
        </div>
      ) : (
        <div className="paper-list-section fade-in">
          {/* Responsive Banner */}
          <div className="paper-management-banner mb-3">
            <div className="banner-content">
              <h5 className="banner-title">PAPER INVENTORY MANAGEMENT</h5>
              <p className="banner-subtitle">
                Comprehensive oversight and administration of all paper stock
              </p>
            </div>
            <div className="banner-stat-badge">
              TOTAL PAPERS: {totalElements || papers.length}
            </div>
          </div>
          <PaperList
            papers={papers}
            loading={loading}
            onEdit={onEdit}
            refreshList={loadPapers}
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

export default ManagePaper;
