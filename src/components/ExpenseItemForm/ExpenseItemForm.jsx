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
        <div className="expense-item-form-wrapper">
            <div className="card form-container">
                <div className="card-body">
                    <h4 className="form-title">
                        <i className="bi bi-receipt"></i>
                        {editData ? "Edit Expense Item" : "Add New Expense Item"}
                    </h4>
                    <form onSubmit={onSubmitHandler}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label fw-bold">Name</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                className="form-control"
                                placeholder="Enter expense item name"
                                onChange={onChangeHandler}
                                value={data.name}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="type" className="form-label fw-bold">Type</label>
                            <select
                                name="type"
                                id="type"
                                className="form-select"
                                onChange={onChangeHandler}
                                value={data.type}
                                required
                            >
                                <option value="DAILY">Daily</option>
                                <option value="MONTHLY">Monthly</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <div className="form-check form-switch">
                                <input
                                    type="checkbox"
                                    name="addInAccount"
                                    id="addInAccount"
                                    className="form-check-input"
                                    onChange={onChangeHandler}
                                    checked={data.addInAccount}
                                />
                                <label htmlFor="addInAccount" className="form-check-label fw-bold">
                                    Add in Account
                                </label>
                            </div>
                            <small className="text-muted">Enable to include this expense in account calculations</small>
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onCancel}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                            >
                                {loading ? "Saving..." : editData ? "Update" : "Add Item"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ExpenseItemForm;
