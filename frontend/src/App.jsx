import { useState, useEffect } from 'react';
import logo from './assets/logo.jpg';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function App() {
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState(null);

  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('CI/CD');
  const [formPriority, setFormPriority] = useState('medium');

  const [apiResponse, setApiResponse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch /health endpoint
  const fetchHealth = async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      setHealthError(err.message || 'Failed to reach health endpoint');
    } finally {
      setHealthLoading(false);
    }
  };

  // Fetch /api/v1/items endpoint
  const fetchItems = async () => {
    setItemsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/items`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setItemsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchItems();
  }, []);

  // Submit valid item
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setApiResponse(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          category: formCategory,
          priority: formPriority,
        }),
      });

      const data = await res.json();
      setApiResponse({
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        data,
      });

      if (res.ok) {
        setFormTitle('');
        fetchItems();
      }
    } catch (err) {
      setApiResponse({
        status: 500,
        statusText: 'Network / Client Error',
        ok: false,
        data: { error: err.message },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger intentionally invalid request (Demonstrating 400 Bad Request)
  const handleTriggerValidationError = async () => {
    setIsSubmitting(true);
    setApiResponse(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'x', // Intentionally < 3 characters
          priority: 'critical_emergency', // Intentionally invalid enum
        }),
      });

      const data = await res.json();
      setApiResponse({
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        data,
      });
    } catch (err) {
      setApiResponse({
        status: 500,
        statusText: 'Network Error',
        ok: false,
        data: { error: err.message },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete item
  const handleDeleteItem = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/items/${id}`, { method: 'DELETE' });
      const data = await res.json();
      setApiResponse({
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        data,
      });
      fetchItems();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  return (
    <div className="portal-container">
      {/* Header */}
      <header className="portal-header">
        <div className="header-left">
          <img src={logo} alt="MA Soft Tech Solutions" className="header-logo-img" />
          <div>
            <h1 className="portal-title">MA SOFT TECH SOLUTIONS</h1>
            <p className="portal-subtitle">DevOps Engineering Internship Assessment — Production Portal</p>
          </div>
        </div>
        <div className="header-right">
          <span className={`status-pill ${health?.status === 'UP' ? 'status-up' : 'status-down'}`}>
            <span className="status-dot"></span>
            System: {health?.status || 'CHECKING...'}
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <main className="portal-grid">
        {/* Card 1: System Health Endpoint */}
        <section className="portal-card">
          <div className="card-header">
            <div>
              <span className="endpoint-badge get">GET</span>
              <h2 className="card-title">/health Endpoint</h2>
            </div>
            <button className="btn btn-secondary" onClick={fetchHealth} disabled={healthLoading}>
              {healthLoading ? 'Checking...' : 'Refresh Health'}
            </button>
          </div>

          <div className="card-body">
            {healthError && <div className="alert alert-error">{healthError}</div>}
            {health ? (
              <div className="health-details">
                <div className="stat-grid">
                  <div className="stat-box">
                    <span className="stat-label">STATUS</span>
                    <span className="stat-value text-success">{health.status}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">DATABASE</span>
                    <span className="stat-value">{health.database?.mode || 'N/A'}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">UPTIME</span>
                    <span className="stat-value">{health.uptime}s</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">VERSION</span>
                    <span className="stat-value">{health.version}</span>
                  </div>
                </div>

                <div className="json-viewer-header">Raw Response Payload (JSON)</div>
                <pre className="json-viewer">{JSON.stringify(health, null, 2)}</pre>
              </div>
            ) : (
              <div className="loading-state">Loading health metrics...</div>
            )}
          </div>
        </section>

        {/* Card 2: Interactive API Endpoint & Input Validation Tester */}
        <section className="portal-card">
          <div className="card-header">
            <div>
              <span className="endpoint-badge post">POST</span>
              <h2 className="card-title">/api/v1/items — Input Validation Tester</h2>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit} className="api-form">
              <div className="form-group">
                <label htmlFor="itemTitle">Item Title (min 3, max 100 chars)</label>
                <input
                  id="itemTitle"
                  type="text"
                  placeholder="e.g. Set up Kubernetes cluster"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="itemCategory">Category</label>
                  <input
                    id="itemCategory"
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="itemPriority">Priority</label>
                  <select
                    id="itemPriority"
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="form-control"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Create Item (Expect 201)'}
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleTriggerValidationError}
                  disabled={isSubmitting}
                >
                  Trigger Validation Error (Expect 400)
                </button>
              </div>
            </form>

            {/* API Execution Result */}
            {apiResponse && (
              <div className="response-box">
                <div className="response-header">
                  <span>Latest API Response:</span>
                  <span
                    className={`status-code-tag ${
                      apiResponse.status === 201
                        ? 'code-201'
                        : apiResponse.status === 400
                        ? 'code-400'
                        : apiResponse.status === 200
                        ? 'code-200'
                        : 'code-error'
                    }`}
                  >
                    HTTP {apiResponse.status} {apiResponse.statusText}
                  </span>
                </div>
                <pre className="json-viewer">{JSON.stringify(apiResponse.data, null, 2)}</pre>
              </div>
            )}
          </div>
        </section>

        {/* Card 3: Live Items Store */}
        <section className="portal-card full-width">
          <div className="card-header">
            <div>
              <span className="endpoint-badge get">GET</span>
              <h2 className="card-title">Stored Application Items ({items.length})</h2>
            </div>
            <button className="btn btn-secondary" onClick={fetchItems} disabled={itemsLoading}>
              {itemsLoading ? 'Refreshing...' : 'Refresh List'}
            </button>
          </div>

          <div className="card-body">
            {items.length === 0 ? (
              <p className="empty-state">No items found in database. Create one using the form above!</p>
            ) : (
              <div className="items-table-wrapper">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Created At</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td><code>#{item.id}</code></td>
                        <td><strong>{item.title}</strong></td>
                        <td><span className="category-tag">{item.category}</span></td>
                        <td>
                          <span className={`priority-tag priority-${item.priority}`}>
                            {item.priority}
                          </span>
                        </td>
                        <td><small>{new Date(item.created_at || item.createdAt).toLocaleTimeString()}</small></td>
                        <td>
                          <button
                            className="btn-link text-danger"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="portal-footer">
        <p>MA SOFT TECH SOLUTIONS &bull; DevOps Technical Assessment &bull; Node.js {health?.system?.nodeVersion || 'v22'} &bull; React 18 &bull; Express 4 &bull; MySQL</p>
      </footer>
    </div>
  );
}
