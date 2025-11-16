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
        <div className="mx-2 mt-2">
            <div className="row">
                <h4 className="text-dark">Create New User</h4>
                <div className="card col-md-12 form-container">
                    <div className="card-body">
                        <form onSubmit={onSubmitHandler}>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Name</label>
                                <input type="text"
                                       name="name"
                                       id="name"
                                       className="form-control"
                                       placeholder="John Doe"
                                       onChange={onChangeHandler}
                                       value={data.name}
                                       required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input type="email"
                                       name="email"
                                       id="email"
                                       className="form-control"
                                       placeholder="yourname@example.com"
                                       onChange={onChangeHandler}
                                       value={data.email}
                                       required
                                />
                            </div>
                            <div className="mb-3 position-relative">
                                <label htmlFor="password" className="form-label">Password</label>
                                <input type={showPassword ? 'text' : 'password'}
                                       name="password"
                                       id="password"
                                       className="form-control"
                                       placeholder="******"
                                       onChange={onChangeHandler}
                                       value={data.password}
                                       required
                                />
                                <button type="button" className="password-toggle" onClick={() => setShowPassword(s => !s)} aria-label="Toggle password visibility">
                                    {showPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                </button>
                            </div>
                            <button type="submit" className="btn  btn-warning w-100" disabled={loading}>
                                {loading ? "Loading..." : (data.userId ? 'Update User' : 'Save')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        
    )
}

export default UserForm;