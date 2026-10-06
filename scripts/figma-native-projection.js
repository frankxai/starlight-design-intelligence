/* Native Figma adapter. No network, fallback fonts, publishing, or existing-node mutation. */
async function runProjection(p) {
  const namespace = p.name + ' / ' + p.revision + ' / ' + p.manifest_sha256.slice(0, 8);
  const existing = figma.root.children.find(n => n.name === namespace);
  if (existing) return { status: 'EXISTS_UNVERIFIED', page_id: existing.id, manifest_sha256: p.manifest_sha256, message: 'Existing projection preserved. Inspect it before accepting or replacing it.' };
  const receipt = { schema_version: 'starlight.figma_execution.v1', status: 'NOT_STARTED', repository: p.repository, commit: p.commit, manifest_sha256: p.manifest_sha256, readiness: p.readiness, created_node_ids: [], variable_ids: [], collection_ids: [], style_ids: [], component_mappings: [], font_resolution: [], parity: 'NOT_RENDERED_OR_RUNTIME_VERIFIED' };
  let page;
  try {
    const available = await figma.listAvailableFontsAsync();
    const fonts = [...new Map(p.text_styles.map(s => [JSON.stringify([s.font.family, s.font.style]), s.font])).values()];
    for (const font of fonts) {
      if (!available.some(f => f.fontName.family === font.family && f.fontName.style === font.style)) throw new Error('Required exact font unavailable: ' + font.family + ' / ' + font.style + '. No substitution is allowed.');
      await figma.loadFontAsync(font);
      receipt.font_resolution.push(font);
    }
    page = figma.createPage(); page.name = namespace; receipt.created_node_ids.push(page.id); receipt.page_id = page.id;
    await figma.setCurrentPageAsync(page);
    page.setPluginData('starlight.source', JSON.stringify({ repository: p.repository, commit: p.commit, manifest_sha256: p.manifest_sha256, readiness: p.readiness }));
    const collection = figma.variables.createVariableCollection(namespace);
    receipt.collection_ids.push(collection.id);
    // One mode per projection works on Starter. Ink/paper are separate inputs/collections.
    const variables = new Map(), tokens = new Map(p.tokens.map(t => [t.name, t]));
    for (const t of p.tokens) {
      const type = t.type === 'color' ? 'COLOR' : ['fontFamily', 'cubicBezier'].includes(t.type) ? 'STRING' : 'FLOAT';
      const v = figma.variables.createVariable(t.name, collection, type); variables.set(t.name, v); receipt.variable_ids.push(v.id);
      v.description = p.repository + '@' + p.commit + ' · ' + (t.source?.path || 'alias ' + t.alias);
      v.scopes = t.type === 'color' ? ['ALL_FILLS', 'STROKE_COLOR'] : t.type === 'dimension' ? ['GAP', 'WIDTH_HEIGHT', 'CORNER_RADIUS'] : [];
      if (t.codeSyntax) v.setVariableCodeSyntax('WEB', t.codeSyntax);
    }
    for (const t of p.tokens) {
      let value;
      if (t.alias) value = { type: 'VARIABLE_ALIAS', id: variables.get(t.alias).id };
      else if (t.type === 'color') value = { r: t.value.components[0], g: t.value.components[1], b: t.value.components[2], a: t.value.alpha };
      else value = t.type === 'cubicBezier' ? t.original : ['duration', 'dimension'].includes(t.type) ? t.value.value : t.value;
      variables.get(t.name).setValueForMode(collection.defaultModeId, value);
    }
    const textStyles = new Map();
    for (const s of p.text_styles) {
      const style = figma.createTextStyle(); receipt.style_ids.push(style.id); style.name = namespace + '/' + s.name; style.fontName = s.font; style.fontSize = s.font_size; style.lineHeight = { unit: 'PERCENT', value: s.line_height };
      style.description = p.repository + '@' + p.commit + ' · ' + s.source_path + ' · ' + (s.notes || 'Source-defined role; font bytes and rendered parity require review.');
      textStyles.set(s.name, style);
    }
    const remember = n => { receipt.created_node_ids.push(n.id); return n; };
    const firstStyle = p.text_styles.find(s => /body/i.test(s.name)) || p.text_styles[0];
    function resolved(name) { const t = tokens.get(name); return t.alias ? resolved(t.alias) : t.value; }
    function paint(node, role, field = 'fills') {
      const value = resolved(role), v = variables.get(role);
      node[field] = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: value.components[0], g: value.components[1], b: value.components[2] }, opacity: value.alpha }, 'color', v)];
    }
    function stack(name, width, gap = 20) {
      const n = remember(figma.createFrame()); n.name = name; n.layoutMode = 'VERTICAL'; n.primaryAxisSizingMode = 'AUTO'; n.counterAxisSizingMode = 'FIXED'; n.resize(width, 100); n.itemSpacing = gap; n.fills = []; n.clipsContent = false; return n;
    }
    const textRole = p.review_roles.text;
    const surfaceRole = p.review_roles.surface;
    async function addText(parent, value, width, styleName = firstStyle.name, role = textRole) {
      const n = remember(figma.createText()), style = textStyles.get(styleName); n.name = value.slice(0, 50); n.fontName = style.fontName; n.characters = value; await n.setTextStyleIdAsync(style.id); n.textAutoResize = 'HEIGHT'; n.resize(width, n.height); parent.appendChild(n); n.layoutSizingVertical = 'HUG'; if (role) paint(n, role); return n;
    }
    const source = stack('SOURCE / native components and foundations', 660); source.x = 40; source.y = 40; source.paddingLeft = source.paddingRight = 20; source.paddingTop = source.paddingBottom = 20; if (surfaceRole) paint(source, surfaceRole); page.appendChild(source);
    await addText(source, p.name, 620);
    await addText(source, p.readiness === 'migration-candidate' ? 'Source migration candidate · review before adoption' : 'Committed source · native review pending', 620);
    const swatches = [];
    for (const token of p.tokens.filter(t => t.type === 'color')) {
      const c = remember(figma.createComponent()); c.name = 'Foundation / ' + token.name; c.layoutMode = 'HORIZONTAL'; c.primaryAxisSizingMode = 'FIXED'; c.counterAxisSizingMode = 'AUTO'; c.resize(620, 60); c.itemSpacing = 12; c.paddingTop = c.paddingBottom = 8; c.fills = [];
      const chip = remember(figma.createRectangle()); chip.name = 'Bound color'; chip.resize(48, 32); paint(chip, token.name); c.appendChild(chip);
      const label = await addText(c, token.name, 540); label.componentPropertyReferences = { characters: c.addComponentProperty('Label', 'TEXT', token.name) }; c.description = 'Source-bound color specimen. ' + p.repository + '@' + p.commit; source.appendChild(c); swatches.push(c);
    }
    const componentSets = [];
    for (const model of p.components || []) {
      const variants = [], labels = [];
      for (const v of model.variants) {
        const c = remember(figma.createComponent()); c.name = 'State=' + v.state; c.layoutMode = 'HORIZONTAL'; c.primaryAxisSizingMode = 'AUTO'; c.counterAxisSizingMode = 'FIXED'; c.resize(120, v.height); c.primaryAxisAlignItems = 'CENTER'; c.counterAxisAlignItems = 'CENTER'; c.paddingLeft = c.paddingRight = v.padding_x; c.cornerRadius = v.radius; c.opacity = v.opacity ?? 1; paint(c, v.fill_token);
        const label = await addText(c, model.label || 'Continue', 100, v.text_style, v.text_token); label.textAutoResize = 'WIDTH_AND_HEIGHT'; labels.push(label);
        if (v.stroke_token) { paint(c, v.stroke_token, 'strokes'); c.strokeWeight = v.stroke_width || 2; c.strokeAlign = 'OUTSIDE'; }
        c.description = 'Visual ' + v.state + ' state. ' + model.code_path + '. ' + (v.notes || '') + ' Runtime interaction requires product verification.'; source.appendChild(c); variants.push(c);
      }
      const set = remember(figma.combineAsVariants(variants, page)); set.name = model.name; set.layoutMode = 'VERTICAL'; set.primaryAxisSizingMode = 'AUTO'; set.counterAxisSizingMode = 'AUTO'; set.itemSpacing = 20; set.fills = []; source.appendChild(set);
      const prop = set.addComponentProperty('Label', 'TEXT', model.label || 'Continue'); for (const label of labels) label.componentPropertyReferences = { characters: prop };
      set.description = p.repository + '@' + p.commit + ' · ' + model.code_path + ' · ' + JSON.stringify(model.props || {}) + ' · Visual projection; effects and runtime parity remain pending.';
      receipt.component_mappings.push({ component_set_id: set.id, code_path: model.code_path, export_name: model.export_name, props: model.props, state_names: model.variants.map(v => v.state) }); componentSets.push(variants);
    }
    const reviews = [];
    for (const [width, x] of [[1440, 760], [390, 2260]]) {
      const review = stack('REVIEW / ' + width, width); review.x = x; review.y = 40; review.paddingLeft = review.paddingRight = 24; review.paddingTop = review.paddingBottom = 24; if (surfaceRole) paint(review, surfaceRole); page.appendChild(review);
      await addText(review, p.name + ' — foundations', width - 48);
      await addText(review, 'Source ' + p.commit.slice(0, 12) + ' · design inspection pending', width - 48);
      for (const style of p.text_styles) await addText(review, style.sample || style.name, width - 48, style.name);
      for (const family of componentSets) for (const c of family) { const instance = remember(c.createInstance()); review.appendChild(instance); }
      for (const c of swatches.slice(0, 6)) { const instance = remember(c.createInstance()); review.appendChild(instance); if (width === 390) { instance.resize(width - 48, instance.height); const label = instance.findOne(n => n.type === 'TEXT'); if (label) { label.resize(width - 120, label.height); label.textAutoResize = 'HEIGHT'; } } }
      reviews.push(review); receipt[width === 390 ? 'mobile_id' : 'desktop_id'] = review.id;
    }
    for (const n of page.findAll(() => true)) receipt.created_node_ids.push(n.id);
    receipt.created_node_ids = [...new Set(receipt.created_node_ids)]; receipt.status = 'CREATED_UNREVIEWED'; receipt.gamut_notes = p.gamut_notes;
    page.setPluginData('starlight.execution', JSON.stringify(receipt)); figma.viewport.scrollAndZoomIntoView(reviews);
    return receipt;
  } catch (error) {
    receipt.status = page ? 'PARTIAL_FAILED' : 'PREFLIGHT_FAILED'; receipt.error = error.message;
    if (page) page.setPluginData('starlight.execution', JSON.stringify(receipt)); return receipt;
  }
}
