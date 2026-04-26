import React from "react";

function ResourceTable({ resources, onEdit, onDelete, loading }) {
  return (
    <div className="m1-table-wrap">
      <div className="m1-table-scroll">
        <table className="m1-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Capacity</th>
              <th>Location</th>
              <th>Availability Window</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource.id}>
                <td className="m1-td-id">{resource.id}</td>
                <td>{resource.name}</td>
                <td>{resource.capacity}</td>
                <td>{resource.location}</td>
                <td>{resource.availabilityWindow}</td>
                <td>{resource.type}</td>
                <td>
                  <span className={`m1-badge ${resource.status === "ACTIVE" ? "active" : "inactive"}`}>
                    {resource.status}
                  </span>
                </td>
                <td>
                  <div className="m1-table-actions">
                    <button className="m1-btn-dark" onClick={() => onEdit(resource)}>Edit</button>
                    <button className="m1-btn-danger" onClick={() => onDelete(resource.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && resources.length === 0 && (
        <div className="m1-table-empty">No resources found.</div>
      )}
      {loading && (
        <div className="m1-table-empty">Loading resources...</div>
      )}
    </div>
  );
}

export default ResourceTable;
