import {useState, useEffect} from "react";
import {addUser, updateUser} from "../../Service/UserService.js";
import toast from "react-hot-toast";
import './UserForm.css';

const UserForm = ({setUsers, selectedUser, onUpdateUser}) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        role: "ROLE_USER"
    });
    const [showPassword, setShowPassword] = useState(false);

    const onChangeHandler = (e) => {
        const value = e.target.value;
        const name = e.target.name;
        setData((data) => ({ ...data, [name]: value }));
    }

    // when selectedUser changes, populate or clear the form
    useEffect(() => {
        if (selectedUser && selectedUser.userId) {
            setData({
                name: selectedUser.name || '',
                email: selectedUser.email || '',
                password: '',
                role: selectedUser.role || 'ROLE_USER',
                userId: selectedUser.userId
            });
        } else if (!selectedUser) {
            setData({ name: '', email: '', password: '', role: 'ROLE_USER' });
        }
    }, [selectedUser]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (data.userId) { // update existing user
                const response = await updateUser(data.userId, data);
                // If backend returns updated user use it; otherwise fall back to local form data
                const updatedUser = (response && response.data && response.data.userId) ? response.data : { ...data };
                onUpdateUser && onUpdateUser(updatedUser);
                toast.success("User updated");
            } else { // create new user
                const response = await addUser(data);
                setUsers((prevUsers) => [...prevUsers, response.data]);
                toast.success("User Added");
            }
            setData({
                name: "",
                email: "",
                password: "",
                role: "ROLE_USER",
            })

        } catch (e) {
            console.error(e);
            toast.error("Error adding user");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="custom-user-form-container">
            <div className="form-header-section">
                <div className="title-wrapper">
                    <div className="blue-vertical-line"></div>
                    <h3 className="form-main-title">
                        <i className="bi bi-person-plus-fill icon-red"></i> {selectedUser ? "EDIT USER" : "ADD NEW USER"}
                    </h3>
                </div>
                <div className="red-horizontal-line"></div>
            </div>

            <h4 className="form-subtitle">Create New User</h4>

            <form onSubmit={onSubmitHandler} className="user-form-body">
                <div className="form-group mb-3">
                    <label htmlFor="name" className="custom-label">NAME</label>
                    <input type="text"
                           name="name"
                           id="name"
                           className="custom-input"
                           placeholder="John Doe"
                           onChange={onChangeHandler}
                           value={data.name}
                           required
                    />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="email" className="custom-label">EMAIL</label>
                    <input type="email"
                           name="email"
                           id="email"
                           className="custom-input"
                           placeholder="yourname@example.com"
                           onChange={onChangeHandler}
                           value={data.email}
                           required
                    />
                </div>
                <div className="form-group mb-4 position-relative">
                    <label htmlFor="password" className="custom-label">PASSWORD</label>
                    <div className="password-input-wrapper">
                        <input type={showPassword ? 'text' : 'password'}
                               name="password"
                               id="password"
                               className="custom-input password-input"
                               placeholder="******"
                               onChange={onChangeHandler}
                               value={data.password}
                               required={!data.userId} 
                        />
                        <button type="button" className="custom-password-toggle" onClick={() => setShowPassword(s => !s)} aria-label="Toggle password visibility">
                            {showPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                        </button>
                    </div>
                </div>
                <button type="submit" className="custom-save-btn w-100" disabled={loading}>
                    {loading ? "SAVING..." : (data.userId ? 'UPDATE USER' : 'SAVE')}
                </button>
            </form>
        </div>
    )
}

export default UserForm;