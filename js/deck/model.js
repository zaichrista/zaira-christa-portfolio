// Turns a deck's data into the running order:
// cover, selected work, then per project a title card and its slides, then the closing.
export function buildSequence(deck) {
  const seq = [
    { id: 'cover', kind: 'cover', notes: '' },
    { id: 'work', kind: 'work', notes: '' },
  ];
  deck.projects.forEach((project, pi) => {
    const extra = [];
    if (project.consentNote) extra.push('Consent: ' + project.consentNote);
    if (project.needs) extra.push('Needs: ' + project.needs.join('; '));
    seq.push({ id: project.id, kind: 'title', project, pi, notes: extra.join('\n') });
    for (const slide of project.slides) {
      seq.push({ id: `${project.id}-${slide.n}`, kind: 'slide', project, pi, slide, notes: slide.notes || '' });
    }
  });
  seq.push({ id: 'closing', kind: 'closing', notes: (deck.closing && deck.closing.notes) || '' });
  return seq;
}
