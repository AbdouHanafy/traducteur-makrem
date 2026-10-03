"use client";

import { useEffect } from "react";
import { EDIT_MESSAGE_TYPE, findMarkers } from "@/lib/i18n-edit";

/**
 * Actif uniquement dans l'aperçu du backoffice : surligne les textes modifiables au survol et,
 * au clic, envoie la clé du texte à la fenêtre parente (l'éditeur) au lieu de suivre le lien.
 */
export default function EditOverlay() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      [data-edit-hover]{outline:2px dashed #2f6bff !important;outline-offset:2px;cursor:pointer !important;background:rgba(47,107,255,.08) !important;border-radius:4px}
      [data-edit-badge]{position:fixed;z-index:2147483647;top:10px;inset-inline-start:10px;background:#14284d;color:#fff;font:600 12px/1.3 system-ui,sans-serif;padding:7px 12px;border-radius:999px;box-shadow:0 6px 20px rgba(0,0,0,.25);pointer-events:none}
    `;
    document.head.appendChild(style);

    const badge = document.createElement("div");
    badge.setAttribute("data-edit-badge", "");
    badge.textContent = "✎ Mode édition — cliquez sur un texte";
    document.body.appendChild(badge);

    /** Le nœud texte (portant une signature) sous le pointeur, avec la signature la plus proche. */
    function locate(x: number, y: number, target: EventTarget | null): { key: string; element: Element } | null {
      let node: Node | null = null;
      let offset = 0;
      const doc = document as Document & {
        caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
        caretRangeFromPoint?: (x: number, y: number) => Range | null;
      };
      if (doc.caretPositionFromPoint) {
        const position = doc.caretPositionFromPoint(x, y);
        if (position) { node = position.offsetNode; offset = position.offset; }
      } else if (doc.caretRangeFromPoint) {
        const range = doc.caretRangeFromPoint(x, y);
        if (range) { node = range.startContainer; offset = range.startOffset; }
      }

      const fromNode = (candidate: Node | null, at: number) => {
        if (!candidate || candidate.nodeType !== Node.TEXT_NODE) return null;
        const markers = findMarkers(candidate.textContent ?? "");
        if (markers.length === 0) return null;
        // La signature suit le texte qu'elle décrit : on prend la première dont la position dépasse le clic.
        const marker = markers.find((m) => m.index >= at) ?? markers[markers.length - 1];
        return { key: marker.key, element: candidate.parentElement as Element };
      };

      const direct = fromNode(node, offset);
      if (direct) return direct;

      // Repli : premier texte signé à l'intérieur de l'élément visé (boutons, liens, icônes + texte).
      const element = target instanceof Element ? target : null;
      if (!element) return null;
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      for (let current = walker.nextNode(); current; current = walker.nextNode()) {
        const found = fromNode(current, 0);
        if (found) return found;
      }
      return null;
    }

    let hovered: Element | null = null;
    function setHover(element: Element | null) {
      if (hovered === element) return;
      hovered?.removeAttribute("data-edit-hover");
      hovered = element;
      hovered?.setAttribute("data-edit-hover", "");
    }

    const onMove = (event: MouseEvent) => setHover(locate(event.clientX, event.clientY, event.target)?.element ?? null);
    const onClick = (event: MouseEvent) => {
      const found = locate(event.clientX, event.clientY, event.target);
      if (!found) return;
      event.preventDefault();
      event.stopPropagation();
      window.parent.postMessage({ type: EDIT_MESSAGE_TYPE, key: found.key }, window.location.origin);
    };
    // Les formulaires de l'aperçu ne doivent rien envoyer.
    const onSubmit = (event: Event) => event.preventDefault();

    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      setHover(null);
      style.remove();
      badge.remove();
    };
  }, []);

  return null;
}
