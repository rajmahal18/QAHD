import { Project, ProjectStatus } from "@prisma/client";
import LocationPicker from "@/components/LocationPicker";

export default function ProjectForm({
  action,
  project,
  error,
}: {
  action: (formData: FormData) => void | Promise<void>;
  project?: Project;
  error?: string;
}) {
  return (
    <form className="card formCard" action={action}>
      {error ? <div className="errorBox">{error}</div> : null}
      <div className="formGrid">
        <div className="field">
          <label htmlFor="projectCode">Project ID / Code</label>
          <input className="input" id="projectCode" name="projectCode" defaultValue={project?.projectCode} autoComplete="off" required />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select className="input" id="status" name="status" defaultValue={project?.status || ProjectStatus.ONGOING}>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
        <div className="field full">
          <label htmlFor="name">Project name</label>
          <input className="input" id="name" name="name" defaultValue={project?.name} autoComplete="off" required />
        </div>
        <LocationPicker
          initialLocation={project?.location || ""}
          initialLatitude={project?.latitude ?? null}
          initialLongitude={project?.longitude ?? null}
        />
        <div className="field full">
          <label htmlFor="contractor">Contractor</label>
          <input className="input" id="contractor" name="contractor" defaultValue={project?.contractor} autoComplete="off" required />
        </div>
        <div className="field">
          <label htmlFor="physicalAccomplishment">Physical accomplishment (%)</label>
          <input className="input" id="physicalAccomplishment" name="physicalAccomplishment" type="number" inputMode="numeric" min="0" max="100" defaultValue={project?.physicalAccomplishment ?? 0} required />
        </div>

        <details className="formDetails full" open={Boolean(project && (project.projectEngineer || project.projectInspector || project.materialsEngineer || project.laboratoryTechnician))}>
          <summary>Project team <span>Optional</span></summary>
          <div className="formGrid nestedFormGrid">
            <div className="field">
              <label htmlFor="projectEngineer">Project Engineer</label>
              <input className="input" id="projectEngineer" name="projectEngineer" defaultValue={project?.projectEngineer || ""} autoComplete="off" />
            </div>
            <div className="field">
              <label htmlFor="projectInspector">Project Inspector</label>
              <input className="input" id="projectInspector" name="projectInspector" defaultValue={project?.projectInspector || ""} autoComplete="off" />
            </div>
            <div className="field">
              <label htmlFor="materialsEngineer">Materials Engineer</label>
              <input className="input" id="materialsEngineer" name="materialsEngineer" defaultValue={project?.materialsEngineer || ""} autoComplete="off" />
            </div>
            <div className="field">
              <label htmlFor="laboratoryTechnician">Laboratory Technician</label>
              <input className="input" id="laboratoryTechnician" name="laboratoryTechnician" defaultValue={project?.laboratoryTechnician || ""} autoComplete="off" />
            </div>
          </div>
        </details>
      </div>
      <div className="formActions">
        <a className="button secondary" href={project ? `/projects/${project.id}` : "/projects"}>Cancel</a>
        <button className="button" type="submit">{project ? "Save changes" : "Create project"}</button>
      </div>
    </form>
  );
}
