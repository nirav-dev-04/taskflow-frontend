import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Demo users for testing (replace with real API later)
const DEMO_USERS = [
  {
    id: "1",
    name: "Alex Rivera",
    email: "admin@taskflow.com",
    password: "admin123",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  },
  {
    id: "2",
    name: "Sara Chen",
    email: "manager@taskflow.com",
    password: "manager123",
    role: "manager",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara",
  },
  {
    id: "3",
    name: "John Smith",
    email: "employee@taskflow.com",
    password: "employee123",
    role: "employee",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("taskflow_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem("taskflow_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("taskflow_user");
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const foundUser = DEMO_USERS.find(
        (u) => u.email === email && u.password === password,
      );

      if (!foundUser) {
        throw new Error("Invalid email or password");
      }

      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      return { success: true, user: userWithoutPassword };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("taskflow_user");
  };

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";
  const isEmployee = user?.role === "employee";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAdmin,
        isManager,
        isEmployee,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export default AuthContext;
