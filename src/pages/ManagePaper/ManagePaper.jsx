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

      const pageData = response.data.page || response.data;
      const content = response.data.content || pageData.content || [];
      const totalPages = pageData.totalPages || 0;
      const totalElements = pageData.totalElements || 0;

      setPapers(content);
      setTotalPages(totalPages);
      setTotalElements(totalElements);
    } catch {
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
      <div className="paper-page-header mb-3">
        <div>
          <h4 className="mb-0">Papers</h4>
        </div>
        {!isFormOpen && (
          <button className="btn btn-primary btn-sm paper-add-btn" onClick={onAddClick}>
            <i className="bi bi-plus-lg" /> Add Paper
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="paper-form-section fade-in">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">
              <i className="bi bi-file-earmark-text me-1" />
              {selectedPaper ? "Edit Paper" : "Add New Paper"}
            </h5>
            <button className="btn btn-outline-secondary btn-sm" onClick={onCloseForm}>
              <i className="bi bi-x-lg" /> Close
            </button>
          </div>
          <PaperForm selectedPaper={selectedPaper} onClose={onCloseForm} refreshList={loadPapers} />
        </div>
      ) : (
        <div className="paper-list-section fade-in">
          <div className="paper-banner position-relative text-center text-white mb-3 rounded px-3 py-3" style={{ backgroundColor: "#1a3a5c" }}>
            <div className="position-absolute top-0 end-0 m-2 px-2 py-1 badge bg-light text-dark shadow-sm fw-bold small">
              Total: {totalElements}
            </div>
            <h5 className="fw-bold mb-1 text-uppercase tracking-wider">Paper Management</h5>
            <p className="mb-0 text-white-50" style={{ fontSize: "0.8rem" }}>Comprehensive oversight and administration of all paper stock</p>
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
