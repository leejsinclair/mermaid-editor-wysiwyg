import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { Editor } from "../editor/Editor";
import { claimDiagram, loadDiagram, takeDiagram, whenTaken } from "../editor/library";
import { forgetSession, recallSession } from "../editor/sessions";
import { isC4Kind } from "../model/kinds";
import { newDiagram } from "../model/newDiagram";
import type { Diagram } from "../model/types";
import { LockDialogs } from "../rendering/shared/LockDialogs";

function diagramFor(type: string | undefined, kind: string | undefined): Diagram | undefined {
  const id = crypto.randomUUID();
  if (kind !== undefined) return isC4Kind(kind) ? newDiagram(id, "c4", kind) : undefined;
  if (type === "flowchart" || type === "sequence") return newDiagram(id, type);
  return undefined;
}

/** Where a diagram comes from: made new, still in memory from this page's session, or read from storage. */
type Source =
  | { readonly kind: "ready"; readonly diagram: Diagram; readonly stored: boolean; readonly version: number }
  | { readonly kind: "loading" }
  | { readonly kind: "none" };

function useSource(id: string | undefined, type: string | undefined, kind: string | undefined) {
  const [source, setSource] = useState<Source>(() => {
    const made = id === undefined ? diagramFor(type, kind) : recallSession(id)?.state.history.present;
    if (made !== undefined) return { kind: "ready", diagram: made, stored: false, version: 0 };
    return id === undefined ? { kind: "none" } : { kind: "loading" };
  });
  const loading = source.kind === "loading";
  useEffect(() => {
    if (!loading || id === undefined) return;
    let current = true;
    void loadDiagram(id).then(
      (result) => {
        if (current) setSource(result.kind === "ok" ? { kind: "ready", diagram: result.diagram, stored: true, version: 0 } : { kind: "none" });
      },
      () => {
        if (current) setSource({ kind: "none" });
      },
    );
    return () => {
      current = false;
    };
  }, [id, loading]);
  return [source, setSource] as const;
}

/** Whether this tab may edit the diagram: it asks once the diagram is known, and hears when another tab takes over. */
function useLock(id: string | undefined) {
  const [state, setState] = useState<{ readonly id: string; readonly kind: "mine" | "elsewhere" | "moved" } | undefined>();
  useEffect(() => {
    if (id === undefined) return;
    let current = true;
    void claimDiagram(id).then((claimed) => {
      if (current) setState({ id, kind: claimed ? "mine" : "elsewhere" });
    });
    const stopListening = whenTaken(id, () => {
      if (current) setState({ id, kind: "moved" });
    });
    return () => {
      current = false;
      stopListening();
    };
  }, [id]);
  return [state !== undefined && state.id === id ? state.kind : "pending", setState] as const;
}

/** A diagram that is new, one whose editing session is in memory (after its first save), or one saved earlier. */
export default function EditorRoute() {
  const { type, kind, id } = useParams();
  const navigate = useNavigate();
  const [source, setSource] = useSource(id, type, kind);
  const diagramId = source.kind === "ready" ? source.diagram.id : undefined;
  const [lock, setLock] = useLock(diagramId);
  const onFirstSaved = useCallback(
    (savedId: string) => {
      if (id === undefined) void navigate(`/d/${savedId}`, { replace: true });
    },
    [id, navigate],
  );
  const takeOver = useCallback(async () => {
    if (diagramId === undefined) return;
    const taken = await takeDiagram(diagramId);
    if (taken.kind !== "ok") {
      setSource({ kind: "none" });
      return;
    }
    forgetSession(diagramId);
    setSource((previous) => ({ kind: "ready", diagram: taken.diagram, stored: true, version: previous.kind === "ready" ? previous.version + 1 : 0 }));
    setLock({ id: diagramId, kind: "mine" });
  }, [diagramId, setSource, setLock]);

  if (source.kind === "none") return <Navigate to="/" replace />;
  if (source.kind === "loading" || lock === "pending") return null;
  const dialogs = (
    <LockDialogs
      situation={lock === "mine" ? null : lock}
      onEditHere={() => void takeOver()}
      onTakeBack={() => void takeOver()}
      onCancel={() => void navigate("/")}
    />
  );
  if (lock === "elsewhere") return dialogs;
  return (
    <>
      <Editor key={source.version} initial={source.diagram} stored={source.stored} onFirstSaved={onFirstSaved} locked={lock === "moved"} />
      {dialogs}
    </>
  );
}
