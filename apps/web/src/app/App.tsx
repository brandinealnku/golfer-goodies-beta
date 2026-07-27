import { HashRouter } from 'react-router-dom';
import { AppRoutes } from '../routes/AppRoutes';
import { CourseContextProvider } from '../state/course-context';
export function App() {
  return (
    <HashRouter>
      <CourseContextProvider>
        <AppRoutes />
      </CourseContextProvider>
    </HashRouter>
  );
}
