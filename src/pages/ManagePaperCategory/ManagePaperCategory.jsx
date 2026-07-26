import "./ManagePaperCategory.css";
import PaperCategoryForm from "../../components/PaperCategoryForm/PaperCategoryForm.jsx";
import PaperCategoryList from "../../components/PaperCategoryList/PaperCategoryList.jsx";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchPaperCategories } from "../../Service/PaperService.js";

const ManagePaperCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => { loadCategories(); }, [page, size]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data } = await fetchPaperCategories(page, size);
      setCategories(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch {
      toast.error("Unable to fetch paper categories");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (cat) => { setSelectedCategory(cat); setIsFormOpen(true); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const onAddClick = () => { setSelectedCategory(null); setIsFormOpen(true); };
  const onCloseForm = () => { setIsFormOpen(false); setSelectedCategory(null); };

  return (
    <div className="paper-category-page text-dark">
      <div className="paper-page-header mb-3">
        <div>
          <h4 className="mb-0">Paper Category</h4>
        </div>
        {!isFormOpen && (
          <button className="btn btn-primary btn-sm paper-add-btn" onClick={onAddClick}>
            <i className="bi bi-plus-lg" /> Add Category
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="paper-form-section fade-in">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">
              <i className="bi bi-layers me-1" />
              {selectedCategory ? "Edit Category" : "Add New Category"}
            </h5>
            <button className="btn btn-outline-secondary btn-sm" onClick={onCloseForm}>
              <i className="bi bi-x-lg" /> Close
            </button>
          </div>
          <PaperCategoryForm selectedCategory={selectedCategory} onClose={onCloseForm} refreshList={loadCategories} />
        </div>
      ) : (
        <div className="paper-list-section fade-in">
          <div className="paper-banner position-relative text-center text-white mb-3 rounded px-3 py-3" style={{ backgroundColor: "#1a3a5c" }}>
            <div className="position-absolute top-0 end-0 m-2 px-2 py-1 badge bg-light text-dark shadow-sm fw-bold small">
              Total: {totalElements}
            </div>
            <h5 className="fw-bold mb-1 text-uppercase tracking-wider">Paper Category Management</h5>
            <p className="mb-0 text-white-50" style={{ fontSize: "0.8rem" }}>Manage and organise all paper categories</p>
          </div>
          <PaperCategoryList
            categories={categories}
            loading={loading}
            onEdit={onEdit}
            refreshList={loadCategories}
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

export default ManagePaperCategory;
