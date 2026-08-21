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
      const response = await fetchPaperCategories(page, size);

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

      setCategories(content);
      setTotalPages(totalPagesVal);
      setTotalElements(totalElementsVal);
    } catch (err) {
      console.error(err);
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
      {/* Premium Header Card */}
      <div className="manage-header-card mb-3">
        <div className="header-title-box">
          <div className="header-icon-badge">
            <i className="bi bi-layers-fill"></i>
          </div>
          <div>
            <h4 className="mb-0 fw-bold text-dark">Paper Category</h4>
            <p className="mb-0 text-muted small">
              Manage and organize all paper categories
            </p>
          </div>
        </div>

        {!isFormOpen && (
          <button className="btn-premium-add" onClick={onAddClick}>
            <i className="bi bi-plus-lg"></i>
            <span>Add Category</span>
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="paper-form-section fade-in">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
              <i className="bi bi-layers text-primary"></i>
              {selectedCategory ? "Edit Category Details" : "Add New Category"}
            </h5>
            <button className="btn btn-outline-secondary btn-sm rounded-2" onClick={onCloseForm}>
              <i className="bi bi-x-lg me-1"></i> Close
            </button>
          </div>
          <PaperCategoryForm selectedCategory={selectedCategory} onClose={onCloseForm} refreshList={loadCategories} />
        </div>
      ) : (
        <div className="paper-list-section fade-in">
          {/* Responsive Banner */}
          <div className="paper-management-banner mb-3">
            <div className="banner-content">
              <h5 className="banner-title">PAPER CATEGORY MANAGEMENT</h5>
              <p className="banner-subtitle">
                Manage and organize all paper categories
              </p>
            </div>
            <div className="banner-stat-badge">
              TOTAL CATEGORIES: {totalElements || categories.length}
            </div>
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
