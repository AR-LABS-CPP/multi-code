import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import ConnectPage from "./pages/ConnectPage"
import EditorPage from "./pages/EditorPage"
import ErrorPage from "./pages/ErrorPage"

const router = createBrowserRouter([
  {
    path: "/",
    element: <ConnectPage />,
  },
  {
    path: "/editor/:projectId",
    element: <EditorPage />
  },
  {
    path: "*",
    element: <ErrorPage />
  }
])

const App = () => {
  return (
    <>
      <div>
        <Toaster position="top-right">
        </Toaster>
      </div>
      <RouterProvider router={router} />
    </>
  )
}

export default App