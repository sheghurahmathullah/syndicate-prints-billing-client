import { useState } from "react";
import toast from "react-hot-toast";
import { addExpenseItem, updateExpenseItem } from "../../Service/ExpenseService.js";
import "./ExpenseItemForm.css";

const ExpenseItemForm = ({ onSubmit, onCancel, editData = null }) => {
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState({
        name: editData?.name || "",
        type: editData?.type || "DAILY",
        addInAccount: editData?.addInAccount !== undefined ? editData.addInAccount : false,
    });

    const onChangeHandler = (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        const name = e.target.name;
        setData((data) => ({ ...data, [name]: value }));
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!data.name || data.name.trim() === "") {
            toast.error("Please enter expense item name");
            return;
        }

        setLoading(true);
        
        try {
            let response;
            if (editData?.expenseItemId) {
                response = await updateExpenseItem(editData.expenseItemId, data);
                if (response.status === 200) {
                    toast.success("Expense item updated successfully");
                    onSubmit(response.data);
                }
            } else {
                response = await addExpenseItem(data);
                if (response.status === 201) {
                    toast.success("Expense item added successfully");
                    onSubmit(response.data);
                }
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error saving expense item");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-form-wrapper fade-in">
            <div className="user-form-card">
                {/* Form Header Banner */}
                <div className="form-section-header mb-4">
                    <div className="form-header-badge ops-badge">
                        <i className="bi bi-tags-fill"></i>
                    </div>
                    <div>
                        <h6 className="form-section-title mb-0">
                            {editData ? "Edit Expense Item" : "Create New Expense Item"}
                        </h6>
                        <p className="form-section-subtitle mb-0">
                            Define catalog details and accounting inclusion rules
                        </p>
                    </div>
                </div>

                <form onSubmit={onSubmitHandler}>
                    <div className="row g-3">
                        {/* Item Name */}
                        <div className="col-md-7">
                            <div className="rich-form-group">
                                <label htmlFor="name" className="rich-form-label">
                                    Expense Item Name <span className="text-danger">*</span>
                                </label>
                                <div className="rich-input-group">
                                    <i className="bi bi-tag-fill rich-input-icon ops-icon"></i>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        className="rich-form-control"
                                        placeholder="e.g. Office Stationery, Fuel, Tea & Refreshments"
                                        onChange={onChangeHandler}
                                        value={data.name}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Expense Type */}
                        <div className="col-md-5">
                            <div className="rich-form-group">
                                <label htmlFor="type" className="rich-form-label">
                                    Expense Frequency <span className="text-danger">*</span>
                                </label>
                                <div className="rich-input-group">
                                    <i className="bi bi-calendar-event-fill rich-input-icon ops-icon"></i>
                                    <select
                                        name="type"
                                        id="type"
                                        className="rich-form-control"
                                        onChange={onChangeHandler}
                                        value={data.type}
                                        required
                                    >
                                        <option value="DAILY">Daily Expense</option>
                                        <option value="MONTHLY">Monthly Expense</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Add In Account Switch */}
                        <div className="col-12 mt-3">
                            <div className="ops-switch-card">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="ops-switch-icon">
                                            <i className="bi bi-calculator-fill"></i>
                                        </div>
                                        <div>
                                            <h6 className="mb-0 fw-bold text-dark">Accounting Calculation</h6>
                                            <p className="mb-0 text-muted small">Include this expense item in profit & loss accounting ledgers</p>
                                        </div>
                                    </div>
                                    <div className="form-check form-switch custom-status-switch">
                                        <input
                                            type="checkbox"
                                            name="addInAccount"
                                            id="addInAccount"
                                            className="form-check-input"
                                            onChange={onChangeHandler}
                                            checked={data.addInAccount}
                                        />
                                        <label htmlFor="addInAccount" className="form-check-label fw-bold ms-2">
                                            {data.addInAccount ? (
                                                <span className="text-emerald-active">Included</span>
                                            ) : (
                                                <span className="text-muted">Excluded</span>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Action Footer */}
                    <div className="form-action-footer mt-4">
                        <button
                            type="button"
                            className="btn-form-cancel"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            <i className="bi bi-x-circle me-1"></i> Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-form-submit-ops"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check2-circle me-1"></i>
                                    {editData ? "Update Item" : "Save Item"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseItemForm;
