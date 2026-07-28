import { HashRouter } from 'react-router-dom';
import { AppRoutes } from '../routes/AppRoutes';
import { CourseContextProvider } from '../state/course-context';
import { CartProvider } from '../state/cart';
import { DemoOrderProvider } from '../state/demo-orders';
import { Component, type ErrorInfo, type ReactNode } from 'react';
class AppErrorBoundary extends Component<
  { children: ReactNode },
  { error?: Error }
> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info);
  }
  render() {
    if (this.state.error)
      return (
        <main className="page recovery">
          <h1>Let’s get you back on course</h1>
          <p>
            Golfer Goodies hit an unexpected snag. Your saved demo data has not
            been removed.
          </p>
          <div className="button-row">
            <button className="button" onClick={() => location.reload()}>
              Refresh app
            </button>
            <a className="button secondary" href="#/discover">
              Return to course discovery
            </a>
          </div>
          {import.meta.env.DEV && (
            <details>
              <summary>Development details</summary>
              <pre>{this.state.error.message}</pre>
            </details>
          )}
        </main>
      );
    return this.props.children;
  }
}
export function App() {
  return (
    <AppErrorBoundary>
      <HashRouter>
        <CourseContextProvider>
          <CartProvider>
            <DemoOrderProvider>
              <AppRoutes />
            </DemoOrderProvider>
          </CartProvider>
        </CourseContextProvider>
      </HashRouter>
    </AppErrorBoundary>
  );
}
