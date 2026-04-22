import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPortal.css";

const MODULES = [
  {
    title: "Module 1",
    subtitle: "Resource Management",
    path: "/m1",
  },
  {
    title: "Module 2",
    subtitle: "Student Portal",
    path: "/m2/admin",
  },
  {
    title: "Module 3",
    subtitle: "Ticketing and Support",
    path: "/m3",
  },
  {
    title: "Module 4",
    subtitle: "Auth and Security",
    path: "/m4",
  },
];

export default function AdminPortal() {
  const navigate = useNavigate();

  return (
    <div className="admin-portal">
      <div className="admin-portal__glow admin-portal__glow--one" />
      <div className="admin-portal__glow admin-portal__glow--two" />
      <div className="admin-portal__gridline" />
      <header className="admin-portal__header">
        <div>
          <p className="admin-portal__eyebrow">Admin Portal</p>
          <h1 className="admin-portal__title">SmartCampus Control Center</h1>
          <p className="admin-portal__subtitle">
            Choose a module to open its workspace.
          </p>
        </div>
        <button
          className="admin-portal__home"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </header>

      <section className="admin-portal__grid">
        {MODULES.map((module) => (
          <button
            key={module.title}
            className="admin-portal__card"
            onClick={() => navigate(module.path)}
          >
            <span className="admin-portal__card-title">{module.title}</span>
            <span className="admin-portal__card-subtitle">
              {module.subtitle}
            </span>
            <span className="admin-portal__card-action">Open module</span>
          </button>
        ))}
      </section>
    </div>
  );
}
