import "./ManageMachineCategory.css";
import MachineCategoryForm from "../../components/MachineCategoryForm/MachineCategoryForm.jsx";
import MachineCategoryList from "../../components/MachineCategoryList/MachineCategoryList.jsx";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchMachineCategories } from "../../Service/MachineCategoryService.js";

const ManageMachineCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [page, size]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetchMachineCategories(page, size);

      const pageData = response.data.page || response.data;
      const content = response.data.content || pageData.content || [];
      const totalPages = pageData.totalPages || 0;
      const totalElements = pageData.totalElements || 0;

      setCategories(content);
      setTotalPages(totalPages);
      setTotalElements(totalElements);
    } catch (error) {
      console.error(error);
      toast.error("Unable to fetch machine categories");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onAddClick = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  const onCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div className="machine-categories-page text-dark">
      <div className="machine-categories-header mb-3">
        <div>
          <h4 className="mb-0">Manage Machine Category</h4>
        </div>
        {!isFormOpen && (
          <button className="btn btn-primary btn-sm add-category-btn" onClick={onAddClick}>
            <i className="bi bi-plus-lg"></i> Add Category
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="category-form-section fade-in">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">
              <i className="bi bi-diagram-3"></i>{" "}
              {selectedCategory ? "Edit Category" : "Add New Category"}
            </h5>
            <button className="btn btn-outline-secondary btn-sm" onClick={onCloseForm}>
              <i className="bi bi-x-lg"></i> Close
            </button>
          </div>
          <MachineCategoryForm
            selectedCategory={selectedCategory}
            onClose={onCloseForm}
            refreshList={loadCategories}
          />
        </div>
      ) : (
        <div className="category-list-section fade-in">
          <div className="category-banner position-relative text-center text-white mb-3 rounded px-3 py-3" style={{ backgroundColor: '#002952' }}>
            <div className="position-absolute top-0 end-0 m-2 px-2 py-1 badge bg-light text-dark shadow-sm fw-bold small">
              Total Categories: {totalElements}
            </div>
            <h5 className="fw-bold mb-1 text-uppercase tracking-wider">Machine Category Management</h5>
            <p className="mb-0 text-white-50" style={{ fontSize: '0.8rem' }}>Comprehensive oversight and administration of machine categories</p>
          </div>
          <MachineCategoryList 
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

export default ManageMachineCategory;
