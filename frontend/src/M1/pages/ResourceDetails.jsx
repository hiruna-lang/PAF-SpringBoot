import React from "react";

function ResourceDetails({ resource, setCurrentPage }) {
  if (!resource) {
    return (
      <div className="m1-page">
        <h2 className="m1-page-title">Resource Details</h2>
        <p className="m1-page-sub">No resource selected.</p>
        <div>
          <button className="m1-btn-secondary" onClick={() => setCurrentPage("view")}>
            Back to View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="m1-page">
      <div className="m1-page-header">
        <div>
          <h2 className="m1-page-title">Resource Details</h2>
          <p className="m1-page-sub">Detailed view for resource ID {resource.id}.</p>
        </div>
        <button className="m1-btn-secondary" onClick={() => setCurrentPage("view")}>
          Back to View
        </button>
      </div>

      <div className="m1-card-lg">
        <div className="m1-details-header">
          <div>
            <p className="m1-details-name-label">Resource</p>
            <p className="m1-details-name">{resource.name}</p>
          </div>
          <span className={`m1-badge ${resource.status === "ACTIVE" ? "active" : "inactive"}`}>
            {resource.status}
          </span>
        </div>

        <dl className="m1-dl-grid">
          {[
            { label: "Name", value: resource.name },
            { label: "Capacity", value: resource.capacity },
            { label: "Location", value: resource.location },
            { label: "Availability Window", value: resource.availabilityWindow },
            { label: "Type", value: resource.type },
            { label: "Status", value: resource.status },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="m1-dl-term">{label}</dt>
              <dd className="m1-dl-def">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export default ResourceDetails;
