import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./Context/AuthContext";
import AppRoutes from "./Routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;