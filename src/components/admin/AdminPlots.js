import React, { useState, useEffect } from 'react';
import { FiX, FiHome, FiMapPin, FiDollarSign, FiTag, FiEye, FiEdit } from 'react-icons/fi';
import "./plotStyle.css";
import Swal from 'sweetalert2';

const AdminPlots = () => {
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewPlot, setViewPlot] = useState(null);
  const [editPlot, setEditPlot] = useState(null);

  const [newPlot, setNewPlot] = useState({
    number: '',
    location: '',
    dimension: '',
    price: '',
    status: 'Available',
    owner: ''
  });

  useEffect(() => {
    fetch("https://musabaha-home-ltd.onrender.com/api/plots")
      .then(res => res.json())
      .then(data => {
        if (data.success) setPlots(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching plots:", err);
        setLoading(false);
      });
  }, []);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleInputChange = (e) => {
    setNewPlot({ ...newPlot, [e.target.name]: e.target.value });
  };

  const handleCreatePlot = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://musabaha-home-ltd.onrender.com/api/plots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlot),
      });
      const data = await res.json();
      if (data.success) {
        setPlots([...plots, data.data]);
        Swal.fire({
          icon: 'success',
          title: 'Plot Created!',
          text: `Plot ${data.data.number} was added successfully.`,
          timer: 2000,
          showConfirmButton: false
        });
        setShowCreateModal(false);
        setNewPlot({ number: '', location: '', dimension: '', price: '', status: 'Available', owner: '' });
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: data.message || 'Something went wrong!' });
      }
    } catch (error) {
      console.error("Error creating plot:", error);
      Swal.fire({ icon: 'error', title: 'Network Error', text: 'Could not connect to server. Try again later.' });
    }
  };

  const filteredPlots = filter === 'all'
    ? plots
    : plots.filter(plot => plot.status.toLowerCase() === filter.toLowerCase());

  if (loading) return <div className="loading">Loading plots...</div>;

  return (
    <div className="admin-content">
      <div className="content-header">
        <h2>Plot Management</h2>
        <div className="header-actions">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Plots</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="reserved">Reserved</option>
          </select>
          <button className="icon-btn primary" onClick={() => setShowCreateModal(true)} data-tooltip="Add Plot">
            <FiHome />
          </button>
        </div>
      </div>

      <div className="plots-grid">
        {filteredPlots.map(plot => (
          <div key={plot.id} className="plot-card">
            <div className="plot-header">
              <h3>Plot {plot.number}</h3>
              <span className={`status-badge ${plot.status.toLowerCase()}`}>
                {plot.status}
              </span>
            </div>
            <div className="plot-details">
              <p><strong>Size:</strong> {plot.dimension}</p>
              <p><strong>Price:</strong> {formatPrice(plot.price)}</p>
              <p><strong>Location:</strong> {plot.location}</p>
              {plot.owner && <p><strong>Owner:</strong> {plot.owner}</p>}
            </div>
            <div className="plot-actions">
              <button className="icon-btn info" onClick={() => setViewPlot(plot)} data-tooltip="View"><FiEye /></button>
              <button className="icon-btn warning" onClick={() => setEditPlot(plot)} data-tooltip="Edit"><FiEdit /></button>
              {plot.status === 'Available' && (
                <button className="icon-btn success" data-tooltip="Sell"><FiDollarSign /></button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FiHome /> Add New Plot</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreatePlot}>
                {["number", "location", "dimension", "price"].map(field => (
                  <div className="form-group" key={field}>
                    <label>{field.charAt(0).toUpperCase() + field.slice(1)} *</label>
                    <input
                      type={field === "price" ? "number" : "text"}
                      name={field}
                      value={newPlot[field]}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                ))}
                <div className="form-group">
                  <label>Status *</label>
                  <select name="status" value={newPlot.status} onChange={handleInputChange} required>
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Owner</label>
                  <input
                    type="text"
                    name="owner"
                    value={newPlot.owner}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="icon-btn secondary" onClick={() => setShowCreateModal(false)}><FiX /></button>
                  <button type="submit" className="icon-btn primary"><FiHome /></button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewPlot && (
        <div className="modal-overlay" onClick={() => setViewPlot(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FiEye /> Plot Details</h3>
              <button className="modal-close" onClick={() => setViewPlot(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <p><strong>Number:</strong> {viewPlot.number}</p>
              <p><strong>Location:</strong> {viewPlot.location}</p>
              <p><strong>Dimension:</strong> {viewPlot.dimension}</p>
              <p><strong>Price:</strong> {formatPrice(viewPlot.price)}</p>
              <p><strong>Status:</strong> {viewPlot.status}</p>
              {viewPlot.owner && <p><strong>Owner:</strong> {viewPlot.owner}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editPlot && (
        <div className="modal-overlay" onClick={() => setEditPlot(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FiEdit /> Edit Plot</h3>
              <button className="modal-close" onClick={() => setEditPlot(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch(`https://musabaha-home-ltd.onrender.com/api/plots/${editPlot.id}`, {
                    method: 'PUT',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editPlot),
                  });
                  const data = await res.json();
                  if (data.success) {
                    const updated = plots.map(p => p.id === editPlot.id ? data.data : p);
                    setPlots(updated);
                    Swal.fire({
                      icon: 'success',
                      title: 'Plot Updated!',
                      text: `Plot ${data.data.number} was updated successfully.`,
                      timer: 2000,
                      showConfirmButton: false
                    });
                    setEditPlot(null);
                  } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: data.message || 'Update failed.' });
                  }
                } catch (err) {
                  console.error(err);
                  Swal.fire({ icon: 'error', title: 'Network Error', text: 'Try again later.' });
                }
              }}>
                {["number", "location", "dimension", "price"].map(field => (
                  <div className="form-group" key={field}>
                    <label>{field.charAt(0).toUpperCase() + field.slice(1)} *</label>
                    <input
                      type={field === "price" ? "number" : "text"}
                      name={field}
                      value={editPlot[field]}
                      onChange={(e) => setEditPlot({ ...editPlot, [field]: e.target.value })}
                      required
                    />
                  </div>
                ))}
                <div className="form-group">
                  <label>Status *</label>
                  <select name="status" value={editPlot.status} onChange={(e) => setEditPlot({ ...editPlot, status: e.target.value })} required>
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Owner</label>
                  <input
                    type="text"
                    name="owner"
                    value={editPlot.owner}
                    onChange={(e) => setEditPlot({ ...editPlot, owner: e.target.value })}
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="icon-btn secondary" onClick={() => setEditPlot(null)}><FiX /></button>
                  <button type="submit" className="icon-btn warning"><FiEdit /></button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlots;
